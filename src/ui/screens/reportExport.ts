import { locale, tx } from '../../i18n';
import { LEVEL_NAMES } from '../../data/topics';
import { formatTime, type GameReport } from '../../engine/report';
import type { Level } from '../../types';

const MODE: Record<string, string> = {
  get quick() { return tx('Szybka rozgrywka', 'Quick game'); }, get campaign() { return tx('Kampania', 'Campaign'); },
  get timed() { return tx('Wyzwanie na czas', 'Time challenge'); }, get class() { return tx('Tryb klasowy', 'Class mode'); },
};

export function reportToText(r: GameReport): string {
  const lines = [
    tx('MATEMATYCZNY ESCAPE ROOM – raport', 'MATHS ESCAPE ROOM – report'),
    `${tx('Scenariusz', 'Scenario')}: ${r.scenarioTitle}`,
    `${tx('Poziom', 'Level')}: ${LEVEL_NAMES[r.level as Level]}   ${tx('Tryb', 'Mode')}: ${MODE[r.mode] ?? r.mode}`,
    `${tx('Gracz', 'Player')}: ${r.playerName}${r.teamName ? `   ${tx('Drużyna', 'Team')}: ${r.teamName}` : ''}`,
    `${tx('Data', 'Date')}: ${new Date(r.date).toLocaleString(locale())}`,
    '',
    `${tx('Wynik', 'Score')}: ${r.score}   Status: ${r.status === 'won' ? tx('ucieczka udana', 'escaped') : tx('nieukończony', 'not completed')}`,
    `${tx('Czas', 'Time')}: ${formatTime(r.elapsed)}   ${tx('Zagadki', 'Puzzles')}: ${r.solved}/${r.totalPuzzles}   ${tx('Błędy', 'Errors')}: ${r.wrong}   ${tx('Podpowiedzi', 'Hints')}: ${r.hintsUsed}   ${tx('Poprawność', 'Accuracy')}: ${r.accuracy}%`,
    `${tx('Ocena skuteczności', 'Performance')}: ${r.rating.title}`,
    '',
    tx('Najlepiej opanowane: ', 'Strongest topics: ') + (r.mastered.join(', ') || '—'),
    tx('Do powtórzenia: ', 'To revise: ') + (r.toReview.join(', ') || '—'),
    tx('Najtrudniejsze zagadki: ', 'Hardest puzzles: ') + (r.hardest.map((h) => h.title).join(', ') || '—'),
    '',
    tx('Sugerowane ćwiczenia:', 'Suggested exercises:'),
    ...r.exercises.map((e) => ' - ' + e),
    '',
    tx('Zagadki:', 'Puzzles:'),
    ...r.rows.map((x) => ` - ${x.title}: ${x.solved ? tx('rozwiązana', 'solved') : tx('nierozwiązana', 'unsolved')}, ${tx('błędy', 'errors')} ${x.wrong}, ${tx('podpowiedzi', 'hints')} ${x.hints}`),
    '',
    tx('Raport jest informacją zwrotną, a nie oceną szkolną.', 'This report is feedback, not a school grade.'),
    '© 2026 CappySoft.pl',
  ];
  return lines.join('\n');
}

export function reportsToCSV(list: GameReport[]): string {
  const head = ['data', 'gracz', 'druzyna', 'scenariusz', 'poziom', 'tryb', 'status', 'wynik', 'czas_s', 'rozwiazane', 'zagadki', 'bledy', 'podpowiedzi', 'poprawnosc_proc', 'do_powtorzenia'];
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = list.map((r) => [r.date, r.playerName, r.teamName ?? '', r.scenarioTitle, LEVEL_NAMES[r.level as Level], MODE[r.mode] ?? r.mode, r.status, r.score, r.elapsed, r.solved, r.totalPuzzles, r.wrong, r.hintsUsed, r.accuracy, r.toReview.join('; ')].map(esc).join(';'));
  return '﻿' + [head.join(';'), ...rows].join('\n');
}
