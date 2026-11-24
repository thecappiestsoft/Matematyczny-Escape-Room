import { tx } from '../i18n';

export type ThemeMode = 'light' | 'dark';

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line key={a} x1="12" y1="2.5" x2="12" y2="4.8" transform={`rotate(${a} 12 12)`} />
      ))}
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1Z" fill="currentColor" />
    </svg>
  );
}

/** Przełącznik motywu jasny / ciemny – dwie ikony */
export function ThemeSwitch({ theme, onChange, big }: { theme: ThemeMode; onChange: (t: ThemeMode) => void; big?: boolean }) {
  const opts: { id: ThemeMode; label: string; icon: JSX.Element }[] = [
    { id: 'light', label: tx('Motyw jasny', 'Light theme'), icon: <SunIcon /> },
    { id: 'dark', label: tx('Motyw ciemny', 'Dark theme'), icon: <MoonIcon /> },
  ];
  return (
    <div className={`theme-switch ${big ? 'theme-switch--big' : ''}`} role="radiogroup" aria-label={tx('Motyw', 'Theme')}>
      {opts.map((o) => (
        <button key={o.id} role="radio" aria-checked={theme === o.id} aria-label={o.label} title={o.label} className={theme === o.id ? 'active' : ''} onClick={() => onChange(o.id)}>
          {o.icon}
        </button>
      ))}
    </div>
  );
}
