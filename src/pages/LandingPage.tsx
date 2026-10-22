import { useNavigate } from 'react-router-dom';
import DuckMascot from '../components/DuckMascot';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import { Flame, Timer, TrendingUp, ArrowRight, ClipboardList, BookOpen, ShieldCheck, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Flame,
    title: 'Ofensiva diária inteligente',
    desc: 'Mantenha sua sequência inabalável de estudos com feedback visual e celebração do mascote.',
    accent: '#00D64B',
  },
  {
    icon: BookOpen,
    title: 'Domínio total do edital',
    desc: 'Acompanhe tópicos concluídos, barras de progresso por área de conhecimento e saiba exatamente o que falta.',
    accent: '#6F00D6',
  },
  {
    icon: Timer,
    title: 'Cronômetro & Pomodoro',
    desc: 'Cronometre seus blocos de foco em tempo real com alertas sonoros ou registre estudos concluídos no dia.',
    accent: '#00D64B',
  },
  {
    icon: ClipboardList,
    title: 'Simulados ENEM & Áreas',
    desc: 'Registre acertos gerais ou por área, notas TRI estimadas, tempo de prova e acompanhe sua curva de crescimento.',
    accent: '#6F00D6',
  },
  {
    icon: TrendingUp,
    title: 'Estatísticas & Aproveitamento',
    desc: 'Métricas completas de acertos por disciplina, taxa de acerto por matéria, tempo acumulado e metas semanais.',
    accent: '#00D64B',
  },
  {
    icon: ShieldCheck,
    title: '100% Gratuito & Aberto',
    desc: 'Sem assinaturas, sem paywalls. Todas as ferramentas essenciais para a sua aprovação no vestibular.',
    accent: '#6F00D6',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-[#14102A] transition-colors duration-300 dark:bg-[#0F0C1E] dark:text-[#F3F1FF]">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-white/5 dark:bg-[#151826]/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo size="md" />
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <button
              onClick={() => navigate('/login')}
              className="hidden rounded-full px-4 py-2 text-xs font-bold text-[#645F78] transition-colors hover:text-[#14102A] dark:text-[#9D96B8] dark:hover:text-white sm:inline-flex"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#00D64B] px-5 py-2 text-xs font-bold text-[#14102A] shadow-xs transition-all hover:bg-[#19E85F] hover:shadow-md active:scale-[0.98]"
            >
              <span>Começar grátis</span>
              <ArrowRight size={13} strokeWidth={2.6} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20 lg:py-24">
        {/* Ambient lighting */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#6F00D6]/10 blur-3xl dark:bg-[#6F00D6]/15" />
        <div className="pointer-events-none absolute top-40 right-10 h-72 w-72 rounded-full bg-[#00D64B]/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 md:grid-cols-2">
          <div className="animate-fade-in">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#00D64B]/30 bg-[#00D64B]/10 px-3.5 py-1 text-xs font-bold text-[#008E32] dark:text-[#00D64B]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00D64B] animate-pulse" />
              <span>DuckMind 2.0 · ENEM 2026 & Vestibulares</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight text-[#14102A] dark:text-white">
              Estude com método e{' '}
              <span className="relative inline-block text-[#6F00D6] dark:text-[#00D64B]">
                conquiste sua vaga
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base sm:text-lg font-medium leading-relaxed text-[#645F78] dark:text-[#9D96B8]">
              Plataforma gamificada para vestibulandos que buscam consistência diária, domínio total do edital e evolução comprovada por métricas reais.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center gap-2 rounded-full bg-[#00D64B] px-7 py-3.5 text-sm font-bold text-[#14102A] shadow-sm transition-all hover:bg-[#19E85F] hover:shadow-md active:scale-[0.98]"
              >
                <span>Criar conta gratuita</span>
                <ArrowRight size={16} strokeWidth={2.6} />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-6 py-3.5 text-sm font-bold text-[#14102A] shadow-xs transition-all hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Já tenho conta
              </button>
            </div>

            {/* Quick Proof Counters */}
            <div className="mt-10 flex flex-wrap gap-3">
              {[
                ['10k+', 'Estudantes ativos'],
                ['98%', 'Aprovação com método'],
                ['100%', 'Sem pegadinhas ou custo'],
              ].map(([n, l]) => (
                <div
                  key={l}
                  className="min-w-[120px] rounded-[18px] border border-slate-200/80 bg-white px-4 py-3 shadow-xs dark:border-white/5 dark:bg-[#151826]"
                >
                  <div className="font-display text-2xl font-bold text-[#14102A] dark:text-white">{n}</div>
                  <div className="mt-0.5 text-xs font-semibold text-[#645F78] dark:text-[#9D96B8]">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual Card / Mascot Showcase */}
          <div className="relative flex items-center justify-center">
            {/* Glowing circle backdrop */}
            <div className="absolute h-72 w-72 sm:h-80 sm:w-80 rounded-full bg-gradient-to-tr from-[#6F00D6]/20 to-[#00D64B]/20 blur-2xl" />

            <div className="relative z-10 flex flex-col items-center">
              <DuckMascot size={260} mood="celebrating" animate fullBody className="sm:size-[300px]" />

              {/* Floating badges */}
              <div className="absolute -top-2 right-0 sm:right-6 flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/95 px-4 py-2 shadow-md backdrop-blur-md dark:border-white/10 dark:bg-[#151826]/95">
                <Flame size={16} className="text-[#00D64B]" />
                <span className="font-display text-xs font-bold text-[#14102A] dark:text-white">15 dias de ofensiva</span>
              </div>

              <div className="absolute bottom-4 left-0 sm:left-4 flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/95 px-4 py-2 shadow-md backdrop-blur-md dark:border-white/10 dark:bg-[#151826]/95">
                <TrendingUp size={16} className="text-[#00D64B]" />
                <span className="font-display text-xs font-bold text-[#14102A] dark:text-white">+28% de acertos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6F00D6]/10 px-3.5 py-1 text-xs font-bold text-[#6F00D6] dark:bg-[#6F00D6]/20 dark:text-[#B26BFF]">
            <Sparkles size={13} />
            Recursos Completos
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#14102A] dark:text-white">
            Tudo que você precisa para ser aprovado
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base font-medium text-[#645F78] dark:text-[#9D96B8]">
            Do edital esquematizado à análise profunda dos seus simulados: dados visuais claros e motivação diária.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc, accent }) => (
            <article
              key={title}
              className="group rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md dark:border-white/5 dark:bg-[#151826] dark:hover:border-white/15"
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl shadow-xs transition-transform group-hover:scale-105"
                style={{ background: `${accent}18`, color: accent }}
              >
                <Icon size={22} strokeWidth={2.4} />
              </div>
              <h3 className="font-display text-lg font-bold text-[#14102A] dark:text-white">{title}</h3>
              <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed text-[#645F78] dark:text-[#9D96B8]">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Call to action section */}
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-gradient-to-br from-[#120F24] via-[#171330] to-[#0D0A1A] p-8 sm:p-12 text-center text-white shadow-xl dark:border-white/10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#00D64B]/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-[#6F00D6]/30 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center">
            <DuckMascot size={90} mood="fire" animate />
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Seu futuro universitário começa hoje.
            </h2>
            <p className="mt-3 max-w-lg text-sm sm:text-base font-medium text-[#9D96B8]">
              Junte-se a milhares de estudantes que abandonaram o caos e organizaram sua preparação com o DuckMind.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#00D64B] px-8 py-3.5 text-sm font-bold text-[#14102A] shadow-md transition-all hover:bg-[#19E85F] hover:shadow-lg active:scale-[0.98]"
            >
              <span>Começar agora — é 100% gratuito</span>
              <ArrowRight size={16} strokeWidth={2.6} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 py-8 text-center text-xs font-semibold text-[#645F78] dark:border-white/5 dark:text-[#9D96B8]">
        © 2026 DuckMind · Feito para vestibulandos rumo à aprovação
      </footer>
    </div>
  );
}
