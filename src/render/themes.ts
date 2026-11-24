import { tx } from '../i18n';
import type { ThemeId } from '../types';

export interface Theme {
  id: ThemeId;
  name: string;
  wallTop: string; wallBottom: string; trim: string;
  floorNear: string; floorFar: string; floorLine: string;
  wood: string; woodDark: string; woodLight: string;
  metal: string; metalDark: string;
  stone: string; stoneDark: string;
  gold: string;
  accent: string;
  glow: string;
  paper: string;
  ink: string;
  screen: string;
  shadow: string;
  /** kolory interfejsu (HUD) dla danego scenariusza */
  ui: { accent: string; accent2: string; panel: string };
}

export const THEMES: Record<ThemeId, Theme> = {
  school: {
    id: 'school', get name() { return tx('Stara szkoła', 'Old school'); },
    wallTop: '#4f5f55', wallBottom: '#3a4740', trim: '#2b1d14',
    floorNear: '#5a3a22', floorFar: '#7a5133', floorLine: '#3e2716',
    wood: '#7b4f2c', woodDark: '#4a2e18', woodLight: '#a8754a',
    metal: '#8a9399', metalDark: '#4d555b', stone: '#7d7a72', stoneDark: '#55524c',
    gold: '#d9b45a', accent: '#f1cf7a', glow: '#ffe2a0', paper: '#efe3c4', ink: '#2c241b',
    screen: '#9fd1ff', shadow: '#0b0a08',
    ui: { accent: '#f1cf7a', accent2: '#8fd3a6', panel: '#1c1a17' },
  },
  egypt: {
    id: 'egypt', get name() { return tx('Piramida', 'Pyramid'); },
    wallTop: '#b98a50', wallBottom: '#8d6234', trim: '#5c3c1c',
    floorNear: '#8a6136', floorFar: '#b48650', floorLine: '#6a4824',
    wood: '#7a5a34', woodDark: '#4b351c', woodLight: '#b08a55',
    metal: '#a9874f', metalDark: '#6b5330', stone: '#c49a5f', stoneDark: '#8a6538',
    gold: '#f0c24e', accent: '#ffcf5a', glow: '#ffb547', paper: '#e8d29a', ink: '#3a2510',
    screen: '#ffd27a', shadow: '#1a0f05',
    ui: { accent: '#ffcf5a', accent2: '#3cc2b4', panel: '#1f170e' },
  },
  lab: {
    id: 'lab', get name() { return tx('Laboratorium', 'Laboratory'); },
    wallTop: '#1f2f44', wallBottom: '#172334', trim: '#0d1622',
    floorNear: '#141d29', floorFar: '#22324a', floorLine: '#2c4260',
    wood: '#3a4a5e', woodDark: '#243142', woodLight: '#5b6f88',
    metal: '#9fb3c8', metalDark: '#56677a', stone: '#4a5a6e', stoneDark: '#2f3b4a',
    gold: '#ffd166', accent: '#3fd3ff', glow: '#7fe8ff', paper: '#e6eef6', ink: '#0d1622',
    screen: '#3fd3ff', shadow: '#03070c',
    ui: { accent: '#3fd3ff', accent2: '#5cf2c2', panel: '#0e1724' },
  },
  bank: {
    id: 'bank', get name() { return tx('Bank', 'Bank'); },
    wallTop: '#2a3550', wallBottom: '#1c2438', trim: '#c9a85a',
    floorNear: '#d9d4c8', floorFar: '#b9b2a3', floorLine: '#8f8878',
    wood: '#5a3626', woodDark: '#381f14', woodLight: '#8a5a40',
    metal: '#b8bec6', metalDark: '#6c737c', stone: '#e3ddd0', stoneDark: '#a8a090',
    gold: '#d8b25a', accent: '#d8b25a', glow: '#ffe9b0', paper: '#f2ecdc', ink: '#1c2438',
    screen: '#8fd0ff', shadow: '#0a0d14',
    ui: { accent: '#d8b25a', accent2: '#8fd0ff', panel: '#141a29' },
  },
  space: {
    id: 'space', get name() { return tx('Stacja kosmiczna', 'Space station'); },
    wallTop: '#2b2f3a', wallBottom: '#1d2029', trim: '#11131a',
    floorNear: '#1a1d25', floorFar: '#30343f', floorLine: '#444a58',
    wood: '#454b59', woodDark: '#2b2f3a', woodLight: '#6b7386',
    metal: '#c7ccd6', metalDark: '#6b7281', stone: '#3c4150', stoneDark: '#262a35',
    gold: '#ffb347', accent: '#ff8c42', glow: '#9ad0ff', paper: '#e8ecf3', ink: '#11131a',
    screen: '#5df2a6', shadow: '#05060a',
    ui: { accent: '#ff8c42', accent2: '#5df2a6', panel: '#11131b' },
  },
  city: {
    id: 'city', get name() { return tx('Zaginione miasto', 'Lost city'); },
    wallTop: '#5f7a5a', wallBottom: '#465c43', trim: '#2c3a2a',
    floorNear: '#5b5546', floorFar: '#7c745f', floorLine: '#3f3a2f',
    wood: '#6b4a2c', woodDark: '#43301c', woodLight: '#97704a',
    metal: '#8fa3a0', metalDark: '#566664', stone: '#9b9a83', stoneDark: '#6a6a57',
    gold: '#e0c25a', accent: '#7ee0b0', glow: '#c6ffdc', paper: '#e9e2c6', ink: '#23301f',
    screen: '#7ee0b0', shadow: '#0b100a',
    ui: { accent: '#7ee0b0', accent2: '#e0c25a', panel: '#141b13' },
  },
};

/** Warianty tła dostępne w edytorze nauczyciela */
export const BG_VARIANTS: { id: string; name: string; theme: ThemeId }[] = [
  { id: 'classroom', get name() { return tx('Sala lekcyjna', 'Classroom'); }, theme: 'school' },
  { id: 'staffroom', get name() { return tx('Pokój nauczycielski', 'Staff room'); }, theme: 'school' },
  { id: 'library', get name() { return tx('Biblioteka', 'Library'); }, theme: 'school' },
  { id: 'basement', get name() { return tx('Piwnica / archiwum', 'Basement / archive'); }, theme: 'school' },
  { id: 'egypt_entrance', get name() { return tx('Komnata wejściowa', 'Entrance chamber'); }, theme: 'egypt' },
  { id: 'egypt_hieroglyphs', get name() { return tx('Sala hieroglifów', 'Hall of hieroglyphs'); }, theme: 'egypt' },
  { id: 'egypt_geometry', get name() { return tx('Sala geometryczna', 'Geometry hall'); }, theme: 'egypt' },
  { id: 'egypt_treasure', get name() { return tx('Komnata skarbu', 'Treasure chamber'); }, theme: 'egypt' },
  { id: 'lab_main', get name() { return tx('Laboratorium', 'Laboratory'); }, theme: 'lab' },
  { id: 'lab_computers', get name() { return tx('Pokój komputerowy', 'Computer room'); }, theme: 'lab' },
  { id: 'lab_storage', get name() { return tx('Magazyn', 'Storeroom'); }, theme: 'lab' },
  { id: 'lab_control', get name() { return tx('Centrum sterowania', 'Control centre'); }, theme: 'lab' },
  { id: 'bank_hall', get name() { return tx('Hol banku', 'Bank hall'); }, theme: 'bank' },
  { id: 'space_module', get name() { return tx('Moduł stacji kosmicznej', 'Space station module'); }, theme: 'space' },
  { id: 'city_square', get name() { return tx('Rynek zaginionego miasta', 'Lost city square'); }, theme: 'city' },
];
