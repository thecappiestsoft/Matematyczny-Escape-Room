import { tx } from '../../i18n';
import type { KeyboardEvent } from 'react';
import { isUnlocked, visibleObjects, type GameState } from '../../engine/game';
import { Background, SceneOverlay, ThemeDefs } from '../../render/backgrounds';
import { ART, FLAT_ART } from '../../render/objectArt';
import { THEMES } from '../../render/themes';
import type { GameObject, Room, Scenario } from '../../types';

interface Props {
  state: GameState;
  scenario: Scenario;
  room: Room;
  showHotspots: boolean;
  flash: string | null;
  selectedItem: string | null;
  onObject: (o: GameObject) => void;
}

/** grafiki z napisem nad obiektem – znacznik rysujemy niżej */
const SIGN_ART = new Set(['exit_dials', 'emergency_exit']);

/** Czy obiekt ma jeszcze coś do zaoferowania (do znacznika interakcji) */
function needsAttention(s: GameState, o: GameObject): boolean {
  if (!s.examined.includes(o.id)) return true;
  if (o.lock && !isUnlocked(s, o)) return true;
  return false;
}

export function Scene({ state, scenario, room, showHotspots, flash, selectedItem, onObject }: Props) {
  const t = THEMES[scenario.theme];
  const dark = !!room.darkUntil && !state.flags.includes(room.darkUntil);
  const objs = visibleObjects(state, scenario, room);
  const key = (o: GameObject) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onObject(o); }
  };
  return (
    <div className={`scene ${selectedItem ? 'scene--using' : ''}`}>
      <svg viewBox="0 0 1600 900" className="scene-svg" role="group" aria-label={`${tx('Pomieszczenie', 'Room')}: ${room.name}`} key={room.id}>
        <ThemeDefs t={t} />
        <g className="scene-bg"><Background variant={room.bg} t={t} /></g>
        {objs.map((o) => {
          const Art = ART[o.art] ?? ART.note;
          const open = isUnlocked(state, o) && !!o.lock;
          const discovered = !o.secret || state.secretsFound.includes(o.id);
          const attention = needsAttention(state, o);
          const label = discovered ? `${o.name}${o.lock && !isUnlocked(state, o) ? tx(' (zamknięte)', ' (locked)') : ''}` : tx('Podejrzane miejsce', 'Suspicious spot');
          return (
            <g
              key={o.id}
              className={`obj ${o.secret && !discovered ? 'obj--secret' : ''} ${flash === o.id ? 'obj--flash' : ''} ${o.door ? 'obj--door' : ''} ${showHotspots && discovered ? 'obj--highlight' : ''}`}
              transform={`translate(${o.x},${o.y})`}
              role="button"
              tabIndex={0}
              aria-label={label}
              onClick={() => onObject(o)}
              onKeyDown={key(o)}
            >
              <title>{label}</title>
              <g filter={FLAT_ART.has(o.art) ? undefined : `url(#shadow-${t.id})`} className="obj-art">
                {Art({ w: o.w, h: o.h, t, open })}
              </g>
              <rect className="obj-hit" x={-6} y={-6} width={o.w + 12} height={o.h + 12} rx="12" />
              {attention && discovered && (
                <g className="obj-marker" transform={`translate(${o.w / 2},${SIGN_ART.has(o.art) ? 24 : Math.max(-18, -o.h * 0.05)})`} aria-hidden="true">
                  <circle r="16" className="marker-ring" />
                  <circle r="7" className="marker-dot" />
                </g>
              )}
              {showHotspots && discovered && (
                <text x={o.w / 2} y={o.h + 26} textAnchor="middle" className="obj-name">{o.name}</text>
              )}
            </g>
          );
        })}
        <SceneOverlay t={t} dark={dark} />
      </svg>
    </div>
  );
}
