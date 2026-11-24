import type { Puzzle } from '../types';

export type AnswerValue = string | number | string[] | number[];

/** Zamienia tekst wpisany przez ucznia na liczbę (obsługa przecinka, ułamków, jednostek, spacji) */
export function parseNumber(input: string): number | null {
  const s = input.trim().toLowerCase().replace(/ /g, ' ').replace(/−/g, '-');
  if (!s) return null;
  // liczba (z opcjonalnymi spacjami tysięcy i przecinkiem), opcjonalny ułamek, potem ewentualna jednostka
  const m = s.match(/^((?:-?\d{1,3}(?: \d{3})+|-?\d+)(?:[.,]\d+)?|-?[.,]\d+)(?:\s*\/\s*(-?\d+(?:[.,]\d+)?))?\s*(.*)$/);
  if (!m) return null;
  const rest = m[3];
  if (rest && /^[\d.,/]/.test(rest)) return null;
  const num = parseFloat(m[1].replace(/ /g, '').replace(',', '.'));
  if (m[2] !== undefined) {
    const d = parseFloat(m[2].replace(',', '.'));
    if (d === 0) return null;
    return num / d;
  }
  return Number.isFinite(num) ? num : null;
}

export function normalizeText(s: string): string {
  return s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/\s+/g, ' ');
}

/** Sprawdza odpowiedź ucznia. Zwraca true, gdy jest poprawna. */
export function checkAnswer(p: Puzzle, value: AnswerValue): boolean {
  switch (p.kind) {
    case 'number': {
      const n = typeof value === 'number' ? value : parseNumber(String(value));
      if (n === null) return false;
      const tol = p.tolerance ?? 1e-6;
      return Math.abs(n - p.answer) <= tol;
    }
    case 'text': {
      const v = normalizeText(String(value));
      return p.answers.some((a) => normalizeText(a) === v);
    }
    case 'choice':
      return Number(value) === p.correct;
    case 'order': {
      const arr = value as string[];
      return Array.isArray(arr) && arr.length === p.items.length && arr.every((x, i) => x === p.items[i]);
    }
    case 'match': {
      // value: tablica prawych elementów w kolejności lewych
      const arr = value as string[];
      return Array.isArray(arr) && arr.length === p.pairs.length && arr.every((x, i) => x === p.pairs[i][1]);
    }
    case 'code': {
      const arr = Array.isArray(value) ? (value as string[]).map(String) : String(value).split('');
      return arr.length === p.answer.length && arr.every((x, i) => x.toUpperCase() === p.answer[i].toUpperCase());
    }
    case 'switches': {
      const idx = (value as number[]).map(Number);
      const sum = idx.reduce((acc, i) => acc + (p.switches[i]?.value ?? 0), 0);
      return idx.length > 0 && Math.abs(sum - p.target) < 1e-9;
    }
  }
}

/** Przykładowa poprawna odpowiedź (używana w testach automatycznych i w podglądzie nauczyciela) */
export function sampleSolution(p: Puzzle): AnswerValue {
  switch (p.kind) {
    case 'number': return String(p.answer).replace('.', ',');
    case 'text': return p.answers[0];
    case 'choice': return p.correct;
    case 'order': return [...p.items];
    case 'match': return p.pairs.map((x) => x[1]);
    case 'code': return [...p.answer];
    case 'switches': {
      // przeszukanie podzbiorów
      const n = p.switches.length;
      for (let mask = 1; mask < 1 << n; mask++) {
        const idx: number[] = [];
        let sum = 0;
        for (let i = 0; i < n; i++) if (mask & (1 << i)) { idx.push(i); sum += p.switches[i].value; }
        if (Math.abs(sum - p.target) < 1e-9) return idx;
      }
      return [];
    }
  }
}

/** Czytelny opis poprawnej odpowiedzi (raport nauczyciela) */
export function describeSolution(p: Puzzle): string {
  switch (p.kind) {
    case 'number': return `${String(p.answer).replace('.', ',')}${p.unit ? ' ' + p.unit : ''}`;
    case 'text': return p.answers[0];
    case 'choice': return p.options[p.correct];
    case 'order': return p.items.join(' → ');
    case 'match': return p.pairs.map(([a, b]) => `${a} ↔ ${b}`).join('; ');
    case 'code': return p.answer.join(p.style === 'symbols' ? ' ' : '');
    case 'switches': {
      const s = sampleSolution(p) as number[];
      return s.map((i) => p.switches[i].label).join(' + ') + ` = ${p.target}${p.unit ? ' ' + p.unit : ''}`;
    }
  }
}
