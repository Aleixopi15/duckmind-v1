/** @type {import('tailwindcss').Config} */

// ─── DuckMind 2.0 Sistema de Marca ───────────────────────────────────────────
// Mistura da Direção moderna (claro) com a Opção B (escuro).
// Fontes Space Grotesk e Inter em todo o site.

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"Space Grotesk"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Paleta Claro
        nevoa: '#F6F5FB',
        papel: '#F6F5FB',
        tinta: '#14102A',

        // Paleta Escuro
        noite: '#0D0A1F',
        texto: '#F3F1FF',

        // Cores da Marca
        pato: {
          DEFAULT: '#00D64B',
          glow: '#19E85F',
          50: '#E6FFF0',
          100: '#C2FFD9',
          400: '#19E85F',
          500: '#00D64B',
          600: '#00B83E',
        },
        mente: {
          DEFAULT: '#6F00D6',
          glow: '#9B3DFF',
          50: '#F5EDFF',
          100: '#EADBFF',
          400: '#9B3DFF',
          500: '#6F00D6',
          600: '#5D00B4',
        },
        bico: {
          DEFAULT: '#D68200',
          glow: '#FFB84D',
          50: '#FFF6E6',
          100: '#FFEAC2',
          400: '#FFB84D',
          500: '#D68200',
          600: '#B26C00',
        },
        muted: '#645F78',

        // Superfícies escuras
        'surface-dark': '#0D0A1F',
        'surface-dark-card': '#14102A',
        'surface-dark-subtle': '#1B1538',
        'surface-dark-muted': '#282052',
      },
      borderRadius: {
        md: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '22px',
        '3xl': '26px',
        '4xl': '32px',
        card: '26px',
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(20, 16, 42, 0.05), 0 2px 6px -1px rgba(20, 16, 42, 0.02)',
        'card-hover': '0 8px 30px -4px rgba(20, 16, 42, 0.08), 0 4px 10px -2px rgba(20, 16, 42, 0.03)',
        'glow-pato': '0 0 24px rgba(25, 232, 95, 0.35)',
        'glow-mente': '0 0 24px rgba(155, 61, 255, 0.35)',
        'glow-bico': '0 0 24px rgba(255, 184, 77, 0.35)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        brutal: '0 4px 20px -2px rgba(20, 16, 42, 0.06)',
        'brutal-sm': '0 2px 8px rgba(20, 16, 42, 0.05)',
        'brutal-lg': '0 10px 30px rgba(20, 16, 42, 0.08)',
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
