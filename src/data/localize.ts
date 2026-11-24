/* Nakładki językowe: scenariusz jest zdefiniowany raz (logika, odpowiedzi, układ),
 * a tłumaczenie podmienia wyłącznie teksty. Dzięki temu odpowiedzi i kody są
 * identyczne w obu językach. */
import type { ClueDef, Effects, L, Level, Puzzle, Scenario, Visual } from '../types';

export interface PuzzlePatch {
  title?: string;
  prompt?: string;
  hints?: [string, string, string];
  options?: string[];
  /** zagadka „ułóż” – elementy w PRAWIDŁOWEJ kolejności */
  items?: string[];
  orderLabel?: [string, string];
  /** pary w prawidłowym dopasowaniu */
  pairs?: [string, string][];
  unit?: string;
  switchLabels?: string[];
  visual?: Visual;
}

export interface ObjectPatch {
  name: string;
  description: L<string>;
  lockedText?: L<string>;
  openedText?: L<string>;
  message?: L<string>;
}

export interface ScenarioOverlay {
  title: string;
  subtitle: string;
  description: string;
  intro: L<string>;
  ending: L<string>;
  reward: string;
  items: Record<string, { name: string; description: string }>;
  clues: Record<string, { title: string; text: L<string>; visual?: L<Visual | undefined> }>;
  puzzles: Record<string, PuzzlePatch | { sp: PuzzlePatch; lo: PuzzlePatch; tech: PuzzlePatch }>;
  rooms: Record<string, { name: string; intro: L<string>; objects: Record<string, ObjectPatch> }>;
}

const LEVELS: Level[] = ['sp', 'lo', 'tech'];

function isLeveled<T>(v: unknown): v is { sp: T; lo: T; tech: T } {
  return !!v && typeof v === 'object' && !Array.isArray(v) && 'sp' in (v as object) && 'lo' in (v as object) && 'tech' in (v as object);
}

function patchPuzzle(p: Puzzle, patch: PuzzlePatch | undefined): Puzzle {
  if (!patch) return p;
  const out = { ...p } as Puzzle & Record<string, unknown>;
  if (patch.title) out.title = patch.title;
  if (patch.prompt) out.prompt = patch.prompt;
  if (patch.hints) out.hints = patch.hints;
  if (patch.visual) out.visual = patch.visual;
  if (patch.unit !== undefined && (p.kind === 'number' || p.kind === 'switches')) out.unit = patch.unit;
  if (p.kind === 'choice' && patch.options) (out as { options: string[] }).options = patch.options;
  if (p.kind === 'order') {
    if (patch.items) (out as { items: string[] }).items = patch.items;
    if (patch.orderLabel) (out as { orderLabel?: [string, string] }).orderLabel = patch.orderLabel;
  }
  if (p.kind === 'match' && patch.pairs) (out as { pairs: [string, string][] }).pairs = patch.pairs;
  if (p.kind === 'switches' && patch.switchLabels) {
    (out as { switches: { label: string; value: number }[] }).switches = p.switches.map((s, i) => ({ ...s, label: patch.switchLabels![i] ?? s.label }));
  }
  return out as Puzzle;
}

function patchEffects(e: Effects | undefined, message: L<string> | undefined): Effects | undefined {
  if (!e || message === undefined) return e;
  return { ...e, message };
}

/** Zwraca kopię scenariusza z tekstami z nakładki */
export function localizeScenario(sc: Scenario, ov: ScenarioOverlay | undefined): Scenario {
  if (!ov) return sc;
  const puzzles: Scenario['puzzles'] = {};
  for (const [id, entry] of Object.entries(sc.puzzles)) {
    const patch = ov.puzzles[id];
    const variants = entry.variants;
    let next: L<Puzzle>;
    if (!isLeveled<Puzzle>(variants) && !isLeveled<PuzzlePatch>(patch)) {
      next = patchPuzzle(variants as Puzzle, patch as PuzzlePatch | undefined);
    } else {
      const v: Record<Level, Puzzle> = {} as Record<Level, Puzzle>;
      for (const l of LEVELS) {
        const base = isLeveled<Puzzle>(variants) ? variants[l] : (variants as Puzzle);
        const pp = isLeveled<PuzzlePatch>(patch) ? patch[l] : (patch as PuzzlePatch | undefined);
        v[l] = patchPuzzle(base, pp);
      }
      next = v;
    }
    puzzles[id] = { ...entry, variants: next };
  }
  const clues: Scenario['clues'] = {};
  for (const [id, c] of Object.entries(sc.clues)) {
    const o = ov.clues[id];
    clues[id] = o ? ({ title: o.title, text: o.text, visual: o.visual !== undefined ? o.visual : c.visual } as ClueDef) : c;
  }
  const items: Scenario['items'] = {};
  for (const [id, it] of Object.entries(sc.items)) items[id] = { ...it, ...(ov.items[id] ?? {}) };
  return {
    ...sc,
    title: ov.title,
    subtitle: ov.subtitle,
    description: ov.description,
    intro: ov.intro,
    ending: ov.ending,
    reward: { ...sc.reward, title: ov.reward },
    items,
    clues,
    puzzles,
    rooms: sc.rooms.map((r) => {
      const ro = ov.rooms[r.id];
      if (!ro) return r;
      return {
        ...r,
        name: ro.name,
        intro: ro.intro,
        objects: r.objects.map((o) => {
          const op = ro.objects[o.id];
          if (!op) return o;
          return {
            ...o,
            name: op.name,
            description: op.description,
            lockedText: op.lockedText ?? o.lockedText,
            openedText: op.openedText ?? o.openedText,
            onOpen: patchEffects(o.onOpen, op.message),
          };
        }),
      };
    }),
  };
}
