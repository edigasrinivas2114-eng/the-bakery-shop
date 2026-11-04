/**
 * Colour themes for the whole site. Each theme sets the same tokens; Tailwind reads them as CSS variables.
 * "chocolate" is the locked brand palette and the default. The others are options for review.
 */
export type ThemeTokens = {
  choc: string; // main dark (headings, buttons on light)
  'choc-deep': string; // dark bands, header
  'choc-ink': string; // body text
  'choc-soft': string;
  'choc-night': string; // footer
  caramel: string; // accent text on light (eyebrows, italic words)
  'caramel-light': string; // accent on dark
  cream: string; // light background
  'cream-2': string;
  'cream-3': string;
  berry: string; // primary button
  'berry-dark': string;
  pista: string;
  'pista-dark': string;
  glow: string; // italic highlight on dark
};

/** hero: optional suffix for a recoloured hero video set, e.g. '-violet' → media/hero/hero-16x9-violet.mp4 */
export type Theme = { id: string; name: string; note: string; t: ThemeTokens; hero?: string };

export const themes: Theme[] = [
  {
    id: 'chocolate',
    name: 'Chocolate & Strawberry',
    note: 'Brand palette (current)',
    t: {
      choc: '#4B2E24', 'choc-deep': '#24150F', 'choc-ink': '#2E1C16', 'choc-soft': '#6B4A3C', 'choc-night': '#1A0F0B',
      caramel: '#A65E32', 'caramel-light': '#C98A5E', cream: '#FFF3E6', 'cream-2': '#F7E5D2', 'cream-3': '#EFD6BD',
      berry: '#D7263D', 'berry-dark': '#B01C30', pista: '#879A45', 'pista-dark': '#5F6E2C', glow: '#F2C9A4',
    },
  },
  {
    id: 'pistachio',
    name: 'Pistachio Garden',
    note: 'Deep green, pistachio, coral buttons',
    t: {
      choc: '#2E4026', 'choc-deep': '#18240F', 'choc-ink': '#1E281A', 'choc-soft': '#526446', 'choc-night': '#10180B',
      caramel: '#667A2C', 'caramel-light': '#B0C06E', cream: '#FAF7EC', 'cream-2': '#EEEEDA', 'cream-3': '#DEE2C4',
      berry: '#C2412A', 'berry-dark': '#A23420', pista: '#879A45', 'pista-dark': '#5F6E2C', glow: '#D6E2A0',
    },
  },
  {
    id: 'blush',
    name: 'Strawberry Blush',
    note: 'Wine red, rose pink, soft blush',
    t: {
      choc: '#5C1A2B', 'choc-deep': '#330D18', 'choc-ink': '#3C141E', 'choc-soft': '#783C4B', 'choc-night': '#240810',
      caramel: '#B83E58', 'caramel-light': '#E88CA0', cream: '#FFF1F2', 'cream-2': '#FAE1E4', 'cream-3': '#F4CDD3',
      berry: '#D7263D', 'berry-dark': '#B01C30', pista: '#879A45', 'pista-dark': '#5F6E2C', glow: '#F7BEC8',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight & Gold',
    note: 'Navy with gold, for a luxury feel',
    t: {
      choc: '#1B2233', 'choc-deep': '#0E121E', 'choc-ink': '#141A28', 'choc-soft': '#465069', 'choc-night': '#080B14',
      caramel: '#97722C', 'caramel-light': '#D6B46E', cream: '#FAF6EE', 'cream-2': '#F0E9DA', 'cream-3': '#E4DAC4',
      berry: '#8E6A22', 'berry-dark': '#755719', pista: '#879A45', 'pista-dark': '#5F6E2C', glow: '#E6C88C',
    },
  },
  {
    id: 'mocha',
    name: 'Mocha & Mint',
    note: 'Coffee brown with fresh mint',
    t: {
      choc: '#3A2C26', 'choc-deep': '#1E1714', 'choc-ink': '#281E1A', 'choc-soft': '#64554E', 'choc-night': '#140F0D',
      caramel: '#36735F', 'caramel-light': '#7FB8A4', cream: '#F6F3EC', 'cream-2': '#E8ECE2', 'cream-3': '#D6E0D2',
      berry: '#2F6E5E', 'berry-dark': '#23584B', pista: '#879A45', 'pista-dark': '#5F6E2C', glow: '#A8D6C4',
    },
  },
  {
    id: 'blueberry',
    name: 'Blueberry Lavender',
    note: 'Plum, lavender and raspberry',
    hero: '-blueberry',
    t: {
      choc: '#2E2340', 'choc-deep': '#1A1326', 'choc-ink': '#221A30', 'choc-soft': '#5C5073', 'choc-night': '#110C1A',
      caramel: '#7452A8', 'caramel-light': '#B49FD8', cream: '#FAF6FF', 'cream-2': '#EEE8F8', 'cream-3': '#DED4F0',
      berry: '#D7265C', 'berry-dark': '#B01C48', pista: '#879A45', 'pista-dark': '#5F6E2C', glow: '#D6C4F0',
    },
  },
  {
    id: 'butterscotch',
    name: 'Butterscotch',
    note: 'Golden caramel, warm and bright',
    t: {
      choc: '#5C3614', 'choc-deep': '#3A210C', 'choc-ink': '#3C2410', 'choc-soft': '#7E5A3A', 'choc-night': '#2A1708',
      caramel: '#A0601A', 'caramel-light': '#E8AA5A', cream: '#FFF8E8', 'cream-2': '#FAECCD', 'cream-3': '#F2DEB4',
      berry: '#D7263D', 'berry-dark': '#B01C30', pista: '#879A45', 'pista-dark': '#5F6E2C', glow: '#F5CD8C',
    },
  },
];

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

export function applyTheme(theme: Theme) {
  const s = document.documentElement.style;
  for (const [k, v] of Object.entries(theme.t)) s.setProperty(`--${k}`, rgb(v));
  document.documentElement.dataset.theme = theme.id;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.t['choc-deep']);
  window.dispatchEvent(new CustomEvent('bakery-theme', { detail: theme }));
}

/** The chosen site theme. */
export const DEFAULT_THEME = 'blueberry';

export function heroSuffix(id?: string) {
  return themes.find((x) => x.id === id)?.hero ?? '';
}
