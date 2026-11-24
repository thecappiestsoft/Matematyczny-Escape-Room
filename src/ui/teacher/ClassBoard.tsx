import { tx } from '../../i18n';
import { useState } from 'react';
import { useApp } from '../../app/context';
import { LEVEL_NAMES } from '../../data/topics';
import { formatTime } from '../../engine/report';
import { repo, type ClassSession } from '../../storage/repo';
import { ConfirmButton, downloadFile, EMBEDDED, TopBar } from '../common';
import { reportsToCSV } from '../screens/reportExport';

/** Wynik drużyny: punkty z gry + punkty za współpracę (przyznaje nauczyciel) */
const teamTotal = (t: ClassSession['teams'][number]) => (t.result?.score ?? 0) + t.cooperation;

export function ClassBoard({ sessionId }: { sessionId: string }) {
  const app = useApp();
  const [session, setSession] = useState<ClassSession | undefined>(() => repo.getClassSessions().find((s) => s.id === sessionId));
  if (!session) return <div className="screen"><TopBar title={tx('Lekcja', 'Lesson')} onBack={() => app.go({ name: 'teacher' })} /><p>{tx('Nie znaleziono lekcji.', 'Lesson not found.')}</p></div>;
  const sc = app.getScenario(session.scenarioId);
  const save = (s: ClassSession) => { repo.saveClassSession(s); setSession({ ...s }); };
  const next = session.teams.find((t) => !t.result);
  const ranking = [...session.teams].filter((t) => t.result).sort((a, b) => teamTotal(b) - teamTotal(a) || (a.result!.elapsed - b.result!.elapsed));

  const play = (team: string) => {
    if (!sc) return;
    app.startGame({
      scenarioId: sc.id, level: session.level, mode: 'class', timeLimit: session.timeLimit, timeoutBehavior: session.timeoutBehavior,
      hintLimit: session.hintLimit, includeBonus: session.includeBonus, playerName: team, teamName: team, classSessionId: session.id,
    });
  };

  return (
    <div className="screen classboard">
      <TopBar title={`🏫 ${session.name}`} onBack={() => app.go({ name: 'teacher', tab: 'class' })}>
        <span className="room-code" title={tx('Kod pokoju – przygotowanie pod grę sieciową', 'Room code – ready for future network play')}>{tx('Kod pokoju', 'Room code')}: <strong>{session.roomCode}</strong></span>
      </TopBar>
      <section className="panel class-info">
        <div><strong>{sc?.title}</strong> • {LEVEL_NAMES[session.level]} • {session.timeLimit ? `${session.timeLimit} min` : tx('bez limitu czasu', 'no time limit')} • {tx('podpowiedzi', 'hints')}: {session.hintLimit === null ? tx('bez limitu', 'unlimited') : session.hintLimit} • {session.includeBonus ? tx('z zagadkami dodatkowymi', 'with bonus puzzles') : tx('tylko zagadki główne', 'main puzzles only')}</div>
        {next ? (
          <div className="next-team">
            <span>{tx('Teraz gra drużyna:', 'Now playing:')}</span>
            <strong className="next-team-name">{next.name}</strong>
            <button className="btn btn--primary btn--big" onClick={() => play(next.name)}>▶ {tx('Start drużyny', 'Start team')}</button>
          </div>
        ) : <div className="next-team done">{tx('Wszystkie drużyny zakończyły grę!', 'All teams have finished!')} 🎉</div>}
      </section>
      <section className="panel">
        <h2>{tx('Tablica wyników', 'Scoreboard')}</h2>
        <div className="table-wrap">
          <table className="data-table big">
            <thead><tr><th>#</th><th>{tx('Drużyna', 'Team')}</th><th>{tx('Punkty gry', 'Game points')}</th><th>{tx('Współpraca (0–50)', 'Teamwork (0–50)')}</th><th>{tx('Razem', 'Total')}</th><th>{tx('Czas', 'Time')}</th><th>{tx('Zagadki', 'Puzzles')}</th><th>{tx('Błędy', 'Errors')}</th><th>{tx('Podpowiedzi', 'Hints')}</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {session.teams.map((t) => {
                const pos = ranking.indexOf(t);
                return (
                  <tr key={t.name} className={pos === 0 ? 'leader' : ''}>
                    <td>{pos >= 0 ? (['🥇', '🥈', '🥉'][pos] ?? pos + 1) : '–'}</td>
                    <td><strong>{t.name}</strong></td>
                    <td>{t.result?.score ?? '–'}</td>
                    <td>
                      <input type="number" min={0} max={50} step={5} value={t.cooperation} aria-label={`${tx('Punkty za współpracę', 'Teamwork points')}: ${t.name}`} className="coop-input"
                        onChange={(e) => save({ ...session, teams: session.teams.map((x) => (x.name === t.name ? { ...x, cooperation: Math.max(0, Math.min(50, Number(e.target.value) || 0)) } : x)) })} />
                    </td>
                    <td><strong>{t.result ? teamTotal(t) : '–'}</strong></td>
                    <td>{t.result ? formatTime(t.result.elapsed) : '–'}</td>
                    <td>{t.result ? `${t.result.solved}/${t.result.totalPuzzles}` : '–'}</td>
                    <td>{t.result?.wrong ?? '–'}</td>
                    <td>{t.result?.hintsUsed ?? '–'}</td>
                    <td>{t.result ? (t.result.status === 'won' ? <span className="good">{tx('uciekli ✓', 'escaped ✓')}</span> : <span className="muted">{tx('nie ukończyli', 'did not finish')}</span>) : <span className="muted">{tx('czeka', 'waiting')}</span>}</td>
                    <td>{t.result ? <ConfirmButton className="btn btn--small" label={tx('Powtórz', 'Replay')} confirmLabel={tx('Zastąpić wynik? Kliknij', 'Replace result? Click')} onConfirm={() => play(t.name)} /> : <button className="btn btn--small" onClick={() => play(t.name)}>{tx('Graj', 'Play')}</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="muted small">{tx('Ranking: punkty gry (poprawność, szybkość, podpowiedzi, ukończenie) + punkty za współpracę przyznane przez nauczyciela. Remis rozstrzyga krótszy czas.', 'Ranking: game points (accuracy, speed, hints, completion) + teamwork points awarded by the teacher. Ties go to the faster team.')}</p>
        <div className="btn-row">
          {!EMBEDDED && <button className="btn" onClick={() => downloadFile(`lekcja-${session.roomCode}.csv`, reportsToCSV(session.teams.flatMap((t) => (t.result ? [t.result] : []))), 'text/csv;charset=utf-8')}>⬇️ {tx('Eksport wyników lekcji (CSV)', 'Export lesson results (CSV)')}</button>}
          {!EMBEDDED && <button className="btn" onClick={() => window.print()}>🖨️ {tx('Drukuj', 'Print')}</button>}
        </div>
      </section>
      {ranking.length > 0 && (
        <section className="panel">
          <h2>{tx('Wspólne wnioski dla klasy', 'Takeaways for the class')}</h2>
          <ul>
            {[...new Set(ranking.flatMap((t) => t.result!.toReview))].map((x) => <li key={x}>{tx('Do powtórzenia', 'To revise')}: {x}</li>)}
            {[...new Set(ranking.flatMap((t) => t.result!.hardest.map((h) => h.title)))].slice(0, 5).map((x) => <li key={x}>{tx('Trudna zagadka', 'Hard puzzle')}: {x}</li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
