/* Biblioteka grafik obiektów interaktywnych (SVG, lokalny układ 0..w × 0..h). */
import type { ReactNode } from 'react';
import { tx } from '../i18n';
import type { Theme } from './themes';

export interface ArtProps { w: number; h: number; t: Theme; open: boolean }
type Art = (p: ArtProps) => ReactNode;

const u = (name: string, t: Theme) => `url(#${name}-${t.id})`;

/* ---------- wspólne elementy ---------- */
function Dial({ cx, cy, r, t, label }: { cx: number; cy: number; r: number; t: Theme; label?: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={u('metal', t)} stroke="#222" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={r * 0.62} fill={t.metalDark} />
      <line x1={cx} y1={cy - r * 0.6} x2={cx} y2={cy - r * 0.95} stroke="#fff" strokeWidth="3" />
      {label && <text x={cx} y={cy + r * 0.22} fontSize={r * 0.6} textAnchor="middle" fill="#fff" fontWeight="700">{label}</text>}
    </g>
  );
}

function Keypad({ x, y, s, t }: { x: number; y: number; s: number; t: Theme }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect width="60" height="84" rx="6" fill="#1b1f24" stroke={t.metal} strokeWidth="2" />
      <rect x="8" y="6" width="44" height="14" rx="2" fill={t.screen} opacity="0.85" />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={8 + (i % 3) * 15} y={26 + Math.floor(i / 3) * 18} width="12" height="13" rx="2" fill={t.metal} />)}
    </g>
  );
}

function DoorFrame({ w, h, t, children, fill, open }: { w: number; h: number; t: Theme; children?: ReactNode; fill?: string; open: boolean }) {
  return (
    <g>
      <rect x="0" y="0" width={w} height={h} rx="4" fill={t.trim} />
      <rect x="10" y="10" width={w - 20} height={h - 10} fill="#07070a" />
      {open ? (
        <g>
          <rect x="10" y="10" width={w - 20} height={h - 10} fill={t.glow} opacity="0.35" />
          <path d={`M10,10 L${w * 0.32},40 L${w * 0.32},${h - 30} L10,${h}`} fill={fill ?? u('wood', t)} stroke="#000" strokeOpacity="0.4" />
        </g>
      ) : (
        <g>
          <rect x="10" y="10" width={w - 20} height={h - 10} fill={fill ?? u('wood', t)} />
          {children}
        </g>
      )}
    </g>
  );
}

/* ---------- SZKOŁA ---------- */
const chalkboard: Art = ({ w, h, t, open }) => (
  <g>
    <rect width={w} height={h} rx="6" fill={t.woodDark} />
    <rect x="14" y="14" width={w - 28} height={h - 40} fill="#21392c" />
    <rect x="14" y="14" width={w - 28} height={h - 40} fill="url(#glow-school)" opacity="0.12" />
    <text x={w / 2} y={h * 0.33} fontSize="34" fill="#e9efe6" textAnchor="middle" fontFamily="'Comic Sans MS', 'Segoe Print', cursive" opacity="0.92">{tx('Kto chce wyjść,', 'Whoever wants to leave')}</text>
    <text x={w / 2} y={h * 0.5} fontSize="34" fill="#e9efe6" textAnchor="middle" fontFamily="'Comic Sans MS', 'Segoe Print', cursive" opacity="0.92">{tx('musi liczyć jak my.', 'must count like we did.')}</text>
    <text x={w / 2} y={h * 0.7} fontSize="30" fill={open ? '#9df2b0' : '#f4e27a'} textAnchor="middle" fontFamily="monospace">{open ? tx('✓ rozwiązane', '✓ solved') : '? = ?'}</text>
    <rect x="10" y={h - 26} width={w - 20} height="14" fill={t.wood} />
    <rect x="60" y={h - 32} width="40" height="8" rx="3" fill="#f2f2f2" />
  </g>
);

const clock: Art = ({ w, h, t }) => {
  const r = Math.min(w, h) / 2 - 4;
  return (
    <g>
      <circle cx={w / 2} cy={h / 2} r={r} fill={t.woodDark} />
      <circle cx={w / 2} cy={h / 2} r={r - 9} fill="#f6efdc" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return <line key={i} x1={w / 2 + Math.sin(a) * (r - 14)} y1={h / 2 - Math.cos(a) * (r - 14)} x2={w / 2 + Math.sin(a) * (r - 22)} y2={h / 2 - Math.cos(a) * (r - 22)} stroke="#222" strokeWidth="3" />;
      })}
      <line x1={w / 2} y1={h / 2} x2={w / 2 + Math.sin((4 * Math.PI) / 6) * (r * 0.45)} y2={h / 2 - Math.cos((4 * Math.PI) / 6) * (r * 0.45)} stroke="#111" strokeWidth="6" strokeLinecap="round" />
      <line x1={w / 2} y1={h / 2} x2={w / 2} y2={h / 2 - r * 0.7} stroke="#111" strokeWidth="4" strokeLinecap="round" />
      <circle cx={w / 2} cy={h / 2} r="5" fill="#a33" />
    </g>
  );
};

const poster: Art = ({ w, h, t }) => (
  <g>
    <rect width={w} height={h} fill={u('paper', t)} stroke="#6b5a3a" strokeWidth="3" />
    <text x={w / 2} y="30" fontSize="18" textAnchor="middle" fill={t.ink} fontWeight="700">{tx('PLAN SZKOŁY 1926', 'SCHOOL PLAN 1926')}</text>
    <rect x="20" y="50" width={w - 40} height={h - 110} fill="none" stroke={t.ink} strokeWidth="3" />
    <line x1={w / 2} y1="50" x2={w / 2} y2={h - 60} stroke={t.ink} strokeWidth="2" />
    <line x1="20" y1={h / 2} x2={w - 20} y2={h / 2} stroke={t.ink} strokeWidth="2" />
    <rect x={w - 60} y={h - 50} width="34" height="34" fill="none" stroke="#a33" strokeWidth="3" />
    <text x="24" y={h - 22} fontSize="14" fill="#a33" fontStyle="italic">a = ?</text>
    <circle cx="14" cy="12" r="5" fill="#b33" />
    <circle cx={w - 14} cy="12" r="5" fill="#b33" />
  </g>
);

const windowArt: Art = ({ w, h, t }) => (
  <g>
    <rect width={w} height={h} fill={t.woodDark} />
    <rect x="14" y="14" width={w - 28} height={h - 28} fill="#1d2b4a" />
    <rect x="14" y="14" width={w - 28} height={(h - 28) * 0.6} fill="#2e3f6b" />
    <circle cx={w * 0.7} cy={h * 0.25} r="22" fill="#f6efc8" opacity="0.9" />
    <path d={`M14,${h * 0.75} q${w * 0.2},-40 ${w * 0.4},-10 t${w * 0.45},-20 V${h - 14} H14 Z`} fill="#0d1424" />
    <line x1={w / 2} y1="14" x2={w / 2} y2={h - 14} stroke={t.woodDark} strokeWidth="10" />
    <line x1="14" y1={h / 2} x2={w - 14} y2={h / 2} stroke={t.woodDark} strokeWidth="10" />
    {Array.from({ length: 5 }, (_, i) => <line key={i} x1={14 + (i + 0.5) * ((w - 28) / 5)} y1="14" x2={14 + (i + 0.5) * ((w - 28) / 5)} y2={h - 14} stroke="#222" strokeWidth="5" />)}
    <rect x="-10" y={h - 14} width={w + 20} height="18" fill={t.wood} />
  </g>
);

const backpack: Art = ({ w, h }) => (
  <g>
    <path d={`M${w * 0.2},${h * 0.25} Q${w * 0.5},0 ${w * 0.8},${h * 0.25} L${w * 0.88},${h} L${w * 0.12},${h} Z`} fill="#2f5d8a" />
    <rect x={w * 0.24} y={h * 0.55} width={w * 0.52} height={h * 0.3} rx="10" fill="#244a6f" />
    <path d={`M${w * 0.35},${h * 0.18} Q${w * 0.5},${h * 0.02} ${w * 0.65},${h * 0.18}`} fill="none" stroke="#1b3550" strokeWidth="8" />
    <rect x={w * 0.7} y={h * 0.4} width={w * 0.14} height={h * 0.08} fill="#f3e6b5" transform={`rotate(-20 ${w * 0.77} ${h * 0.44})`} />
  </g>
);

const desk: Art = ({ w, h, t, open }) => (
  <g>
    <rect x="0" y="0" width={w} height="34" rx="4" fill={u('wood', t)} />
    <rect x="16" y="34" width={w * 0.36} height={h - 34} fill={t.wood} stroke={t.woodDark} strokeWidth="3" />
    <rect x={w - 16 - w * 0.36} y="34" width={w * 0.36} height={h - 34} fill={t.wood} stroke={t.woodDark} strokeWidth="3" />
    <rect x={w * 0.42} y="40" width={w * 0.16} height={open ? 60 : 44} fill={t.woodLight} stroke={t.woodDark} strokeWidth="3" />
    {[0, 1, 2].map((i) => <circle key={i} cx={w * 0.45 + i * (w * 0.05)} cy={open ? 92 : 62} r="7" fill={u('metal', t)} stroke="#222" />)}
    {[0, 1].map((i) => <rect key={i} x={30} y={50 + i * 70} width={w * 0.36 - 28} height="56" fill="none" stroke={t.woodDark} strokeWidth="2" />)}
    <rect x={w * 0.62} y="-26" width="70" height="26" fill="#d9d0b4" />
    <rect x={w * 0.15} y="-14" width="90" height="14" fill="#8a2a2a" />
  </g>
);

const bin: Art = ({ w, h, t }) => (
  <g>
    <path d={`M0,10 L${w},10 L${w * 0.85},${h} L${w * 0.15},${h} Z`} fill={t.metalDark} />
    {[1, 2, 3, 4].map((i) => <line key={i} x1={(w * i) / 5} y1="12" x2={w * 0.15 + ((w * 0.7) * i) / 5} y2={h} stroke={t.metal} strokeWidth="2" opacity="0.5" />)}
    <circle cx={w * 0.45} cy="12" r="14" fill="#efe9d8" />
    <ellipse cx={w / 2} cy="10" rx={w / 2} ry="7" fill="#2a2a2a" />
  </g>
);

const door: Art = ({ w, h, t, open }) => (
  <DoorFrame w={w} h={h} t={t} open={open}>
    <rect x="30" y="40" width={w - 60} height={h * 0.36} fill="none" stroke={t.woodDark} strokeWidth="5" />
    <rect x="30" y={h * 0.5} width={w - 60} height={h * 0.42} fill="none" stroke={t.woodDark} strokeWidth="5" />
    <circle cx={w - 36} cy={h * 0.5} r="10" fill={t.gold} />
    <rect x={w - 41} y={h * 0.5 + 16} width="10" height="20" rx="3" fill="#111" />
  </DoorFrame>
);

const doorSide: Art = ({ w, h, t }) => (
  <g>
    <path d={`M0,0 L${w},${h * 0.06} L${w},${h * 0.94} L0,${h} Z`} fill={t.trim} />
    <path d={`M8,12 L${w - 6},${h * 0.08} L${w - 6},${h * 0.92} L8,${h - 6} Z`} fill={u('wood', t)} />
    <circle cx={w * 0.7} cy={h / 2} r="6" fill={t.gold} />
    <text x={w / 2} y={h * 0.2} fontSize="36" textAnchor="middle" fill="#fff" opacity="0.8">◀</text>
  </g>
);

const doorCard: Art = (p) => (
  <g>
    {door(p)}
    {!p.open && <g><rect x={p.w - 46} y={p.h * 0.36} width="30" height="46" rx="4" fill="#222" /><circle cx={p.w - 31} cy={p.h * 0.36 + 12} r="5" fill="#ff4d4d" /></g>}
  </g>
);

const corkboard: Art = ({ w, h, t }) => (
  <g>
    <rect width={w} height={h} rx="4" fill={t.woodDark} />
    <rect x="10" y="10" width={w - 20} height={h - 20} fill="#b98a55" />
    <rect x="40" y="30" width={w * 0.55} height={h * 0.6} fill="#fbf6e8" transform={`rotate(-2 ${w * 0.3} ${h * 0.4})`} />
    {[0.25, 0.45, 0.35, 0.7, 0.55].map((v, i) => <rect key={i} x={60 + i * (w * 0.09)} y={30 + h * 0.6 - v * h * 0.5} width={w * 0.06} height={v * h * 0.5} fill={i === 3 ? '#c0392b' : '#3a6ea5'} />)}
    <rect x={w * 0.68} y="40" width={w * 0.22} height={h * 0.3} fill="#fff59d" transform={`rotate(4 ${w * 0.8} ${h * 0.2})`} />
    <rect x={w * 0.66} y={h * 0.55} width={w * 0.25} height={h * 0.3} fill="#c8e6c9" transform={`rotate(-5 ${w * 0.8} ${h * 0.7})`} />
    {[[60, 34], [w * 0.78, 44], [w * 0.76, h * 0.58]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="6" fill="#d33" />)}
  </g>
);

const calendar: Art = ({ w, h }) => (
  <g>
    <rect width={w} height={h} rx="4" fill="#fbfbf6" stroke="#999" />
    <rect width={w} height={h * 0.2} rx="4" fill="#b23a3a" />
    <text x={w / 2} y={h * 0.15} fontSize="18" textAnchor="middle" fill="#fff" fontWeight="700">{tx('MAJ', 'MAY')}</text>
    {Array.from({ length: 28 }, (_, i) => <rect key={i} x={10 + (i % 7) * ((w - 20) / 7)} y={h * 0.26 + Math.floor(i / 7) * ((h * 0.68) / 4)} width={(w - 20) / 7 - 3} height={(h * 0.68) / 4 - 4} fill="#eee" />)}
    <circle cx={10 + 6 * ((w - 20) / 7) - 6} cy={h * 0.26 + 2 * ((h * 0.68) / 4) + 12} r="13" fill="none" stroke="#d33" strokeWidth="3" />
  </g>
);

const computer: Art = ({ w, h, t, open }) => (
  <g>
    <rect x={w * 0.08} y="0" width={w * 0.84} height={h * 0.66} rx="8" fill="#ddd6c8" />
    <rect x={w * 0.13} y={h * 0.05} width={w * 0.74} height={h * 0.52} fill={open ? '#2a6aa8' : '#0f1d2b'} />
    {open ? <text x={w / 2} y={h * 0.33} fontSize="18" fill="#fff" textAnchor="middle">{tx('e-dziennik', 'e-register')}</text> : <g><rect x={w * 0.3} y={h * 0.27} width={w * 0.4} height="20" fill="#fff" opacity="0.85" /><text x={w / 2} y={h * 0.22} fontSize="14" fill={t.screen} textAnchor="middle">{tx('HASŁO:', 'PASSWORD:')}</text></g>}
    <rect x={w * 0.42} y={h * 0.66} width={w * 0.16} height={h * 0.12} fill="#c9c1b2" />
    <rect x={w * 0.1} y={h * 0.8} width={w * 0.8} height={h * 0.16} rx="4" fill="#cfc7b6" />
    {Array.from({ length: 14 }, (_, i) => <rect key={i} x={w * 0.13 + (i % 7) * (w * 0.106)} y={h * 0.83 + Math.floor(i / 7) * (h * 0.06)} width={w * 0.09} height={h * 0.045} fill="#9e9686" />)}
  </g>
);

const plant: Art = ({ w, h }) => (
  <g>
    {[-50, -25, 0, 25, 50, -65, 65].map((a, i) => <path key={i} d={`M${w / 2},${h * 0.6} q${a * 0.6},-${h * 0.3} ${a * 1.1},-${h * 0.55 - (i % 3) * 10}`} fill="none" stroke="#3e8a4a" strokeWidth="9" strokeLinecap="round" />)}
    <path d={`M${w * 0.15},${h * 0.58} L${w * 0.85},${h * 0.58} L${w * 0.75},${h} L${w * 0.25},${h} Z`} fill="#b5532f" />
    <rect x={w * 0.6} y={h * 0.8} width={w * 0.28} height={h * 0.08} fill="#f8f1d8" transform={`rotate(15 ${w * 0.7} ${h * 0.84})`} />
  </g>
);

const locker: Art = ({ w, h, t, open }) => (
  <g>
    <rect width={w} height={h} rx="4" fill={u('metal', t)} />
    {open ? (
      <g>
        <rect x="8" y="8" width={w - 16} height={h - 16} fill="#2c3238" />
        <rect x="16" y={h * 0.3} width={w - 32} height="8" fill={t.metal} />
        <path d={`M8,8 L-${w * 0.35},28 L-${w * 0.35},${h - 28} L8,${h - 8} Z`} fill={t.metalDark} />
      </g>
    ) : (
      <g>
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={w * 0.25} y={20 + i * 12} width={w * 0.5} height="5" rx="2" fill={t.metalDark} />)}
        <Keypad x={w * 0.62} y={h * 0.42} s={0.85} t={t} />
        <rect x="8" y="8" width={w - 16} height={h - 16} fill="none" stroke={t.metalDark} strokeWidth="3" />
      </g>
    )}
  </g>
);

const shelf: Art = ({ w, h, t }) => (
  <g>
    <rect width={w} height={h} fill={t.woodDark} />
    {[0, 1, 2, 3].map((r) => (
      <g key={r}>
        <rect x="8" y={(r + 1) * (h / 4) - 12} width={w - 16} height="12" fill={t.wood} />
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={14 + i * ((w - 28) / 9)} y={r * (h / 4) + 18 + (i % 3) * 4} width={(w - 28) / 9 - 4} height={h / 4 - 34 - (i % 3) * 4} fill={['#2f3f5f', '#5a2a2a', '#2f4f3a', '#4a3a2a'][(i + r) % 4]} />)}
      </g>
    ))}
  </g>
);

const bookshelf: Art = ({ w, h, t, open }) => (
  <g>
    <rect width={w} height={h} fill={t.woodDark} />
    {[0, 1, 2, 3, 4].map((r) => (
      <g key={r}>
        <rect x="10" y={(r + 1) * (h / 5) - 14} width={w - 20} height="14" fill={t.wood} />
        {r !== 2 && Array.from({ length: 13 }, (_, i) => <rect key={i} x={16 + i * ((w - 32) / 13)} y={r * (h / 5) + 16 + (i % 4) * 5} width={(w - 32) / 13 - 3} height={h / 5 - 34 - (i % 4) * 5} fill={['#7a2e2e', '#2e5a3d', '#2e4a7a', '#8a6a2e', '#5a2e6a'][(i * 3 + r) % 5]} />)}
      </g>
    ))}
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={'b' + i}>
        <rect x={w * 0.2 + i * (w * 0.12)} y={2 * (h / 5) + 14} width={w * 0.1} height={h / 5 - 30} fill={['#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#d35400'][i]} stroke="#000" strokeOpacity="0.3" />
        <text x={w * 0.25 + i * (w * 0.12)} y={2 * (h / 5) + h / 10 + 4} fontSize="16" textAnchor="middle" fill="#fff" fontWeight="700">{['?', '?', '?', '?', '?'][i]}</text>
      </g>
    ))}
    {open && <rect x={w * 0.1} y={2 * (h / 5) + 10} width={w * 0.08} height={h / 5 - 26} fill={t.glow} opacity="0.7" />}
  </g>
);

const paintingShapes: Art = ({ w, h, t }) => (
  <g>
    <rect width={w} height={h} fill={u('gold', t)} />
    <rect x="16" y="16" width={w - 32} height={h - 32} fill="#1f2c3d" />
    <rect x="36" y="40" width={w * 0.2} height={h * 0.28} fill="#e74c3c" opacity="0.85" />
    <rect x={w * 0.36} y="36" width={w * 0.2} height={w * 0.2} fill="#f1c40f" opacity="0.85" />
    <path d={`M${w * 0.62},${h * 0.48} L${w * 0.92},${h * 0.48} L${w * 0.77},${h * 0.12} Z`} fill="#2ecc71" opacity="0.85" />
    <path d={`M${w * 0.2},${h * 0.85} L${w * 0.5},${h * 0.85} L${w * 0.45},${h * 0.58} L${w * 0.27},${h * 0.58} Z`} fill="#3498db" opacity="0.85" />
    {['A', 'B', 'C', 'D'].map((l, i) => <text key={l} x={[w * 0.16, w * 0.46, w * 0.77, w * 0.36][i]} y={[h * 0.42, h * 0.32, h * 0.42, h * 0.78][i]} fontSize="22" fill="#fff" textAnchor="middle" fontWeight="800">{l}</text>)}
  </g>
);

const openBook: Art = ({ w, h, t }) => (
  <g>
    <path d={`M${w * 0.1},${h * 0.7} L${w / 2},${h * 0.8} L${w * 0.9},${h * 0.7} L${w * 0.9},${h * 0.9} L${w / 2},${h} L${w * 0.1},${h * 0.9} Z`} fill={t.woodDark} />
    <path d={`M${w * 0.05},${h * 0.1} Q${w * 0.28},0 ${w / 2},${h * 0.12} L${w / 2},${h * 0.85} Q${w * 0.28},${h * 0.72} ${w * 0.05},${h * 0.8} Z`} fill={u('paper', t)} stroke="#8a7a5a" />
    <path d={`M${w * 0.95},${h * 0.1} Q${w * 0.72},0 ${w / 2},${h * 0.12} L${w / 2},${h * 0.85} Q${w * 0.72},${h * 0.72} ${w * 0.95},${h * 0.8} Z`} fill={u('paper', t)} stroke="#8a7a5a" />
    {Array.from({ length: 5 }, (_, i) => <g key={i}><line x1={w * 0.1} y1={h * 0.25 + i * h * 0.1} x2={w * 0.44} y2={h * 0.25 + i * h * 0.1} stroke="#7a6a50" strokeWidth="2" /><line x1={w * 0.56} y1={h * 0.25 + i * h * 0.1} x2={w * 0.9} y2={h * 0.25 + i * h * 0.1} stroke="#7a6a50" strokeWidth="2" /></g>)}
  </g>
);

const globe: Art = ({ w, h, t }) => (
  <g>
    <rect x={w * 0.42} y={h * 0.7} width={w * 0.16} height={h * 0.2} fill={t.woodDark} />
    <ellipse cx={w / 2} cy={h * 0.95} rx={w * 0.35} ry={h * 0.05} fill={t.woodDark} />
    <path d={`M${w * 0.12},${h * 0.38} A${w * 0.4},${w * 0.4} 0 1 0 ${w * 0.5},${h * 0.0}`} fill="none" stroke={t.gold} strokeWidth="6" />
    <circle cx={w / 2} cy={h * 0.38} r={w * 0.34} fill="#2f6fa0" />
    <path d={`M${w * 0.3},${h * 0.25} q20,-20 40,0 t30,20 q-20,30 -50,10 Z M${w * 0.55},${h * 0.45} q20,0 25,20 t-30,10 Z`} fill="#5aa35a" />
    <line x1={w * 0.16} y1={h * 0.38} x2={w * 0.84} y2={h * 0.38} stroke="#f3e6b5" strokeWidth="3" opacity="0.8" />
  </g>
);

const chest: Art = ({ w, h, t, open }) => (
  <g>
    <rect x="0" y={h * 0.38} width={w} height={h * 0.62} rx="6" fill={u('wood', t)} stroke={t.woodDark} strokeWidth="4" />
    {open ? (
      <path d={`M0,${h * 0.38} L${w * 0.06},0 L${w * 0.94},0 L${w},${h * 0.38} Z`} fill={t.woodDark} />
    ) : (
      <path d={`M0,${h * 0.4} Q${w / 2},-${h * 0.05} ${w},${h * 0.4} Z`} fill={u('wood', t)} stroke={t.woodDark} strokeWidth="4" />
    )}
    {[0.15, 0.85].map((p) => <rect key={p} x={w * p - 8} y={h * 0.1} width="16" height={h * 0.9} fill={u('metal', t)} />)}
    <rect x={w * 0.36} y={h * 0.44} width={w * 0.28} height={h * 0.3} rx="4" fill="#222" />
    {[0, 1, 2].map((i) => <rect key={i} x={w * 0.39 + i * w * 0.075} y={h * 0.5} width={w * 0.06} height={h * 0.18} fill="#ddd" />)}
  </g>
);

const lamp: Art = ({ w, h, t }) => (
  <g>
    <ellipse cx={w / 2} cy={h * 0.3} rx={w * 0.9} ry={h * 0.5} fill={u('glow', t)} />
    <path d={`M${w * 0.1},${h * 0.35} Q${w / 2},0 ${w * 0.9},${h * 0.35} Z`} fill="#2e6b3e" />
    <rect x={w * 0.46} y={h * 0.35} width={w * 0.08} height={h * 0.5} fill={t.gold} />
    <ellipse cx={w / 2} cy={h * 0.92} rx={w * 0.35} ry={h * 0.07} fill={t.gold} />
  </g>
);

const hatch: Art = ({ w, h, t, open }) => (
  <g>
    <path d={`M${w * 0.08},0 L${w * 0.92},0 L${w},${h} L0,${h} Z`} fill={open ? '#050505' : u('wood', t)} stroke={t.woodDark} strokeWidth="5" />
    {!open && [0.3, 0.55, 0.8].map((p) => <line key={p} x1={w * 0.04 + w * 0.04 * p} y1={h * p} x2={w - w * 0.04 * p} y2={h * p} stroke={t.woodDark} strokeWidth="3" />)}
    {!open && <g><rect x={w * 0.45} y={h * 0.35} width={w * 0.1} height={h * 0.35} rx="4" fill={t.metalDark} /><path d={`M${w * 0.47},${h * 0.35} q${w * 0.03},-20 ${w * 0.06},0`} fill="none" stroke={t.metal} strokeWidth="4" /></g>}
    {open && [0.2, 0.45, 0.7].map((p) => <rect key={p} x={w * 0.2} y={h * p} width={w * 0.6} height="8" fill={t.woodDark} />)}
  </g>
);

const fusebox: Art = ({ w, h, t, open }) => (
  <g>
    <rect width={w} height={h} rx="6" fill={u('metal', t)} stroke="#222" strokeWidth="3" />
    <rect x="12" y="12" width={w - 24} height={h - 24} fill="#2b2f33" />
    {Array.from({ length: 5 }, (_, i) => (
      <g key={i}>
        <rect x={24 + i * ((w - 48) / 5)} y={h * 0.35} width={(w - 48) / 5 - 8} height={h * 0.35} rx="3" fill="#ddd" />
        <rect x={30 + i * ((w - 48) / 5)} y={open ? h * 0.38 : h * 0.55} width={(w - 48) / 5 - 20} height={h * 0.12} fill={open ? '#2ecc71' : '#c0392b'} />
      </g>
    ))}
    <path d={`M${w / 2 - 14},20 l10,0 l-6,16 l12,0 l-20,26 l6,-18 l-10,0 Z`} fill="#f1c40f" />
  </g>
);

const archive: Art = ({ w, h, t, open }) => (
  <g>
    <rect width={w} height={h} fill={t.metalDark} />
    {[0, 1, 2, 3].map((r) => (
      <g key={r}>
        <rect x="10" y={10 + r * ((h - 20) / 4)} width={w - 20} height={(h - 20) / 4 - 8} fill={u('metal', t)} />
        <rect x={w / 2 - 30} y={30 + r * ((h - 20) / 4)} width="60" height="14" rx="3" fill="#222" />
        <rect x={w / 2 - 22} y={56 + r * ((h - 20) / 4)} width="44" height="20" fill="#f3ead1" />
      </g>
    ))}
    {open && <rect x="10" y={10 + 2 * ((h - 20) / 4)} width={w - 20} height="40" fill="#e8d9a8" />}
  </g>
);

const wallSymbols: Art = ({ w, h, t }) => (
  <g>
    <rect width={w} height={h} rx="10" fill="#000" opacity="0.15" />
    {['▲', '★', '■', '●'].map((s, i) => <text key={s} x={(w / 4) * i + w / 8} y={h * 0.7} fontSize={h * 0.6} textAnchor="middle" fill={['#e74c3c', '#f1c40f', '#3498db', '#2ecc71'][i]} opacity="0.9">{s}</text>)}
    <text x={w - 8} y={h - 8} fontSize="16" textAnchor="end" fill={t.paper} opacity="0.6">1 → 4</text>
  </g>
);

const photo: Art = ({ w, h, t }) => (
  <g>
    <rect width={w} height={h} fill={u('gold', t)} />
    <rect x="10" y="10" width={w - 20} height={h - 20} fill="#c9b99a" />
    {Array.from({ length: 8 }, (_, i) => <g key={i}><circle cx={22 + (i % 4) * ((w - 44) / 3)} cy={h * 0.35 + Math.floor(i / 4) * h * 0.28} r="9" fill="#5a4a3a" /><rect x={14 + (i % 4) * ((w - 44) / 3)} y={h * 0.35 + Math.floor(i / 4) * h * 0.28 + 9} width="16" height="22" fill="#5a4a3a" /></g>)}
    <text x={w / 2} y={h - 16} fontSize="12" textAnchor="middle" fill="#3a2a1a">1926</text>
  </g>
);

const crate: Art = ({ w, h, t }) => (
  <g>
    <rect width={w} height={h} fill={u('wood', t)} stroke={t.woodDark} strokeWidth="5" />
    <line x1="0" y1="0" x2={w} y2={h} stroke={t.woodDark} strokeWidth="8" />
    <line x1={w} y1="0" x2="0" y2={h} stroke={t.woodDark} strokeWidth="8" />
    <rect x="0" y={h / 2 - 8} width={w} height="16" fill={t.woodDark} />
  </g>
);

const stairs: Art = ({ w, h, t }) => (
  <g>
    {Array.from({ length: 7 }, (_, i) => <rect key={i} x={i * 12} y={i * (h / 7)} width={w - i * 24} height={h / 7} fill={i % 2 ? t.stone : t.stoneDark} stroke="#222" strokeWidth="2" />)}
    <text x={w / 2} y={h * 0.25} fontSize="34" textAnchor="middle" fill="#fff" opacity="0.8">▲</text>
  </g>
);

const exitDials: Art = ({ w, h, t, open }) => (
  <g>
    <DoorFrame w={w} h={h} t={t} open={open} fill={u('metal', t)}>
      <rect x="30" y="40" width={w - 60} height={h - 80} fill="none" stroke={t.metalDark} strokeWidth="6" />
      {[0, 1, 2, 3].map((i) => <Dial key={i} cx={w / 2} cy={h * 0.28 + i * h * 0.13} r={Math.min(30, w * 0.13)} t={t} label={['▲', '★', '■', '●'][i]} />)}
    </DoorFrame>
    <rect x={w * 0.2} y="-40" width={w * 0.6} height="34" rx="4" fill="#1e7a3a" />
    <text x={w / 2} y="-15" fontSize="22" textAnchor="middle" fill="#fff" fontWeight="800">{tx('WYJŚCIE', 'EXIT')}</text>
  </g>
);

/* ---------- EGIPT ---------- */
const stoneBlock = (w: number, h: number, t: Theme) => (
  <g>
    <rect width={w} height={h} fill={u('stone', t)} />
    {Array.from({ length: Math.ceil(h / 60) }, (_, r) => <line key={r} x1="0" y1={r * 60} x2={w} y2={r * 60} stroke={t.stoneDark} strokeWidth="3" />)}
  </g>
);

const stoneGate: Art = ({ w, h, t }) => (
  <g>
    <rect x="0" y="0" width={w} height={h} fill={t.stoneDark} />
    <rect x="20" y="40" width={w - 40} height={h - 40} fill={u('stone', t)} />
    {Array.from({ length: 8 }, (_, i) => <line key={i} x1="20" y1={40 + i * ((h - 40) / 8)} x2={w - 20} y2={40 + i * ((h - 40) / 8)} stroke={t.stoneDark} strokeWidth="3" />)}
    <rect x="0" y="0" width={w} height="40" fill={t.trim} />
    <text x={w / 2} y={h / 2} fontSize="60" textAnchor="middle" fill={t.trim} opacity="0.5">◉</text>
  </g>
);

const statue: Art = ({ w, h, t }) => (
  <g>
    <rect x={w * 0.1} y={h * 0.85} width={w * 0.8} height={h * 0.15} fill={t.stoneDark} />
    <path d={`M${w * 0.3},${h * 0.85} L${w * 0.33},${h * 0.35} L${w * 0.67},${h * 0.35} L${w * 0.7},${h * 0.85} Z`} fill="#2a2522" />
    <path d={`M${w * 0.38},${h * 0.35} L${w * 0.4},${h * 0.18} L${w * 0.6},${h * 0.18} L${w * 0.62},${h * 0.35} Z`} fill="#2a2522" />
    <path d={`M${w * 0.4},${h * 0.2} L${w * 0.36},${h * 0.03} L${w * 0.46},${h * 0.16} Z M${w * 0.6},${h * 0.2} L${w * 0.64},${h * 0.03} L${w * 0.54},${h * 0.16} Z`} fill="#2a2522" />
    <path d={`M${w * 0.55},${h * 0.24} L${w * 0.75},${h * 0.27} L${w * 0.58},${h * 0.3} Z`} fill="#2a2522" />
    <circle cx={w * 0.55} cy={h * 0.23} r="4" fill={t.gold} />
    <rect x={w * 0.33} y={h * 0.36} width={w * 0.34} height={h * 0.05} fill={u('gold', t)} />
    <rect x={w * 0.12} y={h * 0.42} width={w * 0.3} height={h * 0.16} fill={t.paper} stroke={t.trim} strokeWidth="3" />
    <rect x={w * 0.58} y={h * 0.42} width={w * 0.3} height={h * 0.16} fill={t.paper} stroke={t.trim} strokeWidth="3" />
  </g>
);

const torch: Art = ({ w, h, t, open }) => (
  <g>
    <rect x={w * 0.2} y={h * 0.45} width={w * 0.6} height="14" fill={t.metalDark} />
    {!open && (
      <g>
        <ellipse cx={w / 2} cy={h * 0.15} rx={w * 1.4} ry={h * 0.4} fill={u('glow', t)} />
        <rect x={w * 0.4} y={h * 0.25} width={w * 0.2} height={h * 0.7} fill={t.woodDark} />
        <path d={`M${w / 2},0 Q${w * 0.85},${h * 0.15} ${w * 0.62},${h * 0.27} L${w * 0.38},${h * 0.27} Q${w * 0.15},${h * 0.15} ${w / 2},0 Z`} fill="#ff9a2e" className="flame" />
        <path d={`M${w / 2},${h * 0.08} Q${w * 0.68},${h * 0.18} ${w * 0.56},${h * 0.26} L${w * 0.44},${h * 0.26} Q${w * 0.32},${h * 0.18} ${w / 2},${h * 0.08} Z`} fill="#ffe36e" />
      </g>
    )}
  </g>
);

const clayTablet: Art = ({ w, h }) => (
  <g>
    <rect width={w} height={h} rx="14" fill="#a5683d" stroke="#6e4224" strokeWidth="4" />
    <text x={w * 0.2} y={h * 0.6} fontSize="30" fill="#5a3418">|</text>
    <path d={`M${w * 0.32},${h * 0.62} q12,-40 24,0`} fill="none" stroke="#5a3418" strokeWidth="4" />
    <path d={`M${w * 0.55},${h * 0.5} m-10,0 a10,10 0 1,0 20,0 a6,6 0 1,0 -12,0`} fill="none" stroke="#5a3418" strokeWidth="4" />
    <path d={`M${w * 0.78},${h * 0.65} l0,-30 m0,0 q-14,-6 -10,-18 m10,18 q14,-6 10,-18`} fill="none" stroke="#5a3418" strokeWidth="4" />
  </g>
);

const urn: Art = ({ w, h, t }) => (
  <g>
    <path d={`M${w * 0.3},0 L${w * 0.7},0 L${w * 0.65},${h * 0.12} Q${w},${h * 0.35} ${w * 0.75},${h} L${w * 0.25},${h} Q0,${h * 0.35} ${w * 0.35},${h * 0.12} Z`} fill="#b5643a" />
    <path d={`M${w * 0.15},${h * 0.45} L${w * 0.85},${h * 0.45}`} stroke={t.ink} strokeWidth="5" />
    <path d={`M${w * 0.3},${h * 0.58} q${w * 0.2},14 ${w * 0.4},0`} stroke={t.ink} strokeWidth="4" fill="none" />
  </g>
);

const mosaic: Art = ({ w, h }) => (
  <g>
    <path d={`M${w * 0.06},0 L${w * 0.94},0 L${w},${h} L0,${h} Z`} fill="#c99a5b" opacity="0.6" />
    {Array.from({ length: 36 }, (_, i) => (i % 7 === 3 ? null : <rect key={i} x={w * 0.08 + (i % 12) * (w * 0.07)} y={8 + Math.floor(i / 12) * (h * 0.3)} width={w * 0.06} height={h * 0.26} fill={['#2e7d9a', '#d4a33a', '#9a3a2e'][i % 3]} opacity="0.8" />))}
  </g>
);

const stoneDoorDials: Art = ({ w, h, t, open }) => (
  <g>
    <rect width={w} height={h} fill={t.stoneDark} />
    {open ? <rect x="24" y="24" width={w - 48} height={h - 24} fill="#0a0603" /> : (
      <g>
        <g transform="translate(24,24)">{stoneBlock(w - 48, h - 24, t)}</g>
        {[0, 1, 2, 3].map((i) => <Dial key={i} cx={w * 0.2 + i * w * 0.2} cy={h * 0.45} r={w * 0.075} t={{ ...t, metal: t.gold, metalDark: '#7a5a1c' }} />)}
      </g>
    )}
    {open && <rect x={w - 40} y="24" width="16" height={h - 24} fill={u('stone', t)} />}
  </g>
);

const niche: Art = ({ w, h, t, open }) => (
  <g>
    <path d={`M0,${h} L0,${h * 0.25} Q${w / 2},-${h * 0.15} ${w},${h * 0.25} L${w},${h} Z`} fill={t.stoneDark} />
    <path d={`M20,${h} L20,${h * 0.28} Q${w / 2},-${h * 0.05} ${w - 20},${h * 0.28} L${w - 20},${h} Z`} fill={open ? '#3a2412' : '#050302'} />
    {open && <ellipse cx={w / 2} cy={h * 0.5} rx={w * 0.45} ry={h * 0.45} fill={u('glow', t)} />}
    {open && <rect x={w * 0.42} y={h * 0.62} width={w * 0.16} height={h * 0.3} fill={t.woodDark} />}
  </g>
);

const hieroglyphWall: Art = ({ w, h, t }) => (
  <g>
    <rect width={w} height={h} fill={u('stone', t)} stroke={t.trim} strokeWidth="6" />
    {Array.from({ length: 5 }, (_, r) => <line key={r} x1="10" y1={(r + 1) * (h / 6)} x2={w - 10} y2={(r + 1) * (h / 6)} stroke={t.trim} strokeWidth="2" opacity="0.5" />)}
    {['2', '5', '11', '23', '47', '?'].map((n, i) => (
      <g key={i}>
        <text x={30 + (i % 3) * (w / 3)} y={(Math.floor(i / 3) + 1) * (h / 3) - 20} fontSize="34" fill={t.ink} fontWeight="700" opacity="0.8">{n}</text>
      </g>
    ))}
    <text x={w * 0.75} y={h * 0.9} fontSize="40" fill={t.ink} opacity="0.4">◉</text>
  </g>
);

const papyrus: Art = ({ w, h, t }) => (
  <g>
    <rect x="10" y="10" width={w - 20} height={h - 20} fill={t.paper} />
    <rect x="0" y="0" width="22" height={h} rx="10" fill="#c7a86a" />
    <rect x={w - 22} y="0" width="22" height={h} rx="10" fill="#c7a86a" />
    {[0, 1, 2].map((i) => <path key={i} d={['M40,40 l20,-20 l20,20 Z', 'M95,25 h30 v30 h-30 Z', 'M155,40 m-15,0 a15,15 0 1,0 30,0 a15,15 0 1,0 -30,0'][i]} fill="none" stroke={t.ink} strokeWidth="3" transform={`scale(${w / 200}, ${h / 100})`} />)}
    {Array.from({ length: 3 }, (_, i) => <line key={i} x1="30" y1={h * 0.65 + i * 12} x2={w - 30} y2={h * 0.65 + i * 12} stroke={t.ink} strokeWidth="2" opacity="0.5" />)}
  </g>
);

const egyptChest: Art = ({ w, h, t, open }) => (
  <g>
    <rect y={h * 0.35} width={w} height={h * 0.65} fill="#2a4f7a" stroke={t.gold} strokeWidth="5" />
    {open ? <path d={`M0,${h * 0.35} L${w * 0.08},0 L${w * 0.92},0 L${w},${h * 0.35} Z`} fill="#1d3a5c" stroke={t.gold} strokeWidth="4" /> : <path d={`M0,${h * 0.36} L${w * 0.1},${h * 0.1} L${w * 0.9},${h * 0.1} L${w},${h * 0.36} Z`} fill="#2a4f7a" stroke={t.gold} strokeWidth="5" />}
    {[0, 1, 2].map((i) => <circle key={i} cx={w * 0.3 + i * w * 0.2} cy={h * 0.65} r={h * 0.13} fill={t.paper} stroke={t.gold} strokeWidth="4" />)}
    {open && <ellipse cx={w / 2} cy={h * 0.3} rx={w * 0.4} ry={h * 0.3} fill={u('glow', t)} />}
  </g>
);

const balance: Art = ({ w, h, t }) => (
  <g>
    <rect x={w * 0.47} y={h * 0.15} width={w * 0.06} height={h * 0.75} fill={u('gold', t)} />
    <rect x={w * 0.3} y={h * 0.9} width={w * 0.4} height={h * 0.1} fill={t.metalDark} />
    <rect x={w * 0.08} y={h * 0.18} width={w * 0.84} height="8" fill={u('gold', t)} />
    {[0.15, 0.85].map((p) => <g key={p}><line x1={w * p} y1={h * 0.2} x2={w * p - 30} y2={h * 0.55} stroke={t.gold} strokeWidth="2" /><line x1={w * p} y1={h * 0.2} x2={w * p + 30} y2={h * 0.55} stroke={t.gold} strokeWidth="2" /><path d={`M${w * p - 40},${h * 0.55} Q${w * p},${h * 0.7} ${w * p + 40},${h * 0.55} Z`} fill={u('gold', t)} /></g>)}
  </g>
);

const passageSide: Art = ({ w, h, t }) => (
  <g>
    <path d={`M0,0 L${w},${h * 0.06} L${w},${h * 0.94} L0,${h} Z`} fill="#0b0704" stroke={t.stoneDark} strokeWidth="8" />
    <text x={w / 2} y={h * 0.2} fontSize="34" textAnchor="middle" fill="#fff" opacity="0.8">◀</text>
  </g>
);

const scarabDoor: Art = ({ w, h, t, open }) => (
  <g>
    <rect width={w} height={h} fill={t.stoneDark} />
    {open ? <rect x="24" y="24" width={w - 48} height={h - 24} fill="#0a0603" /> : (
      <g>
        <rect x="24" y="24" width={(w - 48) / 2} height={h - 24} fill={u('stone', t)} stroke={t.stoneDark} strokeWidth="3" />
        <rect x={w / 2} y="24" width={(w - 48) / 2} height={h - 24} fill={u('stone', t)} stroke={t.stoneDark} strokeWidth="3" />
        <ellipse cx={w / 2} cy={h * 0.45} rx={w * 0.12} ry={h * 0.08} fill="#2a1a0a" stroke={t.gold} strokeWidth="4" />
        <Hieroglyph x={40} y={h * 0.7} t={t} />
      </g>
    )}
  </g>
);
function Hieroglyph({ x, y, t }: { x: number; y: number; t: Theme }) {
  return <text x={x} y={y} fontSize="28" fill={t.trim} opacity="0.6">☥ ◉ ⌒ ☥</text>;
}

const shapesWall: Art = ({ w, h, t, open }) => (
  <g>
    <rect width={w} height={h} fill={u('stone', t)} stroke={t.trim} strokeWidth="6" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={20 + (i % 2) * (w / 2)} y={20 + Math.floor(i / 2) * (h / 2)} width={w / 2 - 40} height={h / 2 - 40} fill={t.stoneDark} opacity="0.5" />)}
    <rect x="45" y="45" width="60" height="60" fill="none" stroke={t.gold} strokeWidth="4" />
    <path d={`M${w / 2 + 40},${h / 2 - 30} l50,-70 l50,70 Z`} fill="none" stroke={t.gold} strokeWidth="4" />
    <circle cx="90" cy={h * 0.75} r="34" fill="none" stroke={t.gold} strokeWidth="4" />
    <path d={`M${w / 2 + 30},${h - 40} l30,-60 l70,0 l-30,60 Z`} fill="none" stroke={t.gold} strokeWidth="4" />
    {open && <rect width={w} height={h} fill={t.glow} opacity="0.2" />}
  </g>
);

const inscription: Art = ({ w, h, t }) => (
  <g>
    <rect width={w} height={h} fill={t.stoneDark} opacity="0.6" stroke={t.trim} strokeWidth="4" />
    {Array.from({ length: 3 }, (_, r) => <text key={r} x={w / 2} y={(r + 1) * (h / 3.4)} fontSize="26" textAnchor="middle" fill={t.ink} opacity="0.75">{['☥ ◉ ▲ ◇ ☥', '⌒ 60 ⌒ ▲ ?', '◉ ◇ ☥ ◉ ◇'][r]}</text>)}
  </g>
);

const pyramidModel: Art = ({ w, h, t, open }) => (
  <g>
    <rect x={w * 0.1} y={h * 0.62} width={w * 0.8} height={h * 0.38} fill={u('stone', t)} stroke={t.stoneDark} strokeWidth="4" />
    <path d={`M${w * 0.15},${h * 0.62} L${w / 2},0 L${w * 0.85},${h * 0.62} Z`} fill={u('gold', t)} />
    <path d={`M${w / 2},0 L${w * 0.85},${h * 0.62} L${w * 0.6},${h * 0.62} Z`} fill="#000" opacity="0.2" />
    <text x={w / 2} y={h * 0.85} fontSize="24" textAnchor="middle" fill={t.ink}>{open ? '60' : 'V = ?'}</text>
  </g>
);

const brazier: Art = ({ w, h, t }) => (
  <g>
    <ellipse cx={w / 2} cy={h * 0.15} rx={w * 1.2} ry={h * 0.35} fill={u('glow', t)} />
    <path d={`M${w * 0.1},${h * 0.32} L${w * 0.9},${h * 0.32} L${w * 0.7},${h * 0.55} L${w * 0.3},${h * 0.55} Z`} fill={u('gold', t)} />
    <rect x={w * 0.45} y={h * 0.55} width={w * 0.1} height={h * 0.38} fill={t.metalDark} />
    <rect x={w * 0.25} y={h * 0.92} width={w * 0.5} height={h * 0.08} fill={t.metalDark} />
    <path d={`M${w * 0.3},${h * 0.32} Q${w * 0.4},${h * 0.05} ${w / 2},${h * 0.2} Q${w * 0.6},0 ${w * 0.7},${h * 0.32} Z`} fill="#ff7b1f" className="flame" />
  </g>
);

const floorTiles: Art = ({ w, h, t }) => (
  <g>
    <path d={`M${w * 0.05},0 L${w * 0.95},0 L${w},${h} L0,${h} Z`} fill={t.stoneDark} opacity="0.4" />
    {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${w * 0.05 + i * w * 0.18},4 l${w * 0.17},0 l${w * 0.01},${h - 8} l-${w * 0.19},0 Z`} fill={i === 2 ? t.gold : t.stone} opacity={i === 2 ? 0.6 : 0.5} stroke={t.trim} strokeWidth="2" />)}
  </g>
);

const sarcophagus: Art = ({ w, h, t, open }) => (
  <g>
    <rect x="0" y={h * 0.45} width={w} height={h * 0.55} rx="10" fill={u('stone', t)} stroke={t.stoneDark} strokeWidth="4" />
    <g transform={open ? `translate(${w * 0.25},-${h * 0.12}) rotate(8 ${w / 2} ${h * 0.3})` : ''}>
      <path d={`M${w * 0.03},${h * 0.5} Q${w * 0.02},${h * 0.18} ${w * 0.2},${h * 0.12} L${w * 0.97},${h * 0.18} L${w * 0.97},${h * 0.5} Z`} fill={u('gold', t)} stroke="#7a5a1c" strokeWidth="4" />
      <ellipse cx={w * 0.17} cy={h * 0.3} rx={w * 0.08} ry={h * 0.13} fill="#2a4f7a" />
      {[0, 1, 2].map((i) => <Dial key={i} cx={w * 0.45 + i * w * 0.16} cy={h * 0.33} r={h * 0.1} t={{ ...t, metal: t.stone, metalDark: t.stoneDark }} />)}
    </g>
  </g>
);

const sunDoor: Art = ({ w, h, t, open }) => (
  <g>
    <rect width={w} height={h} fill={t.stoneDark} />
    {open ? <rect x="20" y="20" width={w - 40} height={h - 20} fill="#2a1505" /> : (
      <g>
        <rect x="20" y="20" width={w - 40} height={h - 20} fill={u('stone', t)} />
        <circle cx={w / 2} cy={h * 0.35} r={w * 0.22} fill="none" stroke={t.gold} strokeWidth="6" />
        {Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return <line key={i} x1={w / 2 + Math.cos(a) * w * 0.25} y1={h * 0.35 + Math.sin(a) * w * 0.25} x2={w / 2 + Math.cos(a) * w * 0.34} y2={h * 0.35 + Math.sin(a) * w * 0.34} stroke={t.gold} strokeWidth="5" />; })}
        <circle cx={w / 2} cy={h * 0.35} r={w * 0.08} fill="#1a0f05" />
      </g>
    )}
    {open && <ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} fill={u('glow', t)} />}
  </g>
);

const treasure: Art = ({ w, h, t }) => (
  <g>
    <ellipse cx={w / 2} cy={h * 0.8} rx={w / 2} ry={h * 0.22} fill={u('gold', t)} />
    {Array.from({ length: 18 }, (_, i) => <circle key={i} cx={w * 0.1 + ((i * 53) % (w * 0.8))} cy={h * 0.55 + ((i * 29) % (h * 0.3))} r={10 + (i % 3) * 3} fill={u('gold', t)} stroke="#8a6a1c" />)}
    <rect x={w * 0.55} y={h * 0.2} width={w * 0.35} height={h * 0.4} fill="#7a4a2a" stroke={t.gold} strokeWidth="4" />
    <path d={`M${w * 0.15},${h * 0.5} L${w * 0.25},${h * 0.15} L${w * 0.35},${h * 0.5} Z`} fill={u('gold', t)} />
    <circle cx={w * 0.72} cy={h * 0.4} r="10" fill="#2ecc71" />
    <circle cx={w * 0.8} cy={h * 0.33} r="8" fill="#e74c3c" />
  </g>
);

const starmap: Art = ({ w, h, t }) => (
  <g>
    <rect width={w} height={h} rx="8" fill="#0f1a3a" stroke={t.gold} strokeWidth="6" />
    {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={20 + ((i * 97) % (w - 40))} cy={20 + ((i * 59) % (h - 40))} r={1.5 + (i % 3)} fill="#fff6c8" />)}
    <polyline points={`${w * 0.15},${h * 0.3} ${w * 0.3},${h * 0.2} ${w * 0.45},${h * 0.35} ${w * 0.6},${h * 0.25}`} fill="none" stroke={t.gold} strokeWidth="2" opacity="0.7" />
    <polyline points={`${w * 0.55},${h * 0.7} ${w * 0.7},${h * 0.6} ${w * 0.85},${h * 0.75}`} fill="none" stroke={t.gold} strokeWidth="2" opacity="0.7" />
    <text x={w / 2} y={h - 18} fontSize="18" textAnchor="middle" fill={t.gold}>☥ ? ☥</text>
  </g>
);

const hourglass: Art = ({ w, h, t }) => (
  <g>
    <rect width={w} height="14" fill={u('gold', t)} />
    <rect y={h - 14} width={w} height="14" fill={u('gold', t)} />
    <path d={`M${w * 0.15},14 L${w * 0.85},14 L${w * 0.55},${h / 2} L${w * 0.85},${h - 14} L${w * 0.15},${h - 14} L${w * 0.45},${h / 2} Z`} fill="#cfe8ff" opacity="0.4" stroke="#fff" />
    <path d={`M${w * 0.3},${h * 0.3} L${w * 0.7},${h * 0.3} L${w * 0.52},${h / 2} L${w * 0.48},${h / 2} Z`} fill="#e3b45a" />
    <path d={`M${w * 0.2},${h - 16} Q${w / 2},${h * 0.7} ${w * 0.8},${h - 16} Z`} fill="#e3b45a" />
  </g>
);

const altar: Art = ({ w, h, t, open }) => (
  <g>
    <rect x="0" y={h * 0.3} width={w} height={h * 0.7} fill={u('stone', t)} stroke={t.stoneDark} strokeWidth="5" />
    <rect x="-10" y={h * 0.22} width={w + 20} height={h * 0.12} fill={t.stoneDark} />
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={20 + i * ((w - 40) / 6)} y={h * (open && i % 2 ? 0.3 : 0.25)} width={(w - 40) / 6 - 10} height={h * 0.08} fill={u('gold', t)} />)}
    <text x={w / 2} y={h * 0.75} fontSize="30" textAnchor="middle" fill={t.trim} opacity="0.6">☥ Σ ☥</text>
  </g>
);

const statueGold: Art = ({ w, h, t }) => (
  <g>
    <rect x="0" y={h * 0.88} width={w} height={h * 0.12} fill={t.stoneDark} />
    <path d={`M${w * 0.25},${h * 0.88} L${w * 0.3},${h * 0.3} L${w * 0.7},${h * 0.3} L${w * 0.75},${h * 0.88} Z`} fill={u('gold', t)} />
    <path d={`M${w * 0.32},${h * 0.3} L${w * 0.25},${h * 0.12} Q${w / 2},0 ${w * 0.75},${h * 0.12} L${w * 0.68},${h * 0.3} Z`} fill="#2a4f7a" />
    <ellipse cx={w / 2} cy={h * 0.18} rx={w * 0.14} ry={h * 0.08} fill={u('gold', t)} />
    {Array.from({ length: 5 }, (_, i) => <line key={i} x1={w * 0.3} y1={h * (0.4 + i * 0.09)} x2={w * 0.7} y2={h * (0.4 + i * 0.09)} stroke="#8a6a1c" strokeWidth="3" />)}
  </g>
);

const sunGate: Art = ({ w, h, t, open }) => (
  <g>
    <rect width={w} height={h} fill={t.stoneDark} />
    {open ? (
      <g>
        <rect x="24" y="24" width={w - 48} height={h - 24} fill="#ffe9a8" />
        <circle cx={w / 2} cy={h * 0.35} r={w * 0.2} fill="#fff6d0" />
        <rect x="24" y={h * 0.7} width={w - 48} height={h * 0.3 - 0} fill="#e8c27a" />
      </g>
    ) : (
      <g>
        <rect x="24" y="24" width={w - 48} height={h - 24} fill={u('stone', t)} />
        <circle cx={w / 2} cy={h * 0.3} r={w * 0.22} fill={u('gold', t)} />
        {Array.from({ length: 16 }, (_, i) => { const a = (i * Math.PI) / 8; return <line key={i} x1={w / 2 + Math.cos(a) * w * 0.24} y1={h * 0.3 + Math.sin(a) * w * 0.24} x2={w / 2 + Math.cos(a) * w * 0.34} y2={h * 0.3 + Math.sin(a) * w * 0.34} stroke={t.gold} strokeWidth="6" />; })}
        <line x1={w / 2} y1={h * 0.5} x2={w / 2} y2={h} stroke={t.stoneDark} strokeWidth="5" />
      </g>
    )}
  </g>
);

/* ---------- LABORATORIUM ---------- */
const whiteboard: Art = ({ w, h, t }) => (
  <g>
    <rect width={w} height={h} rx="6" fill={t.metal} />
    <rect x="10" y="10" width={w - 20} height={h - 30} fill="#f7fafc" />
    <text x="30" y="60" fontSize="28" fill="#1f4fa0" fontFamily="'Segoe Print', cursive">E = P · t</text>
    <text x="30" y="110" fontSize="26" fill="#c0392b" fontFamily="'Segoe Print', cursive">x = ?</text>
    <path d={`M${w * 0.55},${h * 0.7} q40,-120 90,-60 t90,-60`} fill="none" stroke="#2e7d32" strokeWidth="4" />
    <line x1={w * 0.52} y1={h * 0.72} x2={w * 0.95} y2={h * 0.72} stroke="#333" strokeWidth="2" />
    <line x1={w * 0.55} y1={h * 0.1} x2={w * 0.55} y2={h * 0.75} stroke="#333" strokeWidth="2" />
    <rect x="20" y={h - 20} width={w - 40} height="10" fill={t.metalDark} />
  </g>
);

const notebook: Art = ({ w, h, t }) => (
  <g transform={`rotate(-6 ${w / 2} ${h / 2})`}>
    <rect width={w} height={h} rx="4" fill="#1f6f8b" />
    <rect x="8" y="6" width={w - 14} height={h - 12} fill={t.paper} />
    {Array.from({ length: 5 }, (_, i) => <line key={i} x1="16" y1={20 + i * 14} x2={w - 14} y2={20 + i * 14} stroke="#9ab" strokeWidth="2" />)}
    <line x1="16" y1="76" x2={w * 0.6} y2="76" stroke="#c0392b" strokeWidth="3" />
  </g>
);

const microscope: Art = ({ w, h, t }) => (
  <g>
    <rect x={w * 0.1} y={h * 0.88} width={w * 0.8} height={h * 0.12} rx="6" fill={t.metalDark} />
    <path d={`M${w * 0.6},${h * 0.88} Q${w * 0.95},${h * 0.5} ${w * 0.6},${h * 0.3}`} fill="none" stroke={t.metalDark} strokeWidth="18" />
    <rect x={w * 0.3} y={h * 0.05} width={w * 0.18} height={h * 0.48} rx="6" fill={t.metal} transform={`rotate(-18 ${w * 0.4} ${h * 0.3})`} />
    <rect x={w * 0.15} y={h * 0.6} width={w * 0.55} height={h * 0.06} fill={t.metal} />
    <rect x={w * 0.3} y={h * 0.56} width={w * 0.25} height={h * 0.04} fill={t.accent} opacity="0.8" />
  </g>
);

const beakers: Art = ({ w, h, t }) => (
  <g>
    {[
      { x: 0.05, bw: 0.25, bh: 0.7, c: '#ff5c8a' },
      { x: 0.36, bw: 0.3, bh: 0.9, c: '#3fd3ff' },
      { x: 0.72, bw: 0.22, bh: 0.6, c: '#9cff6b' },
    ].map((b, i) => (
      <g key={i}>
        <rect x={w * b.x} y={h * (1 - b.bh)} width={w * b.bw} height={h * b.bh} rx="6" fill="#dff4ff" opacity="0.35" stroke="#fff" strokeWidth="2" />
        <rect x={w * b.x + 3} y={h * (1 - b.bh * 0.55)} width={w * b.bw - 6} height={h * b.bh * 0.55 - 3} rx="4" fill={b.c} opacity="0.8" />
      </g>
    ))}
    <ellipse cx={w / 2} cy={h * 0.5} rx={w * 0.6} ry={h * 0.5} fill={u('glow', t)} opacity="0.4" />
  </g>
);

const reagentCabinet: Art = ({ w, h, t, open }) => (
  <g>
    <rect width={w} height={h} rx="6" fill={t.metalDark} stroke={t.metal} strokeWidth="3" />
    {[0, 1, 2, 3].map((r) => (
      <g key={r}>
        <rect x="14" y={20 + r * ((h - 40) / 4)} width={w - 28} height="8" fill={t.metal} />
        {Array.from({ length: 5 }, (_, i) => <rect key={i} x={22 + i * ((w - 44) / 5)} y={20 + r * ((h - 40) / 4) - 50} width="20" height="48" rx="5" fill={['#ff5c8a', '#3fd3ff', '#9cff6b', '#ffd166', '#b28dff'][(i + r) % 5]} opacity="0.75" />)}
      </g>
    ))}
    <rect x="10" y="10" width={w - 20} height={h - 20} fill="#bfe9ff" opacity={open ? 0.05 : 0.22} stroke="#fff" strokeOpacity="0.5" />
    {!open && <Keypad x={w - 70} y={h * 0.45} s={0.9} t={t} />}
  </g>
);

const robot: Art = ({ w, h, t }) => (
  <g>
    <ellipse cx={w / 2} cy={h * 0.6} rx={w * 0.48} ry={h * 0.35} fill={t.metal} />
    <ellipse cx={w / 2} cy={h * 0.52} rx={w * 0.38} ry={h * 0.22} fill="#e8eef4" />
    <rect x={w * 0.35} y={h * 0.42} width={w * 0.3} height={h * 0.16} rx="4" fill="#0d1622" />
    <text x={w / 2} y={h * 0.55} fontSize="16" textAnchor="middle" fill={t.accent}>?</text>
    <circle cx={w * 0.2} cy={h * 0.92} r="10" fill="#222" />
    <circle cx={w * 0.8} cy={h * 0.92} r="10" fill="#222" />
  </g>
);

const extinguisher: Art = ({ w, h }) => (
  <g>
    <rect x={w * 0.15} y={h * 0.2} width={w * 0.7} height={h * 0.8} rx={w * 0.3} fill="#d32f2f" />
    <rect x={w * 0.3} y={h * 0.08} width={w * 0.4} height={h * 0.14} fill="#222" />
    <path d={`M${w * 0.6},${h * 0.12} q${w * 0.5},0 ${w * 0.3},${h * 0.4}`} fill="none" stroke="#222" strokeWidth="5" />
    <rect x={w * 0.2} y={h * 0.45} width={w * 0.6} height={h * 0.2} fill="#fff" opacity="0.85" />
  </g>
);

const labDoor: Art = ({ w, h, t, open }) => (
  <g>
    <rect width={w} height={h} fill={t.metalDark} />
    {open ? (
      <g>
        <rect x="14" y="14" width={w - 28} height={h - 14} fill="#bff4ff" opacity="0.4" />
        <rect x="14" y="14" width="22" height={h - 14} fill={u('metal', t)} />
        <rect x={w - 36} y="14" width="22" height={h - 14} fill={u('metal', t)} />
      </g>
    ) : (
      <g>
        <rect x="14" y="14" width={(w - 28) / 2} height={h - 14} fill={u('metal', t)} />
        <rect x={w / 2} y="14" width={(w - 28) / 2} height={h - 14} fill={u('metal', t)} />
        <rect x={w / 2 - 2} y="14" width="4" height={h - 14} fill="#111" />
        <rect x="30" y={h * 0.15} width={w - 60} height={h * 0.18} rx="4" fill="#9fdfff" opacity="0.35" />
        {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M14,${h - 60 + i * 0} l${(w - 28) / 6},0`} />)}
        <rect x="14" y={h - 40} width={w - 28} height="26" fill="#ffd166" opacity="0.8" />
        {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${14 + i * ((w - 28) / 8)},${h - 14} l${(w - 28) / 16},-26 l${(w - 28) / 16},0 l-${(w - 28) / 16},26 Z`} fill="#111" />)}
      </g>
    )}
    <rect x={w + 6} y={h * 0.4} width="22" height="40" rx="3" fill="#111" />
    <circle cx={w + 17} cy={h * 0.4 + 12} r="5" fill={open ? '#2ecc71' : '#ff4d4d'} />
  </g>
);

const labDoorCode: Art = (p) => (
  <g>
    {labDoor(p)}
    {!p.open && <g><rect x={p.w / 2 - 50} y={p.h * 0.45} width="100" height="50" rx="6" fill="#0d1622" stroke={p.t.accent} /><text x={p.w / 2} y={p.h * 0.45 + 34} fontSize="24" fill={p.t.accent} textAnchor="middle" fontFamily="monospace">? ? ?</text></g>}
  </g>
);

const server: Art = ({ w, h, t, open }) => (
  <g>
    <rect width={w} height={h} rx="6" fill="#0b121c" stroke={t.metalDark} strokeWidth="4" />
    {Array.from({ length: 5 }, (_, i) => (
      <g key={i}>
        <rect x="14" y={20 + i * ((h - 40) / 5)} width={w - 28} height={(h - 40) / 5 - 12} rx="4" fill={t.metalDark} />
        {Array.from({ length: 6 }, (_, j) => <circle key={j} cx={34 + j * 16} cy={20 + i * ((h - 40) / 5) + 20} r="4" fill={open ? (j % 2 ? '#5cf2c2' : t.accent) : '#333'} />)}
        <rect x={w - 70} y={20 + i * ((h - 40) / 5) + 12} width="40" height="18" rx="9" fill={open ? '#5cf2c2' : '#555'} />
      </g>
    ))}
  </g>
);

const terminalOff: Art = ({ w, h, t }) => (
  <g>
    <rect width={w} height={h * 0.85} rx="10" fill={t.metalDark} />
    <rect x="14" y="14" width={w - 28} height={h * 0.85 - 28} fill="#05080c" />
    <text x={w / 2} y={h * 0.45} fontSize="20" textAnchor="middle" fill="#ff5470">{tx('BRAK ZASILANIA', 'NO POWER')}</text>
    <rect x={w * 0.4} y={h * 0.85} width={w * 0.2} height={h * 0.15} fill={t.metalDark} />
  </g>
);

const terminal: Art = ({ w, h, t, open }) => (
  <g>
    <rect width={w} height={h * 0.85} rx="10" fill={t.metalDark} />
    <rect x="14" y="14" width={w - 28} height={h * 0.85 - 28} fill="#04121c" />
    <polyline points={`30,${h * 0.6} ${w * 0.3},${h * 0.4} ${w * 0.5},${h * 0.25} ${w * 0.7},${h * 0.35} ${w - 30},${h * 0.5}`} fill="none" stroke={t.accent} strokeWidth="3" />
    <text x="30" y="40" fontSize="16" fill={t.accent} fontFamily="monospace">{open ? tx('> DOSTĘP OK', '> ACCESS OK') : tx('> PYTANIE KONTROLNE_', '> SECURITY QUESTION_')}</text>
    <rect x={w * 0.4} y={h * 0.85} width={w * 0.2} height={h * 0.15} fill={t.metalDark} />
  </g>
);

const monitorTable: Art = ({ w, h, t }) => (
  <g>
    <rect width={w} height={h * 0.85} rx="8" fill={t.metalDark} />
    <rect x="12" y="12" width={w - 24} height={h * 0.85 - 24} fill="#071a26" />
    {Array.from({ length: 4 }, (_, r) => Array.from({ length: 6 }, (_, c) => <rect key={`${r}-${c}`} x={22 + c * ((w - 44) / 6)} y={26 + r * 34} width={(w - 44) / 6 - 4} height="28" fill={r === 0 ? t.accent : '#123a50'} opacity={r === 0 ? 0.7 : 1} />))}
    <rect x={w * 0.4} y={h * 0.85} width={w * 0.2} height={h * 0.15} fill={t.metalDark} />
  </g>
);

const printer: Art = ({ w, h, t, open }) => (
  <g>
    <rect y={h * 0.25} width={w} height={h * 0.65} rx="8" fill="#d8dee6" />
    <rect x={w * 0.1} y={h * 0.15} width={w * 0.8} height={h * 0.15} fill="#aab4c0" />
    <rect x={w * 0.15} y={h * 0.55} width={w * 0.7} height="8" fill="#333" />
    <circle cx={w * 0.88} cy={h * 0.38} r="6" fill={open ? '#2ecc71' : t.accent} />
    {open && <rect x={w * 0.22} y={h * 0.58} width={w * 0.56} height={h * 0.38} fill="#fff" stroke="#ccc" />}
  </g>
);

const mug: Art = ({ w, h, t }) => (
  <g>
    <rect x="0" y={h * 0.15} width={w * 0.75} height={h * 0.85} rx="8" fill="#f2f2f2" />
    <path d={`M${w * 0.75},${h * 0.35} q${w * 0.3},0 0,${h * 0.35}`} fill="none" stroke="#f2f2f2" strokeWidth="8" />
    <text x={w * 0.37} y={h * 0.65} fontSize={h * 0.3} textAnchor="middle" fill={t.accent} fontWeight="800">∑</text>
  </g>
);

const boxShelf: Art = ({ w, h, t, open }) => (
  <g>
    {[0, 1, 2].map((r) => <rect key={r} x="0" y={(r + 1) * (h / 3) - 14} width={w} height="14" fill="#ffb02e" />)}
    <rect x="0" y="0" width="14" height={h} fill="#2b5f9e" />
    <rect x={w - 14} y="0" width="14" height={h} fill="#2b5f9e" />
    {[0, 1, 2].map((r) => Array.from({ length: r === 1 ? 5 : 3 }, (_, i) => {
      const n = r === 1 ? 5 : 3;
      const bw = (w - 40) / n - 10;
      const bh = h / 3 - 40 - (i % 2) * 20;
      return <g key={`${r}-${i}`}><rect x={24 + i * ((w - 40) / n)} y={(r + 1) * (h / 3) - 14 - bh} width={bw} height={bh} fill="#c49a6c" stroke="#7a5a3a" strokeWidth="3" />{r === 1 && <rect x={34 + i * ((w - 40) / n)} y={(r + 1) * (h / 3) - 14 - bh + 10} width={bw - 20} height="20" fill="#fff" />}</g>;
    }))}
    {open && <rect x={w / 2 - 15} y={h - 30} width="30" height="16" fill={t.gold} />}
  </g>
);

const clipboard: Art = ({ w, h, t }) => (
  <g>
    <rect width={w} height={h} rx="8" fill="#8a5a34" />
    <rect x="12" y="24" width={w - 24} height={h - 36} fill={t.paper} />
    <rect x={w * 0.3} y="4" width={w * 0.4} height="28" rx="6" fill={t.metal} />
    {Array.from({ length: 7 }, (_, i) => <g key={i}><rect x="22" y={44 + i * 20} width="10" height="10" fill="none" stroke="#333" /><line x1="40" y1={50 + i * 20} x2={w - 22} y2={50 + i * 20} stroke="#567" strokeWidth="2" /></g>)}
  </g>
);

const container: Art = ({ w, h, t }) => (
  <g>
    <rect width={w} height={h} fill="#c0392b" />
    {Array.from({ length: 14 }, (_, i) => <rect key={i} x={10 + i * ((w - 20) / 14)} y="10" width={(w - 20) / 14 - 8} height={h - 20} fill="#a8322a" />)}
    <rect x={w * 0.25} y={h * 0.35} width={w * 0.5} height={h * 0.3} fill="#ffd166" />
    <text x={w / 2} y={h * 0.55} fontSize="22" textAnchor="middle" fill="#111" fontWeight="800">{tx('☣ PRÓBKI', '☣ SAMPLES')}</text>
    <rect x="0" y="0" width={w} height="10" fill={t.metalDark} />
  </g>
);

const toolbox: Art = ({ w, h, open }) => (
  <g>
    <rect y={h * 0.3} width={w} height={h * 0.7} rx="6" fill="#d35400" />
    {open ? <rect y="0" x={w * 0.05} width={w * 0.9} height={h * 0.3} fill="#a04000" /> : <rect y={h * 0.22} width={w} height={h * 0.16} rx="4" fill="#e67e22" />}
    <path d={`M${w * 0.35},${h * 0.22} q${w * 0.15},-${h * 0.3} ${w * 0.3},0`} fill="none" stroke="#333" strokeWidth="8" />
    {!open && <rect x={w * 0.45} y={h * 0.4} width={w * 0.1} height={h * 0.25} rx="3" fill="#bbb" />}
  </g>
);

const floorScale: Art = ({ w, h, t }) => (
  <g>
    <rect x={w * 0.35} y="0" width={w * 0.3} height={h * 0.3} rx="6" fill="#0d1622" stroke={t.metal} strokeWidth="3" />
    <text x={w / 2} y={h * 0.2} fontSize="20" textAnchor="middle" fill={t.accent} fontFamily="monospace">2.35</text>
    <rect x={w * 0.47} y={h * 0.3} width={w * 0.06} height={h * 0.45} fill={t.metalDark} />
    <path d={`M0,${h * 0.75} L${w},${h * 0.75} L${w * 0.92},${h} L${w * 0.08},${h} Z`} fill={u('metal', t)} />
  </g>
);

const fusePanel: Art = ({ w, h, t, open }) => (
  <g>
    <rect width={w} height={h} rx="6" fill={t.metalDark} stroke={t.metal} strokeWidth="3" />
    <rect x={w * 0.25} y={h * 0.3} width={w * 0.5} height={h * 0.4} rx="4" fill={open ? '#888' : '#111'} />
    <circle cx={w / 2} cy={h * 0.15} r="7" fill={open ? '#2ecc71' : '#ff4d4d'} />
    <path d={`M${w / 2 - 8},${h * 0.78} l8,-10 l0,8 l8,0 l-8,12 l0,-8 Z`} fill="#ffd166" />
  </g>
);

const calibration: Art = ({ w, h, t, open }) => (
  <g>
    <rect width={w} height={h} rx="10" fill={t.metalDark} stroke={t.accent} strokeWidth="3" />
    {Array.from({ length: 4 }, (_, i) => (
      <g key={i}>
        <rect x="24" y={30 + i * ((h - 60) / 4)} width={w * 0.3} height={(h - 60) / 4 - 14} rx="4" fill="#0d1622" stroke={t.accent} />
        <rect x={w - 24 - w * 0.3} y={30 + i * ((h - 60) / 4)} width={w * 0.3} height={(h - 60) / 4 - 14} rx="4" fill="#0d1622" stroke="#5cf2c2" />
        {open && <line x1={24 + w * 0.3} y1={30 + i * ((h - 60) / 4) + 20} x2={w - 24 - w * 0.3} y2={30 + ((i + 1) % 4) * ((h - 60) / 4) + 20} stroke="#5cf2c2" strokeWidth="3" />}
      </g>
    ))}
  </g>
);

const screenChart: Art = ({ w, h, t }) => (
  <g>
    <rect width={w} height={h} rx="8" fill={t.metalDark} />
    <rect x="12" y="12" width={w - 24} height={h - 24} fill="#04121c" />
    {[0.5, 0.3, 0.75, 0.45].map((v, i) => <rect key={i} x={50 + i * ((w - 100) / 4)} y={h - 30 - v * (h - 60)} width={(w - 100) / 4 - 20} height={v * (h - 60)} fill={i === 1 ? '#5cf2c2' : t.accent} opacity="0.8" />)}
    <line x1="40" y1={h - 30} x2={w - 30} y2={h - 30} stroke="#fff" strokeOpacity="0.5" />
  </g>
);

const facilityMap: Art = ({ w, h, t }) => (
  <g>
    <rect width={w} height={h} rx="6" fill="#0f2238" stroke={t.metal} strokeWidth="3" />
    {[[20, 20, 0.3, 0.4], [0.35, 20, 0.3, 0.4], [0.7, 20, 0.25, 0.8], [20, 0.5, 0.65, 0.4]].map(([x, y, rw, rh], i) => <rect key={i} x={x < 1 ? x * w : x} y={y < 1 ? y * h : y} width={rw * w} height={rh * h} fill="none" stroke={t.accent} strokeWidth="2" />)}
    <path d={`M${w * 0.15},${h * 0.3} L${w * 0.5},${h * 0.3} L${w * 0.5},${h * 0.7} L${w * 0.85},${h * 0.7}`} fill="none" stroke="#5cf2c2" strokeWidth="4" strokeDasharray="10 6" />
  </g>
);

const logbook: Art = ({ w, h, t }) => (
  <g transform={`rotate(4 ${w / 2} ${h / 2})`}>
    <rect width={w} height={h} rx="10" fill="#111" />
    <rect x="10" y="10" width={w - 20} height={h - 20} rx="4" fill="#0d2a3a" />
    {Array.from({ length: 4 }, (_, i) => <rect key={i} x="20" y={22 + i * 22} width={w * (0.4 + (i % 2) * 0.3)} height="8" fill={i === 0 ? '#ff5470' : t.accent} opacity="0.8" />)}
  </g>
);

const consoleArt: Art = ({ w, h, t, open }) => (
  <g>
    <path d={`M0,${h * 0.35} L${w * 0.08},0 L${w * 0.92},0 L${w},${h * 0.35} Z`} fill={t.metalDark} stroke={t.accent} strokeWidth="2" />
    <rect y={h * 0.35} width={w} height={h * 0.65} fill={t.wood} />
    {['X', 'Y', 'Z'].map((l, i) => <Dial key={l} cx={w * 0.25 + i * w * 0.25} cy={h * 0.17} r={h * 0.12} t={t} label={l} />)}
    {Array.from({ length: 10 }, (_, i) => <rect key={i} x={w * 0.08 + i * w * 0.085} y={h * 0.5} width={w * 0.06} height={h * 0.08} rx="3" fill={open ? '#5cf2c2' : i % 3 ? '#ff5470' : '#ffd166'} />)}
    <rect x={w * 0.3} y={h * 0.7} width={w * 0.4} height={h * 0.16} rx="4" fill="#04121c" />
    <text x={w / 2} y={h * 0.81} fontSize="18" textAnchor="middle" fill={open ? '#5cf2c2' : '#ff5470'} fontFamily="monospace">{open ? 'ONLINE' : 'OFFLINE'}</text>
  </g>
);

const drone: Art = ({ w, h, t }) => (
  <g>
    <rect x={w * 0.1} y={h * 0.75} width={w * 0.8} height={h * 0.25} rx="6" fill={t.metalDark} />
    <rect x={w * 0.35} y={h * 0.35} width={w * 0.3} height={h * 0.25} rx="8" fill={t.metal} />
    {[0.12, 0.88].map((p) => <g key={p}><line x1={w / 2} y1={h * 0.45} x2={w * p} y2={h * 0.3} stroke={t.metal} strokeWidth="5" /><ellipse cx={w * p} cy={h * 0.27} rx={w * 0.14} ry={h * 0.04} fill={t.accent} opacity="0.6" /></g>)}
    <circle cx={w / 2} cy={h * 0.48} r="5" fill={t.accent} />
  </g>
);

const emergencyExit: Art = ({ w, h, t, open }) => (
  <g>
    {labDoor({ w, h, t, open })}
    <rect x={w * 0.15} y="-46" width={w * 0.7} height="40" rx="4" fill="#1e9e4a" />
    <text x={w / 2} y="-18" fontSize="22" textAnchor="middle" fill="#fff" fontWeight="800">🏃 EXIT</text>
  </g>
);

/* ---------- ogólne (edytor) ---------- */
const safe: Art = ({ w, h, t, open }) => (
  <g>
    <rect width={w} height={h} rx="8" fill={u('metal', t)} stroke="#222" strokeWidth="4" />
    {open ? <rect x="14" y="14" width={w - 28} height={h - 28} fill="#1a1a1a" /> : <Dial cx={w / 2} cy={h / 2} r={Math.min(w, h) * 0.25} t={t} />}
    <rect x={w - 20} y={h * 0.3} width="8" height={h * 0.4} rx="3" fill="#222" />
  </g>
);

const note: Art = ({ w, h, t }) => (
  <g transform={`rotate(-4 ${w / 2} ${h / 2})`}>
    <rect width={w} height={h} fill={u('paper', t)} stroke="#b9a77a" />
    {Array.from({ length: 4 }, (_, i) => <line key={i} x1="10" y1={h * 0.25 + i * (h * 0.17)} x2={w - 10} y2={h * 0.25 + i * (h * 0.17)} stroke="#7a6a50" strokeWidth="2" />)}
  </g>
);

const switchArt: Art = ({ w, h, t, open }) => (
  <g>
    <rect width={w} height={h} rx="6" fill={t.metalDark} />
    <rect x={w * 0.3} y={h * 0.15} width={w * 0.4} height={h * 0.7} rx="6" fill="#111" />
    <rect x={w * 0.34} y={open ? h * 0.18 : h * 0.5} width={w * 0.32} height={h * 0.3} rx="4" fill={open ? '#2ecc71' : '#c0392b'} />
  </g>
);

export const ART: Record<string, Art> = {
  chalkboard, clock, poster, window: windowArt, backpack, desk, bin, door, door_side: doorSide, door_card: doorCard,
  corkboard, calendar, computer, plant, locker, shelf, bookshelf, painting_shapes: paintingShapes, open_book: openBook,
  globe, chest, lamp, hatch, fusebox, archive, wall_symbols: wallSymbols, photo, crate, stairs, exit_dials: exitDials,
  stone_gate: stoneGate, statue, torch, clay_tablet: clayTablet, urn, mosaic, stone_door_dials: stoneDoorDials, niche,
  hieroglyph_wall: hieroglyphWall, papyrus, egypt_chest: egyptChest, balance, passage_side: passageSide, scarab_door: scarabDoor,
  shapes_wall: shapesWall, inscription, pyramid_model: pyramidModel, brazier, floor_tiles: floorTiles, sarcophagus,
  sun_door: sunDoor, treasure, starmap, hourglass, altar, statue_gold: statueGold, sun_gate: sunGate,
  whiteboard, notebook, microscope, beakers, reagent_cabinet: reagentCabinet, robot, extinguisher, lab_door: labDoor,
  lab_door_code: labDoorCode, server, terminal_off: terminalOff, terminal, monitor_table: monitorTable, printer, mug,
  box_shelf: boxShelf, clipboard, container, toolbox, floor_scale: floorScale, fuse_panel: fusePanel, calibration,
  screen_chart: screenChart, facility_map: facilityMap, logbook, console: consoleArt, drone, emergency_exit: emergencyExit,
  safe, note, switch: switchArt,
};

/** Grafiki dostępne w edytorze (nazwy po polsku) */
export const ART_LABELS: Record<string, string> = {
  get door() { return tx('Drzwi', 'Door'); }, get door_side() { return tx('Drzwi boczne (powrót)', 'Side door (back)'); }, get door_card() { return tx('Drzwi z czytnikiem', 'Door with card reader'); }, get lab_door() { return tx('Drzwi automatyczne', 'Automatic door'); }, get exit_dials() { return tx('Wyjście z pokrętłami', 'Exit with dials'); },
  get emergency_exit() { return tx('Wyjście ewakuacyjne', 'Emergency exit'); }, get sun_gate() { return tx('Brama Słońca', 'Sun Gate'); }, get stone_door_dials() { return tx('Kamienne przejście', 'Stone passage'); }, get hatch() { return tx('Klapa w podłodze', 'Floor hatch'); },
  get chalkboard() { return tx('Tablica kredowa', 'Chalkboard'); }, get whiteboard() { return tx('Tablica biała', 'Whiteboard'); }, get corkboard() { return tx('Tablica korkowa', 'Corkboard'); }, get clock() { return tx('Zegar', 'Clock'); }, get poster() { return tx('Plakat', 'Poster'); }, get calendar() { return tx('Kalendarz', 'Calendar'); },
  get painting_shapes() { return tx('Obraz z figurami', 'Painting with shapes'); }, get photo() { return tx('Zdjęcie', 'Photo'); }, get window() { return tx('Okno', 'Window'); }, get desk() { return tx('Biurko z szufladą', 'Desk with drawer'); }, get chest() { return tx('Kufer', 'Trunk'); }, get egypt_chest() { return tx('Skrzynia egipska', 'Egyptian chest'); },
  get safe() { return tx('Sejf', 'Safe'); }, get locker() { return tx('Szafka', 'Locker'); }, get reagent_cabinet() { return tx('Szafka przeszklona', 'Glass cabinet'); }, get bookshelf() { return tx('Regał z książkami', 'Bookcase'); }, get shelf() { return tx('Regał', 'Shelf'); }, get box_shelf() { return tx('Regał z pudłami', 'Shelf with boxes'); },
  get open_book() { return tx('Otwarta księga', 'Open book'); }, get note() { return tx('Notatka', 'Note'); }, get notebook() { return tx('Notatnik', 'Notebook'); }, get clipboard() { return tx('Podkładka z listą', 'Clipboard'); }, get papyrus() { return tx('Papirus', 'Papyrus'); }, get clay_tablet() { return tx('Gliniana tabliczka', 'Clay tablet'); },
  get computer() { return tx('Komputer', 'Computer'); }, get terminal() { return tx('Terminal', 'Terminal'); }, get monitor_table() { return tx('Monitor z tabelą', 'Monitor with table'); }, get screen_chart() { return tx('Ekran z wykresem', 'Chart screen'); }, get printer() { return tx('Drukarka', 'Printer'); },
  get server() { return tx('Szafa serwerowa', 'Server rack'); }, get console() { return tx('Konsola z pokrętłami', 'Console with dials'); }, get calibration() { return tx('Panel połączeń', 'Connection panel'); }, get fusebox() { return tx('Skrzynka bezpieczników', 'Fuse box'); }, get fuse_panel() { return tx('Panel zasilania', 'Power panel'); },
  get switch() { return tx('Przełącznik', 'Switch'); }, get globe() { return tx('Globus', 'Globe'); }, get lamp() { return tx('Lampa', 'Lamp'); }, get plant() { return tx('Roślina', 'Plant'); }, get backpack() { return tx('Plecak', 'Backpack'); }, get bin() { return tx('Kosz', 'Bin'); }, get crate() { return tx('Skrzynia drewniana', 'Wooden crate'); }, get toolbox() { return tx('Skrzynka narzędziowa', 'Toolbox'); },
  get statue() { return tx('Posąg', 'Statue'); }, get statue_gold() { return tx('Złoty posąg', 'Golden statue'); }, get torch() { return tx('Pochodnia', 'Torch'); }, get urn() { return tx('Urna', 'Urn'); }, get mosaic() { return tx('Mozaika', 'Mosaic'); }, get hieroglyph_wall() { return tx('Ściana z hieroglifami', 'Hieroglyph wall'); }, get inscription() { return tx('Inskrypcja', 'Inscription'); },
  get pyramid_model() { return tx('Model piramidy', 'Pyramid model'); }, get sarcophagus() { return tx('Sarkofag', 'Sarcophagus'); }, get altar() { return tx('Ołtarz', 'Altar'); }, get treasure() { return tx('Skarb', 'Treasure'); }, get starmap() { return tx('Mapa gwiazd', 'Star map'); }, get hourglass() { return tx('Klepsydra', 'Hourglass'); }, get balance() { return tx('Waga szalkowa', 'Balance scale'); },
  get microscope() { return tx('Mikroskop', 'Microscope'); }, get beakers() { return tx('Zlewki', 'Beakers'); }, get robot() { return tx('Robot', 'Robot'); }, get drone() { return tx('Dron', 'Drone'); }, get mug() { return tx('Kubek', 'Mug'); }, get container() { return tx('Kontener', 'Container'); }, get floor_scale() { return tx('Waga', 'Scale'); }, get facility_map() { return tx('Mapa obiektu', 'Facility map'); }, get logbook() { return tx('Tablet', 'Tablet'); },
  get wall_symbols() { return tx('Symbole na ścianie', 'Wall symbols'); }, get stairs() { return tx('Schody', 'Stairs'); }, get archive() { return tx('Szafa archiwalna', 'Archive cabinet'); }, get extinguisher() { return tx('Gaśnica', 'Fire extinguisher'); },
};

/** Obiekty płaskie na ścianie (bez cienia rzucanego na podłogę) */
export const FLAT_ART = new Set(['poster', 'calendar', 'wall_symbols', 'inscription', 'mosaic', 'floor_tiles', 'hieroglyph_wall', 'starmap', 'facility_map', 'door_side', 'passage_side', 'hatch', 'corkboard']);
