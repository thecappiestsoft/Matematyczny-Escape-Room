import type { Lang } from '../i18n';
import { createContext, useContext } from 'react';
import type { GameState } from '../engine/game';
import type { GameReport } from '../engine/report';
import type { AppSettings } from '../storage/repo';
import type { GameMode, Scenario, SessionConfig } from '../types';

export type Screen =
  | { name: 'home' }
  | { name: 'setup'; mode: GameMode; scenarioId?: string }
  | { name: 'campaign' }
  | { name: 'game' }
  | { name: 'result'; report: GameReport; achievements: string[]; scenarioId: string }
  | { name: 'teacher'; tab?: string }
  | { name: 'classBoard'; sessionId: string }
  | { name: 'history' };

export interface AppCtx {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  switchLang: (l: Lang) => void;
  screen: Screen;
  go: (s: Screen) => void;
  scenarios: Scenario[];
  refreshScenarios: () => void;
  getScenario: (id: string) => Scenario | undefined;
  startGame: (cfg: SessionConfig) => void;
  resumeGame: (g: GameState) => void;
}

export const AppContext = createContext<AppCtx | null>(null);

export function useApp(): AppCtx {
  const c = useContext(AppContext);
  if (!c) throw new Error('Brak kontekstu aplikacji');
  return c;
}
