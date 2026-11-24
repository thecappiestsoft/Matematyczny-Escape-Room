import { tx } from '../i18n';
import type { GameReport } from './report';

export interface AchievementDef { id: string; name: string; description: string; icon: string }

function ach(id: string, icon: string, pl: string, en: string, dPl: string, dEn: string): AchievementDef {
  return { id, icon, get name() { return tx(pl, en); }, get description() { return tx(dPl, dEn); } };
}

export const ACHIEVEMENTS: AchievementDef[] = [
  ach('first_escape', '🗝️', 'Pierwsza ucieczka', 'First escape', 'Ukończ dowolny scenariusz.', 'Complete any scenario.'),
  ach('no_hints', '🧠', 'Samodzielny umysł', 'Independent mind', 'Ukończ scenariusz bez żadnej podpowiedzi.', 'Complete a scenario without any hints.'),
  ach('flawless', '🎯', 'Bezbłędnie', 'Flawless', 'Ukończ scenariusz bez błędnej odpowiedzi.', 'Complete a scenario without a wrong answer.'),
  ach('speedy', '⚡', 'Błyskawica', 'Lightning', 'Ucieknij w mniej niż 15 minut.', 'Escape in under 15 minutes.'),
  ach('explorer', '🔍', 'Odkrywca', 'Explorer', 'Znajdź wszystkie ukryte obiekty w scenariuszu.', 'Find every hidden object in a scenario.'),
  ach('school', '🏫', 'Absolwent Starej Szkoły', 'Old School Graduate', 'Rozwiąż Tajemnicę Starej Szkoły.', 'Solve the Mystery of the Old School.'),
  ach('egypt', '🔺', 'Strażnik Piramidy', 'Pyramid Guardian', 'Odkryj Sekret Egipskiej Piramidy.', 'Uncover the Secret of the Egyptian Pyramid.'),
  ach('lab', '🧪', 'Ratownik Laboratorium', 'Lab Rescuer', 'Przywróć zasilanie w Laboratorium.', 'Restore power in the Laboratory.'),
  ach('all_levels', '🏆', 'Wszechstronny', 'All-rounder', 'Ukończ scenariusze na wszystkich trzech poziomach.', 'Complete scenarios at all three levels.'),
  ach('team', '🤝', 'Siła drużyny', 'Team spirit', 'Ukończ scenariusz w trybie klasowym.', 'Complete a scenario in class mode.'),
  ach('time_master', '⏱️', 'Pan czasu', 'Time master', 'Ukończ wyzwanie na czas przed upływem limitu.', 'Finish a time challenge before the limit.'),
];

/** Zwraca listę nowych osiągnięć na podstawie raportu i historii */
export function evaluateAchievements(r: GameReport, history: GameReport[], owned: string[]): string[] {
  if (r.status !== 'won') return [];
  const got = new Set<string>();
  got.add('first_escape');
  if (r.hintsUsed === 0) got.add('no_hints');
  if (r.wrong === 0) got.add('flawless');
  if (r.elapsed < 15 * 60) got.add('speedy');
  if (r.secretsTotal > 0 && r.secretsFound >= r.secretsTotal) got.add('explorer');
  if (r.scenarioId === 'stara-szkola') got.add('school');
  if (r.scenarioId === 'piramida') got.add('egypt');
  if (r.scenarioId === 'laboratorium') got.add('lab');
  if (r.mode === 'class') got.add('team');
  if (r.mode === 'timed' && !r.timedOut) got.add('time_master');
  const levels = new Set([...history, r].filter((h) => h.status === 'won').map((h) => h.level));
  if (levels.size === 3) got.add('all_levels');
  return [...got].filter((a) => !owned.includes(a));
}
