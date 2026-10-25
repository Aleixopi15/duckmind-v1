import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import {
  ClipboardCheck,
  GraduationCap,
  Clock,
  BookOpen,
  BarChart2,
  Trophy,
  Check,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-[#14102A] transition-colors duration-300 dark:bg-[#0B0819] dark:text-[#F3F1FF]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-white/5 dark:bg-[#0B0819]/85">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8">
          {/* Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="cursor-pointer select-none font-display text-2xl font-bold tracking-tight text-[#14102A] dark:text-white"
          >
            Duck<span className="text-[#6F00D6] dark:text-[#19E85F]">Mind</span>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#645F78] md:flex dark:text-[#9D96B8]">
            <button
              onClick={() => scrollToSection('modos')}
              className="transition-colors hover:text-[#14102A] dark:hover:text-white"
            >
              Modos
            </button>
            <button
              onClick={() => scrollToSection('recursos')}
              className="transition-colors hover:text-[#14102A] dark:hover:text-white"
            >
              Recursos
            </button>
            <button
              onClick={() => scrollToSection('como-funciona')}
              className="transition-colors hover:text-[#14102A] dark:hover:text-white"
            >
              Como funciona
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:inline-flex text-xs font-bold text-[#645F78] hover:text-[#14102A] px-3 py-2 rounded-full transition-colors dark:text-[#9D96B8] dark:hover:text-white"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="inline-flex items-center justify-center rounded-full bg-[#00D64B] px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-[#14102A] shadow-xs transition-all hover:bg-[#19E85F] hover:shadow-md active:scale-[0.98]"
            >
              <span className="hidden sm:inline">Começar grátis</span>
              <span className="sm:hidden">Começar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 sm:px-8 lg:grid-cols-12">
          {/* Left Column */}
          <div className="lg:col-span-7">
            {/* Pill */}
            <div className="mb-6 inline-block rounded-full bg-[#FEF3C7] px-3.5 py-1 text-xs font-bold text-[#92400E] dark:bg-amber-500/15 dark:text-amber-300">
              Dois modos, um só app
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[54px] font-bold leading-[1.12] tracking-tight text-[#14102A] dark:text-white">
              Do vestibular à faculdade,{' '}
              <span className="hidden sm:inline">sua rotina de estudos num só lugar.</span>
              <span className="sm:hidden">numa rotina só.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 max-w-xl text-base sm:text-lg font-normal leading-relaxed text-[#645F78] dark:text-[#9D96B8]">
              Troque de modo conforme sua fase: edital e simulados para o ENEM, disciplinas e provas para a graduação.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center justify-center rounded-full bg-[#00D64B] px-7 py-3.5 text-sm font-bold text-[#14102A] shadow-md shadow-[#00D64B]/20 transition-all hover:bg-[#19E85F] hover:shadow-lg active:scale-[0.98]"
              >
                Começar grátis
              </button>
              <button
                onClick={() => scrollToSection('modos')}
                className="inline-flex items-center justify-center rounded-full border border-slate-200/90 bg-white px-6 py-3.5 text-sm font-bold text-[#14102A] shadow-xs transition-all hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Conhecer os modos
              </button>
            </div>
          </div>

          {/* Right Column (Hero Graphic with Overlapping Cards) */}
          <div className="relative flex flex-col items-center justify-center lg:col-span-5">
            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute -top-12 -right-8 h-72 w-72 rounded-full bg-[#00D64B]/20 blur-3xl dark:bg-[#00D64B]/15" />
            <div className="pointer-events-none absolute -bottom-12 -left-8 h-72 w-72 rounded-full bg-[#6F00D6]/25 blur-3xl dark:bg-[#6F00D6]/20" />

            <div className="relative z-10 flex w-full max-w-sm flex-col gap-4 md:max-w-md">
              {/* Card 1: Vestibular */}
              <div className="rounded-[24px] border border-slate-200/90 bg-white p-5 shadow-xl transition-all duration-300 hover:shadow-2xl dark:border-white/10 dark:bg-[#131124] md:w-[350px]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-[#008E32] dark:bg-emerald-500/20 dark:text-[#00D64B]">
                    <ClipboardCheck size={16} strokeWidth={2.4} />
                  </div>
                  <span className="font-display text-sm font-bold text-[#14102A] dark:text-white">
                    Vestibular
                  </span>
                </div>
                <div className="mt-1 text-[11px] font-medium text-slate-500 dark:text-[#9D96B8]">
                  ENEM 2026 · Edital, simulados e redação
                </div>

                <div className="mt-4 flex items-center gap-5">
                  {/* Circular progress 77% */}
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100 dark:text-white/10"
                        strokeWidth="3.2"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#00D64B]"
                        strokeDasharray="77, 100"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute font-display text-xs font-bold text-[#14102A] dark:text-white">
                      77%
                    </span>
                  </div>

                  {/* Bullet points */}
                  <div className="flex flex-col gap-1.5 text-xs font-medium text-[#14102A] dark:text-[#E2E0EC]">
                    <div className="flex items-center gap-2">
                      <Check size={13} className="text-[#00D64B] shrink-0" strokeWidth={2.6} />
                      <span>Edital completo por área</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={13} className="text-[#00D64B] shrink-0" strokeWidth={2.6} />
                      <span>Simulados com correção</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={13} className="text-[#00D64B] shrink-0" strokeWidth={2.6} />
                      <span>Banco de redações</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Universitário (Overlapping slightly on desktop) */}
              <div className="rounded-[24px] border border-slate-200/90 bg-white p-5 shadow-xl transition-all duration-300 hover:shadow-2xl dark:border-white/10 dark:bg-[#131124] md:-mt-6 md:ml-12 md:w-[350px]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-[#6F00D6] dark:bg-purple-500/20 dark:text-[#B26BFF]">
                    <GraduationCap size={16} strokeWidth={2.4} />
                  </div>
                  <span className="font-display text-sm font-bold text-[#14102A] dark:text-white">
                    Universitário
                  </span>
                </div>
                <div className="mt-1 text-[11px] font-medium text-slate-500 dark:text-[#9D96B8]">
                  Semestre 2026.1 · Disciplinas e provas
                </div>

                <div className="mt-4 flex items-center gap-5">
                  {/* Circular progress 86% */}
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100 dark:text-white/10"
                        strokeWidth="3.2"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#6F00D6] dark:text-[#B26BFF]"
                        strokeDasharray="86, 100"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute font-display text-xs font-bold text-[#14102A] dark:text-white">
                      86%
                    </span>
                  </div>

                  {/* Bullet points */}
                  <div className="flex flex-col gap-1.5 text-xs font-medium text-[#14102A] dark:text-[#E2E0EC]">
                    <div className="flex items-center gap-2">
                      <Check size={13} className="text-[#6F00D6] dark:text-[#B26BFF] shrink-0" strokeWidth={2.6} />
                      <span>Notas e média por disciplina</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={13} className="text-[#6F00D6] dark:text-[#B26BFF] shrink-0" strokeWidth={2.6} />
                      <span>Prazos e entregas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={13} className="text-[#6F00D6] dark:text-[#B26BFF] shrink-0" strokeWidth={2.6} />
                      <span>Resumos e flashcards</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section MODOS */}
      <section id="modos" className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
        <div className="text-center">
          <span className="font-display text-xs font-bold tracking-widest uppercase text-[#6F00D6] dark:text-[#B26BFF]">
            Modos
          </span>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#14102A] dark:text-white">
            Um app, duas rotinas
          </h2>
          <p className="mt-2 text-sm sm:text-base font-normal text-[#645F78] dark:text-[#9D96B8]">
            Mude de modo quando sua fase mudar — seus dados continuam com você.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Card Modo Vestibular */}
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-7 sm:p-9 shadow-xs transition-all duration-200 hover:shadow-md dark:border-white/5 dark:bg-[#131124]">
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-[#008E32] dark:bg-emerald-500/20 dark:text-[#00D64B]">
              <ClipboardCheck size={20} strokeWidth={2.4} />
            </div>
            <h3 className="font-display text-lg font-bold text-[#14102A] dark:text-white">
              Modo Vestibular
            </h3>
            <p className="mt-2 text-sm font-normal leading-relaxed text-[#645F78] dark:text-[#9D96B8]">
              Organize o edital do ENEM por área, registre simulados e acompanhe suas redações por competência.
            </p>
          </div>

          {/* Card Modo Universitário */}
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-7 sm:p-9 shadow-xs transition-all duration-200 hover:shadow-md dark:border-white/5 dark:bg-[#131124]">
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-[#6F00D6] dark:bg-purple-500/20 dark:text-[#B26BFF]">
              <GraduationCap size={20} strokeWidth={2.4} />
            </div>
            <h3 className="font-display text-lg font-bold text-[#14102A] dark:text-white">
              Modo Universitário
            </h3>
            <p className="mt-2 text-sm font-normal leading-relaxed text-[#645F78] dark:text-[#9D96B8]">
              Acompanhe disciplinas, notas, prazos de entrega e monte resumos e flashcards por matéria.
            </p>
          </div>
        </div>
      </section>

      {/* Section RECURSOS */}
      <section id="recursos" className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
        <div className="text-center">
          <span className="font-display text-xs font-bold tracking-widest uppercase text-[#6F00D6] dark:text-[#B26BFF]">
            Recursos
          </span>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#14102A] dark:text-white">
            O que os dois modos têm em comum
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Cronômetro de foco */}
          <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:shadow-md dark:border-white/5 dark:bg-[#131124]">
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-[#6F00D6] dark:bg-purple-500/20 dark:text-[#B26BFF]">
              <Clock size={19} strokeWidth={2.3} />
            </div>
            <h3 className="font-display text-base font-bold text-[#14102A] dark:text-white">
              Cronômetro de foco
            </h3>
            <p className="mt-2 text-xs sm:text-sm font-normal leading-relaxed text-[#645F78] dark:text-[#9D96B8]">
              Registre cada sessão de estudo e acompanhe sua meta diária.
            </p>
          </div>

          {/* Organização completa */}
          <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:shadow-md dark:border-white/5 dark:bg-[#131124]">
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-[#6F00D6] dark:bg-purple-500/20 dark:text-[#B26BFF]">
              <BookOpen size={19} strokeWidth={2.3} />
            </div>
            <h3 className="font-display text-base font-bold text-[#14102A] dark:text-white">
              Organização completa
            </h3>
            <p className="mt-2 text-xs sm:text-sm font-normal leading-relaxed text-[#645F78] dark:text-[#9D96B8]">
              Conteúdo por área ou disciplina, com progresso por tópico.
            </p>
          </div>

          {/* Metas e progresso */}
          <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:shadow-md dark:border-white/5 dark:bg-[#131124]">
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-[#6F00D6] dark:bg-purple-500/20 dark:text-[#B26BFF]">
              <BarChart2 size={19} strokeWidth={2.3} />
            </div>
            <h3 className="font-display text-base font-bold text-[#14102A] dark:text-white">
              Metas e progresso
            </h3>
            <p className="mt-2 text-xs sm:text-sm font-normal leading-relaxed text-[#645F78] dark:text-[#9D96B8]">
              Tempo estudado, questões e aproveitamento, sempre à vista.
            </p>
          </div>

          {/* Gamificação */}
          <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:shadow-md dark:border-white/5 dark:bg-[#131124]">
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-[#6F00D6] dark:bg-purple-500/20 dark:text-[#B26BFF]">
              <Trophy size={19} strokeWidth={2.3} />
            </div>
            <h3 className="font-display text-base font-bold text-[#14102A] dark:text-white">
              Gamificação
            </h3>
            <p className="mt-2 text-xs sm:text-sm font-normal leading-relaxed text-[#645F78] dark:text-[#9D96B8]">
              Sequências e conquistas que tornam o hábito mais leve.
            </p>
          </div>
        </div>
      </section>

      {/* Section COMO FUNCIONA */}
      <section id="como-funciona" className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
        <div className="text-center">
          <span className="font-display text-xs font-bold tracking-widest uppercase text-[#6F00D6] dark:text-[#B26BFF]">
            Como funciona
          </span>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#14102A] dark:text-white">
            Três passos até sua rotina de estudo
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {/* Step 01 */}
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-7 sm:p-8 shadow-xs transition-all duration-200 hover:shadow-md dark:border-white/5 dark:bg-[#131124]">
            <div className="font-display text-2xl font-bold text-[#00D64B]">
              01
            </div>
            <h3 className="mt-2 font-display text-base font-bold text-[#14102A] dark:text-white">
              Escolha seu modo
            </h3>
            <p className="mt-2 text-sm font-normal leading-relaxed text-[#645F78] dark:text-[#9D96B8]">
              Vestibular ou universitário — você pode trocar quando quiser.
            </p>
          </div>

          {/* Step 02 */}
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-7 sm:p-8 shadow-xs transition-all duration-200 hover:shadow-md dark:border-white/5 dark:bg-[#131124]">
            <div className="font-display text-2xl font-bold text-[#00D64B]">
              02
            </div>
            <h3 className="mt-2 font-display text-base font-bold text-[#14102A] dark:text-white">
              Registre cada sessão
            </h3>
            <p className="mt-2 text-sm font-normal leading-relaxed text-[#645F78] dark:text-[#9D96B8]">
              Use o cronômetro e anote questões, notas ou entregas.
            </p>
          </div>

          {/* Step 03 */}
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-7 sm:p-8 shadow-xs transition-all duration-200 hover:shadow-md dark:border-white/5 dark:bg-[#131124]">
            <div className="font-display text-2xl font-bold text-[#00D64B]">
              03
            </div>
            <h3 className="mt-2 font-display text-base font-bold text-[#14102A] dark:text-white">
              Acompanhe sua evolução
            </h3>
            <p className="mt-2 text-sm font-normal leading-relaxed text-[#645F78] dark:text-[#9D96B8]">
              Veja estatísticas, sequência de dias e seu progresso.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="mx-auto max-w-7xl px-6 pb-20 sm:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-[#6F00D6] p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Subtle ambient lighting */}
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-[#9D4EDD]/40 blur-3xl" />
          <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-[#8318E8]/30 blur-2xl" />

          <div className="relative z-10 max-w-xl text-center md:text-left">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Pronto para começar?
            </h2>
            <p className="mt-2 text-sm sm:text-base font-normal text-white/85">
              Crie sua conta e escolha entre o modo Vestibular e o Universitário em poucos minutos.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <button
              onClick={() => navigate('/signup')}
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-bold text-[#6F00D6] shadow-md transition-all hover:bg-slate-50 hover:shadow-lg active:scale-[0.98]"
            >
              Criar minha conta
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 py-10 dark:border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-xs text-[#645F78] sm:flex-row sm:px-8 dark:text-[#9D96B8]">
          <div className="font-display text-base font-bold tracking-tight text-[#14102A] dark:text-white">
            Duck<span className="text-[#6F00D6] dark:text-[#19E85F]">Mind</span>
          </div>
          <div>
            © 2026 DuckMind · para o vestibular e a faculdade
          </div>
        </div>
      </footer>
    </div>
  );
}
