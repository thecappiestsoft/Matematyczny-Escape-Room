import { tx } from '../../i18n';
import { useApp } from '../../app/context';
import { CAMPAIGN_LINKS, CAMPAIGN_ORDER } from '../../data/scenarios';
import { LEVEL_NAMES } from '../../data/topics';
import { ACHIEVEMENTS } from '../../engine/achievements';
import { formatTime } from '../../engine/report';
import { repo } from '../../storage/repo';
import type { Level } from '../../types';
import { RoomThumb, TopBar } from '../common';

export function CampaignScreen() {
  const app = useApp();
  const { settings, updateSettings } = app;
  const player = settings.playerName || tx('Gracz', 'Player');
  const progress = repo.getCampaign(player);
  const owned = repo.getAchievements(player);
  const history = repo.getHistory().filter((h) => h.playerName === player && h.mode === 'campaign');
  const chapters = CAMPAIGN_ORDER.map((id) => app.getScenario(id)).filter(Boolean);
  const done = progress.completed;

  return (
    <div className="screen">
      <TopBar title={`📖 ${tx('Kampania: Strażnicy Liczb', 'Campaign: Guardians of Numbers')}`} onBack={() => app.go({ name: 'home' })}>
        <div className="seg small" role="radiogroup" aria-label={tx('Poziom', 'Level')}>
          {(['sp', 'lo', 'tech'] as Level[]).map((l) => <button key={l} role="radio" aria-checked={settings.level === l} className={settings.level === l ? 'active' : ''} onClick={() => updateSettings({ level: l })}>{LEVEL_NAMES[l]}</button>)}
        </div>
      </TopBar>
      <section className="panel campaign-intro">
        <p>{tx('W 1926 roku klasa matematyczna ukryła w różnych miejscach świata zagadki dla przyszłych pokoleń. Ich zeszyt prowadzi od starej szkoły aż do zaginionego miasta. Każdy ukończony rozdział odblokowuje kolejny.', 'In 1926 a maths class hid puzzles around the world for future generations. Their notebook leads from the old school all the way to a lost city. Each completed chapter unlocks the next.')}</p>
        <p className="muted">{tx('Gracz', 'Player')}: <strong>{player}</strong> • {tx('ukończone rozdziały', 'chapters completed')}: {done.length} / {chapters.filter((c) => !c!.comingSoon).length}</p>
      </section>
      <ol className="chapters">
        {chapters.map((sc, i) => {
          const s = sc!;
          const unlocked = i === 0 || done.includes(CAMPAIGN_ORDER[i - 1]);
          const completed = done.includes(s.id);
          const best = history.filter((h) => h.scenarioId === s.id && h.status === 'won').sort((a, b) => b.score - a.score)[0];
          const available = unlocked && !s.comingSoon;
          return (
            <li key={s.id} className={`chapter ${completed ? 'done' : ''} ${available ? '' : 'locked'}`}>
              <div className="chapter-thumb">{s.comingSoon || !unlocked ? <div className={`soon-art soon-${s.theme}`}><span>🔒</span></div> : <RoomThumb scenario={s} />}</div>
              <div className="chapter-body">
                <small>{s.subtitle}</small>
                <h3>{s.title} {completed && <span className="good">✓</span>}</h3>
                <p>{CAMPAIGN_LINKS[s.id]}</p>
                {best && <p className="muted small">{tx('Najlepszy wynik', 'Best score')}: {best.score} {tx('pkt', 'pts')} • {formatTime(best.elapsed)} • {LEVEL_NAMES[best.level as Level]}</p>}
                {available ? (
                  <button className="btn btn--primary" onClick={() => app.startGame({ scenarioId: s.id, level: settings.level, mode: 'campaign', timeLimit: null, timeoutBehavior: 'continue', hintLimit: null, includeBonus: true, playerName: player })}>
                    {completed ? tx('Zagraj ponownie', 'Play again') : tx('Graj rozdział', 'Play chapter')}
                  </button>
                ) : <span className="muted">{s.comingSoon ? tx('Rozdział w przygotowaniu', 'Chapter in preparation') : tx('Ukończ poprzedni rozdział, aby odblokować', 'Complete the previous chapter to unlock')}</span>}
              </div>
            </li>
          );
        })}
      </ol>
      <section className="panel">
        <h2>{tx('Osiągnięcia', 'Achievements')}</h2>
        <div className="achievements">
          {ACHIEVEMENTS.map((a) => (
            <div key={a.id} className={`achievement ${owned.includes(a.id) ? 'got' : ''}`} title={a.description}>
              <span className="ach-icon">{owned.includes(a.id) ? a.icon : '🔒'}</span>
              <strong>{a.name}</strong>
              <small>{a.description}</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
