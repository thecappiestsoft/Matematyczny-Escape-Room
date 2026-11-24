import { tx } from '../../i18n';
import { useApp } from '../../app/context';
import { LEVEL_DESCRIPTIONS, LEVEL_NAMES } from '../../data/topics';
import { formatTime } from '../../engine/report';
import { repo } from '../../storage/repo';
import type { Level } from '../../types';
import { RoomThumb } from '../common';
import { LangSwitch } from '../LangSwitch';
import { ThemeSwitch } from '../ThemeSwitch';

export function HomeScreen() {
  const app = useApp();
  const { settings, updateSettings } = app;
  const save = repo.getSave();
  const saveSc = save ? app.getScenario(save.config.scenarioId) : undefined;
  const hero = app.getScenario('stara-szkola');

  return (
    <div className="home">
      <section className="hero">
        {hero && <div className="hero-bg"><RoomThumb scenario={hero} /></div>}
        <div className="hero-lang">
          <ThemeSwitch theme={settings.theme} onChange={(t) => updateSettings({ theme: t })} big />
          <LangSwitch lang={settings.lang} onChange={app.switchLang} big />
        </div>
        <div className="hero-content">
          <p className="hero-kicker">{tx('Edukacyjna gra przygodowa', 'Educational adventure game')}</p>
          <h1 className="hero-title">{tx('Matematyczny', 'Maths')}<br /><span>Escape Room</span></h1>
          <p className="hero-lead">{tx('Drzwi są zamknięte, mechanizmy nie działają, a wskazówki ukryto w pomieszczeniach. Obserwuj, łącz informacje i licz – tylko matematyka wyprowadzi Cię na zewnątrz.', 'The doors are locked, the mechanisms are dead and the clues are hidden in the rooms. Observe, combine information and calculate – only maths will get you out.')}</p>
          {save && saveSc && save.status === 'playing' && (
            <button className="btn btn--primary btn--big" onClick={() => app.resumeGame(save)}>
              ▶ {tx('Kontynuuj', 'Continue')}: {saveSc.title} <small>({LEVEL_NAMES[save.config.level]}, {formatTime(save.elapsed)})</small>
            </button>
          )}
        </div>
      </section>

      <section className="panel" aria-labelledby="who">
        <div className="panel-head">
          <h2 id="who">1. {tx('Kto gra i na jakim poziomie?', 'Who is playing, and at what level?')}</h2>
          <label className="name-field">
            <span>{tx('Imię lub pseudonim:', 'Name or nickname:')}</span>
            <input value={settings.playerName} maxLength={30} placeholder={tx('Gracz', 'Player')} onChange={(e) => updateSettings({ playerName: e.target.value })} />
          </label>
        </div>
        <div className="level-cards" role="radiogroup" aria-label={tx('Poziom edukacyjny', 'Education level')}>
          {(['sp', 'lo', 'tech'] as Level[]).map((l) => (
            <button key={l} role="radio" aria-checked={settings.level === l} className={`level-card ${settings.level === l ? 'active' : ''}`} onClick={() => updateSettings({ level: l })}>
              <span className="level-icon">{{ sp: '🎒', lo: '🎓', tech: '🛠️' }[l]}</span>
              <strong>{LEVEL_NAMES[l]}</strong>
              <small>{LEVEL_DESCRIPTIONS[l]}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="panel" aria-labelledby="modes">
        <h2 id="modes">2. {tx('Wybierz tryb gry', 'Choose a game mode')}</h2>
        <div className="mode-grid">
          <button className="mode-card" onClick={() => app.go({ name: 'setup', mode: 'quick' })}>
            <span className="mode-icon">⚡</span><strong>{tx('Szybka rozgrywka', 'Quick game')}</strong>
            <small>{tx('Wybierz scenariusz i graj od razu. Bez zakładania konta – wyniki zapisują się na tym urządzeniu.', 'Pick a scenario and play straight away. No account needed – results are saved on this device.')}</small>
          </button>
          <button className="mode-card" onClick={() => app.go({ name: 'campaign' })}>
            <span className="mode-icon">📖</span><strong>{tx('Kampania fabularna', 'Story campaign')}</strong>
            <small>{tx('Zeszyt Klasy 1926 prowadzi przez kolejne escape roomy. Odblokowuj rozdziały i zdobywaj osiągnięcia.', 'The notebook of the Class of 1926 leads through one escape room after another. Unlock chapters and earn achievements.')}</small>
          </button>
          <button className="mode-card" onClick={() => app.go({ name: 'setup', mode: 'timed' })}>
            <span className="mode-icon">⏱️</span><strong>{tx('Wyzwanie na czas', 'Time challenge')}</strong>
            <small>{tx('Ucieknij przed upływem limitu. Liczy się szybkość, poprawność i samodzielność.', 'Escape before the time runs out. Speed, accuracy and independence count.')}</small>
          </button>
          <button className="mode-card" onClick={() => app.go({ name: 'teacher', tab: 'class' })}>
            <span className="mode-icon">🏫</span><strong>{tx('Tryb klasowy', 'Class mode')}</strong>
            <small>{tx('Nauczyciel uruchamia scenariusz dla drużyn i porównuje ich wyniki na tablicy.', 'The teacher runs a scenario for teams and compares their results on the board.')}</small>
          </button>
        </div>
      </section>

      <section className="home-links">
        <button className="btn" onClick={() => app.go({ name: 'history' })}>🏆 {tx('Osiągnięcia i historia', 'Achievements and history')}</button>
        <button className="btn" onClick={() => app.go({ name: 'teacher' })}>👩‍🏫 {tx('Panel nauczyciela', 'Teacher panel')}</button>
        <label className="toggle inline"><input type="checkbox" checked={!settings.muted} onChange={(e) => updateSettings({ muted: !e.target.checked })} /> {tx('Dźwięki', 'Sound')}</label>
        <label className="toggle inline"><input type="checkbox" checked={settings.reducedMotion} onChange={(e) => updateSettings({ reducedMotion: e.target.checked })} /> {tx('Mniej animacji', 'Fewer animations')}</label>
        <label className="toggle inline"><input type="checkbox" checked={settings.presentation} onChange={(e) => updateSettings({ presentation: e.target.checked })} /> {tx('Widok prezentacyjny', 'Presentation view')}</label>
      </section>
    </div>
  );
}
