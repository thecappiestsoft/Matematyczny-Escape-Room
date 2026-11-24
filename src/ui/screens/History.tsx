import { locale, tx } from '../../i18n';
import { useState } from 'react';
import { useApp } from '../../app/context';
import { LEVEL_SHORT } from '../../data/topics';
import { ACHIEVEMENTS } from '../../engine/achievements';
import { formatTime } from '../../engine/report';
import { repo } from '../../storage/repo';
import type { Level } from '../../types';
import { TopBar } from '../common';

export function HistoryScreen() {
  const app = useApp();
  const player = app.settings.playerName || tx('Gracz', 'Player');
  const [all, setAll] = useState(false);
  const history = repo.getHistory().filter((h) => all || h.playerName === player);
  const owned = repo.getAchievements(player);
  const won = history.filter((h) => h.status === 'won');
  return (
    <div className="screen">
      <TopBar title={`🏆 ${tx('Osiągnięcia i historia', 'Achievements and history')}`} onBack={() => app.go({ name: 'home' })} />
      <section className="panel">
        <h2>{tx('Osiągnięcia gracza', 'Achievements of')}: {player}</h2>
        <div className="achievements">
          {ACHIEVEMENTS.map((a) => (
            <div key={a.id} className={`achievement ${owned.includes(a.id) ? 'got' : ''}`}>
              <span className="ach-icon">{owned.includes(a.id) ? a.icon : '🔒'}</span>
              <strong>{a.name}</strong>
              <small>{a.description}</small>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel-head">
          <h2>{tx('Historia rozgrywek', 'Game history')}</h2>
          <label className="toggle inline"><input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} /> {tx('Pokaż wszystkich graczy na tym urządzeniu', 'Show all players on this device')}</label>
        </div>
        <p className="muted">{tx('Rozgrywek', 'Games')}: {history.length} • {tx('ukończonych', 'completed')}: {won.length} • {tx('najlepszy wynik', 'best score')}: {Math.max(0, ...history.map((h) => h.score))} {tx('pkt', 'pts')}</p>
        {history.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>{tx('Data', 'Date')}</th><th>{tx('Gracz', 'Player')}</th><th>{tx('Scenariusz', 'Scenario')}</th><th>{tx('Poziom', 'Level')}</th><th>{tx('Wynik', 'Score')}</th><th>{tx('Czas', 'Time')}</th><th>{tx('Zagadki', 'Puzzles')}</th><th>{tx('Błędy', 'Errors')}</th><th>{tx('Podp.', 'Hints')}</th></tr></thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}>
                    <td>{new Date(h.date).toLocaleString(locale(), { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td>{h.playerName}{h.teamName ? ` (${h.teamName})` : ''}</td>
                    <td>{h.scenarioTitle} {h.status === 'won' ? <span className="good">✓</span> : <span className="muted">✗</span>}</td>
                    <td>{LEVEL_SHORT[h.level as Level]}</td>
                    <td><strong>{h.score}</strong></td>
                    <td>{formatTime(h.elapsed)}</td>
                    <td>{h.solved}/{h.totalPuzzles}</td>
                    <td>{h.wrong}</td>
                    <td>{h.hintsUsed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="muted">{tx('Brak rozgrywek – czas na pierwszą ucieczkę!', 'No games yet – time for your first escape!')}</p>}
      </section>
    </div>
  );
}
