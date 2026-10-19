import { useNavigate } from 'react-router-dom';
import DuckMascot from '../components/DuckMascot';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import { Flame, BarChart3, Timer, TrendingUp, ArrowRight, ClipboardList } from 'lucide-react';

const features = [
  { icon: Flame, title: 'Ofensiva diária', desc: 'Mantenha sua sequência de estudos com o sistema de ofensiva gamificado.' },
  { icon: BarChart3, title: 'Progresso no edital', desc: 'Veja o quanto já estudou de cada matéria com barras de progresso detalhadas.' },
  { icon: Timer, title: 'Cronômetro & Pomodoro', desc: 'Cronometre suas sessões em tempo real ou registre estudos já concluídos.' },
  { icon: ClipboardList, title: 'Simulados ENEM', desc: 'Registre notas de simulados completos e acompanhe sua evolução mês a mês.' },
  { icon: TrendingUp, title: 'Estatísticas avançadas', desc: 'Gráficos de rendimento por matéria, tempo estudado e evolução.' },
  { icon: BarChart3, title: '100% gratuito', desc: 'Sem assinatura, sem limites. Tudo que você precisa para passar no ENEM.' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-papel text-tinta dark:bg-surface-dark dark:text-papel">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b-[3px] border-tinta bg-white dark:border-papel/40 dark:bg-[#120C22]">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 md:px-6">
          <Logo size="md" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => navigate('/login')} className="btn hidden bg-transparent px-3 py-2 text-sm shadow-none hover:bg-papel sm:inline-flex">
              Entrar
            </button>
            <button onClick={() => navigate('/signup')} className="btn bg-pato px-4 py-2 text-sm text-tinta">
              Começar grátis
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="overflow-hidden py-12 md:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2 md:px-6">
          <div className="animate-slide-up">
            <span className="chip mb-5 inline-flex items-center gap-1.5 bg-bico px-3 py-1.5 text-tinta dark:border-papel">
              <span className="h-2 w-2 rounded-full bg-tinta" />
              ENEM 2026 · Vestibulares
            </span>

            <h1 className="font-display text-[2.6rem] font-bold leading-[1.05] tracking-tight sm:text-[3.4rem] md:text-[3.8rem]">
              Estude com método e{' '}
              <span className="inline-block rounded-[20px] border-[3px] border-tinta bg-mente px-3 pb-2.5 pt-0.5 leading-[1.12] text-papel dark:border-papel">
                passe no ENEM
              </span>
            </h1>

            <p className="mt-5 max-w-md text-lg font-semibold leading-relaxed text-muted dark:text-papel/70">
              Plataforma gamificada para vestibulandos que buscam consistência diária, domínio do edital e evolução comprovada por dados reais.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => navigate('/signup')} className="btn bg-pato px-6 py-3 text-base text-tinta">
                Criar conta grátis <ArrowRight size={18} strokeWidth={3} />
              </button>
              <button onClick={() => navigate('/login')} className="btn bg-white px-6 py-3 text-base dark:border-papel dark:bg-transparent dark:text-papel">
                Já tenho conta
              </button>
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              {[['10k+', 'Estudantes'], ['98%', 'Aprovação'], ['100%', 'Gratuito']].map(([n, l]) => (
                <div
                  key={l}
                  className="min-w-[104px] rounded-[18px] border-[3px] border-tinta bg-white px-4 py-2.5 dark:border-papel dark:bg-transparent"
                >
                  <div className="font-display text-2xl font-bold leading-none">{n}</div>
                  <div className="mt-1 text-xs font-bold text-muted dark:text-papel/60">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Composição do mascote */}
          <div className="relative flex items-center justify-center">
            <div className="absolute h-64 w-64 rounded-full border-[4px] border-tinta bg-mente md:h-80 md:w-80 dark:border-papel" />
            <DuckMascot size={250} mood="celebrating" animate fullBody className="relative z-10 md:size-[300px]" />

            <div className="absolute right-0 top-2 rounded-[18px] border-[3px] border-tinta bg-bico px-3.5 py-2 shadow-brutal-sm dark:border-papel">
              <div className="flex items-center gap-2">
                <Flame size={16} strokeWidth={2.8} />
                <span className="font-display text-sm font-bold">15 dias seguidos</span>
              </div>
            </div>
            <div className="absolute bottom-2 left-0 rounded-[18px] border-[3px] border-tinta bg-white px-3.5 py-2 shadow-brutal-sm dark:border-papel dark:bg-surface-dark-card">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} strokeWidth={2.8} className="text-mente dark:text-pato" />
                <span className="font-display text-sm font-bold">+23% nesta semana</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-20">
        <h2 className="text-center font-display text-[2rem] font-bold tracking-tight sm:text-[2.8rem]">
          Tudo que você precisa para passar
        </h2>
        <p className="mx-auto mb-10 mt-3 max-w-xl text-center text-[17px] font-semibold text-muted dark:text-papel/60">
          Do acompanhamento do edital ao dia da prova: dados claros e motivação contínua para sua aprovação.
        </p>

        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <article key={title} className="card card-hover p-5 sm:p-6">
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] border-[3px] border-tinta text-tinta dark:border-papel"
                style={{ background: i % 3 === 0 ? '#00D64B' : i % 3 === 1 ? '#6F00D6' : '#D68200', color: i % 3 === 1 ? '#FFF9EC' : '#17102B' }}
              >
                <Icon size={24} strokeWidth={2.6} />
              </div>
              <h3 className="font-display text-xl font-bold tracking-tight">{title}</h3>
              <p className="mt-1.5 text-sm font-semibold leading-relaxed text-muted dark:text-papel/60">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-y-[3px] border-tinta bg-pato py-14 md:py-20 dark:border-papel/40">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full border-[4px] border-tinta bg-mente/40" />
        <div className="relative mx-auto max-w-xl px-4 text-center text-tinta">
          <div className="flex justify-center">
            <DuckMascot size={92} mood="fire" animate />
          </div>
          <h2 className="mt-4 font-display text-[2rem] font-bold leading-tight tracking-tight sm:text-[2.8rem]">
            Seu futuro começa hoje.
          </h2>
          <p className="mb-6 mt-3 text-lg font-semibold text-tinta/80">
            Junte-se a milhares de estudantes que já organizaram sua preparação com o DuckMind.
          </p>
          <button onClick={() => navigate('/signup')} className="btn bg-white px-7 py-3.5 text-base">
            Começar agora — é gratuito!
          </button>
        </div>
      </section>

      <footer className="py-8 text-center text-xs font-bold text-muted dark:text-papel/50">
        © 2026 DuckMind · Feito para vestibulandos rumo à aprovação
      </footer>
    </div>
  );
}
