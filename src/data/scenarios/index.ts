import type { Scenario } from '../../types';
import { school } from './school';
import { pyramid } from './pyramid';
import { lab } from './lab';
import { localizeScenario, type ScenarioOverlay } from '../localize';
import { getLang, tx } from '../../i18n';
import { schoolEn } from './en/school.en';
import { pyramidEn } from './en/pyramid.en';
import { labEn } from './en/lab.en';

export const EN_OVERLAYS: Record<string, ScenarioOverlay> = { 'stara-szkola': schoolEn, piramida: pyramidEn, laboratorium: labEn };

/** Scenariusze zapowiedziane – opis fabuły gotowy, treść w przygotowaniu */
function upcoming(id: string, title: string, subtitle: string, description: string, theme: Scenario['theme']): Scenario {
  return {
    id, title, subtitle, description, theme, difficulty: 3, levels: ['sp', 'lo', 'tech'],
    intro: '', ending: '', startRoom: '', rooms: [], items: {}, clues: {}, puzzles: {},
    reward: { badge: '🔒', title }, comingSoon: true,
  };
}

export const BUILTIN_SCENARIOS: Scenario[] = [
  school,
  pyramid,
  lab,
  upcoming('bank', 'Awaria w Banku', 'Rozdział IV – Skarbiec', 'Pracownik banku zostaje przypadkowo zamknięty w skarbcu po awarii systemu zabezpieczeń. Procenty, odsetki, wykresy finansowe i równania pomogą bezpiecznie przywrócić system i wyjść.', 'bank'),
  upcoming('stacja', 'Kosmiczna Stacja', 'Rozdział V – Orbita', 'Awaria na stacji kosmicznej: system podtrzymywania życia działa tylko przez ograniczony czas. Prędkość, odległość, funkcje i trygonometria uruchomią kolejne moduły.', 'space'),
  upcoming('miasto', 'Tajemnica Zaginionego Miasta', 'Rozdział VI – Świątynia', 'Starożytne miasto pełne symetrii, skal i ciągów. Odkryj matematyczny mechanizm miasta i dotrzyj do centralnej świątyni.', 'city'),
];

/** Kolejność rozdziałów kampanii fabularnej */
export const CAMPAIGN_ORDER = ['stara-szkola', 'piramida', 'laboratorium', 'bank', 'stacja', 'miasto'];

export const CAMPAIGN_LINKS: Record<string, string> = {
  get 'stara-szkola'() { return tx('W starej szkole czeka zeszyt Klasy 1926 – dziennik Strażników Liczb, którzy ukryli zagadki w różnych miejscach świata.', 'In the old school waits the notebook of the Class of 1926 – the diary of the Guardians of Numbers, who hid puzzles all over the world.'); },
  get piramida() { return tx('Zeszyt prowadzi do Egiptu. Szkic piramidy i dopisek: „Liczby faraonów strzegą wyjścia”.', 'The notebook leads to Egypt. A sketch of a pyramid and a note: “The pharaohs’ numbers guard the exit”.'); },
  get laboratorium() { return tx('Ostatnia strona zeszytu zawiera adres laboratorium. Czy dawni uczniowie zostali naukowcami?', 'The last page of the notebook holds the address of a laboratory. Did the former pupils become scientists?'); },
  get bank() { return tx('Kolejny trop: stary bank w centrum miasta. (Rozdział w przygotowaniu)', 'The next lead: an old bank in the city centre. (Chapter in preparation)'); },
  get stacja() { return tx('Sygnał z orbity zawiera ciąg liczb… (Rozdział w przygotowaniu)', 'A signal from orbit contains a sequence of numbers… (Chapter in preparation)'); },
  get miasto() { return tx('Mapa zaginionego miasta – ostatni sekret Strażników Liczb. (Rozdział w przygotowaniu)', 'A map of the lost city – the last secret of the Guardians of Numbers. (Chapter in preparation)'); },
};

/** Scenariusze wbudowane w bieżącym języku */
export function builtinScenarios(): Scenario[] {
  if (getLang() === 'pl') return BUILTIN_SCENARIOS;
  return BUILTIN_SCENARIOS.map((sc) => {
    if (sc.comingSoon) {
      const t = UPCOMING_EN[sc.id];
      return t ? { ...sc, title: t[0], subtitle: t[1], description: t[2], reward: { ...sc.reward, title: t[0] } } : sc;
    }
    return localizeScenario(sc, EN_OVERLAYS[sc.id]);
  });
}

const UPCOMING_EN: Record<string, [string, string, string]> = {
  bank: ['Bank Breakdown', 'Chapter IV – The Vault', 'A bank employee is accidentally locked in the vault after the security system fails. Percentages, interest, financial charts and equations will help restore the system safely and get out.'],
  stacja: ['The Space Station', 'Chapter V – Orbit', 'A failure on a space station: life support will only last for a limited time. Speed, distance, functions and trigonometry will restart the modules one by one.'],
  miasto: ['The Mystery of the Lost City', 'Chapter VI – The Temple', 'An ancient city full of symmetry, scales and sequences. Discover the city’s mathematical mechanism and reach the central temple.'],
};
