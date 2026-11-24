import { tx } from '../i18n';
/* =========================================================================
 * Silnik gry – czyste funkcje (state, akcja) -> { state, events }.
 * Brak zależności od Reacta: łatwo testować i przenieść na serwer
 * (np. do rozgrywki sieciowej w trybie klasowym).
 * ========================================================================= */
import type { Effects, GameObject, Room, Scenario, ScoringConfig, SessionConfig } from '../types';
import { checkAnswer, type AnswerValue } from './answers';
import { getPuzzle, lv } from './level';
import { hintCost, lockoutFor, wrongPenalty } from './scoring';

export interface PuzzleStat {
  attempts: number;
  wrong: number;
  /** najwyższy odkryty poziom podpowiedzi (0–3) */
  hints: number;
  solved: boolean;
  solvedAt?: number;
  firstSeenAt?: number;
  /** do kiedy (czas gry w s) zamek jest zablokowany po błędnej odpowiedzi */
  lockedUntil?: number;
}

export interface LogEntry { t: number; text: string; delta?: number }

export interface GameState {
  version: 1;
  id: string;
  config: SessionConfig;
  scoring: ScoringConfig;
  roomId: string;
  visitedRooms: string[];
  completedRooms: string[];
  inventory: string[];
  collected: string[];
  clues: string[];
  flags: string[];
  opened: string[];
  examined: string[];
  secretsFound: string[];
  puzzles: Record<string, PuzzleStat>;
  score: number;
  hintsUsedTotal: number;
  elapsed: number;
  timedOut: boolean;
  status: 'playing' | 'won' | 'ended';
  timeBonus: number;
  log: LogEntry[];
  startedAt: string;
}

export type GameEvent =
  | { type: 'toast'; text: string; tone: 'success' | 'info' | 'warn' }
  | { type: 'sound'; name: SoundName }
  | { type: 'points'; delta: number; reason: string }
  | { type: 'item'; id: string }
  | { type: 'clue'; id: string }
  | { type: 'roomComplete'; roomId: string }
  | { type: 'unlocked'; objectId: string }
  | { type: 'timeout' }
  | { type: 'won' };

export type SoundName = 'click' | 'success' | 'error' | 'unlock' | 'pickup' | 'hint' | 'door' | 'secret' | 'win';

export interface Outcome { state: GameState; events: GameEvent[] }

/* ------------------------------ pomocnicze ------------------------------ */

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function clone(s: GameState): GameState {
  return {
    ...s,
    visitedRooms: [...s.visitedRooms], completedRooms: [...s.completedRooms],
    inventory: [...s.inventory], collected: [...s.collected], clues: [...s.clues],
    flags: [...s.flags], opened: [...s.opened], examined: [...s.examined],
    secretsFound: [...s.secretsFound],
    puzzles: Object.fromEntries(Object.entries(s.puzzles).map(([k, v]) => [k, { ...v }])),
    log: [...s.log],
  };
}

function addScore(s: GameState, ev: GameEvent[], delta: number, reason: string) {
  if (!delta) return;
  const before = s.score;
  s.score = Math.max(0, s.score + delta);
  const real = s.score - before;
  s.log.push({ t: s.elapsed, text: reason, delta: real });
  ev.push({ type: 'points', delta: real === 0 && delta < 0 ? 0 : delta, reason });
}

function stat(s: GameState, pid: string): PuzzleStat {
  if (!s.puzzles[pid]) s.puzzles[pid] = { attempts: 0, wrong: 0, hints: 0, solved: false, firstSeenAt: s.elapsed };
  return s.puzzles[pid];
}

export function findObject(sc: Scenario, objectId: string): { room: Room; obj: GameObject } {
  for (const room of sc.rooms) {
    const obj = room.objects.find((o) => o.id === objectId);
    if (obj) return { room, obj };
  }
  throw new Error(`Nie znaleziono obiektu ${objectId}`);
}

export function getRoom(sc: Scenario, id: string): Room {
  const r = sc.rooms.find((x) => x.id === id);
  if (!r) throw new Error(`Nie znaleziono pomieszczenia ${id}`);
  return r;
}

export function isBonusObject(sc: Scenario, obj: GameObject): boolean {
  return obj.lock?.type === 'puzzle' && !!sc.puzzles[obj.lock.puzzle]?.bonus;
}

export function isUnlocked(s: GameState, obj: GameObject): boolean {
  return !obj.lock || s.opened.includes(obj.id);
}

export function isVisible(s: GameState, sc: Scenario, obj: GameObject): boolean {
  if (obj.showIf && !s.flags.includes(obj.showIf)) return false;
  if (obj.hideIf && s.flags.includes(obj.hideIf)) return false;
  if (!s.config.includeBonus && isBonusObject(sc, obj)) return false;
  return true;
}

export function visibleObjects(s: GameState, sc: Scenario, room: Room): GameObject[] {
  return room.objects.filter((o) => isVisible(s, sc, o));
}

export function hintsRemaining(s: GameState): number | null {
  return s.config.hintLimit === null ? null : Math.max(0, s.config.hintLimit - s.hintsUsedTotal);
}

/* ------------------------------ tworzenie gry --------------------------- */

export function newGame(config: SessionConfig, sc: Scenario, scoring: ScoringConfig): GameState {
  return {
    version: 1,
    id: uid(),
    config,
    scoring,
    roomId: sc.startRoom,
    visitedRooms: [sc.startRoom],
    completedRooms: [],
    inventory: [],
    collected: [],
    clues: [],
    flags: [],
    opened: [],
    examined: [],
    secretsFound: [],
    puzzles: {},
    score: 0,
    hintsUsedTotal: 0,
    elapsed: 0,
    timedOut: false,
    status: 'playing',
    timeBonus: 0,
    log: [{ t: 0, text: `Start: ${sc.title}` }],
    startedAt: new Date().toISOString(),
  };
}

/* -------------------------------- efekty -------------------------------- */

function applyEffects(s: GameState, sc: Scenario, eff: Effects | undefined, ev: GameEvent[]) {
  if (!eff) return;
  for (const it of eff.items ?? []) {
    if (!s.collected.includes(it)) {
      s.collected.push(it);
      s.inventory.push(it);
      ev.push({ type: 'item', id: it });
      ev.push({ type: 'toast', text: `${tx('Nowy przedmiot', 'New item')}: ${sc.items[it]?.name ?? it}`, tone: 'success' });
      ev.push({ type: 'sound', name: 'pickup' });
      s.log.push({ t: s.elapsed, text: `${tx('Zdobyto', 'Found')}: ${sc.items[it]?.name ?? it}` });
    }
  }
  for (const c of eff.clues ?? []) {
    if (!s.clues.includes(c)) {
      s.clues.push(c);
      ev.push({ type: 'clue', id: c });
      ev.push({ type: 'toast', text: `${tx('Nowa wskazówka w dzienniku', 'New clue in the journal')}: ${sc.clues[c]?.title ?? c}`, tone: 'info' });
    }
  }
  for (const f of eff.flags ?? []) if (!s.flags.includes(f)) s.flags.push(f);
}

function unlockObject(s: GameState, sc: Scenario, obj: GameObject, ev: GameEvent[]) {
  if (s.opened.includes(obj.id)) return;
  s.opened.push(obj.id);
  ev.push({ type: 'unlocked', objectId: obj.id });
  if (obj.lock) ev.push({ type: 'sound', name: obj.door ? 'door' : 'unlock' });
  applyEffects(s, sc, obj.onOpen, ev);
  checkRoomCompletion(s, sc, ev);
}

/** Pomieszczenie jest ukończone, gdy wszystkie wymagane zamki (bez zagadek dodatkowych) są otwarte */
function checkRoomCompletion(s: GameState, sc: Scenario, ev: GameEvent[]) {
  for (const room of sc.rooms) {
    if (s.completedRooms.includes(room.id)) continue;
    const required = room.objects.filter((o) => o.lock && !isBonusObject(sc, o));
    if (required.length && required.every((o) => s.opened.includes(o.id))) {
      s.completedRooms.push(room.id);
      ev.push({ type: 'roomComplete', roomId: room.id });
      addScore(s, ev, s.scoring.room, `${tx('Ukończono pomieszczenie', 'Room completed')}: ${room.name}`);
    }
  }
}

/* ------------------------------- interakcje ----------------------------- */

/** Kliknięcie / obejrzenie obiektu */
export function examine(prev: GameState, sc: Scenario, objectId: string): Outcome {
  const s = clone(prev);
  const ev: GameEvent[] = [];
  const { obj } = findObject(sc, objectId);
  if (obj.secret && !s.secretsFound.includes(obj.id)) {
    s.secretsFound.push(obj.id);
    ev.push({ type: 'sound', name: 'secret' });
    ev.push({ type: 'toast', text: `${tx('Odkryto ukryty obiekt', 'Hidden object found')}: ${obj.name}!`, tone: 'success' });
    addScore(s, ev, s.scoring.secret, `${tx('Odkrycie', 'Discovery')}: ${obj.name}`);
  }
  if (!s.examined.includes(obj.id)) s.examined.push(obj.id);
  if (!obj.lock) {
    unlockObject(s, sc, obj, ev);
  } else if (obj.lock.type === 'flag' && s.flags.includes(obj.lock.flag)) {
    unlockObject(s, sc, obj, ev);
  } else if (obj.lock.type === 'puzzle') {
    stat(s, obj.lock.puzzle);
  }
  return { state: s, events: ev };
}

/** Użycie przedmiotu z ekwipunku na obiekcie */
export function useItem(prev: GameState, sc: Scenario, objectId: string, itemId: string): Outcome {
  const s = clone(prev);
  const ev: GameEvent[] = [];
  const { obj } = findObject(sc, objectId);
  if (!s.inventory.includes(itemId)) return { state: prev, events: [] };
  if (obj.lock?.type === 'item' && obj.lock.item === itemId && !s.opened.includes(obj.id)) {
    if (obj.lock.consume) s.inventory = s.inventory.filter((i) => i !== itemId);
    ev.push({ type: 'toast', text: tx(`Użyto: ${sc.items[itemId]?.name}. ${obj.name} – odblokowano!`, `Used: ${sc.items[itemId]?.name}. ${obj.name} – unlocked!`), tone: 'success' });
    unlockObject(s, sc, obj, ev);
    return { state: s, events: ev };
  }
  ev.push({ type: 'sound', name: 'error' });
  ev.push({ type: 'toast', text: tx(`${sc.items[itemId]?.name ?? 'Ten przedmiot'} tu nie pasuje.`, `${sc.items[itemId]?.name ?? 'This item'} does not fit here.`), tone: 'warn' });
  return { state: prev, events: ev };
}

/** Odpowiedź na zagadkę zabezpieczającą obiekt */
export function submitAnswer(prev: GameState, sc: Scenario, objectId: string, value: AnswerValue): Outcome & { correct: boolean } {
  const s = clone(prev);
  const ev: GameEvent[] = [];
  const { obj } = findObject(sc, objectId);
  if (obj.lock?.type !== 'puzzle') return { state: prev, events: [], correct: false };
  const pid = obj.lock.puzzle;
  const p = getPuzzle(sc, pid, s.config.level);
  const st = stat(s, pid);
  if (st.solved) return { state: prev, events: [], correct: true };
  if (st.lockedUntil !== undefined && s.elapsed < st.lockedUntil) {
    // zamek zablokowany – odpowiedź nie jest sprawdzana (ochrona przed zgadywaniem)
    return { state: prev, events: [{ type: 'toast', text: tx('Mechanizm jest chwilowo zablokowany.', 'The mechanism is locked for a moment.'), tone: 'warn' }], correct: false };
  }
  st.attempts++;
  if (checkAnswer(p, value)) {
    st.solved = true;
    st.solvedAt = s.elapsed;
    ev.push({ type: 'sound', name: 'success' });
    addScore(s, ev, s.scoring.solve, `${tx('Rozwiązano', 'Solved')}: ${p.title}`);
    // premia tylko za samodzielne i bezbłędne rozwiązanie – zgadywanie jej nie daje
    if (st.hints === 0 && st.wrong === 0) addScore(s, ev, s.scoring.noHintBonus, tx('Bez podpowiedzi i bez pomyłek', 'No hints, no mistakes'));
    unlockObject(s, sc, obj, ev);
    return { state: s, events: ev, correct: true };
  }
  st.wrong++;
  const lock = lockoutFor(s.scoring, st.wrong);
  if (lock > 0) st.lockedUntil = s.elapsed + lock;
  ev.push({ type: 'sound', name: 'error' });
  addScore(s, ev, -wrongPenalty(s.scoring, st.wrong), `${tx('Błędna próba', 'Wrong attempt')}: ${p.title}`);
  return { state: s, events: ev, correct: false };
}

/** Ile sekund pozostało do odblokowania zamka zagadki (0 = odblokowany) */
export function lockRemaining(s: GameState, puzzleId: string): number {
  const st = s.puzzles[puzzleId];
  if (!st || st.solved || st.lockedUntil === undefined) return 0;
  return Math.max(0, st.lockedUntil - s.elapsed);
}

/** Odsłonięcie kolejnego poziomu podpowiedzi */
export function takeHint(prev: GameState, sc: Scenario, puzzleId: string): Outcome {
  const s = clone(prev);
  const ev: GameEvent[] = [];
  const st = stat(s, puzzleId);
  if (st.hints >= 3 || st.solved) return { state: prev, events: [] };
  const rem = hintsRemaining(s);
  if (rem !== null && rem <= 0) {
    ev.push({ type: 'toast', text: tx('Limit podpowiedzi został wykorzystany.', 'You have used up the hint limit.'), tone: 'warn' });
    return { state: prev, events: ev };
  }
  st.hints++;
  s.hintsUsedTotal++;
  ev.push({ type: 'sound', name: 'hint' });
  const p = getPuzzle(sc, puzzleId, s.config.level);
  const names = [tx('wskazówka', 'clue'), tx('podpowiedź matematyczna', 'maths hint'), tx('pełne rozwiązanie', 'full solution')];
  addScore(s, ev, -hintCost(s.scoring, st.hints as 1 | 2 | 3), `${names[st.hints - 1]}: ${p.title}`);
  return { state: s, events: ev };
}

/** Przejście do pomieszczenia (przez drzwi lub mapę – tylko do odwiedzonych) */
export function enterRoom(prev: GameState, sc: Scenario, roomId: string): Outcome {
  const s = clone(prev);
  const ev: GameEvent[] = [];
  const room = getRoom(sc, roomId);
  s.roomId = roomId;
  if (!s.visitedRooms.includes(roomId)) {
    s.visitedRooms.push(roomId);
    s.log.push({ t: s.elapsed, text: `${tx('Nowe pomieszczenie', 'New room')}: ${room.name}` });
  }
  ev.push({ type: 'sound', name: 'door' });
  return { state: s, events: ev };
}

/** Upływ czasu */
export function tick(prev: GameState, seconds = 1): Outcome {
  if (prev.status !== 'playing') return { state: prev, events: [] };
  const s = { ...prev, elapsed: prev.elapsed + seconds };
  const ev: GameEvent[] = [];
  const limit = s.config.timeLimit;
  if (limit !== null && !s.timedOut && s.elapsed >= limit * 60) {
    const s2 = clone(s);
    s2.timedOut = true;
    addScore(s2, ev, -s2.scoring.timeout, tx('Przekroczenie limitu czasu', 'Time limit exceeded'));
    ev.push({ type: 'timeout' });
    if (s2.config.timeoutBehavior === 'end') s2.status = 'ended';
    return { state: s2, events: ev };
  }
  return { state: s, events: ev };
}

/** Wyjście ze scenariusza (drzwi z door.exit) */
export function escape(prev: GameState): Outcome {
  const s = clone(prev);
  const ev: GameEvent[] = [];
  if (s.status !== 'playing') return { state: prev, events: [] };
  addScore(s, ev, s.scoring.scenario, tx('Ucieczka zakończona sukcesem!', 'Successful escape!'));
  const limit = s.config.timeLimit;
  if (limit !== null && !s.timedOut) {
    const remainingMin = Math.floor((limit * 60 - s.elapsed) / 60);
    const bonus = Math.max(0, remainingMin) * s.scoring.timePerMinute;
    s.timeBonus = bonus;
    addScore(s, ev, bonus, tx(`Premia czasowa (${remainingMin} min zapasu)`, `Time bonus (${remainingMin} min to spare)`));
  }
  s.status = 'won';
  ev.push({ type: 'won' }, { type: 'sound', name: 'win' });
  return { state: s, events: ev };
}

/** Zakończenie przez gracza (poddanie się) */
export function giveUp(prev: GameState): GameState {
  return { ...prev, status: 'ended' };
}

/** Lista identyfikatorów zagadek dostępnych w danej konfiguracji */
export function activePuzzleIds(sc: Scenario, cfg: SessionConfig): string[] {
  const ids: string[] = [];
  for (const room of sc.rooms) for (const o of room.objects) {
    if (o.lock?.type === 'puzzle') {
      if (!cfg.includeBonus && sc.puzzles[o.lock.puzzle]?.bonus) continue;
      if (!ids.includes(o.lock.puzzle)) ids.push(o.lock.puzzle);
    }
  }
  return ids;
}

/** Tekst opisu obiektu z uwzględnieniem stanu */
export function objectText(s: GameState, obj: GameObject): string {
  const level = s.config.level;
  if (isUnlocked(s, obj) && obj.openedText) return lv(obj.openedText, level);
  return lv(obj.description, level);
}
