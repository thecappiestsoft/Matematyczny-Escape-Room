import { tx } from '../i18n';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Background, SceneOverlay, ThemeDefs } from '../render/backgrounds';
import { ART } from '../render/objectArt';
import { THEMES } from '../render/themes';
import type { Room, Scenario } from '../types';

export function Modal({ title, onClose, children, wide, className, labelledBy }: { title: ReactNode; onClose?: () => void; children: ReactNode; wide?: boolean; className?: string; labelledBy?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  // onClose zmienia się przy każdym renderze rodzica (np. co sekundę przez zegar gry),
  // dlatego trzymamy go w ref – efekt uruchamia się tylko raz, przy otwarciu okna.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const first = el?.querySelector<HTMLElement>('input, button:not(.modal-close), select, textarea, [tabindex="0"]') ?? el?.querySelector<HTMLElement>('button');
    first?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeRef.current) { e.stopPropagation(); closeRef.current(); }
      if (e.key === 'Tab' && el) {
        const f = [...el.querySelectorAll<HTMLElement>('button, input, select, textarea, [tabindex="0"]')].filter((x) => !x.hasAttribute('disabled'));
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => { document.removeEventListener('keydown', onKey, true); prev?.focus?.({ preventScroll: true }); };
  }, []);
  const id = labelledBy ?? 'modal-title';
  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}>
      <div className={`modal ${wide ? 'modal--wide' : ''} ${className ?? ''}`} role="dialog" aria-modal="true" aria-labelledby={id} ref={ref}>
        <div className="modal-head">
          <h2 id={id}>{title}</h2>
          {onClose && <button className="modal-close" onClick={onClose} aria-label={tx('Zamknij okno', 'Close')}>✕</button>}
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Stars({ n, max = 3 }: { n: number; max?: number }) {
  return <span className="stars" aria-label={tx(`${n} z ${max} gwiazdek`, `${n} of ${max} stars`)}>{Array.from({ length: max }, (_, i) => <span key={i} className={i < n ? 'on' : ''}>★</span>)}</span>;
}

export function TopBar({ title, onBack, children }: { title: ReactNode; onBack?: () => void; children?: ReactNode }) {
  return (
    <header className="topbar">
      {onBack && <button className="btn btn--ghost" onClick={onBack}>{tx('← Wróć', '← Back')}</button>}
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-right">{children}</div>
    </header>
  );
}

/** Miniatura pomieszczenia (np. na kartach scenariuszy) */
export function RoomThumb({ scenario, room, bg }: { scenario: Scenario; room?: Room; bg?: string }) {
  const t = THEMES[scenario.theme];
  const r = room ?? scenario.rooms[0];
  return (
    <svg viewBox="0 0 1600 900" className="thumb" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <ThemeDefs t={t} />
      <Background variant={bg ?? r?.bg ?? 'classroom'} t={t} />
      {r?.objects.filter((o) => !o.showIf && !o.secret).map((o) => {
        const Art = ART[o.art];
        return Art ? <g key={o.id} transform={`translate(${o.x},${o.y})`}>{Art({ w: o.w, h: o.h, t, open: false })}</g> : null;
      })}
      <SceneOverlay t={t} dark={false} />
    </svg>
  );
}

export function downloadFile(name: string, content: string, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function shuffle<T>(arr: T[], seed = Math.random()): T[] {
  const a = [...arr];
  let s = Math.floor(seed * 2147483647) || 1;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Tasowanie gwarantujące inną kolejność niż wyjściowa (dla zagadek „ułóż”) */
export function shuffleDifferent<T>(arr: T[], seed?: number): T[] {
  if (arr.length < 2) return [...arr];
  for (let k = 0; k < 10; k++) {
    const s = shuffle(arr, seed !== undefined ? (seed + k * 0.137) % 1 : undefined);
    if (s.some((x, i) => x !== arr[i])) return s;
  }
  return [...arr].reverse();
}

/** Strona osadzona w ramce (np. podgląd online) – drukowanie i pobieranie plików mogą być zablokowane */
export const EMBEDDED = (() => { try { return window.self !== window.top; } catch { return true; } })();

/** Przycisk z potwierdzeniem w dwóch kliknięciach (bez okien confirm()) */
export function ConfirmButton({ className, label, confirmLabel = tx('Na pewno? Kliknij ponownie', 'Sure? Click again'), onConfirm }: { className?: string; label: ReactNode; confirmLabel?: string; onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(id);
  }, [armed]);
  return (
    <button className={`${className ?? 'btn'} ${armed ? 'armed' : ''}`} onClick={() => { if (armed) { setArmed(false); onConfirm(); } else setArmed(true); }}>
      {armed ? confirmLabel : label}
    </button>
  );
}
