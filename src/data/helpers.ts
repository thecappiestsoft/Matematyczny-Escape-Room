import type { L } from '../types';

/** '748' -> ['7','4','8'] */
export const digits = (s: string): string[] => s.split('');

/** Ta sama wartość dla wszystkich poziomów */
export const all = <T>(v: T): L<T> => v;

/** Wartości dla poziomów: SP, LO, TECH */
export const lvl = <T>(sp: T, lo: T, tech: T): L<T> => ({ sp, lo, tech });

export const LETTERS_A_H = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
export const SHAPES = ['tri', 'sq', 'pent', 'hex', 'circ'];
