import { tx } from '../../i18n';
import { useState } from 'react';
import { useApp } from '../../app/context';
import { LEVEL_NAMES, TOPICS } from '../../data/topics';
import { scenarioTopics } from '../../engine/level';
import type { GameMode, Level, Scenario, TopicId } from '../../types';
import { RoomThumb, TopBar } from '../common';

const TIME_OPTIONS: (number | null)[] = [null, 15, 30, 45, 60];

export function ScenarioCard({ sc, level, selected, onSelect, extra }: { sc: Scenario; level: Level; selected?: boolean; onSelect?: () => void; extra?: React.ReactNode }) {
  const topics = sc.comingSoon ? [] : scenarioTopics(sc, level);
  return (
    <button className={`scenario-card ${selected ? 'active' : ''} ${sc.comingSoon ? 'soon' : ''}`} onClick={onSelect} disabled={sc.comingSoon} aria-pressed={selected}>
      <div className="scenario-thumb">
        {sc.comingSoon ? <div className={`soon-art soon-${sc.theme}`}><span>🔒</span></div> : <RoomThumb scenario={sc} />}
        <span className="scenario-diff" aria-label={tx(`Trudność ${sc.difficulty} na 3`, `Difficulty ${sc.difficulty} of 3`)}>{'●'.repeat(sc.difficulty)}{'○'.repeat(3 - sc.difficulty)}</span>
        {sc.custom && <span className="scenario-tag">{tx('Nauczyciela', 'Teacher’s')}</span>}
      </div>
      <div className="scenario-info">
        <small className="scenario-sub">{sc.subtitle}</small>
        <strong>{sc.title}</strong>
        <p>{sc.description}</p>
        {sc.comingSoon ? <em className="soon-label">{tx('Wkrótce – scenariusz w przygotowaniu', 'Coming soon – scenario in preparation')}</em> : (
          <div className="chips">{topics.slice(0, 6).map((t) => <span key={t} className="chip">{TOPICS[t as TopicId]?.name ?? t}</span>)}</div>
        )}
        {!sc.comingSoon && <small className="muted">{sc.rooms.length} {tx('pomieszczenia', 'rooms')} • {Object.keys(sc.puzzles).length} {tx('zagadek', 'puzzles')}</small>}
        {extra}
      </div>
    </button>
  );
}

export function SetupScreen({ mode, preselect }: { mode: GameMode; preselect?: string }) {
  const app = useApp();
  const { settings, updateSettings } = app;
  const playable = app.scenarios.filter((s) => !s.comingSoon);
  const [scenarioId, setScenarioId] = useState(preselect ?? playable[0]?.id);
  const [time, setTime] = useState<number | null>(mode === 'timed' ? 30 : null);
  const [bonus, setBonus] = useState(true);
  const level = settings.level;
  const sc = app.getScenario(scenarioId ?? '');
  const title = mode === 'timed' ? `⏱️ ${tx('Wyzwanie na czas', 'Time challenge')}` : `⚡ ${tx('Szybka rozgrywka', 'Quick game')}`;

  const start = () => {
    if (!sc) return;
    app.startGame({
      scenarioId: sc.id, level, mode, timeLimit: time, timeoutBehavior: mode === 'timed' ? 'end' : settings.defaultTimeoutBehavior,
      hintLimit: null, includeBonus: bonus, playerName: settings.playerName || tx('Gracz', 'Player'),
    });
  };

  return (
    <div className="screen">
      <TopBar title={title} onBack={() => app.go({ name: 'home' })} />
      <section className="panel">
        <h2>{tx('Poziom edukacyjny', 'Education level')}</h2>
        <div className="seg" role="radiogroup" aria-label={tx('Poziom', 'Level')}>
          {(['sp', 'lo', 'tech'] as Level[]).map((l) => (
            <button key={l} role="radio" aria-checked={level === l} className={level === l ? 'active' : ''} onClick={() => updateSettings({ level: l })}>{LEVEL_NAMES[l]}</button>
          ))}
        </div>
      </section>
      <section className="panel">
        <h2>{tx('Scenariusz', 'Scenario')}</h2>
        <div className="scenario-grid">
          {app.scenarios.map((s) => <ScenarioCard key={s.id} sc={s} level={level} selected={s.id === scenarioId} onSelect={() => setScenarioId(s.id)} />)}
        </div>
      </section>
      <section className="panel setup-options">
        <div>
          <h2>{tx('Limit czasu', 'Time limit')}</h2>
          <div className="seg" role="radiogroup" aria-label={tx('Limit czasu', 'Time limit')}>
            {TIME_OPTIONS.filter((o) => mode !== 'timed' || o !== null).map((o) => (
              <button key={String(o)} role="radio" aria-checked={time === o} className={time === o ? 'active' : ''} onClick={() => setTime(o)}>{o === null ? tx('Bez limitu', 'No limit') : `${o} min`}</button>
            ))}
          </div>
          {mode === 'timed' && <p className="muted small">{tx(`W wyzwaniu każda pozostała minuta to +${settings.scoring.timePerMinute} pkt. Po upływie czasu gra się kończy i pokazuje wynik.`, `In the challenge each minute left is worth +${settings.scoring.timePerMinute} pts. When time runs out the game ends and shows your result.`)}</p>}
        </div>
        <div>
          <h2>{tx('Zagadki dodatkowe', 'Bonus puzzles')}</h2>
          <label className="toggle"><input type="checkbox" checked={bonus} onChange={(e) => setBonus(e.target.checked)} /> {tx('Ukryte zagadki bonusowe (dodatkowe punkty)', 'Hidden bonus puzzles (extra points)')}</label>
        </div>
      </section>
      <div className="start-bar">
        <div>{sc && <><strong>{sc.title}</strong> • {LEVEL_NAMES[level]} • {time ? `${time} min` : tx('bez limitu', 'no limit')}</>}</div>
        <button className="btn btn--primary btn--big" disabled={!sc} onClick={start}>{tx('Rozpocznij ucieczkę', 'Start the escape')} →</button>
      </div>
    </div>
  );
}
