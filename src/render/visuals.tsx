import { fmtNum, tx } from '../i18n';
/* Wizualizacje do zagadek i wskazówek: wykresy, tabele, figury, zegar, liczby egipskie. */
import type { ReactNode } from 'react';
import type { ShapeSpec, Visual } from '../types';

const fmt = (n: number) => fmtNum(n);

export function ShapeIcon({ id, size = 40, color = 'currentColor' }: { id: string; size?: number; color?: string }) {
  const s = size;
  const c = s / 2;
  const poly = (n: number, rot = -Math.PI / 2) =>
    Array.from({ length: n }, (_, i) => {
      const a = rot + (i * 2 * Math.PI) / n;
      return `${c + Math.cos(a) * c * 0.85},${c + Math.sin(a) * c * 0.85}`;
    }).join(' ');
  let el: ReactNode;
  switch (id) {
    case 'tri': el = <polygon points={poly(3)} />; break;
    case 'sq': el = <rect x={s * 0.15} y={s * 0.15} width={s * 0.7} height={s * 0.7} />; break;
    case 'pent': el = <polygon points={poly(5)} />; break;
    case 'hex': el = <polygon points={poly(6, 0)} />; break;
    case 'circ': el = <circle cx={c} cy={c} r={c * 0.8} />; break;
    default: return <span style={{ fontSize: size * 0.8, lineHeight: 1 }}>{id}</span>;
  }
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-label={SHAPE_NAMES[id] ?? id} role="img">
      <g fill="none" stroke={color} strokeWidth={s / 14} strokeLinejoin="round">{el}</g>
    </svg>
  );
}

export const SHAPE_NAMES: Record<string, string> = {
  get tri() { return tx('trójkąt', 'triangle'); }, get sq() { return tx('kwadrat', 'square'); }, get pent() { return tx('pięciokąt', 'pentagon'); },
  get hex() { return tx('sześciokąt', 'hexagon'); }, get circ() { return tx('koło', 'circle'); },
};

function Bars({ v }: { v: Extract<Visual, { type: 'bars' }> }) {
  const W = 520, H = 280, pad = 46;
  const max = Math.max(...v.values) * 1.15;
  const bw = (W - pad * 2) / v.values.length;
  const ticks = 5;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="viz" role="img" aria-label={v.title ?? tx('wykres słupkowy', 'bar chart')}>
      {v.title && <text x={W / 2} y="18" textAnchor="middle" className="viz-title">{v.title}</text>}
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const val = (max / ticks) * i;
        const y = H - pad - ((H - pad * 2) * i) / ticks;
        return <g key={i}><line x1={pad} y1={y} x2={W - 10} y2={y} className="viz-grid" /><text x={pad - 6} y={y + 4} textAnchor="end" className="viz-tick">{Math.round(val)}</text></g>;
      })}
      {v.values.map((val, i) => {
        const h = ((H - pad * 2) * val) / max;
        return (
          <g key={i}>
            <rect x={pad + i * bw + bw * 0.15} y={H - pad - h} width={bw * 0.7} height={h} className="viz-bar" rx="3" />
            <text x={pad + i * bw + bw / 2} y={H - pad - h - 6} textAnchor="middle" className="viz-val">{fmt(val)}</text>
            <text x={pad + i * bw + bw / 2} y={H - pad + 18} textAnchor="middle" className="viz-tick">{v.labels[i]}</text>
          </g>
        );
      })}
      <line x1={pad} y1={H - pad} x2={W - 10} y2={H - pad} className="viz-axis" />
      {v.unit && <text x={pad - 6} y={pad - 14} textAnchor="end" className="viz-tick">[{v.unit}]</text>}
    </svg>
  );
}

function niceStep(range: number): number {
  const raw = range / 8;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p;
}

function Line({ v }: { v: Extract<Visual, { type: 'line' }> }) {
  const W = 520, H = 320, pad = 50;
  const xs = v.points.map((p) => p[0]);
  const ys = v.points.map((p) => p[1]);
  const [x0, x1] = v.xRange ?? [Math.min(...xs), Math.max(...xs)];
  const [y0, y1] = v.yRange ?? [Math.min(0, ...ys), Math.max(...ys) * 1.1];
  const sx = (x: number) => pad + ((x - x0) / (x1 - x0)) * (W - pad * 1.5);
  const sy = (y: number) => H - pad - ((y - y0) / (y1 - y0)) * (H - pad * 1.6);
  const stx = niceStep(x1 - x0);
  const sty = niceStep(y1 - y0);
  const gx: number[] = [];
  for (let x = Math.ceil(x0 / stx) * stx; x <= x1 + 1e-9; x += stx) gx.push(+x.toFixed(6));
  const gy: number[] = [];
  for (let y = Math.ceil(y0 / sty) * sty; y <= y1 + 1e-9; y += sty) gy.push(+y.toFixed(6));
  let path = v.points.map((p, i) => `${i ? 'L' : 'M'}${sx(p[0])},${sy(p[1])}`).join(' ');
  if (v.extend && v.points.length >= 2) {
    const [a, b] = [v.points[0], v.points[v.points.length - 1]];
    const k = (b[1] - a[1]) / (b[0] - a[0]);
    const f = (x: number) => a[1] + k * (x - a[0]);
    path = `M${sx(x0)},${sy(f(x0))} L${sx(x1)},${sy(f(x1))}`;
  }
  const axisY = y0 <= 0 && y1 >= 0 ? sy(0) : H - pad;
  const axisX = x0 <= 0 && x1 >= 0 ? sx(0) : pad;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="viz" role="img" aria-label={v.title ?? tx('wykres', 'chart')}>
      <defs><clipPath id="plotclip"><rect x={pad} y={pad * 0.6} width={W - pad * 1.5} height={H - pad * 1.6} /></clipPath></defs>
      {v.title && <text x={W / 2} y="18" textAnchor="middle" className="viz-title">{v.title}</text>}
      {(v.grid ?? true) && gx.map((x) => <line key={'gx' + x} x1={sx(x)} y1={sy(y0)} x2={sx(x)} y2={sy(y1)} className="viz-grid" />)}
      {(v.grid ?? true) && gy.map((y) => <line key={'gy' + y} x1={sx(x0)} y1={sy(y)} x2={sx(x1)} y2={sy(y)} className="viz-grid" />)}
      <line x1={pad} y1={axisY} x2={W - pad / 2} y2={axisY} className="viz-axis" />
      <line x1={axisX} y1={sy(y0)} x2={axisX} y2={sy(y1)} className="viz-axis" />
      {gx.map((x) => <text key={'tx' + x} x={sx(x)} y={axisY + 16} textAnchor="middle" className="viz-tick">{fmt(x)}</text>)}
      {gy.map((y) => <text key={'ty' + y} x={axisX - 6} y={sy(y) + 4} textAnchor="end" className="viz-tick">{fmt(y)}</text>)}
      {v.xLabel && <text x={W - pad / 2} y={axisY - 8} textAnchor="end" className="viz-label">{v.xLabel}</text>}
      {v.yLabel && <text x={axisX + 8} y={pad * 0.6 + 4} className="viz-label">{v.yLabel}</text>}
      {(v.connect ?? true) && <path d={path} className="viz-line" clipPath="url(#plotclip)" />}
      {v.points.map((p, i) => <circle key={i} cx={sx(p[0])} cy={sy(p[1])} r="5" className="viz-point" />)}
    </svg>
  );
}

function Table({ v }: { v: Extract<Visual, { type: 'table' }> }) {
  return (
    <div className="viz-table-wrap">
      {v.title && <div className="viz-caption">{v.title}</div>}
      <table className="viz-table">
        <thead><tr>{v.headers.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr></thead>
        <tbody>{v.rows.map((r, i) => <tr key={i}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{typeof c === 'number' ? fmt(c) : c}</td>))}</tr>)}</tbody>
      </table>
    </div>
  );
}

function ShapeFigure({ s }: { s: ShapeSpec }) {
  const W = 150, H = 110;
  let el: ReactNode;
  switch (s.kind) {
    case 'rect': el = <rect x="15" y="25" width="120" height="70" />; break;
    case 'square': el = <rect x="35" y="15" width="80" height="80" />; break;
    case 'triangle': el = <><polygon points="15,95 135,95 60,15" /><line x1="60" y1="15" x2="60" y2="95" strokeDasharray="5 4" /></>; break;
    case 'trapezoid': el = <><polygon points="15,95 135,95 105,25 45,25" /><line x1="75" y1="25" x2="75" y2="95" strokeDasharray="5 4" /></>; break;
    case 'circle': el = <><circle cx="75" cy="55" r="42" /><line x1="75" y1="55" x2="117" y2="55" strokeDasharray="5 4" /></>; break;
    case 'rhombus': el = <><polygon points="75,10 135,55 75,100 15,55" /><line x1="15" y1="55" x2="135" y2="55" strokeDasharray="5 4" /><line x1="75" y1="10" x2="75" y2="100" strokeDasharray="5 4" /></>; break;
    case 'parallelogram': el = <polygon points="15,95 105,95 135,25 45,25" />; break;
    case 'pentagon': el = <polygon points="75,10 135,50 112,100 38,100 15,50" />; break;
    case 'hexagon': el = <polygon points="40,12 110,12 140,55 110,98 40,98 10,55" />; break;
  }
  return (
    <figure className="viz-shape">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${s.label}: ${s.dims.join(', ')}`}>
        <g className="viz-shape-g">{el}</g>
      </svg>
      <figcaption><strong>{s.label}</strong>{s.dims.map((d, i) => <span key={i}>{d}</span>)}</figcaption>
    </figure>
  );
}

function Clock({ h, m }: { h: number; m: number }) {
  const r = 90;
  const ha = ((h % 12) + m / 60) * 30 * (Math.PI / 180);
  const ma = m * 6 * (Math.PI / 180);
  return (
    <svg viewBox="0 0 220 220" className="viz viz-clock" role="img" aria-label={tx('tarcza zegara', 'clock face')}>
      <circle cx="110" cy="110" r={r + 8} className="clock-rim" />
      <circle cx="110" cy="110" r={r} className="clock-face" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return <text key={i} x={110 + Math.sin(a) * (r - 18)} y={110 - Math.cos(a) * (r - 18) + 6} textAnchor="middle" className="clock-num">{i === 0 ? 12 : i}</text>;
      })}
      <line x1="110" y1="110" x2={110 + Math.sin(ha) * 50} y2={110 - Math.cos(ha) * 50} className="clock-h" />
      <line x1="110" y1="110" x2={110 + Math.sin(ma) * 75} y2={110 - Math.cos(ma) * 75} className="clock-m" />
      <circle cx="110" cy="110" r="6" className="clock-pin" />
    </svg>
  );
}

/* Liczby egipskie: kreska 1, pałąk 10, zwój 100, lotos 1000 */
function EgGlyph({ kind, x, y }: { kind: 1 | 10 | 100 | 1000; x: number; y: number }) {
  switch (kind) {
    case 1: return <line x1={x + 6} y1={y} x2={x + 6} y2={y + 36} className="eg" />;
    case 10: return <path d={`M${x},${y + 36} L${x},${y + 14} Q${x + 11},${y - 6} ${x + 22},${y + 14} L${x + 22},${y + 36}`} className="eg" />;
    case 100: return <path d={`M${x + 14},${y + 36} L${x + 14},${y + 20} M${x + 14},${y + 20} a10,10 0 1,1 0.1,0 M${x + 14},${y + 16} a5,5 0 1,1 0.1,0`} className="eg" />;
    case 1000: return <path d={`M${x + 14},${y + 36} L${x + 14},${y + 12} M${x + 14},${y + 12} Q${x},${y + 4} ${x + 4},${y - 4} Q${x + 14},${y + 2} ${x + 14},${y + 12} Q${x + 14},${y + 2} ${x + 24},${y - 4} Q${x + 28},${y + 4} ${x + 14},${y + 12}`} className="eg" />;
  }
}

function egyptGlyphs(n: number): (1 | 10 | 100 | 1000)[] {
  const out: (1 | 10 | 100 | 1000)[] = [];
  for (const v of [1000, 100, 10, 1] as const) {
    const c = Math.floor(n / v) % 10 + (v === 1000 ? Math.floor(n / 10000) * 10 : 0);
    for (let i = 0; i < c; i++) out.push(v);
  }
  return out;
}

function EgyptNumber({ n }: { n: number }) {
  const g = egyptGlyphs(n);
  const step = 30;
  const W = Math.max(60, g.length * step + 20);
  return (
    <svg viewBox={`0 0 ${W} 60`} className="viz-eg" style={{ width: Math.min(W, 520) }} role="img" aria-label={tx('liczba zapisana znakami egipskimi', 'number written in Egyptian numerals')}>
      <rect x="0" y="0" width={W} height="60" rx="8" className="eg-bg" />
      {g.map((k, i) => <EgGlyph key={i} kind={k} x={12 + i * step} y={12} />)}
    </svg>
  );
}

function EgyptLegend() {
  return (
    <div className="eg-legend">
      {([1, 10, 100, 1000] as const).map((k) => (
        <div key={k} className="eg-legend-item">
          <svg viewBox="0 0 40 52" width="40" height="52"><rect width="40" height="52" rx="6" className="eg-bg" /><EgGlyph kind={k} x={7} y={9} /></svg>
          <span>= {k}</span>
          <small>{{ 1: tx('kreska', 'stroke'), 10: tx('pałąk', 'hobble'), 100: tx('zwój liny', 'coil of rope'), 1000: tx('kwiat lotosu', 'lotus flower') }[k]}</small>
        </div>
      ))}
    </div>
  );
}

export function VisualView({ v }: { v: Visual }) {
  switch (v.type) {
    case 'bars': return <Bars v={v} />;
    case 'line': return <Line v={v} />;
    case 'table': return <Table v={v} />;
    case 'shapes': return <div className="viz-shapes">{v.shapes.map((s, i) => <ShapeFigure key={i} s={s} />)}</div>;
    case 'clock': return <Clock h={v.h} m={v.m} />;
    case 'egypt': return <div className="viz-eg-list">{v.numbers.map((n, i) => <EgyptNumber key={i} n={n} />)}</div>;
    case 'egyptLegend': return <EgyptLegend />;
    case 'symbols': return (
      <div className="viz-symbols">
        {v.items.map((s, i) => <span key={i} className="viz-symbol"><ShapeIcon id={s} size={46} /><small>{SHAPE_NAMES[s] ?? ''}</small></span>)}
        {v.caption && <div className="viz-caption">{v.caption}</div>}
      </div>
    );
  }
}
