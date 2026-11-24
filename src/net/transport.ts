/* =========================================================================
 * Architektura pod rozgrywkę sieciową w trybie klasowym.
 *
 * Obecnie (wersja 1) tryb klasowy działa na jednym urządzeniu: drużyny grają
 * kolejno („hot-seat”), a wyniki zapisują się lokalnie (LocalClassTransport).
 *
 * Docelowo: nauczyciel tworzy sesję -> serwer zwraca kod pokoju (roomCode),
 * uczniowie dołączają z własnych urządzeń, a postęp drużyn jest publikowany
 * w czasie rzeczywistym (WebSocket). Silnik gry (engine/game.ts) jest
 * czystą logiką bez Reacta, więc ten sam kod może walidować ruchy na serwerze.
 * ========================================================================= */
import type { GameReport } from '../engine/report';
import { repo, type ClassSession } from '../storage/repo';

export interface TeamProgress {
  sessionId: string;
  team: string;
  room: string;
  score: number;
  solved: number;
  elapsed: number;
  finished: boolean;
}

export interface ClassTransport {
  /** Utworzenie sesji; zwraca kod pokoju */
  createSession(s: ClassSession): Promise<string>;
  /** Dołączenie drużyny do sesji po kodzie pokoju */
  join(roomCode: string, team: string): Promise<ClassSession | null>;
  /** Publikacja postępu drużyny (na żywo) */
  publishProgress(p: TeamProgress): void;
  /** Wysłanie wyniku końcowego */
  submitResult(sessionId: string, team: string, r: GameReport): Promise<void>;
  /** Subskrypcja zmian (tablica wyników nauczyciela) */
  subscribe(sessionId: string, cb: (s: ClassSession) => void): () => void;
}

export function makeRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/** Implementacja lokalna – jedno urządzenie, dane w localStorage */
export class LocalClassTransport implements ClassTransport {
  private listeners = new Map<string, Set<(s: ClassSession) => void>>();

  async createSession(s: ClassSession) {
    repo.saveClassSession(s);
    return s.roomCode;
  }
  async join(roomCode: string, team: string) {
    const s = repo.getClassSessions().find((x) => x.roomCode === roomCode) ?? null;
    if (s && !s.teams.some((t) => t.name === team)) {
      s.teams.push({ name: team, cooperation: 0 });
      repo.saveClassSession(s);
    }
    return s;
  }
  publishProgress(_p: TeamProgress) {
    /* lokalnie: brak potrzeby synchronizacji na żywo */
  }
  async submitResult(sessionId: string, team: string, r: GameReport) {
    const s = repo.getClassSessions().find((x) => x.id === sessionId);
    if (!s) return;
    const t = s.teams.find((x) => x.name === team);
    if (t) t.result = r;
    if (s.teams.every((x) => x.result)) s.status = 'finished';
    repo.saveClassSession(s);
    this.listeners.get(sessionId)?.forEach((cb) => cb(s));
  }
  subscribe(sessionId: string, cb: (s: ClassSession) => void) {
    if (!this.listeners.has(sessionId)) this.listeners.set(sessionId, new Set());
    this.listeners.get(sessionId)!.add(cb);
    return () => this.listeners.get(sessionId)?.delete(cb);
  }
}

export const classTransport: ClassTransport = new LocalClassTransport();
