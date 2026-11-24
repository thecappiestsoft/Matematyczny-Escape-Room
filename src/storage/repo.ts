import { detectLang, type Lang } from '../i18n';
/* =========================================================================
 * Warstwa zapisu danych.
 * Interfejs `Repository` oddziela aplikację od miejsca przechowywania danych.
 * Wersja 1: localStorage (LocalRepository). Aby przenieść dane na serwer,
 * wystarczy dopisać np. `HttpRepository` implementujący ten sam interfejs.
 * ========================================================================= */
import type { GameState } from '../engine/game';
import type { GameReport } from '../engine/report';
import { DEFAULT_SCORING } from '../engine/scoring';
import type { Level, Scenario, ScoringConfig, TimeoutBehavior } from '../types';

export interface AppSettings {
  lang: Lang;
  theme: 'light' | 'dark';
  muted: boolean;
  reducedMotion: boolean;
  presentation: boolean;
  highContrast: boolean;
  showHotspots: boolean;
  playerName: string;
  level: Level;
  scoring: ScoringConfig;
  defaultTimeoutBehavior: TimeoutBehavior;
}

export interface ClassTeam { name: string; result?: GameReport; cooperation: number }

export interface ClassSession {
  id: string;
  name: string;
  createdAt: string;
  scenarioId: string;
  level: Level;
  timeLimit: number | null;
  hintLimit: number | null;
  includeBonus: boolean;
  timeoutBehavior: TimeoutBehavior;
  topics: string[];
  teams: ClassTeam[];
  /** kod pokoju – przygotowanie pod rozgrywkę sieciową */
  roomCode: string;
  status: 'setup' | 'running' | 'finished';
}

export interface CampaignProgress { completed: string[]; level: Level }

export interface Repository {
  getSettings(): AppSettings;
  saveSettings(s: AppSettings): void;
  getHistory(): GameReport[];
  addResult(r: GameReport): void;
  clearHistory(): void;
  getAchievements(player: string): string[];
  addAchievements(player: string, ids: string[]): void;
  getCampaign(player: string): CampaignProgress;
  saveCampaign(player: string, p: CampaignProgress): void;
  getSave(): GameState | null;
  setSave(s: GameState | null): void;
  getCustomScenarios(): Scenario[];
  saveCustomScenario(sc: Scenario): void;
  deleteCustomScenario(id: string): void;
  getClassSessions(): ClassSession[];
  saveClassSession(s: ClassSession): void;
  deleteClassSession(id: string): void;
  exportAll(): string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  lang: detectLang(),
  theme: detectTheme(),
  muted: false,
  reducedMotion: false,
  presentation: false,
  highContrast: false,
  showHotspots: false,
  playerName: '',
  level: 'sp',
  scoring: DEFAULT_SCORING,
  defaultTimeoutBehavior: 'continue',
};

function detectTheme(): 'light' | 'dark' {
  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

const P = 'mer.v1.';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(P + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(P + key);
    else localStorage.setItem(P + key, JSON.stringify(value));
  } catch {
    /* brak miejsca lub tryb prywatny – gra działa dalej bez zapisu */
  }
}

export class LocalRepository implements Repository {
  getSettings(): AppSettings {
    const s = read<Partial<AppSettings>>('settings', {});
    return { ...DEFAULT_SETTINGS, ...s, scoring: { ...DEFAULT_SCORING, ...(s.scoring ?? {}) } };
  }
  saveSettings(s: AppSettings) { write('settings', s); }
  getHistory() { return read<GameReport[]>('history', []); }
  addResult(r: GameReport) {
    const h = this.getHistory();
    h.unshift(r);
    write('history', h.slice(0, 500));
  }
  clearHistory() { write('history', null); }
  getAchievements(player: string) { return read<Record<string, string[]>>('achievements', {})[player] ?? []; }
  addAchievements(player: string, ids: string[]) {
    const all = read<Record<string, string[]>>('achievements', {});
    all[player] = [...new Set([...(all[player] ?? []), ...ids])];
    write('achievements', all);
  }
  getCampaign(player: string): CampaignProgress {
    return read<Record<string, CampaignProgress>>('campaign', {})[player] ?? { completed: [], level: 'sp' };
  }
  saveCampaign(player: string, p: CampaignProgress) {
    const all = read<Record<string, CampaignProgress>>('campaign', {});
    all[player] = p;
    write('campaign', all);
  }
  getSave() { return read<GameState | null>('save', null); }
  setSave(s: GameState | null) { write('save', s); }
  getCustomScenarios() { return read<Scenario[]>('custom', []); }
  saveCustomScenario(sc: Scenario) {
    const list = this.getCustomScenarios().filter((x) => x.id !== sc.id);
    list.push({ ...sc, custom: true });
    write('custom', list);
  }
  deleteCustomScenario(id: string) { write('custom', this.getCustomScenarios().filter((x) => x.id !== id)); }
  getClassSessions() { return read<ClassSession[]>('class', []); }
  saveClassSession(s: ClassSession) {
    const list = this.getClassSessions().filter((x) => x.id !== s.id);
    list.unshift(s);
    write('class', list.slice(0, 100));
  }
  deleteClassSession(id: string) { write('class', this.getClassSessions().filter((x) => x.id !== id)); }
  exportAll() {
    const out: Record<string, unknown> = {};
    for (const k of ['settings', 'history', 'achievements', 'campaign', 'custom', 'class']) out[k] = read(k, null);
    return JSON.stringify({ app: 'matematyczny-escape-room', version: 1, exportedAt: new Date().toISOString(), data: out }, null, 2);
  }
}

export const repo: Repository = new LocalRepository();
