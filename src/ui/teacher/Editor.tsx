import { getLang, tx } from '../../i18n';
/* Edytor scenariuszy nauczyciela – tworzy scenariusze w tym samym formacie danych
 * co scenariusze wbudowane (src/types.ts), więc silnik gry obsługuje je bez zmian. */
import { useRef, useState, type MouseEvent } from 'react';
import { useApp } from '../../app/context';
import { TOPICS } from '../../data/topics';
import { validateScenario, type ValidationResult } from '../../engine/validate';
import { Background, SceneOverlay, ThemeDefs } from '../../render/backgrounds';
import { ART, ART_LABELS } from '../../render/objectArt';
import { BG_VARIANTS, THEMES } from '../../render/themes';
import { repo } from '../../storage/repo';
import type { GameObject, Puzzle, Room, Scenario, ThemeId, TopicId } from '../../types';
import { ConfirmButton, downloadFile, EMBEDDED } from '../common';

const uid = (p: string) => `${p}${Math.random().toString(36).slice(2, 7)}`;

function template(): Scenario {
  const roomId = uid('r');
  return {
    id: uid('custom-'), title: tx('Mój escape room', 'My escape room'), subtitle: tx('Scenariusz nauczyciela', 'Teacher’s scenario'), description: tx('Krótki opis fabuły scenariusza.', 'A short description of the story.'),
    theme: 'school', difficulty: 1, levels: ['sp', 'lo', 'tech'], custom: true,
    intro: tx('Drzwi zamknęły się za Tobą. Rozejrzyj się uważnie!', 'The door has closed behind you. Look around carefully!'), ending: tx('Brawo! Udało Ci się wydostać.', 'Well done! You got out.'),
    startRoom: roomId, reward: { badge: '⭐', title: tx('Mój escape room', 'My escape room') },
    items: { i_klucz: { name: tx('Klucz', 'Key'), icon: '🗝️', description: tx('Klucz do drzwi.', 'The key to the door.') } },
    clues: { c_notatka: { title: tx('Notatka', 'Note'), text: tx('Kod sejfu to wynik działania 12 · 3 + 7 = ?', 'The safe code is the result of 12 · 3 + 7 = ?') } },
    puzzles: {
      p_sejf: { variants: { kind: 'number', title: tx('Sejf', 'Safe'), topic: 'dzialania', prompt: tx('Wpisz kod sejfu (wynik działania z notatki).', 'Enter the safe code (the result of the calculation in the note).'), answer: 43, hints: [tx('Przeczytaj notatkę leżącą na biurku.', 'Read the note lying on the desk.'), tx('Najpierw mnożenie, potem dodawanie.', 'Multiplication first, then addition.'), '12 · 3 = 36; 36 + 7 = 43.'] } },
    },
    rooms: [{
      id: roomId, name: tx('Pokój 1', 'Room 1'), bg: 'classroom', intro: tx('Pierwsze pomieszczenie.', 'The first room.'),
      objects: [
        { id: uid('o'), name: tx('Notatka', 'Note'), art: 'note', x: 640, y: 560, w: 140, h: 100, description: tx('Kartka z zapiskiem.', 'A sheet of paper with a note.'), onOpen: { clues: ['c_notatka'] } },
        { id: uid('o'), name: tx('Sejf', 'Safe'), art: 'safe', x: 900, y: 420, w: 200, h: 200, description: tx('Sejf z zamkiem szyfrowym.', 'A safe with a combination lock.'), lock: { type: 'puzzle', puzzle: 'p_sejf' }, onOpen: { items: ['i_klucz'], message: tx('Sejf otwarty! W środku jest klucz.', 'The safe is open! There is a key inside.') } },
        { id: uid('o'), name: tx('Zegar', 'Clock'), art: 'clock', x: 1180, y: 80, w: 130, h: 130, description: tx('Zegar tyka miarowo.', 'The clock ticks steadily.') },
        { id: uid('o'), name: tx('Okno', 'Window'), art: 'window', x: 90, y: 110, w: 280, h: 360, description: tx('Za oknem widać boisko.', 'You can see the sports field through the window.') },
        { id: uid('o'), name: tx('Drzwi wyjściowe', 'Exit door'), art: 'door', x: 1400, y: 130, w: 180, h: 570, description: tx('Drzwi zamknięte na klucz.', 'The door is locked.'), lockedText: tx('Potrzebny klucz.', 'You need a key.'), lock: { type: 'item', item: 'i_klucz' }, door: { exit: true } },
      ],
    }],
  };
}

type Kind = 'number' | 'text' | 'choice' | 'keypad' | 'dials';

function puzzleKind(p: Puzzle): Kind {
  if (p.kind === 'code') return p.style === 'keypad' ? 'keypad' : 'dials';
  if (p.kind === 'number' || p.kind === 'text' || p.kind === 'choice') return p.kind;
  return 'number';
}

function makePuzzle(kind: Kind, base: { title: string; topic: TopicId; prompt: string; hints: [string, string, string] }, answer: string, options: string[], correct: number): Puzzle {
  switch (kind) {
    case 'number': return { ...base, kind: 'number', answer: Number(answer.replace(',', '.')) || 0 };
    case 'text': return { ...base, kind: 'text', answers: answer.split('|').map((x) => x.trim()).filter(Boolean) };
    case 'choice': return { ...base, kind: 'choice', options, correct: Math.min(correct, Math.max(0, options.length - 1)) };
    case 'keypad': return { ...base, kind: 'code', style: 'keypad', answer: answer.replace(/\D/g, '').split('') };
    case 'dials': return { ...base, kind: 'code', style: 'dials', answer: answer.replace(/\D/g, '').split('') };
  }
}

export function Editor() {
  const app = useApp();
  const [list, setList] = useState<Scenario[]>(() => repo.getCustomScenarios());
  const [sc, setSc] = useState<Scenario>(() => list[0] ?? template());
  const [roomIdx, setRoomIdx] = useState(0);
  const [objId, setObjId] = useState<string | null>(null);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [saved, setSaved] = useState('');
  const room = sc.rooms[roomIdx] ?? sc.rooms[0];
  const obj = room?.objects.find((o) => o.id === objId) ?? null;

  const update = (fn: (draft: Scenario) => void) => {
    const d: Scenario = JSON.parse(JSON.stringify(sc));
    fn(d);
    setSc(d);
    setResult(null);
    setSaved('');
  };
  const updRoom = (fn: (r: Room) => void) => update((d) => fn(d.rooms[roomIdx]));
  const updObj = (fn: (o: GameObject, d: Scenario) => void) => update((d) => { const o = d.rooms[roomIdx].objects.find((x) => x.id === objId); if (o) fn(o, d); });

  const save = () => {
    const r = validateScenario(sc);
    setResult(r);
    repo.saveCustomScenario(sc);
    setList(repo.getCustomScenarios());
    app.refreshScenarios();
    setSaved(r.ok ? tx('Zapisano. Scenariusz jest dostępny na liście scenariuszy.', 'Saved. The scenario is now on the scenario list.') : tx('Zapisano szkic – popraw problemy, aby scenariusz był grywalny.', 'Draft saved – fix the problems to make the scenario playable.'));
  };

  return (
    <div className="editor">
      <section className="panel editor-top">
        <div className="field-row">
          <label className="field"><span>{tx('Edytowany scenariusz', 'Scenario being edited')}</span>
            <select value={sc.id} onChange={(e) => { const s = list.find((x) => x.id === e.target.value); if (s) { setSc(s); setRoomIdx(0); setObjId(null); setResult(null); } }}>
              {!list.some((x) => x.id === sc.id) && <option value={sc.id}>{sc.title} {tx('(niezapisany)', '(unsaved)')}</option>}
              {list.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </label>
          <div className="field"><span>&nbsp;</span><div className="btn-row">
            <button className="btn" onClick={() => { setSc(template()); setRoomIdx(0); setObjId(null); setResult(null); }}>+ {tx('Nowy scenariusz', 'New scenario')}</button>
            <button className="btn btn--primary" onClick={save}>💾 {tx('Zapisz', 'Save')}</button>
            <button className="btn" onClick={() => setResult(validateScenario(sc))}>✔ {tx('Sprawdź grywalność', 'Check playability')}</button>
            <button className="btn" onClick={() => { save(); app.startGame({ scenarioId: sc.id, level: app.settings.level, mode: 'quick', timeLimit: null, timeoutBehavior: 'continue', hintLimit: null, includeBonus: true, playerName: tx('Nauczyciel (test)', 'Teacher (test)') }); }}>▶ {tx('Testuj', 'Test')}</button>
            {!EMBEDDED && <button className="btn" onClick={() => downloadFile(`${sc.id}.json`, JSON.stringify(sc, null, 2))}>⬇️ JSON</button>}
            {list.some((x) => x.id === sc.id) && <ConfirmButton className="btn btn--danger" label={tx('Usuń', 'Delete')} onConfirm={() => { repo.deleteCustomScenario(sc.id); const l = repo.getCustomScenarios(); setList(l); app.refreshScenarios(); setSc(l[0] ?? template()); setRoomIdx(0); }} />}
          </div></div>
        </div>
        {saved && <p className="good" role="status">{saved}</p>}
        {result && (
          <div className={`validation ${result.ok ? 'ok' : 'bad'}`} role="status">
            {result.ok ? <p>✅ {tx('Scenariusz jest grywalny – automatyczny tester ukończył go na wszystkich poziomach.', 'The scenario is playable – the automatic tester completed it at every level.')}</p> : <ul>{result.problems.map((p) => <li key={p}>❌ {p}</li>)}</ul>}
            {result.warnings.length > 0 && <ul>{result.warnings.map((p) => <li key={p}>⚠️ {p}</li>)}</ul>}
          </div>
        )}
      </section>

      <div className="editor-grid">
        <section className="panel">
          <h2>{tx('Scenariusz', 'Scenario')}</h2>
          <label className="field"><span>{tx('Tytuł', 'Title')}</span><input value={sc.title} onChange={(e) => update((d) => { d.title = e.target.value; d.reward.title = e.target.value; })} /></label>
          <label className="field"><span>{tx('Opis', 'Description')}</span><textarea rows={2} value={sc.description} onChange={(e) => update((d) => { d.description = e.target.value; })} /></label>
          <label className="field"><span>{tx('Motyw graficzny', 'Visual theme')}</span>
            <select value={sc.theme} onChange={(e) => update((d) => { d.theme = e.target.value as ThemeId; })}>
              {Object.values(THEMES).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
          <label className="field"><span>{tx('Trudność', 'Difficulty')}</span><select value={sc.difficulty} onChange={(e) => update((d) => { d.difficulty = Number(e.target.value) as 1 | 2 | 3; })}><option value={1}>{tx('łatwy', 'easy')}</option><option value={2}>{tx('średni', 'medium')}</option><option value={3}>{tx('trudny', 'hard')}</option></select></label>
          <label className="field"><span>{tx('Wprowadzenie (fabuła)', 'Introduction (story)')}</span><textarea rows={3} value={String(sc.intro)} onChange={(e) => update((d) => { d.intro = e.target.value; })} /></label>
          <label className="field"><span>{tx('Zakończenie', 'Ending')}</span><textarea rows={2} value={String(sc.ending)} onChange={(e) => update((d) => { d.ending = e.target.value; })} /></label>

          <h3>{tx('Pomieszczenia (kolejność)', 'Rooms (in order)')}</h3>
          <ol className="editor-rooms">
            {sc.rooms.map((r, i) => (
              <li key={r.id} className={i === roomIdx ? 'active' : ''}>
                <button className="btn btn--ghost" onClick={() => { setRoomIdx(i); setObjId(null); }}>{i + 1}. {r.name}{r.id === sc.startRoom ? tx(' (start)', ' (start)') : ''}</button>
                <button className="btn btn--icon" aria-label={tx('Wyżej', 'Up')} disabled={i === 0} onClick={() => update((d) => { [d.rooms[i - 1], d.rooms[i]] = [d.rooms[i], d.rooms[i - 1]]; d.startRoom = d.rooms[0].id; })}>▲</button>
                <button className="btn btn--icon" aria-label={tx('Niżej', 'Down')} disabled={i === sc.rooms.length - 1} onClick={() => update((d) => { [d.rooms[i + 1], d.rooms[i]] = [d.rooms[i], d.rooms[i + 1]]; d.startRoom = d.rooms[0].id; })}>▼</button>
                <button className="btn btn--icon" aria-label={tx('Usuń pomieszczenie', 'Delete room')} disabled={sc.rooms.length === 1} onClick={() => { update((d) => { d.rooms.splice(i, 1); d.startRoom = d.rooms[0].id; }); setRoomIdx(0); }}>✕</button>
              </li>
            ))}
          </ol>
          <button className="btn" onClick={() => update((d) => { d.rooms.push({ id: uid('r'), name: `${tx('Pokój', 'Room')} ${d.rooms.length + 1}`, bg: BG_VARIANTS.find((b) => b.theme === d.theme)?.id ?? 'classroom', intro: tx('Nowe pomieszczenie.', 'A new room.'), objects: [] }); })}>+ {tx('Dodaj pomieszczenie', 'Add room')}</button>
          <p className="muted small">{tx('Pierwsze pomieszczenie na liście jest startowe. Przejścia tworzysz, dodając obiekt „drzwi” prowadzący do innego pokoju.', 'The first room on the list is the starting room. Create passages by adding a “door” object that leads to another room.')}</p>
        </section>

        {room && (
          <section className="panel">
            <h2>{tx('Pomieszczenie', 'Room')}: {room.name}</h2>
            <div className="field-row">
              <label className="field"><span>{tx('Nazwa', 'Name')}</span><input value={room.name} onChange={(e) => updRoom((r) => { r.name = e.target.value; })} /></label>
              <label className="field"><span>{tx('Tło', 'Background')}</span>
                <select value={room.bg} onChange={(e) => updRoom((r) => { r.bg = e.target.value; })}>
                  {BG_VARIANTS.map((b) => <option key={b.id} value={b.id}>{b.name} ({THEMES[b.theme].name})</option>)}
                </select>
              </label>
            </div>
            <label className="field"><span>{tx('Opis po wejściu', 'Text on entering')}</span><input value={String(room.intro)} onChange={(e) => updRoom((r) => { r.intro = e.target.value; })} /></label>
            <RoomPreview sc={sc} room={room} selected={objId} onPick={setObjId} onPlace={(x, y) => updObj((o) => { o.x = Math.round(Math.max(0, Math.min(1600 - o.w, x - o.w / 2))); o.y = Math.round(Math.max(0, Math.min(900 - o.h, y - o.h / 2))); })} />
            <p className="muted small">{tx('Kliknij obiekt na podglądzie, aby go wybrać. Gdy obiekt jest wybrany, kliknięcie w puste miejsce przesuwa go tam.', 'Click an object in the preview to select it. With an object selected, clicking an empty spot moves it there.')}</p>
            <div className="editor-objects">
              {room.objects.map((o) => <button key={o.id} className={`chip ${o.id === objId ? 'active' : ''}`} onClick={() => setObjId(o.id)}>{o.name}{o.lock ? ' 🔒' : ''}{o.door ? ' 🚪' : ''}</button>)}
              <button className="btn btn--small" onClick={() => { const id = uid('o'); updRoom((r) => { r.objects.push({ id, name: tx('Nowy obiekt', 'New object'), art: 'note', x: 700, y: 400, w: 160, h: 120, description: tx('Opis obiektu.', 'Object description.') }); }); setObjId(id); }}>+ {tx('Dodaj obiekt', 'Add object')}</button>
            </div>
          </section>
        )}

        {obj && room && <ObjectForm key={obj.id} sc={sc} room={room} obj={obj} updObj={updObj} update={update} onDelete={() => { updRoom((r) => { r.objects = r.objects.filter((x) => x.id !== obj.id); }); setObjId(null); }} />}
      </div>
    </div>
  );
}

function RoomPreview({ sc, room, selected, onPick, onPlace }: { sc: Scenario; room: Room; selected: string | null; onPick: (id: string) => void; onPlace: (x: number, y: number) => void }) {
  const ref = useRef<SVGSVGElement>(null);
  const t = THEMES[sc.theme];
  const click = (e: MouseEvent<SVGSVGElement>) => {
    if (!selected || !ref.current) return;
    const pt = ref.current.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const m = ref.current.getScreenCTM();
    if (!m) return;
    const p = pt.matrixTransform(m.inverse());
    onPlace(p.x, p.y);
  };
  return (
    <svg ref={ref} viewBox="0 0 1600 900" className="editor-preview" onClick={click}>
      <ThemeDefs t={t} />
      <Background variant={room.bg} t={t} />
      {room.objects.map((o) => {
        const Art = ART[o.art] ?? ART.note;
        return (
          <g key={o.id} transform={`translate(${o.x},${o.y})`} onClick={(e) => { e.stopPropagation(); onPick(o.id); }} style={{ cursor: 'pointer' }}>
            {Art({ w: o.w, h: o.h, t, open: false })}
            <rect x="-4" y="-4" width={o.w + 8} height={o.h + 8} fill="none" stroke={o.id === selected ? '#ffd166' : '#ffffff55'} strokeWidth={o.id === selected ? 6 : 2} strokeDasharray={o.id === selected ? '' : '10 8'} />
            <text x={o.w / 2} y={-10} textAnchor="middle" fill="#fff" fontSize="26" stroke="#000" strokeWidth="5" paintOrder="stroke">{o.name}</text>
          </g>
        );
      })}
      <SceneOverlay t={t} dark={false} />
    </svg>
  );
}

function ObjectForm({ sc, room, obj, updObj, update, onDelete }: { sc: Scenario; room: Room; obj: GameObject; updObj: (fn: (o: GameObject, d: Scenario) => void) => void; update: (fn: (d: Scenario) => void) => void; onDelete: () => void }) {
  const lockType = obj.lock?.type ?? 'none';
  const puzzleId = obj.lock?.type === 'puzzle' ? obj.lock.puzzle : `p_${obj.id}`;
  const existing = sc.puzzles[puzzleId]?.variants as Puzzle | undefined;
  const [kind, setKind] = useState<Kind>(existing ? puzzleKind(existing) : 'number');
  const [title, setTitle] = useState(existing?.title ?? obj.name);
  const [topic, setTopic] = useState<TopicId>(existing?.topic ?? 'dzialania');
  const [prompt, setPrompt] = useState(existing?.prompt ?? '');
  const [answer, setAnswer] = useState(() => {
    if (!existing) return '';
    if (existing.kind === 'number') return String(existing.answer);
    if (existing.kind === 'text') return existing.answers.join(' | ');
    if (existing.kind === 'code') return existing.answer.join('');
    return '';
  });
  const [options, setOptions] = useState(existing?.kind === 'choice' ? existing.options.join('\n') : 'A\nB\nC\nD');
  const [correct, setCorrect] = useState(existing?.kind === 'choice' ? existing.correct : 0);
  const [hints, setHints] = useState<[string, string, string]>(existing?.hints ?? ['', '', '']);
  const [bonus, setBonus] = useState(!!sc.puzzles[puzzleId]?.bonus);
  const clueId = obj.onOpen?.clues?.[0];
  const itemId = obj.onOpen?.items?.[0];
  const otherRooms = sc.rooms.filter((r) => r.id !== room.id);

  const savePuzzle = () => update((d) => {
    const p = makePuzzle(kind, { title, topic, prompt, hints }, answer, options.split('\n').map((x) => x.trim()).filter(Boolean), correct);
    d.puzzles[puzzleId] = { variants: p, bonus };
    const o = d.rooms.flatMap((r) => r.objects).find((x) => x.id === obj.id);
    if (o) o.lock = { type: 'puzzle', puzzle: puzzleId };
  });

  const answerOk = kind === 'choice' || (kind === 'number' ? answer.trim() !== '' && !Number.isNaN(Number(answer.replace(',', '.'))) : kind === 'text' ? answer.trim() !== '' : /^\d{1,6}$/.test(answer.replace(/\D/g, '')) && answer.replace(/\D/g, '').length >= 3);

  return (
    <section className="panel editor-object">
      <div className="panel-head"><h2>{tx('Obiekt', 'Object')}: {obj.name}</h2><button className="btn btn--danger btn--small" onClick={onDelete}>{tx('Usuń obiekt', 'Delete object')}</button></div>
      <div className="field-row">
        <label className="field"><span>{tx('Nazwa', 'Name')}</span><input value={obj.name} onChange={(e) => updObj((o) => { o.name = e.target.value; })} /></label>
        <label className="field"><span>{tx('Grafika', 'Graphic')}</span>
          <select value={obj.art} onChange={(e) => updObj((o) => { o.art = e.target.value; })}>
            {Object.entries(ART_LABELS).sort((a, b) => a[1].localeCompare(b[1], getLang())).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
      </div>
      <div className="field-row small-fields">
        {(['x', 'y', 'w', 'h'] as const).map((k) => <label key={k} className="field"><span>{{ x: 'X', y: 'Y', w: tx('Szerokość', 'Width'), h: tx('Wysokość', 'Height') }[k]}</span><input type="number" value={obj[k]} onChange={(e) => updObj((o) => { o[k] = Math.max(k === 'w' || k === 'h' ? 30 : 0, Number(e.target.value) || 0); })} /></label>)}
      </div>
      <label className="field"><span>{tx('Opis (po kliknięciu)', 'Description (on click)')}</span><textarea rows={2} value={String(obj.description)} onChange={(e) => updObj((o) => { o.description = e.target.value; })} /></label>
      <label className="toggle"><input type="checkbox" checked={!!obj.secret} onChange={(e) => updObj((o) => { o.secret = e.target.checked; })} /> {tx('Obiekt ukryty (dodatkowe punkty za odkrycie)', 'Hidden object (extra points for finding it)')}</label>

      <h3>{tx('Zabezpieczenie', 'Lock')}</h3>
      <div className="seg">
        {[['none', tx('Brak', 'None')], ['puzzle', tx('Zagadka / zamek', 'Puzzle / lock')], ['item', tx('Wymaga przedmiotu', 'Requires an item')]].map(([v, l]) => (
          <button key={v} className={lockType === v ? 'active' : ''} aria-pressed={lockType === v} onClick={() => updObj((o) => {
            if (v === 'none') delete o.lock;
            if (v === 'item') o.lock = { type: 'item', item: Object.keys(sc.items)[0] ?? '' };
            if (v === 'puzzle') o.lock = { type: 'puzzle', puzzle: puzzleId };
          })}>{l}</button>
        ))}
      </div>
      {lockType === 'item' && (
        <label className="field"><span>{tx('Wymagany przedmiot', 'Required item')}</span>
          <select value={(obj.lock as { item: string }).item} onChange={(e) => updObj((o) => { o.lock = { type: 'item', item: e.target.value }; })}>
            {Object.entries(sc.items).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.name}</option>)}
          </select>
          {!Object.keys(sc.items).length && <small className="bad">{tx('Najpierw dodaj przedmiot jako nagrodę w innym obiekcie.', 'First add an item as a reward in another object.')}</small>}
        </label>
      )}
      {lockType === 'puzzle' && (
        <div className="puzzle-editor">
          <div className="field-row">
            <label className="field"><span>{tx('Rodzaj zagadki', 'Puzzle type')}</span>
              <select value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
                <option value="number">{tx('Wynik liczbowy', 'Numeric answer')}</option>
                <option value="text">{tx('Odpowiedź tekstowa', 'Text answer')}</option>
                <option value="choice">{tx('Wybór jednej odpowiedzi', 'Multiple choice')}</option>
                <option value="keypad">{tx('Zamek z klawiaturą (kod cyfrowy)', 'Keypad lock (digit code)')}</option>
                <option value="dials">{tx('Zamek z pokrętłami (kod cyfrowy)', 'Dial lock (digit code)')}</option>
              </select>
            </label>
            <label className="field"><span>{tx('Dział', 'Topic')}</span>
              <select value={topic} onChange={(e) => setTopic(e.target.value as TopicId)}>
                {Object.entries(TOPICS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
              </select>
            </label>
          </div>
          <label className="field"><span>{tx('Tytuł zagadki', 'Puzzle title')}</span><input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
          <label className="field"><span>{tx('Treść zadania', 'Question text')}</span><textarea rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} /></label>
          {kind === 'choice' ? (
            <div className="field-row">
              <label className="field"><span>{tx('Odpowiedzi (każda w nowej linii)', 'Answers (one per line)')}</span><textarea rows={4} value={options} onChange={(e) => setOptions(e.target.value)} /></label>
              <label className="field"><span>{tx('Poprawna odpowiedź', 'Correct answer')}</span>
                <select value={correct} onChange={(e) => setCorrect(Number(e.target.value))}>
                  {options.split('\n').filter((x) => x.trim()).map((o, i) => <option key={i} value={i}>{String.fromCharCode(65 + i)}: {o}</option>)}
                </select>
              </label>
            </div>
          ) : (
            <label className="field"><span>{kind === 'text' ? tx('Poprawna odpowiedź (warianty oddziel „|”)', 'Correct answer (separate variants with “|”)') : kind === 'number' ? tx('Poprawny wynik (liczba)', 'Correct result (number)') : tx('Kod (3–6 cyfr)', 'Code (3–6 digits)')}</span>
              <input value={answer} onChange={(e) => setAnswer(e.target.value)} aria-invalid={!answerOk} />
            </label>
          )}
          {[tx('Wskazówka (na co zwrócić uwagę)', 'Clue (what to look at)'), tx('Podpowiedź matematyczna (metoda / wzór)', 'Maths hint (method / formula)'), tx('Pełne rozwiązanie krok po kroku', 'Full step-by-step solution')].map((l, i) => (
            <label key={i} className="field"><span>{i + 1}. {l}</span><input value={hints[i]} onChange={(e) => setHints((h) => h.map((x, j) => (j === i ? e.target.value : x)) as [string, string, string])} /></label>
          ))}
          <label className="toggle"><input type="checkbox" checked={bonus} onChange={(e) => setBonus(e.target.checked)} /> {tx('Zagadka dodatkowa (niewymagana do ucieczki)', 'Bonus puzzle (not required to escape)')}</label>
          <button className="btn btn--primary" disabled={!answerOk || !prompt.trim()} onClick={savePuzzle}>{tx('Zastosuj zagadkę', 'Apply puzzle')}</button>
          {!sc.puzzles[puzzleId] && <p className="bad small">{tx('Zagadka nie jest jeszcze zapisana – kliknij „Zastosuj zagadkę”.', 'The puzzle is not saved yet – click “Apply puzzle”.')}</p>}
        </div>
      )}
      {obj.lock && <label className="field"><span>{tx('Komunikat, gdy zamknięte', 'Message when locked')}</span><input value={String(obj.lockedText ?? '')} onChange={(e) => updObj((o) => { o.lockedText = e.target.value; })} /></label>}

      <h3>{tx('Po otwarciu / obejrzeniu', 'When opened / examined')}</h3>
      <label className="field"><span>{tx('Komunikat', 'Message')}</span><input value={String(obj.onOpen?.message ?? '')} onChange={(e) => updObj((o) => { o.onOpen = { ...(o.onOpen ?? {}), message: e.target.value || undefined }; })} /></label>
      <div className="field-row">
        <label className="field"><span>{tx('Wskazówka do dziennika – tytuł', 'Journal clue – title')}</span><input value={clueId ? sc.clues[clueId]?.title ?? '' : ''} placeholder={tx('(brak)', '(none)')} onChange={(e) => updObj((o, d) => {
          const id = clueId ?? `c_${o.id}`;
          if (!e.target.value && !d.clues[id]?.text) { delete d.clues[id]; o.onOpen = { ...(o.onOpen ?? {}), clues: [] }; return; }
          d.clues[id] = { title: e.target.value, text: d.clues[id]?.text ?? '' };
          o.onOpen = { ...(o.onOpen ?? {}), clues: [id] };
        })} /></label>
        <label className="field"><span>{tx('Treść wskazówki', 'Clue text')}</span><input value={clueId ? String(sc.clues[clueId]?.text ?? '') : ''} placeholder={tx('np. „Kod to wynik działania…”', 'e.g. “The code is the result of…”')} onChange={(e) => updObj((o, d) => {
          const id = clueId ?? `c_${o.id}`;
          d.clues[id] = { title: d.clues[id]?.title || tx('Wskazówka', 'Clue'), text: e.target.value };
          o.onOpen = { ...(o.onOpen ?? {}), clues: [id] };
        })} /></label>
      </div>
      <div className="field-row">
        <label className="field"><span>{tx('Przedmiot do zdobycia – nazwa', 'Item to collect – name')}</span><input value={itemId ? sc.items[itemId]?.name ?? '' : ''} placeholder={tx('(brak)', '(none)')} onChange={(e) => updObj((o, d) => {
          const id = itemId ?? `i_${o.id}`;
          if (!e.target.value) { delete d.items[id]; o.onOpen = { ...(o.onOpen ?? {}), items: [] }; return; }
          d.items[id] = { name: e.target.value, icon: d.items[id]?.icon ?? '🗝️', description: d.items[id]?.description ?? e.target.value };
          o.onOpen = { ...(o.onOpen ?? {}), items: [id] };
        })} /></label>
        <label className="field"><span>{tx('Ikona', 'Icon')}</span>
          <select value={itemId ? sc.items[itemId]?.icon : '🗝️'} disabled={!itemId} onChange={(e) => updObj((_o, d) => { if (itemId && d.items[itemId]) d.items[itemId].icon = e.target.value; })}>
            {['🗝️', '🔑', '💳', '🪪', '📜', '🔦', '🔌', '🧭', '💎', '🧩', '⚙️', '🪙'].map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </label>
      </div>

      <h3>{tx('Przejście', 'Passage')}</h3>
      <label className="field"><span>{tx('Obiekt prowadzi do', 'Object leads to')}</span>
        <select value={obj.door ? ('exit' in obj.door ? '__exit' : obj.door.to) : ''} onChange={(e) => updObj((o) => {
          if (!e.target.value) delete o.door;
          else if (e.target.value === '__exit') o.door = { exit: true };
          else o.door = { to: e.target.value };
        })}>
          <option value="">{tx('– nie jest przejściem –', '– not a passage –')}</option>
          {otherRooms.map((r) => <option key={r.id} value={r.id}>{tx('Pomieszczenie', 'Room')}: {r.name}</option>)}
          <option value="__exit">🚪 {tx('Wyjście – koniec scenariusza', 'Exit – end of scenario')}</option>
        </select>
      </label>
    </section>
  );
}

