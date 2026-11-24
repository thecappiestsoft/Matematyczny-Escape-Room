import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppContext, type AppCtx, type Screen } from './app/context';
import { setMuted } from './audio/sound';
import { builtinScenarios } from './data/scenarios';
import { setLang, tx, type Lang } from './i18n';
import { newGame, type GameState } from './engine/game';
import { repo, type AppSettings } from './storage/repo';
import type { Scenario, SessionConfig } from './types';
import { GameScreen } from './ui/game/GameScreen';
import { CampaignScreen } from './ui/screens/Campaign';
import { HistoryScreen } from './ui/screens/History';
import { HomeScreen } from './ui/screens/Home';
import { ResultsScreen } from './ui/screens/Results';
import { SetupScreen } from './ui/screens/Setup';
import { ClassBoard } from './ui/teacher/ClassBoard';
import { TeacherPanel } from './ui/teacher/TeacherPanel';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => repo.getSettings());
  setLang(settings.lang);
  if (typeof document !== 'undefined') document.documentElement.dataset.theme = settings.theme;
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [custom, setCustom] = useState<Scenario[]>(() => repo.getCustomScenarios());
  const [game, setGame] = useState<GameState | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const scenarios = useMemo(() => [...builtinScenarios(), ...custom], [custom, settings.lang]);

  useEffect(() => { document.title = tx('Matematyczny Escape Room', 'Maths Escape Room'); }, [settings.lang]);

  useEffect(() => { setMuted(settings.muted); }, [settings.muted]);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('reduce-motion', settings.reducedMotion);
    root.classList.toggle('presentation', settings.presentation);
    root.classList.toggle('high-contrast', settings.highContrast);
  }, [settings.reducedMotion, settings.presentation, settings.highContrast]);
  useEffect(() => { document.documentElement.dataset.theme = settings.theme; }, [settings.theme]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      repo.saveSettings(next);
      return next;
    });
  }, []);

  const switchLang = useCallback((l: Lang) => {
    if (l === settings.lang) return;
    // gra jest zapisywana na bieżąco – po przemontowaniu wczytujemy najnowszy stan
    const saved = repo.getSave();
    if (saved && saved.status === 'playing') setGame((g) => (g && g.id === saved.id ? saved : g));
    setLang(l);
    updateSettings({ lang: l });
  }, [settings.lang, updateSettings]);

  const go = useCallback((s: Screen) => {
    setScreen(s);
    window.scrollTo({ top: 0 });
  }, []);

  const getScenario = useCallback((id: string) => scenarios.find((s) => s.id === id), [scenarios]);

  const startGame = useCallback((cfg: SessionConfig) => {
    const sc = scenarios.find((s) => s.id === cfg.scenarioId);
    if (!sc || sc.comingSoon) return;
    const g = newGame(cfg, sc, settings.scoring);
    setGame(g);
    repo.setSave(g);
    go({ name: 'game' });
  }, [scenarios, settings.scoring, go]);

  const resumeGame = useCallback((g: GameState) => {
    setGame(g);
    go({ name: 'game' });
  }, [go]);

  const ctx: AppCtx = {
    settings, updateSettings, switchLang, screen, go, scenarios,
    refreshScenarios: () => setCustom(repo.getCustomScenarios()),
    getScenario, startGame, resumeGame,
  };

  const inGame = screen.name === 'game' && game;
  const sc = game ? getScenario(game.config.scenarioId) : undefined;

  return (
    <AppContext.Provider value={ctx}>
      <div className={`app ${inGame ? 'app--game' : ''}`} key={settings.lang}>
        <main className="app-main" id="main">
          {screen.name === 'home' && <HomeScreen />}
          {screen.name === 'setup' && <SetupScreen mode={screen.mode} preselect={screen.scenarioId} />}
          {screen.name === 'campaign' && <CampaignScreen />}
          {screen.name === 'history' && <HistoryScreen />}
          {screen.name === 'teacher' && <TeacherPanel initialTab={screen.tab} />}
          {screen.name === 'classBoard' && <ClassBoard sessionId={screen.sessionId} />}
          {screen.name === 'result' && <ResultsScreen report={screen.report} achievements={screen.achievements} scenarioId={screen.scenarioId} />}
          {inGame && sc && <GameScreen key={game.id} initial={game} scenario={sc} />}
        </main>
        <footer className="app-footer">© 2026 CappySoft.pl</footer>
      </div>
    </AppContext.Provider>
  );
}
