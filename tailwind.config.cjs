/** @type {import('tailwindcss').Config} */

// ─── Identidade "Quack" ───────────────────────────────────────────────────────
const PAPEL = '#FFF9EC';
const TINTA = '#17102B';

// Primária — Pato
const PATO = {
  50: '#E6FFF0', 100: '#C2FFD9', 200: '#8CFFBB', 300: '#4DF79A', 400: '#12E66F',
  500: '#00D64B', 600: '#00B23E', 700: '#008E32', 800: '#006B26', 900: '#004719', 950: '#002D10',
};
// Secundária — Mente
const MENTE = {
  50: '#F5EDFF', 100: '#EADBFF', 200: '#D5B8FF', 300: '#BC8DFF', 400: '#9857F2',
  500: '#6F00D6', 600: '#5D00B4', 700: '#4A0090', 800: '#38006D', 900: '#25004A', 950: '#17002E',
};
// Terciária — Bico
const BICO = {
  50: '#FFF6E6', 100: '#FFEAC2', 200: '#FFD48C', 300: '#FFBC4D', 400: '#F09F12',
  500: '#D68200', 600: '#B26C00', 700: '#8E5600', 800: '#6B4000', 900: '#472B00', 950: '#2C1A00',
};
// Neutros quentes — nunca cinzas frios
const NEUTRAL = {
  50: '#FFF9EC', 100: '#F7F0DF', 200: '#E8E0CC', 300: '#C4BBC9', 400: '#837B99',
  500: '#6B6480', 600: '#4B4560', 700: '#38314D', 800: '#262038', 900: '#17102B', 950: '#0D0819',
};

const HARD = {
  sm: `3px 3px 0 ${TINTA}`,
  base: `4px 4px 0 ${TINTA}`,
  lg: `6px 6px 0 ${TINTA}`,
  xl: `8px 8px 0 ${TINTA}`,
};

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Fredoka', 'Nunito', 'system-ui', 'sans-serif'],
        mono: ['Fredoka', 'ui-monospace', 'sans-serif'],
      },
      colors: {
        // Nomes canônicos da marca — `bg-pato`, `bg-mente`, `bg-bico` usam o DEFAULT
        papel: PAPEL,
        tinta: TINTA,
        pato: { DEFAULT: '#00D64B', ...PATO },
        mente: { DEFAULT: '#6F00D6', ...MENTE },
        bico: { DEFAULT: '#D68200', ...BICO },
        muted: '#4B4560',

        // Aliases semânticos: toda a base antiga passa a renderizar na nova identidade
        brand: { DEFAULT: '#00D64B', ...PATO },
        bio: { DEFAULT: '#6F00D6', ...MENTE },
        streak: { DEFAULT: '#D68200', ...BICO },
        emerald: { DEFAULT: '#00D64B', ...PATO },
        green: { DEFAULT: '#00D64B', ...PATO },
        lime: { DEFAULT: '#00D64B', ...PATO },
        teal: { DEFAULT: '#00D64B', ...PATO },
        amber: { DEFAULT: '#D68200', ...BICO },
        orange: { DEFAULT: '#D68200', ...BICO },
        yellow: { DEFAULT: '#D68200', ...BICO },
        red: { DEFAULT: '#D68200', ...BICO },
        rose: { DEFAULT: '#D68200', ...BICO },
        purple: { DEFAULT: '#6F00D6', ...MENTE },
        violet: { DEFAULT: '#6F00D6', ...MENTE },
        pink: { DEFAULT: '#6F00D6', ...MENTE },
        fuchsia: { DEFAULT: '#6F00D6', ...MENTE },
        sky: { DEFAULT: '#6F00D6', ...MENTE },
        blue: { DEFAULT: '#6F00D6', ...MENTE },
        indigo: { DEFAULT: '#6F00D6', ...MENTE },
        cyan: { DEFAULT: '#6F00D6', ...MENTE },
        slate: NEUTRAL,

        // Superfícies escuras ("Sobre Tinta")
        'surface-dark': TINTA,
        'surface-dark-card': '#1E1738',
        'surface-dark-subtle': '#2A2350',
        'surface-dark-muted': '#3A3266',
      },
      borderWidth: {
        3: '3px',
      },
      borderRadius: {
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '22px',
        '3xl': '28px',
      },
      boxShadow: {
        // Sombra dura substitui todas as sombras difusas
        sm: HARD.sm,
        DEFAULT: HARD.base,
        md: HARD.base,
        lg: HARD.lg,
        xl: HARD.xl,
        '2xl': HARD.xl,
        card: HARD.base,
        'card-hover': HARD.lg,
        'glow-emerald': HARD.base,
        'glow-mint': HARD.base,
        'glow-sm': HARD.sm,
        glass: HARD.lg,
        brutal: HARD.base,
        'brutal-sm': HARD.sm,
        'brutal-lg': HARD.lg,
        'brutal-xl': HARD.xl,
      },
      spacing: {
        4.5: '1.125rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        bob: 'bob 2.4s ease-in-out infinite',
        wave: 'wave 1.6s ease-in-out infinite',
        celebrate: 'celebrate 0.8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        scaleIn: { from: { opacity: 0, transform: 'scale(0.96)' }, to: { opacity: 1, transform: 'scale(1)' } },
        slideUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        bob: {
          '0%,100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-6px) rotate(-2deg)' },
          '75%': { transform: 'translateY(-3px) rotate(2deg)' },
        },
        wave: {
          '0%,100%': { transform: 'rotate(0deg)' },
          '20%': { transform: 'rotate(-20deg)' }, '40%': { transform: 'rotate(10deg)' },
          '60%': { transform: 'rotate(-15deg)' }, '80%': { transform: 'rotate(8deg)' },
        },
        celebrate: {
          '0%,100%': { transform: 'scale(1) rotate(0deg)' },
          '25%': { transform: 'scale(1.08) rotate(-4deg)' },
          '75%': { transform: 'scale(1.08) rotate(4deg)' },
        },
      },
    },
  },
  plugins: [],
};
