import { cn } from '../lib/theme';

type LogoProps = {
  /** Sizing options */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  /** Explicitly show mascot */
  showMascot?: boolean;
  /** Show mascot on desktop (md:) screens alongside text */
  withDesktopMascot?: boolean;
};

const HEIGHTS = {
  sm: 'h-6 sm:h-7',
  md: 'h-7 sm:h-8',
  lg: 'h-10 sm:h-12',
};

const MASCOT_SIZES = {
  sm: 'w-7 h-7',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
};

/**
 * Mascote Oficial DuckMind em SVG
 * Conforme fornecido pelo projeto DuckMind 2.0
 */
export function DuckMascotSvg({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="38 38 38 38"
      className={cn('shrink-0 select-none', className)}
      aria-hidden="true"
    >
      <mask id="mask-duck-mascot">
        <rect width="38" height="38" x="38" y="38" fill="#ffffff" />
      </mask>
      <g mask="url(#mask-duck-mascot)">
        <g transform="matrix(0.19 0 0 0.19 38 38)">
          <path
            d="M100 44 C96 24 114 12 126 22 C132 30 124 38 116 34"
            fill="none"
            stroke="rgb(23, 16, 43)"
            strokeWidth="24px"
            strokeLinecap="round"
            color="rgb(243, 241, 255)"
          />
          <path
            d="M100 34 C150 34 180 66 180 106 C180 150 146 176 100 176 C54 176 20 150 20 106 C20 66 50 34 100 34Z"
            fill="rgb(25, 232, 95)"
            stroke="rgb(23, 16, 43)"
            strokeWidth="10px"
            color="rgb(243, 241, 255)"
          />
          <path
            d="M100 44 C96 24 114 12 126 22 C132 30 124 38 116 34"
            fill="none"
            stroke="rgb(25, 232, 95)"
            strokeWidth="12px"
            strokeLinecap="round"
            color="rgb(243, 241, 255)"
          />
          <path
            d="M64 122 C64 108 136 108 136 122 C136 140 118 150 100 150 C82 150 64 140 64 122Z"
            fill="rgb(255, 184, 77)"
            stroke="rgb(23, 16, 43)"
            strokeWidth="8px"
            color="rgb(243, 241, 255)"
          />
          <circle cx="68" cy="90" r="12" fill="rgb(23, 16, 43)" color="rgb(243, 241, 255)" stroke="none" />
          <circle cx="132" cy="90" r="12" fill="rgb(23, 16, 43)" color="rgb(243, 241, 255)" stroke="none" />
        </g>
      </g>
    </svg>
  );
}

/**
 * Logo oficial SVG DuckMind em versão texto conforme fornecido pelo usuário.
 * Alterna perfeitamente entre Modo Claro e Modo Escuro, e suporta exibição do Mascote.
 */
export default function Logo({
  size = 'md',
  className,
  onClick,
  showMascot = false,
  withDesktopMascot = false,
}: LogoProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      className={cn('inline-flex items-center gap-2 select-none', onClick && 'cursor-pointer', className)}
    >
      {/* Mascote opcional (sempre exibido ou apenas em telas desktop) */}
      {showMascot && <DuckMascotSvg className={MASCOT_SIZES[size]} />}
      {!showMascot && withDesktopMascot && (
        <DuckMascotSvg className={cn(MASCOT_SIZES[size], 'hidden md:block')} />
      )}

      {/* Modo Claro */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="20 21 141.03125 38"
        className={cn(HEIGHTS[size], 'w-auto block dark:hidden shrink-0')}
        aria-label="DuckMind"
      >
        <g id="span1">
          <text
            dominantBaseline="text-after-edge"
            fontFamily="'Space Grotesk', sans-serif"
            fontSize="30px"
            fontWeight="700"
            letterSpacing="-0.5px"
            fill="rgb(20, 16, 42)"
          >
            <tspan x="20" y="59" textLength="70.96875" lengthAdjust="spacingAndGlyphs">
              Duck
            </tspan>
          </text>
          <g id="span2">
            <text
              dominantBaseline="text-after-edge"
              fontFamily="'Space Grotesk', sans-serif"
              fontSize="30px"
              fontWeight="700"
              letterSpacing="-0.5px"
              fill="rgb(111, 0, 214)"
            >
              <tspan x="90.96875" y="59" textLength="70.0625" lengthAdjust="spacingAndGlyphs">
                Mind
              </tspan>
            </text>
          </g>
        </g>
      </svg>

      {/* Modo Escuro */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="20 21 141.03125 38"
        className={cn(HEIGHTS[size], 'w-auto hidden dark:block shrink-0')}
        aria-label="DuckMind"
      >
        <g id="span1">
          <text
            dominantBaseline="text-after-edge"
            fontFamily="'Space Grotesk', sans-serif"
            fontSize="30px"
            fontWeight="700"
            letterSpacing="-0.5px"
            fill="rgb(243, 241, 255)"
          >
            <tspan x="20" y="59" textLength="70.96875" lengthAdjust="spacingAndGlyphs">
              Duck
            </tspan>
          </text>
          <g id="span2">
            <text
              dominantBaseline="text-after-edge"
              fontFamily="'Space Grotesk', sans-serif"
              fontSize="30px"
              fontWeight="700"
              letterSpacing="-0.5px"
              fill="rgb(25, 232, 95)"
            >
              <tspan x="90.96875" y="59" textLength="70.0625" lengthAdjust="spacingAndGlyphs">
                Mind
              </tspan>
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
