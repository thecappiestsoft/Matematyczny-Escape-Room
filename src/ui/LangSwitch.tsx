import type { Lang } from '../i18n';

/** Przełącznik języka PL / EN */
export function LangSwitch({ lang, onChange, big }: { lang: Lang; onChange: (l: Lang) => void; big?: boolean }) {
  return (
    <div className={`lang-switch ${big ? 'lang-switch--big' : ''}`} role="radiogroup" aria-label="Język / Language">
      {(['pl', 'en'] as Lang[]).map((l) => (
        <button key={l} role="radio" aria-checked={lang === l} className={lang === l ? 'active' : ''} onClick={() => onChange(l)} lang={l} title={l === 'pl' ? 'Polski' : 'English'}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
