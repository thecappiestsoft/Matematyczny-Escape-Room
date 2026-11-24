import type { Scenario, TopicId } from '../types';
import { TOPICS } from '../data/topics';
import { activePuzzleIds, type GameState } from './game';
import { getPuzzle } from './level';
import { rateEfficiency, type Rating } from './scoring';

export interface PuzzleReportRow {
  id: string; title: string; topic: TopicId; solved: boolean; wrong: number; hints: number; bonus: boolean;
  /** czy gracz w ogóle zmierzył się z zagadką (dla bonusowych – czy ją odnalazł) */
  attempted: boolean;
}

export interface TopicReport { topic: TopicId; name: string; puzzles: number; solved: number; wrong: number; hints: number }

export interface GameReport {
  scenarioId: string;
  scenarioTitle: string;
  level: string;
  mode: string;
  playerName: string;
  teamName?: string;
  classSessionId?: string;
  date: string;
  status: 'won' | 'ended' | 'playing';
  score: number;
  elapsed: number;
  timeLimit: number | null;
  timedOut: boolean;
  solved: number;
  totalPuzzles: number;
  correct: number;
  wrong: number;
  hintsUsed: number;
  accuracy: number;
  secretsFound: number;
  secretsTotal: number;
  rating: Rating;
  rows: PuzzleReportRow[];
  topics: TopicReport[];
  hardest: PuzzleReportRow[];
  mastered: string[];
  toReview: string[];
  exercises: string[];
  cooperation?: number;
}

export function buildReport(s: GameState, sc: Scenario): GameReport {
  const level = s.config.level;
  const ids = activePuzzleIds(sc, s.config);
  const rows: PuzzleReportRow[] = ids.map((id) => {
    const p = getPuzzle(sc, id, level);
    const st = s.puzzles[id];
    return {
      id, title: p.title, topic: p.topic, bonus: !!sc.puzzles[id].bonus,
      solved: !!st?.solved, wrong: st?.wrong ?? 0, hints: st?.hints ?? 0,
      attempted: !!st && (st.attempts > 0 || st.hints > 0 || st.solved),
    };
  });
  const solved = rows.filter((r) => r.solved).length;
  const wrong = rows.reduce((a, r) => a + r.wrong, 0);
  const hintsUsed = rows.reduce((a, r) => a + r.hints, 0);
  const accuracy = solved + wrong === 0 ? 0 : Math.round((solved / (solved + wrong)) * 100);

  const tmap = new Map<TopicId, TopicReport>();
  // nieodnalezione zagadki dodatkowe nie wpływają na ocenę działów
  const relevant = rows.filter((r) => !r.bonus || r.attempted);
  for (const r of relevant) {
    const t = tmap.get(r.topic) ?? { topic: r.topic, name: TOPICS[r.topic]?.name ?? r.topic, puzzles: 0, solved: 0, wrong: 0, hints: 0 };
    t.puzzles++; if (r.solved) t.solved++; t.wrong += r.wrong; t.hints += r.hints;
    tmap.set(r.topic, t);
  }
  const topics = [...tmap.values()];
  const mastered = topics.filter((t) => t.solved === t.puzzles && t.wrong === 0 && t.hints <= 1).map((t) => t.name);
  const reviewTopics = topics.filter((t) => t.wrong >= 2 || t.hints >= 3 || t.solved < t.puzzles);
  const hardest = relevant
    .filter((r) => r.wrong + r.hints > 0 || !r.solved)
    .sort((a, b) => (b.wrong * 2 + b.hints + (b.solved ? 0 : 5)) - (a.wrong * 2 + a.hints + (a.solved ? 0 : 5)))
    .slice(0, 3);
  const secretsTotal = sc.rooms.reduce((a, r) => a + r.objects.filter((o) => o.secret && (s.config.includeBonus || !(o.lock?.type === 'puzzle' && sc.puzzles[o.lock.puzzle]?.bonus))).length, 0);

  return {
    scenarioId: sc.id,
    scenarioTitle: sc.title,
    level,
    mode: s.config.mode,
    playerName: s.config.playerName,
    teamName: s.config.teamName,
    classSessionId: s.config.classSessionId,
    date: new Date().toISOString(),
    status: s.status,
    score: s.score,
    elapsed: s.elapsed,
    timeLimit: s.config.timeLimit,
    timedOut: s.timedOut,
    solved,
    totalPuzzles: rows.length,
    correct: solved,
    wrong,
    hintsUsed,
    accuracy,
    secretsFound: s.secretsFound.length,
    secretsTotal,
    rating: rateEfficiency(accuracy, hintsUsed, rows.length),
    rows,
    topics,
    hardest,
    mastered,
    toReview: reviewTopics.map((t) => t.name),
    exercises: reviewTopics.map((t) => `${TOPICS[t.topic]?.name}: ${TOPICS[t.topic]?.exercise}`),
  };
}

export function formatTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}
