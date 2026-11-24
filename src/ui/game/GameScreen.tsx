import { tx } from '../../i18n';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../../app/context';
import { finishGame } from '../../app/finish';
import { play } from '../../audio/sound';
import type { AnswerValue } from '../../engine/answers';
import { enterRoom, escape, examine, getRoom, giveUp, submitAnswer, takeHint, tick, useItem, type GameEvent, type GameState, type Outcome } from '../../engine/game';
import { lv } from '../../engine/level';
import { formatTime } from '../../engine/report';
import { THEMES } from '../../render/themes';
import { repo } from '../../storage/repo';
import { LEVEL_SHORT } from '../../data/topics';
import type { GameObject, Scenario } from '../../types';
import { ConfirmButton, Modal } from '../common';
import { HintPicker, Journal, MapModal, ObjectModal } from './panels';
import { Scene } from './Scene';
import { LangSwitch } from '../LangSwitch';
import { ThemeSwitch } from '../ThemeSwitch';

type ModalState =
  | null
  | { type: 'object'; id: string }
  | { type: 'journal' }
  | { type: 'map' }
  | { type: 'menu' }
  | { type: 'intro' }
  | { type: 'timeout' }
  | { type: 'hint' }
  | { type: 'win' };

interface Toast { id: number; text: string; tone: 'success' | 'info' | 'warn' }
interface Floater { id: number; text: string; good: boolean }

let seq = 0;

export function GameScreen({ initial, scenario }: { initial: GameState; scenario: Scenario }) {
  const app = useApp();
  const { settings, updateSettings } = app;
  const [state, setState] = useState(initial);
  const ref = useRef(initial);
  const [modal, setModal] = useState<ModalState>(initial.elapsed === 0 ? { type: 'intro' } : null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [roomBanner, setRoomBanner] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<string | null>(null);
  const t = THEMES[scenario.theme];
  const room = getRoom(scenario, state.roomId);
  const level = state.config.level;
  const finished = useRef(false);

  const pushToast = useCallback((text: string, tone: Toast['tone']) => {
    const id = ++seq;
    setToasts((a) => [...a.slice(-3), { id, text, tone }]);
    setTimeout(() => setToasts((a) => a.filter((x) => x.id !== id)), 3800);
  }, []);

  const handleEvents = useCallback((events: GameEvent[]) => {
    for (const e of events) {
      switch (e.type) {
        case 'sound': play(e.name); break;
        case 'toast': pushToast(e.text, e.tone); break;
        case 'points': {
          if (!e.delta) break;
          const id = ++seq;
          setFloaters((a) => [...a, { id, text: `${e.delta > 0 ? '+' : ''}${e.delta}`, good: e.delta > 0 }]);
          setTimeout(() => setFloaters((a) => a.filter((x) => x.id !== id)), 1600);
          break;
        }
        case 'unlocked': setFlash(e.objectId); setTimeout(() => setFlash(null), 1300); break;
        case 'item': setNewItem(e.id); setTimeout(() => setNewItem(null), 1500); break;
        case 'roomComplete': pushToast(tx(`Pomieszczenie ukończone! +${ref.current.scoring.room} pkt`, `Room completed! +${ref.current.scoring.room} pts`), 'success'); break;
        case 'timeout': setModal({ type: 'timeout' }); break;
        default: break;
      }
    }
  }, [pushToast]);

  const apply = useCallback((fn: (s: GameState) => Outcome) => {
    const out = fn(ref.current);
    ref.current = out.state;
    setState(out.state);
    handleEvents(out.events);
    if (out.state.status === 'playing') repo.setSave(out.state);
    return out;
  }, [handleEvents]);

  /* zakończenie gry */
  const finish = useCallback((s: GameState) => {
    if (finished.current) return;
    finished.current = true;
    const { report, achievements } = finishGame(s, scenario);
    app.go({ name: 'result', report, achievements, scenarioId: scenario.id });
  }, [app, scenario]);

  useEffect(() => {
    if (state.status === 'ended') finish(state);
  }, [state, finish]);

  /* zegar – zatrzymuje się w menu pauzy i gdy karta jest ukryta */
  const paused = modal?.type === 'menu' || modal?.type === 'intro' || modal?.type === 'win' || state.status !== 'playing';
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => { if (!document.hidden) apply((s) => tick(s, 1)); }, 1000);
    return () => clearInterval(id);
  }, [paused, apply]);

  /* skróty klawiszowe */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (modal) return;
      if (e.key === 'j' || e.key === 'J') setModal({ type: 'journal' });
      else if (e.key === 'm' || e.key === 'M') setModal({ type: 'map' });
      else if (e.key === 'h' || e.key === 'H') updateSettings({ showHotspots: !settings.showHotspots });
      else if (e.key === 'Escape') { if (selected) setSelected(null); else setModal({ type: 'menu' }); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal, selected, settings.showHotspots, updateSettings]);

  /* baner wejścia do pomieszczenia */
  useEffect(() => {
    setRoomBanner(lv(room.intro, level));
    const id = setTimeout(() => setRoomBanner(null), 6500);
    return () => clearTimeout(id);
  }, [room.id, room.intro, level]);

  const onObject = (o: GameObject) => {
    play('click');
    if (selected && o.lock?.type === 'item' && !ref.current.opened.includes(o.id)) {
      const out = apply((s) => useItem(examine(s, scenario, o.id).state, scenario, o.id, selected));
      if (out.state.opened.includes(o.id)) {
        setMessage(o.onOpen?.message ? lv(o.onOpen.message, level) : null);
        setSelected(null);
        setModal({ type: 'object', id: o.id });
      }
      return;
    }
    setSelected(null);
    const before = ref.current.opened.length;
    const out = apply((s) => examine(s, scenario, o.id));
    setMessage(out.state.opened.length > before && o.onOpen?.message ? lv(o.onOpen.message, level) : null);
    setModal({ type: 'object', id: o.id });
  };

  const currentObj = modal?.type === 'object' ? scenario.rooms.flatMap((r) => r.objects).find((o) => o.id === modal.id) : undefined;

  const onAnswer = (v: AnswerValue): boolean => {
    if (!currentObj) return false;
    const out = apply((s) => submitAnswer(s, scenario, currentObj.id, v) as Outcome);
    const ok = out.state.opened.includes(currentObj.id);
    if (ok) setMessage(currentObj.onOpen?.message ? lv(currentObj.onOpen.message, level) : tx('Udało się!', 'Done!'));
    return ok;
  };

  const onUseItem = (itemId: string) => {
    if (!currentObj) return;
    const out = apply((s) => useItem(s, scenario, currentObj.id, itemId));
    if (out.state.opened.includes(currentObj.id)) setMessage(currentObj.onOpen?.message ? lv(currentObj.onOpen.message, level) : null);
  };

  const onDoor = () => {
    if (!currentObj?.door) return;
    if ('exit' in currentObj.door) {
      const out = apply((s) => escape(s));
      setModal({ type: 'win' });
      setTimeout(() => finish(out.state), settings.reducedMotion ? 300 : 2600);
      return;
    }
    const to = currentObj.door.to;
    setModal(null);
    apply((s) => enterRoom(s, scenario, to));
  };

  const limit = state.config.timeLimit;
  const remaining = limit !== null ? limit * 60 - state.elapsed : null;
  const lowTime = remaining !== null && remaining > 0 && remaining < 120;

  return (
    <div className="game" style={{ ['--accent' as string]: t.ui.accent, ['--accent2' as string]: t.ui.accent2, ['--panel' as string]: t.ui.panel }}>
      <header className="hud">
        <div className="hud-left">
          <span className="hud-scenario">{scenario.title}</span>
          <span className="hud-room">📍 {room.name}</span>
        </div>
        <div className="hud-center">
          <div className={`hud-timer ${lowTime ? 'low' : ''} ${state.timedOut ? 'over' : ''}`} aria-label={tx('Czas gry', 'Game time')}>
            ⏱ {remaining !== null && !state.timedOut ? formatTime(remaining) : formatTime(state.elapsed)}
            {remaining !== null && !state.timedOut && <small> {tx('pozostało', 'left')}</small>}
            {state.timedOut && <small> {tx('(po czasie)', '(overtime)')}</small>}
          </div>
          <div className="hud-score" aria-label={tx('Punkty', 'Score')}>
            ⭐ {state.score}
            <span className="floaters" aria-hidden="true">{floaters.map((f) => <span key={f.id} className={`floater ${f.good ? 'good' : 'bad'}`}>{f.text}</span>)}</span>
          </div>
          <span className="hud-level">{LEVEL_SHORT[level]}</span>
        </div>
        <nav className="hud-right" aria-label={tx('Narzędzia gry', 'Game tools')}>
          <button className="btn btn--hud" onClick={() => setModal({ type: 'journal' })} title={tx('Dziennik (J)', 'Journal (J)')}>📔 <span>{tx('Dziennik', 'Journal')}</span>{state.clues.length > 0 && <b className="badge">{state.clues.length}</b>}</button>
          <button className="btn btn--hud" onClick={() => setModal({ type: 'map' })} title={tx('Mapa (M)', 'Map (M)')}>🗺️ <span>{tx('Mapa', 'Map')}</span></button>
          <button className="btn btn--hud" onClick={() => setModal({ type: 'hint' })} title={tx('Podpowiedź', 'Hint')}>💡 <span>{tx('Podpowiedź', 'Hint')}</span></button>
          <button className={`btn btn--hud ${settings.showHotspots ? 'on' : ''}`} onClick={() => updateSettings({ showHotspots: !settings.showHotspots })} title={tx('Pokaż obiekty (H)', 'Show objects (H)')} aria-pressed={settings.showHotspots}>👁 <span>{tx('Obiekty', 'Objects')}</span></button>
          <button className="btn btn--hud" onClick={() => setModal({ type: 'menu' })} title="Menu (Esc)">⚙️ <span>Menu</span></button>
        </nav>
      </header>

      <div className="stage">
        <Scene state={state} scenario={scenario} room={room} showHotspots={settings.showHotspots} flash={flash} selectedItem={selected} onObject={onObject} />
        {roomBanner && !modal && <div className="room-banner" role="status"><strong>{room.name}</strong><span>{roomBanner}</span></div>}
        {selected && <div className="using-banner" role="status">{tx('Wybrano', 'Selected')}: {scenario.items[selected]?.icon} {scenario.items[selected]?.name}. {tx('Kliknij obiekt, na którym chcesz go użyć.', 'Click the object you want to use it on.')} <button className="btn btn--small" onClick={() => setSelected(null)}>{tx('Anuluj', 'Cancel')}</button></div>}
        <div className="toasts" aria-live="polite">{toasts.map((x) => <div key={x.id} className={`toast toast--${x.tone}`}>{x.text}</div>)}</div>
      </div>

      <footer className="inventory" aria-label={tx('Ekwipunek', 'Inventory')}>
        <span className="inventory-title">🎒 {tx('Ekwipunek', 'Inventory')}</span>
        <div className="inventory-items">
          {state.inventory.length === 0 && <span className="muted small">{tx('Pusty – szukaj przedmiotów w pomieszczeniach.', 'Empty – look for items in the rooms.')}</span>}
          {state.inventory.map((i) => (
            <button key={i} className={`inv-item ${selected === i ? 'selected' : ''} ${newItem === i ? 'new' : ''}`} onClick={() => setSelected(selected === i ? null : i)} aria-pressed={selected === i} title={scenario.items[i]?.description}>
              <span className="item-icon">{scenario.items[i]?.icon}</span>
              <span className="inv-name">{scenario.items[i]?.name}</span>
            </button>
          ))}
        </div>
        <span className="inventory-progress">{tx('Zagadki', 'Puzzles')}: {Object.values(state.puzzles).filter((p) => p.solved).length} • {tx('Pokoje', 'Rooms')}: {state.completedRooms.length}/{scenario.rooms.length}</span>
      </footer>

      {modal?.type === 'object' && currentObj && (
        <ObjectModal state={state} scenario={scenario} obj={currentObj} message={message}
          onClose={() => { setModal(null); setMessage(null); }}
          onAnswer={onAnswer} onHint={(pid) => apply((s) => takeHint(s, scenario, pid))} onUseItem={onUseItem} onDoor={onDoor} />
      )}
      {modal?.type === 'journal' && <Journal state={state} scenario={scenario} onClose={() => setModal(null)} />}
      {modal?.type === 'map' && <MapModal state={state} scenario={scenario} onClose={() => setModal(null)} onTravel={(r) => { setModal(null); apply((s) => enterRoom(s, scenario, r)); }} />}
      {modal?.type === 'hint' && <HintPicker state={state} scenario={scenario} onClose={() => setModal(null)} onPick={(o) => {
        setModal(null);
        const r = scenario.rooms.find((x) => x.objects.includes(o));
        if (r && r.id !== ref.current.roomId) apply((s) => enterRoom(s, scenario, r.id));
        onObject(o);
      }} />}
      {modal?.type === 'intro' && (
        <Modal title={scenario.title} onClose={() => setModal(null)} className="intro-modal">
          <p className="intro-sub">{scenario.subtitle}</p>
          <p className="intro-text">{lv(scenario.intro, level)}</p>
          <ul className="intro-tips">
            <li>🖱️ {tx('Klikaj przedmioty – świecące znaczniki pokazują miejsca warte sprawdzenia.', 'Click objects – glowing markers show places worth checking.')}</li>
            <li>📔 {tx('Wskazówki zapisują się w dzienniku (J). Często trzeba połączyć kilka z nich!', 'Clues are saved in the journal (J). You often need to combine several of them!')}</li>
            <li>🎒 {tx('Wybierz przedmiot z ekwipunku i kliknij obiekt, by go użyć.', 'Select an item from your inventory and click an object to use it.')}</li>
            <li>💡 {tx('Każda zagadka ma 3 poziomy podpowiedzi. Niektóre miejsca są dobrze ukryte…', 'Every puzzle has 3 levels of hints. Some places are well hidden…')}</li>
          </ul>
          <button className="btn btn--primary btn--big" onClick={() => setModal(null)}>{tx('Rozpocznij eksplorację', 'Start exploring')}</button>
        </Modal>
      )}
      {modal?.type === 'timeout' && (
        <Modal title={`⏰ ${tx('Czas minął', 'Time is up')}`} onClose={state.status === 'playing' ? () => setModal(null) : undefined}>
          {state.status === 'playing' ? (
            <>
              <p>{tx('Limit czasu się skończył – ale spokojnie, nic się nie stało! Możesz dokończyć ucieczkę bez punktów za czas.', 'The time limit has run out – but don’t worry, that’s fine! You can finish the escape without time points.')}</p>
              <div className="btn-row">
                <button className="btn btn--primary" onClick={() => setModal(null)}>{tx('Graj dalej', 'Keep playing')}</button>
                <button className="btn" onClick={() => finish(giveUp(ref.current))}>{tx('Zakończ i zobacz wynik', 'Finish and see the result')}</button>
              </div>
            </>
          ) : <p>{tx('Limit czasu się skończył. Za chwilę zobaczysz swój wynik i raport.', 'The time limit has run out. Your result and report will appear in a moment.')}</p>}
        </Modal>
      )}
      {modal?.type === 'menu' && (
        <Modal title={`⚙️ ${tx('Menu gry (pauza)', 'Game menu (paused)')}`} onClose={() => setModal(null)}>
          <div className="settings-list">
            <div className="toggle">{tx('Język', 'Language')}: <LangSwitch lang={settings.lang} onChange={app.switchLang} /></div>
            <div className="toggle">{tx('Motyw', 'Theme')}: <ThemeSwitch theme={settings.theme} onChange={(t) => updateSettings({ theme: t })} /></div>
            <label className="toggle"><input type="checkbox" checked={!settings.muted} onChange={(e) => updateSettings({ muted: !e.target.checked })} /> {tx('Dźwięki', 'Sound')}</label>
            <label className="toggle"><input type="checkbox" checked={settings.reducedMotion} onChange={(e) => updateSettings({ reducedMotion: e.target.checked })} /> {tx('Ogranicz animacje', 'Reduce animations')}</label>
            <label className="toggle"><input type="checkbox" checked={settings.showHotspots} onChange={(e) => updateSettings({ showHotspots: e.target.checked })} /> {tx('Pokazuj nazwy obiektów', 'Show object names')}</label>
            <label className="toggle"><input type="checkbox" checked={settings.presentation} onChange={(e) => updateSettings({ presentation: e.target.checked })} /> {tx('Widok prezentacyjny (tablica / projektor)', 'Presentation view (whiteboard / projector)')}</label>
            <label className="toggle"><input type="checkbox" checked={settings.highContrast} onChange={(e) => updateSettings({ highContrast: e.target.checked })} /> {tx('Wysoki kontrast', 'High contrast')}</label>
          </div>
          <p className="muted small">{tx('Skróty: J – dziennik, M – mapa, H – obiekty, Esc – menu. Gra zapisuje się automatycznie.', 'Shortcuts: J – journal, M – map, H – objects, Esc – menu. The game saves automatically.')}</p>
          <div className="btn-row">
            <button className="btn btn--primary" onClick={() => setModal(null)}>{tx('Wróć do gry', 'Back to the game')}</button>
            <button className="btn" onClick={() => { repo.setSave(ref.current); app.go({ name: 'home' }); }}>{tx('Zapisz i wyjdź do menu', 'Save and exit to menu')}</button>
            <ConfirmButton className="btn btn--danger" label={tx('Zakończ grę i pokaż raport', 'End game and show report')} confirmLabel={tx('Na pewno zakończyć? Kliknij ponownie', 'Really end? Click again')} onConfirm={() => finish(giveUp(ref.current))} />
          </div>
        </Modal>
      )}
      {modal?.type === 'win' && (
        <div className="win-overlay" role="status">
          <div className="win-light" />
          <h2>{tx('Wolność!', 'Freedom!')} 🎉</h2>
          <p>{lv(scenario.ending, level)}</p>
        </div>
      )}
    </div>
  );
}
