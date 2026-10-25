import { ClipboardCheck, GraduationCap } from 'lucide-react';

type Props = {
  title: string;
  description: string;
};

/**
 * Painel lateral DuckMind conforme Identidade Visual oficial (PDF anexo).
 * Fundo roxo institucional com orbe de brilho e cards de prévia dos modos Vestibular e Universitário.
 */
export default function AuthBrandPanel({ title, description }: Props) {
  return (
    <div className="relative hidden flex-1 overflow-hidden bg-[#6F00D6] text-white md:flex flex-col justify-between p-12 lg:p-16">
      {/* Ambient background glow orb at bottom right */}
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#9D4EDD]/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/3 h-64 w-64 -translate-y-1/2 rounded-full bg-[#8318E8]/30 blur-2xl" />

      {/* Top Logo */}
      <div className="relative z-10 flex items-center gap-2">
        <span className="font-display text-2xl lg:text-3xl font-bold tracking-tight text-white">
          DuckMind
        </span>
      </div>

      {/* Middle Headline */}
      <div className="relative z-10 my-auto max-w-lg py-8">
        <h1 className="font-display text-3xl lg:text-4xl xl:text-[42px] font-bold leading-[1.15] tracking-tight text-white">
          {title}
        </h1>
        <p className="mt-4 text-base font-normal leading-relaxed text-white/85">
          {description}
        </p>
      </div>

      {/* Bottom Mode Preview Cards */}
      <div className="relative z-10 flex w-full max-w-lg gap-4">
        {/* Vestibular Card */}
        <div className="flex-1 rounded-2xl bg-white/10 p-4 border border-white/15 backdrop-blur-xs transition-all hover:bg-white/15">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white">
            <ClipboardCheck size={18} strokeWidth={2.4} />
          </div>
          <div className="font-display text-sm font-bold text-white">
            Vestibular
          </div>
          <div className="text-xs text-white/75 font-medium">
            Edital e simulados
          </div>
        </div>

        {/* Universitário Card */}
        <div className="flex-1 rounded-2xl bg-white/10 p-4 border border-white/15 backdrop-blur-xs transition-all hover:bg-white/15">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white">
            <GraduationCap size={18} strokeWidth={2.4} />
          </div>
          <div className="font-display text-sm font-bold text-white">
            Universitário
          </div>
          <div className="text-xs text-white/75 font-medium">
            Disciplinas e provas
          </div>
        </div>
      </div>
    </div>
  );
}
