import { getLang, locale, tx } from '../../i18n';
import { useMemo, useState } from 'react';
import { useApp } from '../../app/context';
import { LEVEL_NAMES, LEVEL_SHORT, TOPICS } from '../../data/topics';
import { describeSolution } from '../../engine/answers';
import { getPuzzle, lv, scenarioTopics } from '../../engine/level';
import { formatTime } from '../../engine/report';
import { DEFAULT_SCORING } from '../../engine/scoring';
import { makeRoomCode, classTransport } from '../../net/transport';
import { repo, type ClassSession } from '../../storage/repo';
import type { Level, ScoringConfig, TimeoutBehavior, TopicId } from '../../types';
import { VisualView } from '../../render/visuals';
import { ConfirmButton, downloadFile, EMBEDDED, TopBar } from '../common';
import { reportsToCSV } from '../screens/reportExport';
import { Editor } from './Editor';

const TABS: { id: string; name: string }[] = [
  { id: 'class', get name() { return `🏫 ${tx('Lekcja / tryb klasowy', 'Lesson / class mode')}`; } },
  { id: 'results', get name() { return `📊 ${tx('Wyniki i analiza błędów', 'Results and error analysis')}`; } },
  { id: 'key', get name() { return `🔑 ${tx('Klucz odpowiedzi', 'Answer key')}`; } },
  { id: 'rules', get name() { return `⚖️ ${tx('Punktacja i zasady', 'Scoring and rules')}`; } },
  { id: 'editor', get name() { return `🛠️ ${tx('Edytor scenariuszy', 'Scenario editor')}`; } },
  { id: 'export', get name() { return `💾 ${tx('Eksport / import', 'Export / import')}`; } },
];

const teamNames = () => getLang() === 'en'
  ? ['Maths Explorers', 'Equation Masters', 'Geometry Geniuses', 'Number Busters', 'Fraction Hunters', 'Percentage Guardians']
  : ['Matematyczni Odkrywcy', 'Mistrzowie Równań', 'Geometryczni Geniusze', 'Pogromcy Liczb', 'Łowcy Ułamków', 'Strażnicy Procentów'];

export function TeacherPanel({ initialTab }: { initialTab?: string }) {
  const app = useApp();
  const [tab, setTab] = useState(initialTab ?? 'class');
  return (
    <div className="screen teacher">
      <TopBar title={`👩‍🏫 ${tx('Panel nauczyciela', 'Teacher panel')}`} onBack={() => app.go({ name: 'home' })}>
        <label className="toggle inline"><input type="checkbox" checked={app.settings.presentation} onChange={(e) => app.updateSettings({ presentation: e.target.checked })} /> {tx('Widok prezentacyjny (tablica / projektor)', 'Presentation view (whiteboard / projector)')}</label>
      </TopBar>
      <div className="tabs tabs--big" role="tablist">
        {TABS.map((t) => <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>{t.name}</button>)}
      </div>
      {tab === 'class' && <ClassSetup />}
      {tab === 'results' && <ResultsAnalysis />}
      {tab === 'key' && <AnswerKey />}
      {tab === 'rules' && <Rules />}
      {tab === 'editor' && <Editor />}
      {tab === 'export' && <ExportTab />}
    </div>
  );
}

/* ------------------------------ Tryb klasowy ----------------------------- */

function ClassSetup() {
  const app = useApp();
  const [level, setLevel] = useState<Level>(app.settings.level);
  const [topics, setTopics] = useState<string[]>([]);
  const playable = app.scenarios.filter((s) => !s.comingSoon);
  const filtered = playable.filter((s) => !topics.length || scenarioTopics(s, level).some((t) => topics.includes(t)));
  const [scenarioId, setScenarioId] = useState(playable[0]?.id ?? '');
  const [time, setTime] = useState<number | null>(30);
  const [hintLimit, setHintLimit] = useState<number | null>(null);
  const [bonus, setBonus] = useState(true);
  const [timeout, setTimeoutB] = useState<TimeoutBehavior>('continue');
  const [teams, setTeams] = useState<string[]>(teamNames().slice(0, 4));
  const [name, setName] = useState(`${tx('Lekcja', 'Lesson')} ${new Date().toLocaleDateString(locale())}`);
  const sessions = repo.getClassSessions();
  const allTopics = [...new Set(playable.flatMap((s) => scenarioTopics(s, level)))];
  const sel = filtered.find((s) => s.id === scenarioId) ?? filtered[0];

  const create = async () => {
    if (!sel || !teams.filter((t) => t.trim()).length) return;
    const s: ClassSession = {
      id: Math.random().toString(36).slice(2, 10), name, createdAt: new Date().toISOString(), scenarioId: sel.id, level,
      timeLimit: time, hintLimit, includeBonus: bonus, timeoutBehavior: timeout, topics,
      teams: teams.filter((t) => t.trim()).map((t) => ({ name: t.trim(), cooperation: 0 })), roomCode: makeRoomCode(), status: 'running',
    };
    await classTransport.createSession(s);
    app.go({ name: 'classBoard', sessionId: s.id });
  };

  return (
    <div className="teacher-grid">
      <section className="panel">
        <h2>{tx('Nowa lekcja', 'New lesson')}</h2>
        <label className="field"><span>{tx('Nazwa lekcji', 'Lesson name')}</span><input value={name} onChange={(e) => setName(e.target.value)} /></label>
        <div className="field"><span>{tx('Poziom edukacyjny', 'Education level')}</span>
          <div className="seg">{(['sp', 'lo', 'tech'] as Level[]).map((l) => <button key={l} className={level === l ? 'active' : ''} aria-pressed={level === l} onClick={() => setLevel(l)}>{LEVEL_NAMES[l]}</button>)}</div>
        </div>
        <fieldset className="field">
          <legend>{tx('Działy matematyki (filtr scenariuszy)', 'Maths topics (scenario filter)')}</legend>
          <div className="chip-select">
            {allTopics.map((t) => (
              <label key={t} className={`chip ${topics.includes(t) ? 'active' : ''}`}>
                <input type="checkbox" className="sr-only" checked={topics.includes(t)} onChange={() => setTopics((a) => (a.includes(t) ? a.filter((x) => x !== t) : [...a, t]))} />
                {TOPICS[t as TopicId]?.name ?? t}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="field"><span>{tx('Scenariusz', 'Scenario')}</span>
          <select value={sel?.id ?? ''} onChange={(e) => setScenarioId(e.target.value)}>
            {filtered.map((s) => <option key={s.id} value={s.id}>{s.title}{s.custom ? tx(' (nauczyciela)', ' (teacher’s)') : ''}</option>)}
          </select>
        </label>
        {sel && <p className="muted small">{tx('Działy w tym scenariuszu', 'Topics in this scenario')}: {scenarioTopics(sel, level).map((t) => TOPICS[t as TopicId]?.name ?? t).join(', ')}</p>}
        <div className="field-row">
          <label className="field"><span>{tx('Czas', 'Time')}</span>
            <select value={String(time)} onChange={(e) => setTime(e.target.value === 'null' ? null : Number(e.target.value))}>
              {[null, 15, 30, 45, 60].map((o) => <option key={String(o)} value={String(o)}>{o === null ? tx('bez limitu', 'no limit') : `${o} min`}</option>)}
            </select>
          </label>
          <label className="field"><span>{tx('Limit podpowiedzi', 'Hint limit')}</span>
            <select value={String(hintLimit)} onChange={(e) => setHintLimit(e.target.value === 'null' ? null : Number(e.target.value))}>
              {[null, 0, 3, 5, 10, 15].map((o) => <option key={String(o)} value={String(o)}>{o === null ? tx('bez limitu', 'unlimited') : o === 0 ? tx('wyłączone', 'off') : o}</option>)}
            </select>
          </label>
          <label className="field"><span>{tx('Po upływie czasu', 'When time runs out')}</span>
            <select value={timeout} onChange={(e) => setTimeoutB(e.target.value as TimeoutBehavior)}>
              <option value="continue">{tx('gra dalej (bez punktów za czas)', 'keep playing (no time points)')}</option>
              <option value="end">{tx('zakończ i pokaż wynik', 'end and show the result')}</option>
            </select>
          </label>
        </div>
        <label className="toggle"><input type="checkbox" checked={bonus} onChange={(e) => setBonus(e.target.checked)} /> {tx('Liczba zagadek: pełna (z zagadkami dodatkowymi). Odznacz, by grać tylko zagadki główne.', 'Number of puzzles: full (with bonus puzzles). Untick to play only the main puzzles.')}</label>
      </section>
      <section className="panel">
        <h2>{tx('Drużyny', 'Teams')}</h2>
        <p className="muted small">{tx('W wersji podstawowej drużyny grają kolejno na jednym urządzeniu (np. na tablicy interaktywnej).', 'In this version teams take turns on one device (e.g. an interactive whiteboard).')}</p>
        <ul className="team-list">
          {teams.map((t, i) => (
            <li key={i}>
              <input value={t} aria-label={`${tx('Nazwa drużyny', 'Team name')} ${i + 1}`} onChange={(e) => setTeams((a) => a.map((x, j) => (j === i ? e.target.value : x)))} />
              <button className="btn btn--icon" aria-label={tx('Usuń drużynę', 'Remove team')} onClick={() => setTeams((a) => a.filter((_, j) => j !== i))}>✕</button>
            </li>
          ))}
        </ul>
        <button className="btn" onClick={() => setTeams((a) => { const n = teamNames(); return [...a, n[a.length % n.length] + (a.length >= n.length ? ` ${a.length + 1}` : '')]; })}>+ {tx('Dodaj drużynę', 'Add team')}</button>
        <div className="start-bar inline">
          <button className="btn btn--primary btn--big" disabled={!sel || !teams.some((t) => t.trim())} onClick={create}>{tx('Utwórz lekcję i przejdź do tablicy', 'Create lesson and open the scoreboard')} →</button>
        </div>
      </section>
      {sessions.length > 0 && (
        <section className="panel span2">
          <h2>{tx('Poprzednie lekcje', 'Previous lessons')}</h2>
          <ul className="session-list">
            {sessions.map((s) => (
              <li key={s.id}>
                <div><strong>{s.name}</strong> <span className="muted">– {app.getScenario(s.scenarioId)?.title}, {LEVEL_SHORT[s.level]}, {tx('drużyn', 'teams')}: {s.teams.length}, {tx('kod', 'code')}: {s.roomCode}</span></div>
                <div className="btn-row">
                  <button className="btn btn--small" onClick={() => app.go({ name: 'classBoard', sessionId: s.id })}>{tx('Otwórz tablicę', 'Open scoreboard')}</button>
                  <ConfirmButton className="btn btn--small btn--danger" label={tx('Usuń', 'Delete')} onConfirm={() => { repo.deleteClassSession(s.id); app.go({ name: 'teacher', tab: 'class' }); }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/* ------------------------- Wyniki i analiza błędów ------------------------ */

function ResultsAnalysis() {
  const app = useApp();
  const all = repo.getHistory();
  const [scenario, setScenario] = useState('');
  const [level, setLevel] = useState('');
  const list = all.filter((h) => (!scenario || h.scenarioId === scenario) && (!level || h.level === level));
  const puzzleStats = useMemo(() => {
    const m = new Map<string, { title: string; games: number; wrong: number; hints: number; unsolved: number; scen: string }>();
    for (const r of list) for (const row of r.rows) {
      const k = `${r.scenarioId}:${row.id}:${r.level}`;
      const e = m.get(k) ?? { title: `${row.title} (${LEVEL_SHORT[r.level as Level]})`, games: 0, wrong: 0, hints: 0, unsolved: 0, scen: r.scenarioTitle };
      e.games++; e.wrong += row.wrong; e.hints += row.hints; if (!row.solved) e.unsolved++;
      m.set(k, e);
    }
    return [...m.values()].sort((a, b) => (b.wrong + b.hints) / b.games - (a.wrong + a.hints) / a.games);
  }, [list]);
  const topicStats = useMemo(() => {
    const m = new Map<string, { name: string; puzzles: number; wrong: number; hints: number }>();
    for (const r of list) for (const t of r.topics) {
      const e = m.get(t.topic) ?? { name: t.name, puzzles: 0, wrong: 0, hints: 0 };
      e.puzzles += t.puzzles; e.wrong += t.wrong; e.hints += t.hints;
      m.set(t.topic, e);
    }
    return [...m.values()].sort((a, b) => (b.wrong + b.hints) / b.puzzles - (a.wrong + a.hints) / a.puzzles);
  }, [list]);
  const playable = app.scenarios.filter((s) => !s.comingSoon);
  return (
    <div>
      <section className="panel">
        <div className="field-row">
          <label className="field"><span>{tx('Scenariusz', 'Scenario')}</span><select value={scenario} onChange={(e) => setScenario(e.target.value)}><option value="">{tx('wszystkie', 'all')}</option>{playable.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</select></label>
          <label className="field"><span>{tx('Poziom', 'Level')}</span><select value={level} onChange={(e) => setLevel(e.target.value)}><option value="">{tx('wszystkie', 'all')}</option>{(['sp', 'lo', 'tech'] as Level[]).map((l) => <option key={l} value={l}>{LEVEL_NAMES[l]}</option>)}</select></label>
          {!EMBEDDED && <div className="field"><span>&nbsp;</span><button className="btn" onClick={() => downloadFile('wyniki-escape-room.csv', reportsToCSV(list), 'text/csv;charset=utf-8')}>⬇️ {tx('Eksport CSV', 'Export CSV')} ({list.length})</button></div>}
        </div>
        <p className="muted">{tx('Rozgrywek', 'Games')}: {list.length} • {tx('ukończonych', 'completed')}: {list.filter((h) => h.status === 'won').length} • {tx('średni wynik', 'average score')}: {list.length ? Math.round(list.reduce((a, h) => a + h.score, 0) / list.length) : 0} {tx('pkt', 'pts')} • {tx('średnia poprawność', 'average accuracy')}: {list.length ? Math.round(list.reduce((a, h) => a + h.accuracy, 0) / list.length) : 0}%</p>
      </section>
      {list.length === 0 ? <section className="panel"><p className="muted">{tx('Brak wyników dla wybranych filtrów.', 'No results for the selected filters.')}</p></section> : (
        <>
          <section className="panel">
            <h2>{tx('Działy – gdzie uczniowie mają najwięcej trudności', 'Topics – where pupils struggle most')}</h2>
            <div className="bars-list">
              {topicStats.map((t) => {
                const v = (t.wrong + t.hints * 0.5) / t.puzzles;
                return <div key={t.name} className="bar-row"><span>{t.name}</span><div className="bar"><div style={{ width: `${Math.min(100, v * 50)}%` }} /></div><small>{t.wrong} {tx('błędów', 'errors')} • {t.hints} {tx('podp.', 'hints')} / {t.puzzles} {tx('zagadek', 'puzzles')}</small></div>;
              })}
            </div>
          </section>
          <section className="panel">
            <h2>{tx('Analiza błędów – zagadki', 'Error analysis – puzzles')}</h2>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>{tx('Zagadka', 'Puzzle')}</th><th>{tx('Scenariusz', 'Scenario')}</th><th>{tx('Prób', 'Attempts')}</th><th>{tx('Śr. błędów', 'Avg errors')}</th><th>{tx('Śr. podpowiedzi', 'Avg hints')}</th><th>{tx('Nierozwiązana', 'Unsolved')}</th></tr></thead>
                <tbody>{puzzleStats.map((p) => <tr key={p.title + p.scen}><td>{p.title}</td><td>{p.scen}</td><td>{p.games}</td><td>{(p.wrong / p.games).toFixed(1)}</td><td>{(p.hints / p.games).toFixed(1)}</td><td>{p.unsolved}</td></tr>)}</tbody>
              </table>
            </div>
          </section>
          <section className="panel">
            <h2>{tx('Wszystkie wyniki', 'All results')}</h2>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>{tx('Data', 'Date')}</th><th>{tx('Gracz / drużyna', 'Player / team')}</th><th>{tx('Scenariusz', 'Scenario')}</th><th>{tx('Poziom', 'Level')}</th><th>{tx('Wynik', 'Score')}</th><th>{tx('Czas', 'Time')}</th><th>{tx('Zagadki', 'Puzzles')}</th><th>{tx('Błędy', 'Errors')}</th><th>{tx('Podp.', 'Hints')}</th><th>{tx('Do powtórzenia', 'To revise')}</th></tr></thead>
                <tbody>{list.map((h, i) => <tr key={i}><td>{new Date(h.date).toLocaleString(locale(), { dateStyle: 'short', timeStyle: 'short' })}</td><td>{h.teamName ?? h.playerName}</td><td>{h.scenarioTitle}</td><td>{LEVEL_SHORT[h.level as Level]}</td><td>{h.score}</td><td>{formatTime(h.elapsed)}</td><td>{h.solved}/{h.totalPuzzles}</td><td>{h.wrong}</td><td>{h.hintsUsed}</td><td className="small">{h.toReview.join(', ')}</td></tr>)}</tbody>
              </table>
            </div>
            <ConfirmButton className="btn btn--danger btn--small" label={tx('Wyczyść historię', 'Clear history')} confirmLabel={tx('Usunąć całą historię? Kliknij ponownie', 'Delete the whole history? Click again')} onConfirm={() => { repo.clearHistory(); app.go({ name: 'teacher', tab: 'results' }); }} />
          </section>
        </>
      )}
    </div>
  );
}

/* ----------------------------- Klucz odpowiedzi --------------------------- */

function AnswerKey() {
  const app = useApp();
  const playable = app.scenarios.filter((s) => !s.comingSoon);
  const [id, setId] = useState(playable[0]?.id ?? '');
  const [level, setLevel] = useState<Level>(app.settings.level);
  const sc = app.getScenario(id);
  return (
    <section className="panel">
      <div className="field-row">
        <label className="field"><span>{tx('Scenariusz', 'Scenario')}</span><select value={id} onChange={(e) => setId(e.target.value)}>{playable.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</select></label>
        <div className="field"><span>{tx('Poziom', 'Level')}</span><div className="seg">{(['sp', 'lo', 'tech'] as Level[]).map((l) => <button key={l} className={level === l ? 'active' : ''} aria-pressed={level === l} onClick={() => setLevel(l)}>{LEVEL_NAMES[l]}</button>)}</div></div>
        {!EMBEDDED && <div className="field"><span>&nbsp;</span><button className="btn" onClick={() => window.print()}>🖨️ {tx('Drukuj', 'Print')}</button></div>}
      </div>
      <p className="muted small">{tx('Klucz tylko dla nauczyciela. Kolejność zgodna z przebiegiem scenariusza.', 'Answer key for teachers only. In the order the scenario is played.')}</p>
      {sc?.rooms.map((r, ri) => (
        <div key={r.id} className="key-room">
          <h3>{ri + 1}. {r.name}</h3>
          {r.objects.filter((o) => o.lock?.type === 'puzzle').map((o) => {
            const pid = (o.lock as { puzzle: string }).puzzle;
            const p = getPuzzle(sc, pid, level);
            return (
              <details key={o.id} className="key-item">
                <summary><strong>{p.title}</strong> <span className="muted">({o.name}{sc.puzzles[pid].bonus ? tx(', bonus', ', bonus') : ''})</span> → <span className="good">{describeSolution(p)}</span></summary>
                <p>{p.prompt}</p>
                {p.visual && <VisualView v={p.visual} />}
                <ol>{p.hints.map((h, i) => <li key={i}>{h}</li>)}</ol>
              </details>
            );
          })}
          {r.objects.filter((o) => o.lock?.type === 'item').map((o) => <p key={o.id} className="small">🔑 {o.name}: {tx('wymaga', 'requires')} „{sc.items[(o.lock as { item: string }).item]?.name}”</p>)}
          {r.objects.filter((o) => o.onOpen?.clues?.length).map((o) => <p key={o.id + 'c'} className="small muted">📜 {o.name}: {o.onOpen!.clues!.map((c) => `${sc.clues[c].title} – ${lv(sc.clues[c].text, level)}`).join(' | ')}</p>)}
        </div>
      ))}
    </section>
  );
}

/* ------------------------------- Punktacja -------------------------------- */

function Rules() {
  const app = useApp();
  const [cfg, setCfg] = useState<ScoringConfig>(app.settings.scoring);
  const [savedMsg, setSavedMsg] = useState('');
  const fields: [keyof ScoringConfig, string][] = [
    ['solve', tx('Rozwiązanie zagadki', 'Solving a puzzle')], ['noHintBonus', tx('Premia: bez podpowiedzi i bez pomyłek', 'Bonus: no hints, no mistakes')], ['secret', tx('Odkrycie ukrytego obiektu', 'Finding a hidden object')], ['room', tx('Ukończenie pomieszczenia', 'Completing a room')],
    ['scenario', tx('Ukończenie scenariusza', 'Completing the scenario')], ['timePerMinute', tx('Premia za każdą pozostałą minutę', 'Bonus per minute left')], ['hint1', tx('Kara: wskazówka (poziom 1)', 'Penalty: clue (level 1)')], ['hint2', tx('Kara: podpowiedź matematyczna (2)', 'Penalty: maths hint (2)')],
    ['hint3', tx('Kara: pełne rozwiązanie (3)', 'Penalty: full solution (3)')], ['wrong', tx('Kara: błędna próba', 'Penalty: wrong attempt')], ['timeout', tx('Kara: przekroczenie limitu czasu', 'Penalty: exceeding the time limit')], ['lockout', tx('Blokada zamka po błędzie (s, 0 = wyłączona)', 'Lock after a wrong answer (s, 0 = off)')],
  ];
  return (
    <section className="panel">
      <h2>{tx('Punktacja', 'Scoring')}</h2>
      <p className="muted small">{tx('Wynik nigdy nie spada poniżej zera. Kara za błąd rośnie przy kolejnych pomyłkach w tej samej zagadce (×1, ×2, ×3), a blokada zamka trwa kolejno ×1, ×3, ×6, ×9 podanego czasu. Zmiany dotyczą nowych rozgrywek.', 'The score never drops below zero. The wrong-answer penalty grows with repeated mistakes on the same puzzle (×1, ×2, ×3), and the lock lasts ×1, ×3, ×6, ×9 of the time set. Changes apply to new games.')}</p>
      <div className="score-form">
        {fields.map(([k, label]) => (
          <label key={k} className="field"><span>{label}</span><input type="number" min={0} max={1000} value={cfg[k]} onChange={(e) => setCfg({ ...cfg, [k]: Math.max(0, Number(e.target.value) || 0) })} /></label>
        ))}
      </div>
      <label className="field"><span>{tx('Domyślnie po upływie czasu (szybka gra)', 'Default when time runs out (quick game)')}</span>
        <select value={app.settings.defaultTimeoutBehavior} onChange={(e) => app.updateSettings({ defaultTimeoutBehavior: e.target.value as TimeoutBehavior })}>
          <option value="continue">{tx('pozwól grać dalej (bez punktów za czas)', 'allow playing on (no time points)')}</option>
          <option value="end">{tx('zakończ i pokaż wynik', 'end and show the result')}</option>
        </select>
      </label>
      <div className="btn-row">
        <button className="btn btn--primary" onClick={() => { app.updateSettings({ scoring: cfg }); setSavedMsg(tx('Zapisano punktację.', 'Scoring saved.')); }}>{tx('Zapisz', 'Save')}</button>
        <button className="btn" onClick={() => setCfg(DEFAULT_SCORING)}>{tx('Przywróć domyślne', 'Restore defaults')}</button>
        {savedMsg && <span className="good" role="status">{savedMsg}</span>}
      </div>
    </section>
  );
}

/* --------------------------------- Eksport -------------------------------- */

function ExportTab() {
  const app = useApp();
  const [msg, setMsg] = useState('');
  const importScenario = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      if (!data.id || !data.rooms || !data.puzzles) throw new Error(tx('To nie jest plik scenariusza.', 'This is not a scenario file.'));
      repo.saveCustomScenario({ ...data, custom: true, comingSoon: false });
      app.refreshScenarios();
      setMsg(tx(`Zaimportowano scenariusz „${data.title}”.`, `Imported scenario “${data.title}”.`));
    } catch (e) {
      setMsg(tx('Błąd importu: ', 'Import error: ') + (e as Error).message);
    }
  };
  return (
    <section className="panel">
      <h2>{tx('Eksport danych', 'Data export')}</h2>
      {EMBEDDED && <p className="muted">{tx('W tym podglądzie pobieranie plików jest zablokowane przez przeglądarkę. Eksport działa w wersji uruchomionej lokalnie (plik HTML lub npm run dev).', 'File downloads are blocked by the browser in this preview. Export works in the locally run version (HTML file or npm run dev).')}</p>}
      <div className="btn-row">
        <button className="btn" onClick={() => downloadFile('wyniki-escape-room.csv', reportsToCSV(repo.getHistory()), 'text/csv;charset=utf-8')}>⬇️ {tx('Wyniki (CSV, Excel)', 'Results (CSV, Excel)')}</button>
        <button className="btn" onClick={() => downloadFile('escape-room-dane.json', repo.exportAll())}>⬇️ {tx('Wszystkie dane (JSON – kopia / przyszły serwer)', 'All data (JSON – backup / future server)')}</button>
      </div>
      <h2>{tx('Import scenariusza', 'Import a scenario')}</h2>
      <p className="muted small">{tx('Wczytaj plik JSON scenariusza (np. wyeksportowany z edytora na innym komputerze).', 'Load a scenario JSON file (e.g. exported from the editor on another computer).')}</p>
      <input type="file" accept="application/json,.json" onChange={(e) => { const f = e.target.files?.[0]; if (f) void importScenario(f); }} />
      {msg && <p role="status">{msg}</p>}
      <h2>{tx('Rozgrywka sieciowa', 'Network play')}</h2>
      <p className="muted">{tx('Każda lekcja otrzymuje już kod pokoju. Architektura (moduł net/transport.ts) jest przygotowana tak, by w kolejnej wersji uczniowie mogli dołączać z własnych urządzeń po tym kodzie, a wyniki spływały na tablicę nauczyciela na żywo.', 'Each lesson already gets a room code. The architecture (net/transport.ts module) is ready for a future version in which pupils join from their own devices with this code and results reach the teacher’s scoreboard live.')}</p>
    </section>
  );
}
