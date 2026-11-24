declare const process: { exit(code: number): never };
/* Automatyczna kontrola jakości: przechodzi każdy scenariusz na każdym poziomie,
 * sprawdza spójność danych, poprawność odpowiedzi, punktację i zegar.
 * Uruchom: npm test */
import { BUILTIN_SCENARIOS, builtinScenarios, EN_OVERLAYS } from '../src/data/scenarios/index';
import { setLang } from '../src/i18n';
import { checkAnswer, parseNumber, sampleSolution, type AnswerValue } from '../src/engine/answers';
import { examine, lockRemaining, newGame, submitAnswer, takeHint, tick, useItem } from '../src/engine/game';
import { autoplay, validateScenario } from '../src/engine/validate';
import { getPuzzle, lv } from '../src/engine/level';
import { buildReport } from '../src/engine/report';
import { DEFAULT_SCORING } from '../src/engine/scoring';
import type { Level, Scenario, SessionConfig } from '../src/types';

let failures = 0;
let checks = 0;
function ok(cond: unknown, msg: string) {
  checks++;
  if (!cond) { failures++; console.error('  ✗ ' + msg); }
}

/* ---------- parsowanie liczb ---------- */
ok(parseNumber('4,90') === 4.9, 'przecinek dziesiętny');
ok(parseNumber('1 600') === 1600, 'spacja tysięcy');
ok(parseNumber('40 cm²') === 40, 'jednostka po liczbie');
ok(Math.abs((parseNumber('1/6') ?? 0) - 1 / 6) < 1e-9, 'ułamek zwykły');
ok(parseNumber('−3') === -3, 'minus typograficzny');
ok(parseNumber('abc') === null, 'tekst nie jest liczbą');
ok(parseNumber('12 3/4') === null, 'niejednoznaczny zapis odrzucony');

const LEVELS: Level[] = ['sp', 'lo', 'tech'];

function validate(sc: Scenario) {
  const objIds = new Set<string>();
  const grantedItems = new Set<string>();
  const grantedClues = new Set<string>();
  const grantedFlags = new Set<string>();
  for (const r of sc.rooms) for (const o of r.objects) {
    ok(!objIds.has(o.id), `${sc.id}: unikalny id obiektu ${o.id}`);
    objIds.add(o.id);
    o.onOpen?.items?.forEach((i) => grantedItems.add(i));
    o.onOpen?.clues?.forEach((c) => grantedClues.add(c));
    o.onOpen?.flags?.forEach((f) => grantedFlags.add(f));
    ok(o.x >= 0 && o.y >= 0 && o.x + o.w <= 1600 && o.y + o.h <= 900, `${sc.id}: obiekt ${o.id} mieści się w scenie`);
    if (o.door && 'to' in o.door) { const to = o.door.to; ok(sc.rooms.some((x) => x.id === to), `${sc.id}: drzwi ${o.id} prowadzą do istniejącego pokoju`); }
    if (o.lock?.type === 'puzzle') ok(sc.puzzles[o.lock.puzzle], `${sc.id}: zagadka ${o.lock.puzzle} istnieje`);
    if (o.lock?.type === 'item') ok(sc.items[o.lock.item], `${sc.id}: przedmiot ${o.lock.item} istnieje`);
  }
  for (const r of sc.rooms) {
    ok(r.objects.length >= 5, `${sc.id}/${r.id}: min. 5 obiektów (jest ${r.objects.length})`);
  }
  ok(sc.rooms.length >= 4, `${sc.id}: min. 4 pomieszczenia`);
  for (const i of Object.keys(sc.items)) ok(grantedItems.has(i), `${sc.id}: przedmiot ${i} da się zdobyć`);
  for (const c of Object.keys(sc.clues)) ok(grantedClues.has(c), `${sc.id}: wskazówka ${c} da się zdobyć`);
  for (const r of sc.rooms) for (const o of r.objects) {
    if (o.showIf) ok(grantedFlags.has(o.showIf), `${sc.id}: flaga ${o.showIf} da się ustawić`);
    if (o.lock?.type === 'flag') ok(grantedFlags.has(o.lock.flag), `${sc.id}: flaga zamka ${o.lock.flag} da się ustawić`);
  }
  for (const level of LEVELS) for (const pid of Object.keys(sc.puzzles)) {
    const p = getPuzzle(sc, pid, level);
    ok(p.hints.length === 3 && p.hints.every((h) => h.length > 5), `${sc.id}/${pid}/${level}: 3 podpowiedzi`);
    const sol = sampleSolution(p);
    ok(checkAnswer(p, sol), `${sc.id}/${pid}/${level}: przykładowe rozwiązanie jest poprawne`);
    if (p.kind === 'choice') ok(p.correct >= 0 && p.correct < p.options.length, `${sc.id}/${pid}: indeks odpowiedzi`);
    if (p.kind === 'code' && p.wheels) p.answer.forEach((a, i) => ok(p.wheels![i].includes(a), `${sc.id}/${pid}/${level}: znak ${a} jest na kole ${i}`));
    if (p.kind === 'switches') ok((sol as number[]).length > 0, `${sc.id}/${pid}/${level}: istnieje kombinacja przełączników`);
    if (p.kind === 'number') ok(!checkAnswer(p, String(p.answer + 1)), `${sc.id}/${pid}/${level}: zła odpowiedź odrzucona`);
    if (p.kind === 'order') ok(!checkAnswer(p, [...p.items].reverse()), `${sc.id}/${pid}/${level}: zła kolejność odrzucona`);
  }
}

for (const sc of BUILTIN_SCENARIOS.filter((x) => !x.comingSoon)) {
  console.log(`▶ ${sc.title}`);
  validate(sc);
  const vr = validateScenario(sc);
  ok(vr.ok, `${sc.id}: walidator edytora: ${vr.problems.join('; ')}`);
  for (const level of LEVELS) {
    for (const bonus of [true, false]) {
      const s = autoplay(sc, level, bonus);
      ok(s.status === 'won', `${sc.id}/${level}/bonus=${bonus}: scenariusz ukończony`);
      ok(s.completedRooms.length === sc.rooms.length, `${sc.id}/${level}: wszystkie pomieszczenia ukończone (${s.completedRooms.length}/${sc.rooms.length})`);
      const rep = buildReport(s, sc);
      ok(rep.solved === rep.totalPuzzles, `${sc.id}/${level}: wszystkie zagadki rozwiązane (${rep.solved}/${rep.totalPuzzles})`);
      ok(rep.accuracy === 100 && rep.wrong === 0, `${sc.id}/${level}: 100% poprawności`);
      ok(s.clues.length === Object.keys(sc.clues).length, `${sc.id}/${level}: zebrano wszystkie wskazówki (${s.clues.length}/${Object.keys(sc.clues).length})`);
      // punkty: zagadki*(100+30) + pokoje*50 + scenariusz 200 + sekrety*20 + premia czasowa
      const secrets = s.secretsFound.length;
      const expected = rep.totalPuzzles * 130 + sc.rooms.length * 50 + 200 + secrets * 20 + s.timeBonus;
      ok(s.score === expected, `${sc.id}/${level}/bonus=${bonus}: punktacja ${s.score} = ${expected}`);
      if (level === 'sp' && bonus) {
        console.log(`  ${level}: ${rep.totalPuzzles} zagadek, ${s.score} pkt, czas ${s.elapsed}s, sekrety ${secrets}/${rep.secretsTotal}`);
        const h = autoplay(sc, level, true, true);
        ok(h.status === 'won', `${sc.id}: ukończenie z podpowiedziami`);
        ok(h.score < s.score, `${sc.id}: podpowiedzi obniżają wynik (${h.score} < ${s.score})`);
      }
    }
  }
}

/* ---------- ochrona przed zgadywaniem ---------- */
{
  const sc = BUILTIN_SCENARIOS[0];
  const cfg: SessionConfig = { scenarioId: sc.id, level: 'lo', mode: 'quick', timeLimit: null, timeoutBehavior: 'continue', hintLimit: null, includeBonus: true, playerName: 'T' };
  // rosnące kary i blokady: 10/20/30 pkt, 5/15/30/45 s
  let s = newGame(cfg, sc, DEFAULT_SCORING);
  s.score = 1000;
  const locks: number[] = []; const pens: number[] = [];
  for (let i = 0; i < 5; i++) {
    const before = s.score;
    s = submitAnswer(s, sc, 'k_tablica', '1').state;
    pens.push(before - s.score);
    locks.push(lockRemaining(s, 'tablica'));
    s = tick(s, locks[i]).state;
  }
  ok(JSON.stringify(pens) === '[10,20,30,30,30]', `rosnąca kara ${JSON.stringify(pens)}`);
  ok(JSON.stringify(locks) === '[5,15,30,45,45]', `rosnąca blokada ${JSON.stringify(locks)}`);
  // nauczyciel może wyłączyć blokadę
  let s0 = newGame(cfg, sc, { ...DEFAULT_SCORING, lockout: 0 });
  s0 = submitAnswer(s0, sc, 'k_tablica', '1').state;
  ok(lockRemaining(s0, 'tablica') === 0, 'blokada wyłączona, gdy lockout = 0');
  // symulacja zgadywania: gracz klika odpowiedzi/kombinacje po kolei, czekając tylko na koniec blokady
  for (const scen of BUILTIN_SCENARIOS.filter((x) => !x.comingSoon)) {
    for (const level of LEVELS) {
      for (const room of scen.rooms) for (const o of room.objects) {
        if (o.lock?.type !== 'puzzle') continue;
        const p = getPuzzle(scen, o.lock.puzzle, level);
        if (p.kind !== 'choice' && p.kind !== 'switches') continue;
        const guesses: AnswerValue[] = p.kind === 'choice' ? p.options.map((_, i) => i)
          : Array.from({ length: (1 << p.switches.length) - 1 }, (_, m) => p.switches.map((_, i) => i).filter((i) => ((m + 1) >> i) & 1));
        const fresh = () => { const x = newGame({ ...cfg, scenarioId: scen.id, level }, scen, DEFAULT_SCORING); x.score = 10000; return x; };
        const perfectGain = submitAnswer(fresh(), scen, o.id, sampleSolution(p)).state.score - 10000;
        let g = fresh();
        let waited = 0; let tries = 0;
        for (const guess of guesses) {
          const r = submitAnswer(g, scen, o.id, guess);
          g = r.state; tries++;
          if (r.correct) break;
          const w = lockRemaining(g, o.lock.puzzle); waited += w; g = tick(g, w).state;
        }
        const guessGain = g.score - 10000;
        // zgadnięcie nawet w 2. próbie daje wyraźnie mniej punktów niż samodzielne rozwiązanie
        if (tries > 1) ok(guessGain <= perfectGain - 40 && waited >= 5, `${scen.id}/${o.lock.puzzle}/${level}: zgadywanie się nie opłaca (${tries} prób, ${waited} s blokady, ${guessGain} vs ${perfectGain} pkt)`);
        if (p.kind === 'choice' && tries === p.options.length) ok(waited >= 50 && guessGain <= perfectGain - 90, `${scen.id}/${o.lock.puzzle}/${level}: przeklikanie wszystkich opcji = ${waited} s blokady, ${guessGain} vs ${perfectGain} pkt`);
      }
    }
  }
}

/* ---------- wersja angielska ---------- */
{
  setLang('en');
  const en = builtinScenarios();
  for (const sc of en.filter((x) => !x.comingSoon)) {
    const ov = EN_OVERLAYS[sc.id];
    const base = BUILTIN_SCENARIOS.find((x) => x.id === sc.id)!;
    ok(ov, `${sc.id}: istnieje tłumaczenie EN`);
    for (const k of Object.keys(ov.puzzles)) ok(base.puzzles[k], `${sc.id}: EN zagadka ${k} istnieje w scenariuszu`);
    for (const k of Object.keys(ov.clues)) ok(base.clues[k], `${sc.id}: EN wskazówka ${k} istnieje`);
    for (const [rid, r] of Object.entries(ov.rooms)) {
      const br = base.rooms.find((x) => x.id === rid);
      ok(br, `${sc.id}: EN pokój ${rid}`);
      for (const oid of Object.keys(r.objects)) ok(br?.objects.some((o) => o.id === oid), `${sc.id}: EN obiekt ${oid}`);
    }
    // brak polskich znaków w treści gry po angielsku
    const skip = new Set(['id', 'art', 'bg', 'theme', 'startRoom', 'to', 'item', 'puzzle', 'flag', 'showIf', 'hideIf', 'darkUntil', 'kind', 'style', 'type', 'icon', 'badge']);
    const bad: string[] = [];
    const scan = (v: unknown, path: string) => {
      if (typeof v === 'string') { if (/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]|\bzł\b/.test(v)) bad.push(`${path}: ${v.slice(0, 60)}`); return; }
      if (Array.isArray(v)) { v.forEach((x, i) => scan(x, `${path}[${i}]`)); return; }
      if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { if (!skip.has(k) && !path.endsWith('.items') && !path.endsWith('.clues') && !path.endsWith('.puzzles')) scan(x, `${path}.${k}`); else if (path.endsWith('.items') || path.endsWith('.clues') || path.endsWith('.puzzles')) scan(x, `${path}.${k}`); }
    };
    scan(sc, sc.id);
    ok(bad.length === 0, `${sc.id}: brak polskiego tekstu w wersji EN:\n    ${bad.slice(0, 8).join('\n    ')}`);
    for (const level of LEVELS) {
      for (const pid of Object.keys(sc.puzzles)) {
        const p = getPuzzle(sc, pid, level);
        ok(checkAnswer(p, sampleSolution(p)), `${sc.id}/${pid}/${level}: EN rozwiązanie poprawne`);
        const pb = getPuzzle(base, pid, level);
        if (p.kind === 'choice' && pb.kind === 'choice') ok(p.options.length === pb.options.length, `${sc.id}/${pid}: EN liczba opcji`);
        if (p.kind === 'order' && pb.kind === 'order') ok(p.items.length === pb.items.length, `${sc.id}/${pid}: EN liczba elementów`);
      }
      ok(autoplay(sc, level, true).status === 'won', `${sc.id}/${level}: EN ukończony`);
    }
  }
  setLang('pl');
}

/* ---------- błędne próby, wynik nieujemny, zegar ---------- */
{
  const sc = BUILTIN_SCENARIOS[0];
  const cfg: SessionConfig = { scenarioId: sc.id, level: 'sp', mode: 'timed', timeLimit: 15, timeoutBehavior: 'continue', hintLimit: 2, includeBonus: true, playerName: 'T' };
  let s = newGame(cfg, sc, DEFAULT_SCORING);
  s = examine(s, sc, 'k_tablica').state;
  s = submitAnswer(s, sc, 'k_tablica', '8').state;
  ok(s.score === 0, 'wynik nie spada poniżej zera');
  ok(s.puzzles['tablica'].wrong === 1, 'błędna próba zliczona');
  s = takeHint(s, sc, 'tablica').state;
  s = takeHint(s, sc, 'tablica').state;
  const r = takeHint(s, sc, 'tablica');
  ok(r.state.puzzles['tablica'].hints === 2, 'limit podpowiedzi działa');
  // zamek jest chwilowo zablokowany po błędzie – poprawna odpowiedź nie jest jeszcze przyjmowana
  ok(lockRemaining(s, 'tablica') === 5, `blokada 5 s po pierwszym błędzie (${lockRemaining(s, 'tablica')})`);
  const blocked = submitAnswer(s, sc, 'k_tablica', '7');
  ok(!blocked.correct && blocked.state === s, 'w czasie blokady odpowiedź nie jest sprawdzana');
  ok(blocked.state.puzzles['tablica'].attempts === 1, 'próba w czasie blokady nie liczy się jako błąd');
  s = tick(s, 5).state;
  ok(lockRemaining(s, 'tablica') === 0, 'blokada mija po czasie');
  s = submitAnswer(s, sc, 'k_tablica', '7').state;
  ok(s.score === 100, `brak premii za brak podpowiedzi, gdy użyto podpowiedzi (wynik ${s.score})`);
  for (let i = 0; i < 15 * 60; i++) s = tick(s, 1).state;
  ok(s.timedOut && s.status === 'playing', 'po czasie gra trwa (tryb łagodny)');
  ok(s.score === 0, 'kara za przekroczenie czasu');
  const cfg2 = { ...cfg, timeoutBehavior: 'end' as const };
  let s2 = newGame(cfg2, sc, DEFAULT_SCORING);
  s2 = tick(s2, 15 * 60).state;
  ok(s2.status === 'ended', 'po czasie gra kończy się (ustawienie nauczyciela)');
  // przedmiot w złym miejscu
  const bad = useItem(s, sc, 'k_drzwi', 'karta_biblio');
  ok(bad.state === s, 'nieposiadany przedmiot nic nie zmienia');
  ok(lv({ sp: 1, lo: 2, tech: 3 }, 'lo') === 2, 'rozwiązywanie wartości poziomu');
}

console.log(`\n${checks - failures}/${checks} testów zaliczonych`);
if (failures) { console.error(`${failures} błędów`); process.exit(1); }
