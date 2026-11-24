import { tx } from '../i18n';
import type { ScoringConfig } from '../types';

export const DEFAULT_SCORING: ScoringConfig = {
  solve: 100,
  noHintBonus: 30,
  secret: 20,
  room: 50,
  scenario: 200,
  hint1: 10,
  hint2: 20,
  hint3: 40,
  wrong: 10,
  timeout: 100,
  timePerMinute: 10,
  lockout: 5,
};

/** Mnożniki blokady dla kolejnych błędów tej samej zagadki */
const LOCK_STEPS = [1, 3, 6, 9];

/** Czas blokady (s) po n-tym błędzie tej samej zagadki */
export function lockoutFor(cfg: ScoringConfig, wrongCount: number): number {
  const base = cfg.lockout ?? DEFAULT_SCORING.lockout;
  if (base <= 0 || wrongCount <= 0) return 0;
  return base * LOCK_STEPS[Math.min(wrongCount, LOCK_STEPS.length) - 1];
}

/** Kara za n-ty błąd tej samej zagadki: rośnie (×1, ×2, ×3), aby zgadywanie się nie opłacało */
export function wrongPenalty(cfg: ScoringConfig, wrongCount: number): number {
  return cfg.wrong * Math.min(Math.max(wrongCount, 1), 3);
}

export function hintCost(cfg: ScoringConfig, level: 1 | 2 | 3): number {
  return level === 1 ? cfg.hint1 : level === 2 ? cfg.hint2 : cfg.hint3;
}

export interface Rating { title: string; stars: number; text: string }

/** Ocena skuteczności – informacja zwrotna, NIE ocena szkolna */
export function rateEfficiency(accuracy: number, hintLevelsUsed: number, puzzles: number): Rating {
  const hintRatio = puzzles ? hintLevelsUsed / (puzzles * 3) : 0;
  const v = accuracy / 100 - hintRatio * 0.8;
  if (v >= 0.9) return { title: tx('Mistrz ucieczki', 'Escape master'), stars: 3, text: tx('Świetna precyzja i samodzielność. Spróbuj wyższego poziomu lub trybu na czas!', 'Great precision and independence. Try a higher level or the time challenge!') };
  if (v >= 0.7) return { title: tx('Sprawny odkrywca', 'Skilled explorer'), stars: 2, text: tx('Dobra robota! Kilka zagadek wymagało więcej namysłu – warto do nich wrócić.', 'Good work! A few puzzles needed more thought – they are worth revisiting.') };
  if (v >= 0.45) return { title: tx('Wytrwały badacz', 'Persistent researcher'), stars: 1, text: tx('Udało się dzięki wytrwałości. Raport poniżej pokaże, co warto powtórzyć.', 'You made it through persistence. The report below shows what to revise.') };
  return { title: tx('Początkujący detektyw', 'Novice detective'), stars: 1, text: tx('Każda ucieczka to trening. Przejrzyj rozwiązania krok po kroku i zagraj ponownie.', 'Every escape is practice. Go through the step-by-step solutions and play again.') };
}
