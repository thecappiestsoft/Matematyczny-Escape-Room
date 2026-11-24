import { tx } from '../../i18n';
import { useApp } from '../../app/context';
import { LEVEL_NAMES } from '../../data/topics';
import { ACHIEVEMENTS } from '../../engine/achievements';
import { formatTime, type GameReport } from '../../engine/report';
import type { Level } from '../../types';
import { downloadFile, EMBEDDED, Stars, TopBar } from '../common';
import { reportToText } from './reportExport';

export function ReportBody({ report }: { report: GameReport }) {
  return (
    <>
      <section className="panel">
        <h2>{tx('Raport edukacyjny', 'Learning report')}</h2>
        <p className="muted small">{tx('Raport to informacja zwrotna o tym, co poszło dobrze i co warto powtórzyć – nie jest oceną szkolną.', 'This report is feedback on what went well and what to revise – it is not a school grade.')}</p>
        <div className="report-grid">
          <div>
            <h3>✅ {tx('Najlepiej opanowane', 'Strongest topics')}</h3>
            {report.mastered.length ? <ul>{report.mastered.map((m) => <li key={m}>{m}</li>)}</ul> : <p className="muted">{tx('Każdy dział wymagał chwili namysłu – to normalne!', 'Every topic needed some thought – that is normal!')}</p>}
          </div>
          <div>
            <h3>🔁 {tx('Do powtórzenia', 'To revise')}</h3>
            {report.toReview.length ? <ul>{report.toReview.map((m) => <li key={m}>{m}</li>)}</ul> : <p className="good">{tx('Brak – świetnie!', 'Nothing – great!')}</p>}
          </div>
          <div>
            <h3>🧗 {tx('Najtrudniejsze zagadki', 'Hardest puzzles')}</h3>
            {report.hardest.length ? <ul>{report.hardest.map((r) => <li key={r.id}>{r.title} <span className="muted">({r.wrong} {tx('błędów', 'errors')}, {r.hints} {tx('podp.', 'hints')}{r.solved ? '' : tx(', nierozwiązana', ', unsolved')})</span></li>)}</ul> : <p className="muted">{tx('Wszystko poszło gładko.', 'Everything went smoothly.')}</p>}
          </div>
        </div>
        {report.exercises.length > 0 && (
          <>
            <h3>📝 {tx('Sugerowane ćwiczenia', 'Suggested exercises')}</h3>
            <ul className="exercises">{report.exercises.map((e) => <li key={e}>{e}</li>)}</ul>
          </>
        )}
      </section>
      <section className="panel">
        <h2>{tx('Zagadki', 'Puzzles')}</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>{tx('Zagadka', 'Puzzle')}</th><th>{tx('Dział', 'Topic')}</th><th>{tx('Wynik', 'Result')}</th><th>{tx('Błędy', 'Errors')}</th><th>{tx('Podpowiedzi', 'Hints')}</th></tr></thead>
            <tbody>
              {report.rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.title}{r.bonus && <span className="chip small">{tx('bonus', 'bonus')}</span>}</td>
                  <td>{report.topics.find((t) => t.topic === r.topic)?.name}</td>
                  <td>{r.solved ? <span className="good">{tx('rozwiązana', 'solved')}</span> : <span className="bad">{tx('nie', 'no')}</span>}</td>
                  <td>{r.wrong}</td>
                  <td>{r.hints}/3</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export function ResultsScreen({ report, achievements, scenarioId }: { report: GameReport; achievements: string[]; scenarioId: string }) {
  const app = useApp();
  const won = report.status === 'won';
  const sc = app.getScenario(scenarioId);
  const isClass = report.mode === 'class' && report.classSessionId;
  return (
    <div className="screen results">
      <TopBar title={won ? `🎉 ${tx('Ucieczka udana!', 'You escaped!')}` : tx('Koniec rozgrywki', 'Game over')} onBack={() => app.go({ name: 'home' })} />
      <section className="panel result-hero">
        <div className="result-main">
          <small>{report.scenarioTitle} • {LEVEL_NAMES[report.level as Level]}{report.teamName ? ` • ${tx('drużyna', 'team')} ${report.teamName}` : ''}</small>
          <div className="result-score">{report.score}<span>{tx('pkt', 'pts')}</span></div>
          <Stars n={won ? report.rating.stars : 0} />
          <h2>{won ? report.rating.title : tx('Spróbuj jeszcze raz!', 'Try again!')}</h2>
          <p>{won ? report.rating.text : tx('Tym razem nie udało się uciec, ale każda próba uczy. Zajrzyj do raportu poniżej.', 'You did not escape this time, but every attempt teaches you something. Have a look at the report below.')}</p>
        </div>
        <dl className="stat-grid">
          <div><dt>{tx('Czas', 'Time')}</dt><dd>{formatTime(report.elapsed)}{report.timeLimit ? ` / ${report.timeLimit}:00` : ''}</dd></div>
          <div><dt>{tx('Rozwiązane zagadki', 'Puzzles solved')}</dt><dd>{report.solved} / {report.totalPuzzles}</dd></div>
          <div><dt>{tx('Błędne odpowiedzi', 'Wrong answers')}</dt><dd>{report.wrong}</dd></div>
          <div><dt>{tx('Podpowiedzi', 'Hints')}</dt><dd>{report.hintsUsed}</dd></div>
          <div><dt>{tx('Poprawność', 'Accuracy')}</dt><dd>{report.accuracy}%</dd></div>
          <div><dt>{tx('Ukryte obiekty', 'Hidden objects')}</dt><dd>{report.secretsFound} / {report.secretsTotal}</dd></div>
        </dl>
      </section>
      {achievements.length > 0 && (
        <section className="panel">
          <h2>{tx('Nowe osiągnięcia!', 'New achievements!')}</h2>
          <div className="achievements">
            {achievements.map((id) => { const a = ACHIEVEMENTS.find((x) => x.id === id)!; return <div key={id} className="achievement got pop"><span className="ach-icon">{a.icon}</span><strong>{a.name}</strong><small>{a.description}</small></div>; })}
          </div>
        </section>
      )}
      <ReportBody report={report} />
      <div className="btn-row center">
        {isClass ? <button className="btn btn--primary btn--big" onClick={() => app.go({ name: 'classBoard', sessionId: report.classSessionId! })}>{tx('Wróć do tablicy wyników klasy', 'Back to the class scoreboard')}</button> : (
          <>
            {sc && <button className="btn btn--primary" onClick={() => app.go({ name: 'setup', mode: report.mode === 'timed' ? 'timed' : 'quick', scenarioId: sc.id })}>{tx('Zagraj ponownie', 'Play again')}</button>}
            {report.mode === 'campaign' && <button className="btn btn--primary" onClick={() => app.go({ name: 'campaign' })}>{tx('Dalej w kampanii', 'Continue the campaign')} →</button>}
          </>
        )}
        {!EMBEDDED && <button className="btn" onClick={() => window.print()}>🖨️ {tx('Drukuj raport', 'Print report')}</button>}
        {!EMBEDDED && <button className="btn" onClick={() => downloadFile(`raport-${report.scenarioId}-${report.date.slice(0, 10)}.txt`, reportToText(report), 'text/plain;charset=utf-8')}>⬇️ {tx('Pobierz raport', 'Download report')}</button>}
        <button className="btn" onClick={() => app.go({ name: 'home' })}>{tx('Menu główne', 'Main menu')}</button>
      </div>
    </div>
  );
}
