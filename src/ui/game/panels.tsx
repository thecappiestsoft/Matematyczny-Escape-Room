import { tx } from '../../i18n';
import { useState } from 'react';
import { hintsRemaining, isUnlocked, lockRemaining, objectText, type GameState } from '../../engine/game';
import { getClueVisual, getPuzzle, lv } from '../../engine/level';
import { formatTime } from '../../engine/report';
import { hintCost } from '../../engine/scoring';
import { ThemeDefs } from '../../render/backgrounds';
import { ART } from '../../render/objectArt';
import { THEMES } from '../../render/themes';
import { VisualView } from '../../render/visuals';
import type { AnswerValue } from '../../engine/answers';
import type { GameObject, Scenario } from '../../types';
import { Modal } from '../common';
import { PuzzleView } from './PuzzleView';

/* ------------------------------ Okno obiektu ----------------------------- */

interface ObjectModalProps {
  state: GameState;
  scenario: Scenario;
  obj: GameObject;
  message: string | null;
  onClose: () => void;
  onAnswer: (v: AnswerValue) => boolean;
  onHint: (puzzleId: string) => void;
  onUseItem: (itemId: string) => void;
  onDoor: () => void;
}

export function ClueCard({ scenario, state, id }: { scenario: Scenario; state: GameState; id: string }) {
  const c = scenario.clues[id];
  if (!c) return null;
  const visual = getClueVisual(scenario, id, state.config.level);
  return (
    <article className="clue">
      <h4>📜 {c.title}</h4>
      <p>{lv(c.text, state.config.level)}</p>
      {visual && <div className="clue-visual"><VisualView v={visual} /></div>}
    </article>
  );
}

export function ObjectModal({ state, scenario, obj, message, onClose, onAnswer, onHint, onUseItem, onDoor }: ObjectModalProps) {
  const t = THEMES[scenario.theme];
  const level = state.config.level;
  const unlocked = isUnlocked(state, obj);
  const Art = ART[obj.art] ?? ART.note;
  const scale = Math.min(220 / obj.w, 170 / obj.h, 1);
  const clues = unlocked ? (obj.onOpen?.clues ?? []).filter((c) => state.clues.includes(c)) : [];
  const items = unlocked ? (obj.onOpen?.items ?? []) : [];
  const puzzleId = obj.lock?.type === 'puzzle' ? obj.lock.puzzle : null;
  const puzzle = puzzleId ? getPuzzle(scenario, puzzleId, level) : null;
  const doorTarget = obj.door && 'to' in obj.door ? scenario.rooms.find((r) => r.id === (obj.door as { to: string }).to) : null;

  return (
    <Modal title={obj.name} onClose={onClose} wide={!!puzzle && !unlocked} className="object-modal">
      <div className="object-view">
        <div className="object-art" aria-hidden="true">
          <svg viewBox={`-20 -50 ${obj.w + 40} ${obj.h + 70}`} style={{ width: obj.w * scale + 40, maxWidth: '100%' }}>
            <ThemeDefs t={t} />
            {Art({ w: obj.w, h: obj.h, t, open: unlocked && !!obj.lock })}
          </svg>
        </div>
        <div className="object-text">
          <p>{objectText(state, obj)}</p>
          {message && <p className="object-message">✨ {message}</p>}
          {items.length > 0 && (
            <ul className="object-items">
              {items.map((i) => <li key={i}><span className="item-icon">{scenario.items[i]?.icon}</span> {scenario.items[i]?.name} – {tx('w ekwipunku', 'in your inventory')}</li>)}
            </ul>
          )}
          {obj.lock?.type === 'item' && !unlocked && (
            <div className="lock-item">
              <p className="locked-text">🔒 {obj.lockedText ? lv(obj.lockedText, level) : tx('Zamknięte.', 'Locked.')}</p>
              {state.inventory.length > 0 ? (
                <div className="use-item">
                  <span>{tx('Użyj przedmiotu:', 'Use an item:')}</span>
                  {state.inventory.map((i) => (
                    <button key={i} className="btn btn--item" onClick={() => onUseItem(i)}>
                      <span className="item-icon">{scenario.items[i]?.icon}</span> {scenario.items[i]?.name}
                    </button>
                  ))}
                </div>
              ) : <p className="muted">{tx('Twój ekwipunek jest pusty.', 'Your inventory is empty.')}</p>}
            </div>
          )}
          {obj.lock?.type === 'flag' && !unlocked && <p className="locked-text">🔒 {obj.lockedText ? lv(obj.lockedText, level) : tx('Coś musi się najpierw wydarzyć.', 'Something has to happen first.')}</p>}
        </div>
      </div>

      {clues.length > 0 && <div className="object-clues">{clues.map((c) => <ClueCard key={c} id={c} scenario={scenario} state={state} />)}</div>}

      {puzzle && puzzleId && !unlocked && (
        <div className="object-puzzle">
          <PuzzleView puzzle={puzzle} puzzleKey={`${state.id}-${puzzleId}`} onSubmit={onAnswer} attempt={state.puzzles[puzzleId]?.wrong ?? 0} lockLeft={lockRemaining(state, puzzleId)} />
          <HintPanel state={state} puzzleId={puzzleId} hints={puzzle.hints} onHint={onHint} />
        </div>
      )}

      {obj.door && unlocked && (
        <div className="door-actions">
          {'exit' in obj.door
            ? <button className="btn btn--primary btn--big" onClick={onDoor}>🚪 {tx('Wyjdź na zewnątrz!', 'Step outside!')}</button>
            : <button className="btn btn--primary btn--big" onClick={onDoor}>🚪 {tx('Przejdź', 'Go to')}: {doorTarget?.name}</button>}
        </div>
      )}
    </Modal>
  );
}

/* ------------------------------ Podpowiedzi ------------------------------ */

export function HintPanel({ state, puzzleId, hints, onHint }: { state: GameState; puzzleId: string; hints: [string, string, string]; onHint: (id: string) => void }) {
  const used = state.puzzles[puzzleId]?.hints ?? 0;
  const rem = hintsRemaining(state);
  const names = [tx('Wskazówka', 'Clue'), tx('Podpowiedź matematyczna', 'Maths hint'), tx('Rozwiązanie krok po kroku', 'Step-by-step solution')];
  const sc = state.scoring;
  return (
    <aside className="hints" aria-label={tx('Podpowiedzi', 'Hints')}>
      <h3>💡 {tx('Podpowiedzi', 'Hints')}</h3>
      {hints.slice(0, used).map((h, i) => (
        <div key={i} className={`hint hint--${i + 1}`}>
          <strong>{names[i]}:</strong> {h}
        </div>
      ))}
      {used < 3 && (
        <button className="btn btn--hint" onClick={() => onHint(puzzleId)} disabled={rem !== null && rem <= 0}>
          {names[used]} (−{hintCost(sc, (used + 1) as 1 | 2 | 3)} {tx('pkt', 'pts')})
        </button>
      )}
      {rem !== null && <p className="muted small">{tx('Pozostało podpowiedzi', 'Hints left')}: {rem}</p>}
      {used === 0 && (state.puzzles[puzzleId]?.wrong ?? 0) === 0 && <p className="muted small">{tx(`Rozwiązanie bez podpowiedzi i bez pomyłek daje +${sc.noHintBonus} pkt premii.`, `Solving with no hints and no mistakes earns a +${sc.noHintBonus} pt bonus.`)}</p>}
    </aside>
  );
}

/* -------------------------------- Dziennik ------------------------------- */

export function Journal({ state, scenario, onClose }: { state: GameState; scenario: Scenario; onClose: () => void }) {
  const [tab, setTab] = useState<'clues' | 'items' | 'log'>('clues');
  return (
    <Modal title={`📔 ${tx('Dziennik odkrywcy', 'Explorer’s journal')}`} onClose={onClose} wide>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'clues'} className={tab === 'clues' ? 'active' : ''} onClick={() => setTab('clues')}>{tx('Wskazówki', 'Clues')} ({state.clues.length})</button>
        <button role="tab" aria-selected={tab === 'items'} className={tab === 'items' ? 'active' : ''} onClick={() => setTab('items')}>{tx('Przedmioty', 'Items')} ({state.inventory.length})</button>
        <button role="tab" aria-selected={tab === 'log'} className={tab === 'log' ? 'active' : ''} onClick={() => setTab('log')}>{tx('Postęp', 'Progress')}</button>
      </div>
      {tab === 'clues' && (
        state.clues.length ? <div className="journal-clues">{[...state.clues].reverse().map((c) => <ClueCard key={c} id={c} scenario={scenario} state={state} />)}</div>
          : <p className="muted">{tx('Nie masz jeszcze żadnych wskazówek. Oglądaj przedmioty w pomieszczeniu – wskazówki trafią tutaj automatycznie.', 'You have no clues yet. Examine objects in the room – clues will appear here automatically.')}</p>
      )}
      {tab === 'items' && (
        state.inventory.length ? (
          <ul className="journal-items">
            {state.inventory.map((i) => <li key={i}><span className="item-icon big">{scenario.items[i]?.icon}</span><div><strong>{scenario.items[i]?.name}</strong><p>{scenario.items[i]?.description}</p></div></li>)}
          </ul>
        ) : <p className="muted">{tx('Ekwipunek jest pusty.', 'Your inventory is empty.')}</p>
      )}
      {tab === 'log' && (
        <ul className="journal-log">
          {[...state.log].reverse().map((l, i) => (
            <li key={i}><span className="log-time">{formatTime(l.t)}</span> {l.text} {l.delta ? <span className={l.delta > 0 ? 'good' : 'bad'}>{l.delta > 0 ? '+' : ''}{l.delta}</span> : null}</li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

/* ---------------------------------- Mapa --------------------------------- */

export function MapModal({ state, scenario, onClose, onTravel }: { state: GameState; scenario: Scenario; onClose: () => void; onTravel: (roomId: string) => void }) {
  return (
    <Modal title={`🗺️ ${tx('Mapa', 'Map')}`} onClose={onClose}>
      <p className="muted">{tx('Możesz wrócić do każdego odwiedzonego pomieszczenia.', 'You can return to any room you have visited.')}</p>
      <ol className="map">
        {scenario.rooms.map((r, i) => {
          const visited = state.visitedRooms.includes(r.id);
          const current = state.roomId === r.id;
          const done = state.completedRooms.includes(r.id);
          return (
            <li key={r.id} className={`map-node ${visited ? 'visited' : 'unknown'} ${current ? 'current' : ''}`}>
              <span className="map-num">{i + 1}</span>
              {visited ? (
                <button className="btn btn--map" disabled={current} onClick={() => onTravel(r.id)}>
                  {r.name} {done && <span className="good" aria-label={tx('ukończone', 'completed')}>✓</span>} {current && <em>{tx('(tu jesteś)', '(you are here)')}</em>}
                </button>
              ) : <span className="map-unknown">??? – {tx('nieodkryte', 'undiscovered')}</span>}
            </li>
          );
        })}
        <li className={`map-node ${state.status === 'won' ? 'visited' : 'unknown'}`}><span className="map-num">🚪</span><span>{tx('Wyjście', 'Exit')}</span></li>
      </ol>
    </Modal>
  );
}

/* ------------------------ Lista zagadek do podpowiedzi ----------------------- */

export function HintPicker({ state, scenario, onPick, onClose }: { state: GameState; scenario: Scenario; onPick: (o: GameObject) => void; onClose: () => void }) {
  const open = scenario.rooms.flatMap((r) => r.objects.filter((o) => o.lock?.type === 'puzzle' && state.examined.includes(o.id) && !isUnlocked(state, o)).map((o) => ({ o, r })));
  return (
    <Modal title={`💡 ${tx('Podpowiedź', 'Hint')}`} onClose={onClose}>
      {open.length ? (
        <>
          <p>{tx('Wybierz zagadkę, przy której potrzebujesz pomocy:', 'Choose the puzzle you need help with:')}</p>
          <ul className="hint-pick">
            {open.map(({ o, r }) => (
              <li key={o.id}><button className="btn btn--ghost" onClick={() => onPick(o)}>{o.name} <span className="muted">– {r.name}</span></button></li>
            ))}
          </ul>
        </>
      ) : (
        <div>
          <p><strong>{tx('Ogólna wskazówka:', 'General tip:')}</strong> {tx('klikaj przedmioty w pomieszczeniu (świecące znaczniki pokazują, gdzie jeszcze czegoś nie sprawdziłeś). Zebrane informacje trafiają do dziennika (klawisz J).', 'click objects in the room (glowing markers show what you have not checked yet). Collected information goes to the journal (J key).')}</p>
          <p className="muted">{tx('Gdy otworzysz zagadkę, w jej oknie pojawią się trzy poziomy podpowiedzi.', 'When you open a puzzle, its window shows three levels of hints.')}</p>
        </div>
      )}
    </Modal>
  );
}
