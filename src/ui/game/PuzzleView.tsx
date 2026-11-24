import { tx } from '../../i18n';
import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import type { AnswerValue } from '../../engine/answers';
import { ShapeIcon, SHAPE_NAMES, VisualView } from '../../render/visuals';
import type { CodePuzzle, Puzzle, SwitchPuzzle } from '../../types';
import { shuffle, shuffleDifferent } from '../common';
import { DIGITS } from '../../data/helpers';

interface Props {
  puzzle: Puzzle;
  puzzleKey: string;
  onSubmit: (v: AnswerValue) => boolean;
  /** liczba dotychczasowych błędów – zmienia kolejność odpowiedzi po każdej pomyłce */
  attempt: number;
  /** ile sekund trwa jeszcze blokada zamka po błędzie */
  lockLeft: number;
}

/** Ziarno losowania zależne od zagadki i numeru próby (wartość z przedziału 0–1) */
function seedOf(key: string, attempt: number): number {
  const h = key.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 100003, 7);
  return (((h + attempt * 7919) % 9973) + 1) / 9975;
}

export function PuzzleView({ puzzle, puzzleKey, onSubmit, attempt, lockLeft }: Props) {
  const locked = lockLeft > 0;
  const seedKey = `${puzzleKey}#${attempt}`;
  const [feedback, setFeedback] = useState<null | 'wrong'>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const submit = (v: AnswerValue) => {
    const ok = onSubmit(v);
    if (!ok) { setFeedback('wrong'); setShakeKey((k) => k + 1); }
    else setFeedback(null);
  };
  return (
    <div className="puzzle">
      <p className="puzzle-prompt">{puzzle.prompt}</p>
      {puzzle.visual && <div className="puzzle-visual"><VisualView v={puzzle.visual} /></div>}
      {locked && (
        <div className="lock-banner" role="status">
          <span className="lock-icon" aria-hidden="true">🔒</span>
          <span>
            {tx('Mechanizm zablokował się po błędnej odpowiedzi. Sprawdź obliczenia albo skorzystaj z podpowiedzi.', 'The mechanism has locked after a wrong answer. Check your working or use a hint.')}
            {' '}<strong className="lock-count" aria-hidden="true">{tx(`Odblokowanie za ${lockLeft} s`, `Unlocks in ${lockLeft} s`)}</strong>
          </span>
        </div>
      )}
      <fieldset className={`puzzle-fieldset ${locked ? 'is-locked' : ''}`} disabled={locked}>
        <legend className="sr-only">{tx('Odpowiedź', 'Answer')}</legend>
        <div key={shakeKey} className={`puzzle-input ${feedback === 'wrong' ? 'shake' : ''}`}>
          {puzzle.kind === 'number' && <NumberInput unit={puzzle.unit} onSubmit={submit} />}
          {puzzle.kind === 'text' && <NumberInput text onSubmit={submit} />}
          {puzzle.kind === 'choice' && <Choice options={puzzle.options} seed={seedOf(seedKey, 1)} onSubmit={submit} />}
          {puzzle.kind === 'order' && <Order items={puzzle.items} labels={puzzle.orderLabel} seedKey={seedKey} onSubmit={submit} />}
          {puzzle.kind === 'match' && <Match pairs={puzzle.pairs} seedKey={seedKey} onSubmit={submit} />}
          {puzzle.kind === 'code' && (puzzle.style === 'keypad' ? <Keypad length={puzzle.answer.length} disabled={locked} onSubmit={submit} /> : <Wheels p={puzzle} onSubmit={submit} />)}
          {puzzle.kind === 'switches' && <Switches p={puzzle} onSubmit={submit} />}
        </div>
      </fieldset>
      <div className="puzzle-feedback" role="status" aria-live="polite">
        {feedback === 'wrong' && !locked && <span className="bad">{tx('To jeszcze nie to. Sprawdź obliczenia i spróbuj ponownie – możesz też skorzystać z podpowiedzi.', 'Not quite. Check your working and try again – you can also use a hint.')}</span>}
        {attempt > 0 && <span className="muted small attempt-note">{tx('Każda kolejna pomyłka wydłuża blokadę i zwiększa karę – zgadywanie się nie opłaca.', 'Each further mistake lengthens the lock and raises the penalty – guessing does not pay.')}</span>}
      </div>
    </div>
  );
}

function NumberInput({ unit, text, onSubmit }: { unit?: string; text?: boolean; onSubmit: (v: string) => void }) {
  const [v, setV] = useState('');
  return (
    <form className="answer-row" onSubmit={(e) => { e.preventDefault(); if (v.trim()) onSubmit(v); }}>
      <label className="sr-only" htmlFor="answer">{tx('Twoja odpowiedź', 'Your answer')}</label>
      <input id="answer" className="answer-input" inputMode={text ? 'text' : 'decimal'} autoComplete="off" value={v} onChange={(e) => setV(e.target.value)} placeholder={text ? tx('Wpisz odpowiedź', 'Type your answer') : tx('Wpisz wynik, np. 12 lub 4,5 lub 1/6', 'Enter the result, e.g. 12 or 4.5 or 1/6')} />
      {unit && <span className="answer-unit">{unit}</span>}
      <button className="btn btn--primary" type="submit" disabled={!v.trim()}>{tx('Sprawdź', 'Check')}</button>
    </form>
  );
}

function Choice({ options, seed, onSubmit }: { options: string[]; seed: number; onSubmit: (i: number) => void }) {
  // kolejność odpowiedzi jest tasowana (i zmienia się po każdym błędzie), a zwracamy indeks oryginalny
  const order = useMemo(() => shuffle(options.map((_, i) => i), seed), [options, seed]);
  return (
    <div className="choices">
      {order.map((i, pos) => <button key={i} className="btn btn--choice" onClick={() => onSubmit(i)}><span className="choice-letter">{String.fromCharCode(65 + pos)}</span>{options[i]}</button>)}
    </div>
  );
}

function Order({ items, labels, seedKey, onSubmit }: { items: string[]; labels?: [string, string]; seedKey: string; onSubmit: (v: string[]) => void }) {
  const seed = useMemo(() => (seedKey.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 97) / 97, [seedKey]);
  const [list, setList] = useState(() => shuffleDifferent(items, seed));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const n = [...list];
    [n[i], n[j]] = [n[j], n[i]];
    setList(n);
  };
  return (
    <div className="order">
      {labels && <div className="order-label">↑ {labels[0]}</div>}
      <ol className="order-list">
        {list.map((it, i) => (
          <li key={it} className="order-item">
            <span className="order-pos">{i + 1}</span>
            <span className="order-text">{it}</span>
            <button className="btn btn--icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label={tx(`Przesuń „${it}” wyżej`, `Move “${it}” up`)}>▲</button>
            <button className="btn btn--icon" onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label={tx(`Przesuń „${it}” niżej`, `Move “${it}” down`)}>▼</button>
          </li>
        ))}
      </ol>
      {labels && <div className="order-label">↓ {labels[1]}</div>}
      <button className="btn btn--primary" onClick={() => onSubmit(list)}>{tx('Zatwierdź kolejność', 'Confirm order')}</button>
    </div>
  );
}

function Match({ pairs, seedKey, onSubmit }: { pairs: [string, string][]; seedKey: string; onSubmit: (v: string[]) => void }) {
  const rights = useMemo(() => shuffle(pairs.map((p) => p[1]), (seedKey.length * 0.131) % 1), [pairs, seedKey]);
  const [sel, setSel] = useState<string[]>(() => pairs.map(() => ''));
  const used = new Set(sel.filter(Boolean));
  return (
    <div className="match">
      {pairs.map(([left], i) => (
        <div key={left} className="match-row">
          <label htmlFor={`m${i}`} className="match-left">{left}</label>
          <span aria-hidden="true">↔</span>
          <select id={`m${i}`} className="match-select" value={sel[i]} onChange={(e) => { const n = [...sel]; n[i] = e.target.value; setSel(n); }}>
            <option value="">{tx('— wybierz —', '— choose —')}</option>
            {rights.map((r) => <option key={r} value={r} disabled={used.has(r) && sel[i] !== r}>{r}</option>)}
          </select>
        </div>
      ))}
      <button className="btn btn--primary" disabled={sel.some((s) => !s)} onClick={() => onSubmit(sel)}>{tx('Połącz', 'Connect')}</button>
    </div>
  );
}

function Keypad({ length, disabled, onSubmit }: { length: number; disabled: boolean; onSubmit: (v: string[]) => void }) {
  const [code, setCode] = useState('');
  const press = (d: string) => setCode((c) => (c.length < length ? c + d : c));
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (disabled || (e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (/^\d$/.test(e.key)) press(e.key);
      if (e.key === 'Backspace') setCode((c) => c.slice(0, -1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  return (
    <div className="keypad-lock">
      <div className="keypad-display" aria-live="polite" aria-label={`${tx('Wpisany kod', 'Entered code')}: ${code.split('').join(' ') || tx('pusty', 'empty')}`}>
        {Array.from({ length }, (_, i) => <span key={i} className={code[i] ? 'filled' : ''}>{code[i] ?? '•'}</span>)}
      </div>
      <div className="keypad-grid">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => <button key={d} className="key" onClick={() => press(d)}>{d}</button>)}
        <button className="key key--fn" onClick={() => setCode('')} aria-label={tx('Wyczyść', 'Clear')}>C</button>
        <button className="key" onClick={() => press('0')}>0</button>
        <button className="key key--fn" onClick={() => setCode((c) => c.slice(0, -1))} aria-label={tx('Usuń ostatnią cyfrę', 'Delete last digit')}>⌫</button>
      </div>
      <button className="btn btn--primary" disabled={code.length !== length} onClick={() => { onSubmit(code.split('')); setCode(''); }}>{tx('Otwórz', 'Open')}</button>
    </div>
  );
}

function Wheels({ p, onSubmit }: { p: CodePuzzle; onSubmit: (v: string[]) => void }) {
  const wheels = p.wheels ?? p.answer.map(() => DIGITS);
  const [idx, setIdx] = useState<number[]>(() => wheels.map(() => 0));
  const rot = (w: number, d: number) => setIdx((arr) => arr.map((v, i) => (i === w ? (v + d + wheels[w].length) % wheels[w].length : v)));
  const onKey = (w: number) => (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); rot(w, -1); }
    if (e.key === 'ArrowDown') { e.preventDefault(); rot(w, 1); }
  };
  const isSym = p.style === 'symbols';
  return (
    <div className={`wheels-lock wheels--${p.style}`}>
      <div className="wheels">
        {wheels.map((set, w) => {
          const val = set[idx[w]];
          const prev = set[(idx[w] - 1 + set.length) % set.length];
          const next = set[(idx[w] + 1) % set.length];
          return (
            <div key={w} className="wheel">
              <button className="btn btn--icon" onClick={() => rot(w, -1)} aria-label={tx(`Koło ${w + 1}: poprzedni znak`, `Wheel ${w + 1}: previous symbol`)}>▲</button>
              <div className="wheel-window" tabIndex={0} role="spinbutton" aria-valuetext={isSym ? SHAPE_NAMES[val] : val} aria-label={tx(`Koło ${w + 1}`, `Wheel ${w + 1}`)} onKeyDown={onKey(w)}>
                <span className="wheel-ghost">{isSym ? <ShapeIcon id={prev} size={22} /> : prev}</span>
                <span className="wheel-value" key={val}>{isSym ? <ShapeIcon id={val} size={44} /> : val}</span>
                <span className="wheel-ghost">{isSym ? <ShapeIcon id={next} size={22} /> : next}</span>
              </div>
              <button className="btn btn--icon" onClick={() => rot(w, 1)} aria-label={tx(`Koło ${w + 1}: następny znak`, `Wheel ${w + 1}: next symbol`)}>▼</button>
            </div>
          );
        })}
      </div>
      <button className="btn btn--primary" onClick={() => onSubmit(idx.map((v, w) => wheels[w][v]))}>{tx('Spróbuj otworzyć', 'Try to open')}</button>
    </div>
  );
}

function Switches({ p, onSubmit }: { p: SwitchPuzzle; onSubmit: (v: number[]) => void }) {
  const [on, setOn] = useState<boolean[]>(() => p.switches.map(() => false));
  return (
    <div className="switches">
      <div className="switch-row">
        {p.switches.map((s, i) => (
          <button key={i} className={`switch ${on[i] ? 'switch--on' : ''}`} aria-pressed={on[i]} onClick={() => setOn((a) => a.map((v, j) => (j === i ? !v : v)))}>
            <span className="switch-lever" aria-hidden="true" />
            <span className="switch-label">{s.label}</span>
          </button>
        ))}
      </div>
      <button className="btn btn--primary" disabled={!on.some(Boolean)} onClick={() => onSubmit(on.map((v, i) => (v ? i : -1)).filter((i) => i >= 0))}>{tx('Uruchom mechanizm', 'Start the mechanism')}</button>
    </div>
  );
}
