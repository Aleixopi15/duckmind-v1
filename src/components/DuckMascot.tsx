import { DUCK_LEVELS } from '../lib/gamification';

export type Mood = 'happy' | 'celebrating' | 'studying' | 'sad' | 'fire';

export type DuckMascotProps = {
  size?: number;
  mood?: Mood;
  animate?: boolean;
  className?: string;
  level?: number; // 1 to 8
  showAccessoryBadge?: boolean;
  showLevelTag?: boolean;
  /** Corpo inteiro (patinho de borracha) — para aberturas, conquistas e telas vazias. */
  fullBody?: boolean;
};

/** Paleta fixa do Quack */
const C = {
  pato: '#00D64B',
  mente: '#6F00D6',
  bico: '#D68200',
  tinta: '#17102B',
  papel: '#FFF9EC',
};

const SHARED = {
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
};

/** Rosto do Quack — símbolo principal da marca. */
function QuackFace({ mood }: { mood: Mood }) {
  const head = (
    <>
      <path d="M100 44 C96 24 114 12 126 22 C132 30 124 38 116 34" fill="none" stroke={C.tinta} strokeWidth="17" />
      <path
        d="M100 34 C150 34 180 66 180 106 C180 150 146 176 100 176 C54 176 20 150 20 106 C20 66 50 34 100 34Z"
        fill={C.pato}
        stroke={C.tinta}
        strokeWidth="5"
      />
      <path d="M100 44 C96 24 114 12 126 22 C132 30 124 38 116 34" fill="none" stroke={C.pato} strokeWidth="8" />
    </>
  );

  const cheeks = (
    <>
      <ellipse cx="44" cy="124" rx="12" ry="8" fill={C.bico} opacity=".55" />
      <ellipse cx="156" cy="124" rx="12" ry="8" fill={C.bico} opacity=".55" />
    </>
  );

  const spark = (
    <path d="M166 14 L170 26 L182 30 L170 34 L166 46 L162 34 L150 30 L162 26Z" fill={C.bico} stroke={C.tinta} strokeWidth="3" />
  );

  if (mood === 'studying') {
    return (
      <>
        <path
          d="M100 34 C150 34 180 66 180 106 C180 150 146 176 100 176 C54 176 20 150 20 106 C20 66 50 34 100 34Z"
          fill={C.pato}
          stroke={C.tinta}
          strokeWidth="5"
        />
        <path d="M22 104 C18 4 182 4 178 104" fill="none" stroke={C.tinta} strokeWidth="18" />
        <path d="M22 104 C18 4 182 4 178 104" fill="none" stroke={C.mente} strokeWidth="9" />
        {cheeks}
        <rect x="6" y="86" width="30" height="54" rx="14" fill={C.mente} stroke={C.tinta} strokeWidth="5" />
        <rect x="164" y="86" width="30" height="54" rx="14" fill={C.mente} stroke={C.tinta} strokeWidth="5" />
        <path d="M60 122 C60 104 140 104 140 122 C140 142 120 152 100 152 C80 152 60 142 60 122Z" fill={C.bico} stroke={C.tinta} strokeWidth="5" />
        <path d="M72 128 Q100 142 128 128" fill="none" stroke={C.tinta} strokeWidth="3.5" />
        <circle cx="90" cy="119" r="2.4" fill={C.tinta} />
        <circle cx="110" cy="119" r="2.4" fill={C.tinta} />
        <path d="M50 64 Q68 60 86 72 M114 72 Q132 60 150 64" fill="none" stroke={C.tinta} strokeWidth="6" />
        <circle cx="68" cy="88" r="12" fill={C.tinta} />
        <circle cx="132" cy="88" r="12" fill={C.tinta} />
        <circle cx="72" cy="83" r="4.6" fill={C.papel} />
        <circle cx="65" cy="93" r="2" fill={C.papel} />
        <circle cx="136" cy="83" r="4.6" fill={C.papel} />
        <circle cx="129" cy="93" r="2" fill={C.papel} />
      </>
    );
  }

  if (mood === 'celebrating' || mood === 'fire') {
    return (
      <>
        {head}
        {cheeks}
        <path d="M60 122 C60 104 140 104 140 122 C140 142 120 152 100 152 C80 152 60 142 60 122Z" fill={C.bico} stroke={C.tinta} strokeWidth="5" />
        <path d="M74 126 Q100 152 126 126Z" fill={C.tinta} />
        <ellipse cx="100" cy="138" rx="11" ry="5" fill={C.bico} />
        <circle cx="90" cy="117" r="2.4" fill={C.tinta} />
        <circle cx="110" cy="117" r="2.4" fill={C.tinta} />
        <path d="M52 66 Q68 56 84 66 M116 66 Q132 56 148 66" fill="none" stroke={C.tinta} strokeWidth="6" />
        <path d="M54 96 Q68 76 82 96 M118 96 Q132 76 146 96" fill="none" stroke={C.tinta} strokeWidth="6" />
        <rect x="10" y="30" width="12" height="12" rx="3" fill={C.mente} transform="rotate(20 16 36)" />
        <circle cx="184" cy="50" r="6" fill={C.bico} />
        <circle cx="26" cy="72" r="5" fill={C.tinta} />
        <rect x="170" y="14" width="11" height="11" rx="3" fill={C.bico} transform="rotate(-18 175 20)" />
      </>
    );
  }

  if (mood === 'sad') {
    return (
      <>
        {head}
        {spark}
        {cheeks}
        <path d="M60 122 C60 104 140 104 140 122 C140 142 120 152 100 152 C80 152 60 142 60 122Z" fill={C.bico} stroke={C.tinta} strokeWidth="5" />
        <path d="M74 140 Q100 124 126 140" fill="none" stroke={C.tinta} strokeWidth="3.5" />
        <circle cx="90" cy="119" r="2.4" fill={C.tinta} />
        <circle cx="110" cy="119" r="2.4" fill={C.tinta} />
        <path d="M48 74 Q68 58 88 70 M112 70 Q132 58 152 74" fill="none" stroke={C.tinta} strokeWidth="6" />
        <circle cx="68" cy="92" r="12" fill={C.tinta} />
        <circle cx="132" cy="92" r="12" fill={C.tinta} />
        <circle cx="72" cy="87" r="4.6" fill={C.papel} />
        <circle cx="65" cy="97" r="2" fill={C.papel} />
        <circle cx="136" cy="87" r="4.6" fill={C.papel} />
        <circle cx="129" cy="97" r="2" fill={C.papel} />
      </>
    );
  }

  // happy — piscadinha
  return (
    <>
      {head}
      {spark}
      {cheeks}
      <path d="M60 122 C60 104 140 104 140 122 C140 142 120 152 100 152 C80 152 60 142 60 122Z" fill={C.bico} stroke={C.tinta} strokeWidth="5" />
      <path d="M72 128 Q100 142 128 128" fill="none" stroke={C.tinta} strokeWidth="3.5" />
      <ellipse cx="84" cy="114" rx="11" ry="3.6" fill={C.papel} opacity=".6" />
      <circle cx="90" cy="119" r="2.4" fill={C.tinta} />
      <circle cx="110" cy="119" r="2.4" fill={C.tinta} />
      <path d="M50 64 Q68 60 86 72 M114 64 Q132 54 150 58" fill="none" stroke={C.tinta} strokeWidth="6" />
      <circle cx="68" cy="88" r="12" fill={C.tinta} />
      <circle cx="72" cy="83" r="4.6" fill={C.papel} />
      <circle cx="65" cy="93" r="2" fill={C.papel} />
      <path d="M118 92 Q132 76 146 92" fill="none" stroke={C.tinta} strokeWidth="6" />
      <path d="M34 90 C34 68 46 54 62 48" fill="none" stroke={C.papel} strokeWidth="6" opacity=".7" />
    </>
  );
}

/** Corpo inteiro — patinho de borracha. */
function QuackBody() {
  return (
    <>
      <ellipse cx="100" cy="190" rx="58" ry="6" fill={C.tinta} opacity=".18" />
      <g fill={C.tinta} stroke={C.tinta} strokeWidth="10">
        <path d="M36 114 C22 104 14 92 12 78 C30 80 46 88 56 100Z" />
        <ellipse cx="100" cy="132" rx="72" ry="46" />
        <ellipse cx="108" cy="98" rx="34" ry="26" />
        <circle cx="122" cy="66" r="40" />
      </g>
      <path d="M120 34 C116 14 134 4 146 14 C152 22 144 30 136 26" fill="none" stroke={C.tinta} strokeWidth="17" />
      <g fill={C.pato}>
        <path d="M36 114 C22 104 14 92 12 78 C30 80 46 88 56 100Z" />
        <ellipse cx="100" cy="132" rx="72" ry="46" />
        <ellipse cx="108" cy="98" rx="34" ry="26" />
        <circle cx="122" cy="66" r="40" />
      </g>
      <path d="M120 34 C116 14 134 4 146 14 C152 22 144 30 136 26" fill="none" stroke={C.pato} strokeWidth="8" />
      <path d="M64 124 C82 106 116 110 122 136 C112 156 80 154 64 124Z" fill={C.mente} stroke={C.tinta} strokeWidth="5" />
      <path d="M80 128 C92 126 104 130 110 138" fill="none" stroke={C.tinta} strokeWidth="3" />
      <path d="M72 158 C90 170 124 170 144 156 C128 174 90 176 72 158Z" fill={C.papel} opacity=".5" />
      <path d="M154 54 C176 48 194 56 192 70 C190 84 172 90 152 84Z" fill={C.bico} stroke={C.tinta} strokeWidth="5" />
      <path d="M158 74 C170 78 182 76 188 70" fill="none" stroke={C.tinta} strokeWidth="3" />
      <circle cx="177" cy="62" r="2.2" fill={C.tinta} />
      <ellipse cx="128" cy="72" rx="9" ry="6" fill={C.bico} opacity=".55" />
      <path d="M122 40 Q134 34 148 42" fill="none" stroke={C.tinta} strokeWidth="5" />
      <circle cx="136" cy="56" r="9" fill={C.tinta} />
      <circle cx="139" cy="52" r="3.4" fill={C.papel} />
      <circle cx="133" cy="60" r="1.6" fill={C.papel} />
      <path d="M92 62 C92 50 98 42 106 38" fill="none" stroke={C.papel} strokeWidth="5" opacity=".7" />
    </>
  );
}

export default function DuckMascot({
  size = 120,
  mood = 'studying',
  animate = false,
  className = '',
  level = 1,
  showAccessoryBadge = false,
  showLevelTag = false,
  fullBody = false,
}: DuckMascotProps) {
  const currentLvl = DUCK_LEVELS.find(l => l.level === level) || DUCK_LEVELS[0];
  const isFederalTier = level >= 8;
  const badgeSize = Math.max(16, Math.min(28, Math.round(size * 0.36)));

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title={`Quack · ${currentLvl.title}`}
      role="img"
      aria-label={`Quack, o pato do DuckMind — ${currentLvl.title}`}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        {...SHARED}
        className={`relative z-10 ${animate ? 'duck-bob' : 'duck-bob-subtle'}`}
      >
        {fullBody ? <QuackBody /> : <QuackFace mood={mood} />}
      </svg>

      {showAccessoryBadge && (
        <div
          className="absolute -bottom-1 -right-1 z-20 flex items-center justify-center rounded-full leading-none"
          style={{
            width: `${badgeSize}px`,
            height: `${badgeSize}px`,
            fontSize: badgeSize < 20 ? '10px' : badgeSize < 24 ? '12px' : '14px',
            background: C.papel,
            border: `3px solid ${C.tinta}`,
            boxShadow: `2px 2px 0 ${C.tinta}`,
            color: C.tinta,
          }}
          title={`${currentLvl.title} (${currentLvl.accessory})`}
        >
          <span>{currentLvl.accessory}</span>
        </div>
      )}

      {isFederalTier && !fullBody && (
        <span className="absolute -top-2 left-1/2 z-20 -translate-x-1/2 text-lg" title="Aprovado na Federal!">
          👑
        </span>
      )}

      {showLevelTag && (
        <div
          className="absolute -bottom-2.5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap font-display text-[10px] font-bold uppercase tracking-wide"
          style={{
            background: C.mente,
            color: C.papel,
            border: `2px solid ${C.tinta}`,
            borderRadius: '10px',
            padding: '1px 8px',
            boxShadow: `2px 2px 0 ${C.tinta}`,
          }}
        >
          Nv.{level}
        </div>
      )}
    </div>
  );
}
