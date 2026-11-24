/* =========================================================================
 * MATEMATYCZNY ESCAPE ROOM – model danych
 * Scenariusze są w 100% opisane danymi (data-driven). Silnik gry nie zawiera
 * żadnej wiedzy o konkretnych scenariuszach – dzięki temu nowe escape roomy
 * (także z edytora nauczyciela) działają bez przebudowy aplikacji.
 * ========================================================================= */

/** Poziom edukacyjny: szkoła podstawowa, liceum, technikum */
export type Level = 'sp' | 'lo' | 'tech';

/** Wartość zależna od poziomu (lub wspólna dla wszystkich poziomów) */
export type L<T> = T | { sp: T; lo: T; tech: T };

export type TopicId =
  | 'dzialania' | 'kolejnosc' | 'ulamki' | 'procenty' | 'proporcje' | 'jednostki'
  | 'pola' | 'bryly' | 'rownania' | 'geometria' | 'ciagi' | 'funkcje'
  | 'trygonometria' | 'logarytmy' | 'potegi' | 'prawdopodobienstwo' | 'statystyka'
  | 'finanse' | 'technika' | 'logika' | 'wykresy' | 'systemy_liczbowe' | 'optymalizacja';

/* ----------------------------- Wizualizacje ----------------------------- */

export interface ShapeSpec {
  kind: 'rect' | 'square' | 'triangle' | 'trapezoid' | 'circle' | 'rhombus' | 'parallelogram' | 'pentagon' | 'hexagon';
  label: string;
  dims: string[];
}

export type Visual =
  | { type: 'bars'; title?: string; labels: string[]; values: number[]; unit?: string }
  | {
      type: 'line'; title?: string; xLabel?: string; yLabel?: string;
      points: [number, number][]; connect?: boolean; extend?: boolean;
      xRange?: [number, number]; yRange?: [number, number]; grid?: boolean;
    }
  | { type: 'table'; title?: string; headers: string[]; rows: (string | number)[][] }
  | { type: 'shapes'; shapes: ShapeSpec[] }
  | { type: 'clock'; h: number; m: number }
  | { type: 'egypt'; numbers: number[] }
  | { type: 'egyptLegend' }
  | { type: 'symbols'; items: string[]; caption?: string };

/* ------------------------------- Zagadki -------------------------------- */

export type PuzzleKind = 'number' | 'text' | 'choice' | 'order' | 'match' | 'code' | 'switches';
export type CodeStyle = 'keypad' | 'dials' | 'letters' | 'symbols';

interface PuzzleBase {
  title: string;
  topic: TopicId;
  prompt: string;
  visual?: Visual;
  /** Trzy poziomy podpowiedzi: delikatna, matematyczna, pełne rozwiązanie */
  hints: [string, string, string];
}

export interface NumberPuzzle extends PuzzleBase { kind: 'number'; answer: number; tolerance?: number; unit?: string }
export interface TextPuzzle extends PuzzleBase { kind: 'text'; answers: string[] }
export interface ChoicePuzzle extends PuzzleBase { kind: 'choice'; options: string[]; correct: number }
/** items podane w PRAWIDŁOWEJ kolejności – interfejs je tasuje */
export interface OrderPuzzle extends PuzzleBase { kind: 'order'; items: string[]; orderLabel?: [string, string] }
/** pary [lewa, prawa] – interfejs tasuje prawą kolumnę */
export interface MatchPuzzle extends PuzzleBase { kind: 'match'; pairs: [string, string][] }
export interface CodePuzzle extends PuzzleBase {
  kind: 'code'; style: CodeStyle;
  /** wartości kolejnych pozycji zamka */
  answer: string[];
  /** dla stylu letters/symbols – zestaw znaków na każdym kole */
  wheels?: string[][];
}
export interface SwitchPuzzle extends PuzzleBase {
  kind: 'switches';
  switches: { label: string; value: number }[];
  target: number;
  unit?: string;
}

export type Puzzle = NumberPuzzle | TextPuzzle | ChoicePuzzle | OrderPuzzle | MatchPuzzle | CodePuzzle | SwitchPuzzle;

export interface PuzzleEntry {
  variants: L<Puzzle>;
  /** zagadka dodatkowa – nie jest wymagana do ucieczki */
  bonus?: boolean;
}

/* ------------------------- Obiekty i pomieszczenia ---------------------- */

export type Lock =
  | { type: 'item'; item: string; consume?: boolean }
  | { type: 'puzzle'; puzzle: string }
  | { type: 'flag'; flag: string };

export interface Effects {
  items?: string[];
  clues?: string[];
  flags?: string[];
  message?: L<string>;
}

export interface GameObject {
  id: string;
  name: string;
  /** identyfikator grafiki z biblioteki obiektów */
  art: string;
  /** położenie w scenie 1600×900 */
  x: number; y: number; w: number; h: number;
  description: L<string>;
  /** obiekt ukryty – trudniej go zauważyć, za odkrycie są punkty */
  secret?: boolean;
  /** obiekt widoczny dopiero po ustawieniu flagi */
  showIf?: string;
  /** obiekt znika po ustawieniu flagi */
  hideIf?: string;
  lock?: Lock;
  /** opis tego, czego brakuje (gdy zamknięte) */
  lockedText?: L<string>;
  /** efekty przy otwarciu / pierwszym obejrzeniu */
  onOpen?: Effects;
  /** opis po otwarciu */
  openedText?: L<string>;
  /** przejście do innego pomieszczenia lub wyjście ze scenariusza */
  door?: { to: string } | { exit: true };
}

export interface Room {
  id: string;
  name: string;
  /** wariant tła (patrz render/backgrounds) */
  bg: string;
  /** pomieszczenie jest ciemne, dopóki nie zostanie ustawiona flaga */
  darkUntil?: string;
  intro: L<string>;
  objects: GameObject[];
}

export interface ItemDef { name: string; icon: string; description: string }
export interface ClueDef { title: string; text: L<string>; visual?: L<Visual | undefined> }

export type ThemeId = 'school' | 'egypt' | 'lab' | 'bank' | 'space' | 'city';

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  theme: ThemeId;
  difficulty: 1 | 2 | 3;
  levels: Level[];
  intro: L<string>;
  ending: L<string>;
  startRoom: string;
  rooms: Room[];
  items: Record<string, ItemDef>;
  clues: Record<string, ClueDef>;
  puzzles: Record<string, PuzzleEntry>;
  reward: { badge: string; title: string };
  /** scenariusz zapowiedziany (jeszcze niegrywalny) */
  comingSoon?: boolean;
  /** scenariusz utworzony w edytorze nauczyciela */
  custom?: boolean;
}

/* ------------------------------- Ustawienia ----------------------------- */

export type GameMode = 'quick' | 'campaign' | 'timed' | 'class';
export type TimeoutBehavior = 'continue' | 'end';

export interface ScoringConfig {
  solve: number;
  noHintBonus: number;
  secret: number;
  room: number;
  scenario: number;
  hint1: number;
  hint2: number;
  hint3: number;
  wrong: number;
  timeout: number;
  /** punkty za każdą pozostałą minutę (tryb z limitem) */
  timePerMinute: number;
  /** podstawowy czas blokady zamka po błędnej odpowiedzi w sekundach (0 = bez blokady);
   *  kolejne błędy: ×1, ×3, ×6, ×9 – zapobiega zgadywaniu metodą prób i błędów */
  lockout: number;
}

export interface SessionConfig {
  scenarioId: string;
  level: Level;
  mode: GameMode;
  /** limit w minutach lub null */
  timeLimit: number | null;
  timeoutBehavior: TimeoutBehavior;
  /** maksymalna łączna liczba podpowiedzi (null = bez limitu) */
  hintLimit: number | null;
  includeBonus: boolean;
  playerName: string;
  teamName?: string;
  classSessionId?: string;
}
