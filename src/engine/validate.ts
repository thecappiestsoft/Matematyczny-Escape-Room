import { tx } from '../i18n';
/* Automatyczny „gracz-tester”: sprawdza, czy scenariusz da się ukończyć.
 * Używany w testach oraz w edytorze nauczyciela (przycisk „Sprawdź scenariusz”). */
import type { Level, Scenario, SessionConfig } from '../types';
import { sampleSolution } from './answers';
import { enterRoom, escape, examine, getRoom, isUnlocked, newGame, submitAnswer, takeHint, tick, useItem, visibleObjects, type GameState } from './game';
import { getPuzzle } from './level';
import { DEFAULT_SCORING } from './scoring';

export function autoplay(sc: Scenario, level: Level, includeBonus: boolean, useHints = false): GameState {
  const cfg: SessionConfig = { scenarioId: sc.id, level, mode: 'quick', timeLimit: 30, timeoutBehavior: 'continue', hintLimit: null, includeBonus, playerName: 'Test' };
  let s = newGame(cfg, sc, DEFAULT_SCORING);
  for (let iter = 0; iter < 400 && s.status === 'playing'; iter++) {
    let progressed = false;
    let nextRoom: string | null = null;
    const room = getRoom(sc, s.roomId);
    for (const o of visibleObjects(s, sc, room)) {
      const before = JSON.stringify([s.opened, s.flags, s.inventory]);
      s = examine(s, sc, o.id).state;
      if (o.lock?.type === 'puzzle' && !isUnlocked(s, o)) {
        const p = getPuzzle(sc, o.lock.puzzle, level);
        if (useHints) s = takeHint(s, sc, o.lock.puzzle).state;
        s = submitAnswer(s, sc, o.id, sampleSolution(p)).state;
      }
      if (o.lock?.type === 'item' && !isUnlocked(s, o) && s.inventory.includes(o.lock.item)) s = useItem(s, sc, o.id, o.lock.item).state;
      s = tick(s, 5).state;
      if (JSON.stringify([s.opened, s.flags, s.inventory]) !== before) progressed = true;
      if (o.door && isUnlocked(s, o)) {
        if ('exit' in o.door) nextRoom = '__exit';
        else if (!s.visitedRooms.includes(o.door.to)) nextRoom = o.door.to;
      }
    }
    if (!progressed && nextRoom === '__exit') { s = escape(s).state; break; }
    if (!progressed && nextRoom) { s = enterRoom(s, sc, nextRoom).state; continue; }
    if (!progressed && s.status === 'playing') {
      const others = s.visitedRooms.filter((r) => r !== s.roomId);
      const next = others[iter % Math.max(1, others.length)];
      if (next) s = enterRoom(s, sc, next).state;
    }
  }
  return s;
}

export interface ValidationResult { ok: boolean; problems: string[]; warnings: string[] }

/** Walidacja scenariusza (np. z edytora) – struktura + przejście automatem */
export function validateScenario(sc: Scenario): ValidationResult {
  const problems: string[] = [];
  const warnings: string[] = [];
  if (!sc.rooms.length) problems.push(tx('Scenariusz nie ma żadnych pomieszczeń.', 'The scenario has no rooms.'));
  if (!sc.rooms.some((r) => r.id === sc.startRoom)) problems.push(tx('Nie ustawiono pomieszczenia startowego.', 'No starting room is set.'));
  const hasExit = sc.rooms.some((r) => r.objects.some((o) => o.door && 'exit' in o.door));
  if (!hasExit) problems.push(tx('Brak obiektu będącego wyjściem (drzwi z opcją „wyjście ze scenariusza”).', 'There is no exit object (a door set to “exit – end of scenario”).'));
  for (const r of sc.rooms) {
    if (r.objects.length < 5) warnings.push(tx(`Pomieszczenie „${r.name}” ma mniej niż 5 obiektów (${r.objects.length}).`, `Room “${r.name}” has fewer than 5 objects (${r.objects.length}).`));
    for (const o of r.objects) {
      if (o.lock?.type === 'puzzle' && !sc.puzzles[o.lock.puzzle]) problems.push(tx(`Obiekt „${o.name}” wskazuje na nieistniejącą zagadkę.`, `Object “${o.name}” points to a puzzle that does not exist.`));
      if (o.lock?.type === 'item' && !sc.items[o.lock.item]) problems.push(tx(`Obiekt „${o.name}” wymaga nieistniejącego przedmiotu.`, `Object “${o.name}” requires an item that does not exist.`));
      if (o.door && 'to' in o.door) { const to = o.door.to; if (!sc.rooms.some((x) => x.id === to)) problems.push(tx(`Drzwi „${o.name}” prowadzą do nieistniejącego pomieszczenia.`, `Door “${o.name}” leads to a room that does not exist.`)); }
    }
  }
  for (const [id, e] of Object.entries(sc.puzzles)) {
    for (const lv of ['sp', 'lo', 'tech'] as Level[]) {
      try {
        const p = getPuzzle(sc, id, lv);
        if (!p.prompt.trim()) problems.push(tx(`Zagadka „${p.title || id}” nie ma treści.`, `Puzzle “${p.title || id}” has no question text.`));
        if (p.hints.some((h) => !h.trim())) warnings.push(tx(`Zagadka „${p.title || id}” nie ma kompletu trzech podpowiedzi.`, `Puzzle “${p.title || id}” does not have all three hints.`));
      } catch { problems.push(tx(`Błędna zagadka ${id}.`, `Invalid puzzle ${id}.`)); }
      if (typeof e.variants !== 'object') break;
    }
  }
  if (!problems.length) {
    for (const lv of sc.levels) {
      const s = autoplay(sc, lv, true);
      if (s.status !== 'won') problems.push(tx(`Automatyczny tester nie zdołał ukończyć scenariusza (poziom ${lv.toUpperCase()}). Sprawdź, czy wszystkie przedmioty i drzwi są osiągalne.`, `The automatic tester could not complete the scenario (level ${lv.toUpperCase()}). Check that every item and door can be reached.`));
    }
  }
  return { ok: problems.length === 0, problems, warnings };
}
