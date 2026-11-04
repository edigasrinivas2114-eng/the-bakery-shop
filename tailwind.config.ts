import type { Config } from 'tailwindcss';

// Locked palette from the brand package (01_BRAND_IDENTITY).
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Colours come from CSS variables so the whole site can switch theme (see globals.css).
      colors: {
        choc: { DEFAULT: 'rgb(var(--choc) / <alpha-value>)', deep: 'rgb(var(--choc-deep) / <alpha-value>)', ink: 'rgb(var(--choc-ink) / <alpha-value>)', soft: 'rgb(var(--choc-soft) / <alpha-value>)', night: 'rgb(var(--choc-night) / <alpha-value>)' },
        caramel: { DEFAULT: 'rgb(var(--caramel) / <alpha-value>)', light: 'rgb(var(--caramel-light) / <alpha-value>)' },
        cream: { DEFAULT: 'rgb(var(--cream) / <alpha-value>)', 2: 'rgb(var(--cream-2) / <alpha-value>)', 3: 'rgb(var(--cream-3) / <alpha-value>)' },
        berry: { DEFAULT: 'rgb(var(--berry) / <alpha-value>)', dark: 'rgb(var(--berry-dark) / <alpha-value>)' },
        pista: { DEFAULT: 'rgb(var(--pista) / <alpha-value>)', dark: 'rgb(var(--pista-dark) / <alpha-value>)' },
        glow: 'rgb(var(--glow) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Playfair Display Variable"', 'Georgia', 'serif'],
        sans: ['"Inter Variable"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: { site: '76rem' },
    },
  },
  plugins: [],
};
export default config;
