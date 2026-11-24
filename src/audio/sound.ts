/* Subtelne efekty dźwiękowe generowane Web Audio API – bez plików audio. */
import type { SoundName } from '../engine/game';

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) { muted = m; }

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.08) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function noise(start: number, dur: number, vol = 0.05, freq = 600) {
  const c = ac();
  if (!c) return;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = freq;
  const g = c.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(c.destination);
  src.start(c.currentTime + start);
}

export function play(name: SoundName) {
  if (muted) return;
  switch (name) {
    case 'click': tone(660, 0, 0.06, 'triangle', 0.04); break;
    case 'success': [523, 659, 784].forEach((f, i) => tone(f, i * 0.08, 0.25, 'triangle', 0.07)); break;
    case 'error': tone(196, 0, 0.18, 'sine', 0.07); tone(165, 0.1, 0.22, 'sine', 0.06); break;
    case 'unlock': noise(0, 0.08, 0.08, 1800); tone(880, 0.06, 0.12, 'square', 0.03); break;
    case 'pickup': [880, 1175, 1568].forEach((f, i) => tone(f, i * 0.05, 0.15, 'sine', 0.05)); break;
    case 'hint': tone(740, 0, 0.12, 'sine', 0.05); tone(988, 0.1, 0.18, 'sine', 0.05); break;
    case 'door': noise(0, 0.5, 0.06, 400); tone(110, 0, 0.4, 'sine', 0.05); break;
    case 'secret': [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, i * 0.06, 0.2, 'sine', 0.04)); break;
    case 'win': [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle', 0.07)); break;
  }
}
