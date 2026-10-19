/**
 * DuckMind Design Tokens — Identidade "Quack" (2026)
 *
 * Fundamentos extraídos do guia de marca:
 *  - Cores saturadas com contraste de verdade: texto em Tinta sobre Pato e Bico,
 *    em Papel sobre Mente.
 *  - Fredoka para títulos, números e botões; Nunito para texto e interface.
 *  - Contorno de 3px em Tinta, sombra dura de 4–6px, cantos 14/22/28 e pílula.
 */

export const DESIGN_TOKENS = {
  colors: {
    // Núcleo da marca
    papel: '#FFF9EC',   // Fundos (45% do uso)
    pato: '#00D64B',    // Primária: botões, ações e destaques (25%)
    mente: '#6F00D6',   // Secundária: foco e progresso (15%)
    bico: '#D68200',    // Terciária: conquistas e alertas (10%)
    tinta: '#17102B',   // Texto e contornos (5%)

    // Escalas derivadas dos núcleos
    patoScale: {
      50: '#E6FFF0',
      100: '#C2FFD9',
      200: '#8CFFBB',
      300: '#4DF79A',
      400: '#12E66F',
      500: '#00D64B',
      600: '#00B23E',
      700: '#008E32',
      800: '#006B26',
      900: '#004719',
      950: '#002D10',
    },
    menteScale: {
      50: '#F5EDFF',
      100: '#EADBFF',
      200: '#D5B8FF',
      300: '#BC8DFF',
      400: '#9857F2',
      500: '#6F00D6',
      600: '#5D00B4',
      700: '#4A0090',
      800: '#38006D',
      900: '#25004A',
      950: '#17002E',
    },
    bicoScale: {
      50: '#FFF6E6',
      100: '#FFEAC2',
      200: '#FFD48C',
      300: '#FFBC4D',
      400: '#F09F12',
      500: '#D68200',
      600: '#B26C00',
      700: '#8E5600',
      800: '#6B4000',
      900: '#472B00',
      950: '#2C1A00',
    },

    // Neutros quentes (nunca cinzas frios)
    neutral: {
      papel: '#FFF9EC',
      100: '#F7F0DF',
      200: '#E8E0CC',
      300: '#C4BBC9',
      400: '#837B99',
      500: '#6B6480',
      600: '#4B4560', // texto secundário do guia
      700: '#38314D',
      800: '#262038',
      900: '#17102B',
      950: '#0D0819',
    },

    // Superfícies escuras (variante "Sobre Tinta")
    darkSurface: {
      background: '#17102B',
      card: '#1E1738',
      elevated: '#2A2350',
      border: '#FFF9EC',
    },
  },

  typography: {
    display: "'Fredoka', 'Nunito', system-ui, sans-serif",
    sans: "'Nunito', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },

  border: {
    width: '3px',
    widthSoft: '2px',
  },

  borderRadius: {
    sm: '10px',
    md: '14px',
    lg: '16px',
    xl: '22px',
    '2xl': '28px',
    pill: '9999px',
  },

  shadows: {
    // Sombras duras: nunca difusas
    sm: '3px 3px 0 #17102B',
    base: '4px 4px 0 #17102B',
    lg: '6px 6px 0 #17102B',
    xl: '8px 8px 0 #17102B',
    accent: '8px 8px 0 #00D64B',
  },

  // Proporção de uso das cores no produto
  proportion: {
    papel: '45%',
    pato: '25%',
    mente: '15%',
    bico: '10%',
    tinta: '5%',
  },
} as const;

export default DESIGN_TOKENS;
