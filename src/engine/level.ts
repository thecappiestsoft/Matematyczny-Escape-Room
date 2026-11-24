import type { L, Level, Puzzle, Scenario, Visual } from '../types';

/** Rozwiązuje wartość zależną od poziomu edukacyjnego */
export function lv<T>(value: L<T>, level: Level): T {
  if (value && typeof value === 'object' && !Array.isArray(value) && 'sp' in (value as object) && 'lo' in (value as object) && 'tech' in (value as object)) {
    return (value as { sp: T; lo: T; tech: T })[level];
  }
  return value as T;
}

export function getPuzzle(sc: Scenario, puzzleId: string, level: Level): Puzzle {
  const entry = sc.puzzles[puzzleId];
  if (!entry) throw new Error(`Brak zagadki ${puzzleId} w scenariuszu ${sc.id}`);
  return lv(entry.variants, level);
}

export function getClueVisual(sc: Scenario, clueId: string, level: Level): Visual | undefined {
  const c = sc.clues[clueId];
  if (!c || !c.visual) return undefined;
  return lv(c.visual, level);
}

/** Zbiór działów matematyki obecnych w scenariuszu na danym poziomie */
export function scenarioTopics(sc: Scenario, level?: Level): string[] {
  const set = new Set<string>();
  for (const id of Object.keys(sc.puzzles)) {
    const levels: Level[] = level ? [level] : ['sp', 'lo', 'tech'];
    for (const l of levels) set.add(lv(sc.puzzles[id].variants, l).topic);
  }
  return [...set];
}
