/* =========================================================================
 * Wielojęzyczność (PL / EN).
 * Język jest trzymany w zmiennej modułu; App przemontowuje drzewo komponentów
 * po zmianie języka, więc wywołania tx() zawsze widzą aktualną wartość.
 * ========================================================================= */
export type Lang = 'pl' | 'en';

let current: Lang = 'pl';

export function getLang(): Lang { return current; }

export function setLang(l: Lang) {
  current = l;
  if (typeof document !== 'undefined') document.documentElement.lang = l;
}

/** Tekst w bieżącym języku */
export function tx(pl: string, en: string): string {
  return current === 'en' ? en : pl;
}

/** Liczba z separatorem dziesiętnym właściwym dla języka */
export function fmtNum(n: number | string): string {
  const s = String(n);
  return current === 'en' ? s : s.replace('.', ',');
}

export function locale(): string { return current === 'en' ? 'en-GB' : 'pl-PL'; }

export function detectLang(): Lang {
  try {
    return (navigator.language || 'pl').toLowerCase().startsWith('pl') ? 'pl' : 'en';
  } catch {
    return 'pl';
  }
}
