/* Tła pomieszczeń rysowane w SVG (scena 1600 × 900). */
import type { ReactNode } from 'react';
import type { Theme } from './themes';

const W = 1600;
const H = 900;
const HORIZON = 640;

/** Wspólne definicje gradientów dla motywu */
export function ThemeDefs({ t }: { t: Theme }) {
  const id = t.id;
  return (
    <defs>
      <linearGradient id={`wall-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={t.wallTop} />
        <stop offset="1" stopColor={t.wallBottom} />
      </linearGradient>
      <linearGradient id={`floor-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={t.floorFar} />
        <stop offset="1" stopColor={t.floorNear} />
      </linearGradient>
      <linearGradient id={`wood-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={t.woodLight} />
        <stop offset="0.5" stopColor={t.wood} />
        <stop offset="1" stopColor={t.woodDark} />
      </linearGradient>
      <linearGradient id={`woodh-${id}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={t.woodDark} />
        <stop offset="0.5" stopColor={t.wood} />
        <stop offset="1" stopColor={t.woodDark} />
      </linearGradient>
      <linearGradient id={`metal-${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={t.metal} />
        <stop offset="0.55" stopColor={t.metalDark} />
        <stop offset="1" stopColor={t.metal} />
      </linearGradient>
      <linearGradient id={`stone-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={t.stone} />
        <stop offset="1" stopColor={t.stoneDark} />
      </linearGradient>
      <linearGradient id={`gold-${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff1b0" />
        <stop offset="0.4" stopColor={t.gold} />
        <stop offset="1" stopColor="#8a6a1c" />
      </linearGradient>
      <linearGradient id={`screen-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={t.screen} stopOpacity="0.95" />
        <stop offset="1" stopColor={t.screen} stopOpacity="0.55" />
      </linearGradient>
      <linearGradient id={`paper-${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fffaf0" />
        <stop offset="1" stopColor={t.paper} />
      </linearGradient>
      <radialGradient id={`glow-${id}`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor={t.glow} stopOpacity="0.55" />
        <stop offset="1" stopColor={t.glow} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`vignette-${id}`} cx="0.5" cy="0.45" r="0.75">
        <stop offset="0.55" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.65" />
      </radialGradient>
      <radialGradient id={`dark-${id}`} cx="0.5" cy="0.55" r="0.6">
        <stop offset="0" stopColor="#000" stopOpacity="0.35" />
        <stop offset="1" stopColor="#000" stopOpacity="0.88" />
      </radialGradient>
      <filter id={`shadow-${id}`} x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#000" floodOpacity="0.45" />
      </filter>
      <clipPath id="scene-clip"><rect x="0" y="0" width={W} height={H} /></clipPath>
      <filter id="hotspot-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="6" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  );
}

function Shell({ t, children, floor }: { t: Theme; children?: ReactNode; floor?: ReactNode }) {
  return (
    <g>
      <rect x="0" y="0" width={W} height={HORIZON} fill={`url(#wall-${t.id})`} />
      <rect x="0" y={HORIZON} width={W} height={H - HORIZON} fill={`url(#floor-${t.id})`} />
      {floor}
      <rect x="0" y={HORIZON - 14} width={W} height="16" fill={t.trim} />
      <rect x="0" y="0" width={W} height="24" fill={t.trim} opacity="0.8" />
      {children}
    </g>
  );
}

function Planks({ t }: { t: Theme }) {
  const lines: ReactNode[] = [];
  for (let i = -12; i <= 12; i++) {
    lines.push(<line key={i} x1={800 + i * 70} y1={HORIZON} x2={800 + i * 190} y2={H} stroke={t.floorLine} strokeWidth="3" opacity="0.6" />);
  }
  for (let j = 0; j < 5; j++) {
    const y = HORIZON + 20 + j * j * 12 + j * 22;
    lines.push(<line key={'h' + j} x1="0" y1={y} x2={W} y2={y} stroke={t.floorLine} strokeWidth="2" opacity="0.35" />);
  }
  return <g>{lines}</g>;
}

function Tiles({ t, step = 110 }: { t: Theme; step?: number }) {
  const lines: ReactNode[] = [];
  for (let i = -10; i <= 10; i++) lines.push(<line key={i} x1={800 + i * step * 0.6} y1={HORIZON} x2={800 + i * step * 1.8} y2={H} stroke={t.floorLine} strokeWidth="2" opacity="0.7" />);
  [16, 44, 82, 132, 196].forEach((d, j) => lines.push(<line key={'h' + j} x1="0" y1={HORIZON + d} x2={W} y2={HORIZON + d} stroke={t.floorLine} strokeWidth="2" opacity="0.7" />));
  return <g>{lines}</g>;
}

function Bricks({ t, y0 = 24, y1 = HORIZON - 14, bw = 120, bh = 46, opacity = 0.35 }: { t: Theme; y0?: number; y1?: number; bw?: number; bh?: number; opacity?: number }) {
  const out: ReactNode[] = [];
  let row = 0;
  for (let y = y0; y < y1; y += bh) {
    const off = row % 2 ? bw / 2 : 0;
    out.push(<line key={'r' + y} x1="0" y1={y} x2={W} y2={y} stroke={t.stoneDark} strokeWidth="3" opacity={opacity} />);
    for (let x = -off; x < W; x += bw) out.push(<line key={`${y}-${x}`} x1={x} y1={y} x2={x} y2={Math.min(y + bh, y1)} stroke={t.stoneDark} strokeWidth="3" opacity={opacity} />);
    row++;
  }
  return <g>{out}</g>;
}

function CeilingLamp({ x, t, on = true }: { x: number; t: Theme; on?: boolean }) {
  return (
    <g>
      <line x1={x} y1="0" x2={x} y2="60" stroke="#222" strokeWidth="3" />
      <path d={`M${x - 50},90 L${x - 22},58 L${x + 22},58 L${x + 50},90 Z`} fill={t.metalDark} />
      {on && <ellipse cx={x} cy="150" rx="260" ry="190" fill={`url(#glow-${t.id})`} />}
      <ellipse cx={x} cy="92" rx="50" ry="8" fill={on ? t.glow : '#333'} opacity={on ? 0.9 : 0.6} />
    </g>
  );
}

function SchoolDesk({ x, y, s = 1, t }: { x: number; y: number; s?: number; t: Theme }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} filter={`url(#shadow-${t.id})`}>
      <rect x="0" y="0" width="220" height="22" rx="4" fill={`url(#wood-${t.id})`} />
      <rect x="10" y="22" width="14" height="90" fill={t.metalDark} />
      <rect x="196" y="22" width="14" height="90" fill={t.metalDark} />
      <rect x="20" y="50" width="180" height="10" fill={t.metalDark} opacity="0.7" />
    </g>
  );
}

function Rug({ x, y, w, h, color, border }: { x: number; y: number; w: number; h: number; color: string; border: string }) {
  return (
    <g>
      <path d={`M${x + w * 0.12},${y} L${x + w * 0.88},${y} L${x + w},${y + h} L${x},${y + h} Z`} fill={color} opacity="0.9" />
      <path d={`M${x + w * 0.16},${y + 8} L${x + w * 0.84},${y + 8} L${x + w - 16},${y + h - 10} L${x + 16},${y + h - 10} Z`} fill="none" stroke={border} strokeWidth="5" opacity="0.8" />
    </g>
  );
}

function Hieroglyphs({ x, y, w, rows = 1, color, size = 34 }: { x: number; y: number; w: number; rows?: number; color: string; size?: number }) {
  const glyphs = ['M0,0 h10 v20 h-10 z', 'M0,20 Q10,-6 20,20', 'M10,0 a10,10 0 1,0 0.1,0', 'M0,10 h20 M10,0 v20', 'M0,20 L10,0 L20,20 Z', 'M0,5 q10,-10 20,0 q-10,20 -20,0'];
  const out: ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let i = 0; i * size < w; i++) {
      const g = glyphs[(i * 7 + r * 3) % glyphs.length];
      out.push(<path key={`${r}-${i}`} d={g} transform={`translate(${x + i * size + 6},${y + r * size * 1.3 + 6}) scale(${size / 30})`} fill="none" stroke={color} strokeWidth="2.4" opacity="0.6" />);
    }
  }
  return <g>{out}</g>;
}

function Column({ x, t, h = HORIZON - 24 }: { x: number; t: Theme; h?: number }) {
  return (
    <g>
      <rect x={x} y={24} width="90" height={h} fill={`url(#stone-${t.id})`} />
      <rect x={x - 12} y={24} width="114" height="34" fill={t.stoneDark} />
      <rect x={x - 12} y={h - 10} width="114" height="30" fill={t.stoneDark} />
      {[0, 1, 2].map((i) => <line key={i} x1={x + 22 + i * 23} y1={60} x2={x + 22 + i * 23} y2={h - 12} stroke={t.stoneDark} strokeWidth="4" opacity="0.5" />)}
    </g>
  );
}

function LabPanels({ t }: { t: Theme }) {
  const out: ReactNode[] = [];
  for (let x = 0; x < W; x += 200) {
    out.push(<rect key={x} x={x + 6} y="40" width="188" height="420" rx="6" fill={t.wallTop} stroke={t.floorLine} strokeWidth="2" opacity="0.9" />);
    out.push(<rect key={'b' + x} x={x + 6} y="470" width="188" height="150" rx="6" fill={t.wallBottom} stroke={t.floorLine} strokeWidth="2" />);
  }
  return <g>{out}</g>;
}

function NeonStrip({ y, t, color }: { y: number; t: Theme; color?: string }) {
  return (
    <g>
      <rect x="0" y={y} width={W} height="6" fill={color ?? t.accent} opacity="0.9" />
      <rect x="0" y={y - 10} width={W} height="26" fill={color ?? t.accent} opacity="0.12" />
    </g>
  );
}

function Pipes({ t }: { t: Theme }) {
  return (
    <g opacity="0.9">
      <rect x="0" y="40" width={W} height="22" fill={t.metalDark} />
      <rect x="0" y="72" width={W} height="12" fill={t.metal} opacity="0.5" />
      {[200, 520, 900, 1280].map((x) => <rect key={x} x={x} y="34" width="26" height="56" rx="4" fill={t.metal} />)}
    </g>
  );
}

function Shelves({ x, y, w, h, t, color }: { x: number; y: number; w: number; h: number; t: Theme; color: string[] }) {
  const out: ReactNode[] = [];
  const rows = 5;
  for (let r = 0; r < rows; r++) {
    const yy = y + (r * h) / rows;
    out.push(<rect key={'s' + r} x={x} y={yy + h / rows - 10} width={w} height="10" fill={t.woodDark} />);
    let cx = x + 6;
    let i = 0;
    while (cx < x + w - 20) {
      const bw = 14 + ((r * 13 + i * 7) % 12);
      const bh = h / rows - 22 - ((i * 5 + r) % 14);
      out.push(<rect key={`${r}-${i}`} x={cx} y={yy + h / rows - 10 - bh} width={bw} height={bh} fill={color[(i + r) % color.length]} opacity="0.85" />);
      cx += bw + 2;
      i++;
    }
  }
  return <g><rect x={x - 10} y={y - 10} width={w + 20} height={h + 10} fill={t.woodDark} opacity="0.85" />{out}</g>;
}

/* ------------------------------- Warianty ------------------------------- */

const BACKGROUNDS: Record<string, (t: Theme) => ReactNode> = {
  classroom: (t) => (
    <Shell t={t} floor={<Planks t={t} />}>
      <rect x="0" y="420" width={W} height="206" fill={`url(#woodh-${t.id})`} opacity="0.85" />
      <rect x="0" y="414" width={W} height="10" fill={t.woodDark} />
      <CeilingLamp x={420} t={t} />
      <CeilingLamp x={1180} t={t} />
      <SchoolDesk x={60} y={650} s={1.15} t={t} />
      <SchoolDesk x={1060} y={760} s={0.9} t={t} />
      <rect x="1100" y="30" width="220" height="12" fill={t.woodDark} opacity="0.6" />
    </Shell>
  ),
  staffroom: (t) => (
    <Shell t={t} floor={<><Planks t={t} /><Rug x={420} y={700} w={700} h={170} color="#6b2b2b" border="#d9b45a" /></>}>
      {Array.from({ length: 32 }, (_, i) => <rect key={i} x={i * 50} y="24" width="22" height="602" fill="#000" opacity="0.05" />)}
      <rect x="0" y="470" width={W} height="156" fill={t.woodDark} opacity="0.5" />
      <CeilingLamp x={800} t={t} />
      {/* stół */}
      <g filter={`url(#shadow-${t.id})`}>
        <rect x="490" y="550" width="400" height="26" rx="4" fill={`url(#wood-${t.id})`} />
        <rect x="510" y="576" width="18" height="150" fill={t.woodDark} />
        <rect x="852" y="576" width="18" height="150" fill={t.woodDark} />
      </g>
      <rect x="1180" y="660" width="110" height="20" rx="8" fill={t.wood} />
    </Shell>
  ),
  library: (t) => (
    <Shell t={t} floor={<><Planks t={t} /><Rug x={520} y={710} w={640} h={160} color="#2e3f5a" border="#c8a24e" /></>}>
      <rect x="0" y="24" width={W} height="602" fill="#3b1f17" opacity="0.45" />
      <Shelves x={980} y={70} w={360} h={250} t={t} color={['#7a2e2e', '#2e5a3d', '#2e4a7a', '#8a6a2e', '#5a2e6a']} />
      <CeilingLamp x={850} t={t} />
      {/* pulpit pod kronikę */}
      <g filter={`url(#shadow-${t.id})`}>
        <rect x="700" y="680" width="340" height="22" rx="4" fill={`url(#wood-${t.id})`} />
        <rect x="720" y="702" width="16" height="120" fill={t.woodDark} />
        <rect x="1004" y="702" width="16" height="120" fill={t.woodDark} />
      </g>
    </Shell>
  ),
  basement: (t) => (
    <Shell t={{ ...t, wallTop: '#4a4a48', wallBottom: '#353533' }} floor={<Tiles t={t} step={140} />}>
      <rect x="0" y="24" width={W} height="602" fill="#3a3a38" />
      <Bricks t={t} opacity={0.5} />
      <Pipes t={t} />
      <CeilingLamp x={700} t={t} />
      <rect x="0" y={HORIZON} width={W} height={H - HORIZON} fill="#2b2b29" opacity="0.6" />
    </Shell>
  ),
  egypt_entrance: (t) => (
    <Shell t={t} floor={<Tiles t={t} step={130} />}>
      <Bricks t={t} bw={160} bh={70} opacity={0.4} />
      <rect x="0" y="40" width={W} height="60" fill={t.stoneDark} opacity="0.6" />
      <Hieroglyphs x={0} y={46} w={W} color={t.ink} />
      <Column x={1120} t={t} />
      <ellipse cx="730" cy="260" rx="300" ry="260" fill={`url(#glow-${t.id})`} />
      <path d="M0,640 L1600,640 L1600,700 Q800,660 0,700 Z" fill="#d9b26f" opacity="0.25" />
    </Shell>
  ),
  egypt_hieroglyphs: (t) => (
    <Shell t={{ ...t, wallTop: '#8f6a3e', wallBottom: '#6a4b27' }} floor={<Tiles t={t} step={130} />}>
      <Bricks t={t} bw={180} bh={80} opacity={0.35} />
      <Hieroglyphs x={500} y={590} w={600} color={t.ink} size={26} />
      <rect x="0" y="40" width={W} height="50" fill={t.stoneDark} opacity="0.6" />
      <Hieroglyphs x={0} y={44} w={W} color={t.gold} size={30} />
    </Shell>
  ),
  egypt_geometry: (t) => (
    <Shell t={t} floor={<Tiles t={t} step={120} />}>
      <Bricks t={t} bw={160} bh={70} opacity={0.3} />
      {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${i * 100},100 l50,-60 l50,60 Z`} fill={i % 2 ? t.gold : t.stoneDark} opacity="0.35" />)}
      <Column x={1180} t={t} />
      <ellipse cx="1035" cy="260" rx="200" ry="200" fill={`url(#glow-${t.id})`} />
    </Shell>
  ),
  egypt_treasure: (t) => (
    <Shell t={{ ...t, wallTop: '#a77a3f', wallBottom: '#7a5328' }} floor={<Tiles t={t} step={130} />}>
      <Bricks t={t} bw={160} bh={70} opacity={0.3} />
      <ellipse cx="800" cy="420" rx="760" ry="420" fill={`url(#glow-${t.id})`} opacity="0.8" />
      <rect x="0" y="40" width={W} height="50" fill={t.stoneDark} opacity="0.6" />
      <Hieroglyphs x={0} y={44} w={W} color={t.gold} size={30} />
      {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={60 + ((i * 197) % 1500)} cy={700 + ((i * 53) % 170)} r={6 + (i % 4)} fill={t.gold} opacity="0.7" />)}
    </Shell>
  ),
  lab_main: (t) => (
    <Shell t={t} floor={<Tiles t={t} step={120} />}>
      <LabPanels t={t} />
      <NeonStrip y={30} t={t} />
      <rect x="0" y="0" width={W} height={HORIZON} fill="#ff2040" opacity="0.06" />
      <circle cx="800" cy="60" r="18" fill="#ff5470" />
      <circle cx="800" cy="60" r="60" fill="#ff5470" opacity="0.18" />
      {/* stół laboratoryjny */}
      <g filter={`url(#shadow-${t.id})`}>
        <rect x="270" y="575" width="800" height="28" rx="4" fill={t.metal} />
        <rect x="290" y="603" width="760" height="150" fill={t.metalDark} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={300 + i * 190} y={615} width="175" height="125" rx="4" fill={t.wood} stroke={t.metal} strokeWidth="2" />)}
      </g>
    </Shell>
  ),
  lab_computers: (t) => (
    <Shell t={t} floor={<Tiles t={t} step={110} />}>
      <LabPanels t={t} />
      <NeonStrip y={30} t={t} color="#5cf2c2" />
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={380 + i * 120} y="20" width="6" height="140" fill={t.metalDark} />)}
      <g filter={`url(#shadow-${t.id})`}>
        <rect x="400" y="455" width="380" height="20" rx="4" fill={t.metal} />
        <rect x="420" y="475" width="14" height="240" fill={t.metalDark} />
        <rect x="746" y="475" width="14" height="240" fill={t.metalDark} />
        <rect x="660" y="640" width="400" height="20" rx="4" fill={t.metal} />
        <rect x="680" y="660" width="14" height="130" fill={t.metalDark} />
        <rect x="1026" y="660" width="14" height="130" fill={t.metalDark} />
        <rect x="900" y="390" width="360" height="16" rx="4" fill={t.metal} opacity="0" />
      </g>
    </Shell>
  ),
  lab_storage: (t) => (
    <Shell t={{ ...t, wallTop: '#2a3340', wallBottom: '#202833' }} floor={<Tiles t={t} step={150} />}>
      <Bricks t={{ ...t, stoneDark: '#151c26' }} bw={200} bh={100} opacity={0.6} />
      <NeonStrip y={30} t={t} color="#ffd166" />
      {Array.from({ length: 20 }, (_, i) => <path key={i} d={`M${i * 80},${HORIZON + 4} l40,0 l-30,30 l-40,0 Z`} fill={i % 2 ? '#ffd166' : '#111'} opacity="0.75" />)}
    </Shell>
  ),
  lab_control: (t) => (
    <Shell t={t} floor={<Tiles t={t} step={120} />}>
      <rect x="0" y="24" width={W} height="602" fill="#0b1422" />
      {Array.from({ length: 7 }, (_, i) => (
        <g key={i}>
          <rect x={20 + i * 225} y="40" width="210" height="560" fill="#0f2238" stroke={t.metalDark} strokeWidth="6" />
          {Array.from({ length: 12 }, (_, j) => <circle key={j} cx={40 + i * 225 + ((j * 67) % 180)} cy={60 + ((j * 131 + i * 40) % 300)} r={1.5} fill="#fff" opacity="0.7" />)}
        </g>
      ))}
      <NeonStrip y={30} t={t} />
      <NeonStrip y={612} t={t} color="#5cf2c2" />
    </Shell>
  ),
  bank_hall: (t) => (
    <Shell t={t} floor={<Tiles t={t} step={160} />}>
      {[160, 600, 1040, 1440].map((x) => <Column key={x} x={x} t={{ ...t, stone: '#e8e2d4', stoneDark: '#b8b0a0' }} />)}
      <rect x="0" y="40" width={W} height="20" fill={t.gold} opacity="0.7" />
      <CeilingLamp x={800} t={t} />
    </Shell>
  ),
  space_module: (t) => (
    <Shell t={t} floor={<Tiles t={t} step={100} />}>
      <LabPanels t={t} />
      <circle cx="800" cy="300" r="190" fill="#04060c" stroke={t.metal} strokeWidth="16" />
      {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={630 + ((i * 97) % 340)} cy={130 + ((i * 61) % 340)} r={1.6} fill="#fff" opacity={0.8} />)}
      <circle cx="740" cy="360" r="70" fill="#2a6fd6" opacity="0.85" />
      <NeonStrip y={30} t={t} />
    </Shell>
  ),
  city_square: (t) => (
    <Shell t={t} floor={<Tiles t={t} step={140} />}>
      <Bricks t={t} bw={160} bh={70} opacity={0.35} />
      {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${i * 120 + 20},620 q20,-${60 + (i % 3) * 30} 40,0`} fill="#3d6b3a" opacity="0.6" />)}
      <Column x={300} t={t} />
      <Column x={1220} t={t} />
    </Shell>
  ),
};

export function Background({ variant, t }: { variant: string; t: Theme }) {
  const fn = BACKGROUNDS[variant] ?? BACKGROUNDS.classroom;
  return <g clipPath="url(#scene-clip)">{fn(t)}</g>;
}

export function SceneOverlay({ t, dark }: { t: Theme; dark: boolean }) {
  return (
    <g pointerEvents="none">
      <rect x="0" y="0" width={W} height={H} fill={`url(#vignette-${t.id})`} />
      {dark && <rect x="0" y="0" width={W} height={H} fill={`url(#dark-${t.id})`} className="darkness" />}
    </g>
  );
}
