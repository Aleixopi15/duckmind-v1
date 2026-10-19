import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import LogStudyDialog from '../components/LogStudyDialog';
import StudyTimerDialog from '../components/StudyTimerDialog';
import StreakDialog from '../components/StreakDialog';
import OverviewTab from './dashboard/OverviewTab';
import EditalTab from './dashboard/EditalTab';
import ActivityTab from './dashboard/ActivityTab';
import SimuladosTab from './dashboard/SimuladosTab';
import StatsTab from './dashboard/StatsTab';
import ProfileTab from './dashboard/ProfileTab';
import SettingsTab from './dashboard/SettingsTab';
import RedacaoTab from './dashboard/RedacaoTab';
import ErrorNotebookTab from './dashboard/ErrorNotebookTab';
import SubjectDetailPage from './dashboard/SubjectDetailPage';
import { cn } from '../lib/theme';
import { LayoutDashboard, BookOpen, History, ClipboardList, PenLine, AlertCircle, BarChart3, User, Settings, Menu, X, Plus } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Início', icon: LayoutDashboard },
  { id: 'edital', label: 'Edital', icon: BookOpen },
  { id: 'activity', label: 'Atividade', icon: History },
  { id: 'simulados', label: 'Simulados', icon: ClipboardList },
  { id: 'redacao', label: 'Redação', icon: PenLine },
  { id: 'errors', label: 'Caderno de Erros', icon: AlertCircle },
  { id: 'stats', label: 'Estatísticas', icon: BarChart3 },
];

const BOTTOM_TABS = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

const DRAWER_WIDTH = 240;

type NavTab = { id: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }> };

function NavButton({ tab, active, onClick }: { tab: NavTab; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn('nav-item', active && 'nav-item-active')}>
      <span className="truncate">{tab.label}</span>
    </button>
  );
}

export default function DashboardPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [logOpen, setLogOpen] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);
  const [pendingMinutes, setPendingMinutes] = useState(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [errorFilterSubjectId, setErrorFilterSubjectId] = useState<string | null>(null);
  const [errorFilterTopicId, setErrorFilterTopicId] = useState<string | null>(null);
  const { profile, user } = useApp();
  const navigate = useNavigate();

  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/'); };
  const streak = profile?.current_streak ?? 0;
  const avatarEmoji = profile?.avatar_emoji ?? '🦆';
  const initial = (profile?.display_name ?? 'Você').trim().charAt(0).toUpperCase() || 'D';

  const handleTimerComplete = (minutes: number) => {
    setTimerOpen(false); setPendingMinutes(minutes); setLogOpen(true);
  };

  const pageLabel = TABS.concat(BOTTOM_TABS).find(t => t.id === activeTab)?.label || 'Início';

  const go = (id: string) => { setSelectedSubjectId(null); setActiveTab(id); setDrawerOpen(false); };

  const sidebarInner = (
    <div className="flex h-full select-none flex-col overflow-hidden bg-white px-4 pb-4 pt-6 dark:bg-[#120C22]">
      {/* Marca */}
      <div className="flex shrink-0 items-center justify-between gap-2 px-2 pb-[18px]">
        <Logo size="md" />
        {drawerOpen && (
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setDrawerOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-tinta text-tinta dark:border-papel dark:text-papel md:hidden"
          >
            <X size={16} strokeWidth={2.6} />
          </button>
        )}
      </div>

      {/* Navegação principal */}
      <div className="no-scrollbar flex flex-1 flex-col justify-between gap-2 overflow-y-auto">
        <div className="flex flex-col gap-1.5">
          {TABS.map(t => (
            <NavButton key={t.id} tab={t} active={activeTab === t.id && !selectedSubjectId} onClick={() => go(t.id)} />
          ))}
        </div>

        <div className="nav-divider flex shrink-0 flex-col gap-1.5">
          {BOTTOM_TABS.map(t => (
            <NavButton key={t.id} tab={t} active={activeTab === t.id && !selectedSubjectId} onClick={() => go(t.id)} />
          ))}

          <button
            onClick={handleLogout}
            className="dm-pill w-full justify-center border-[3px] border-tinta bg-bico py-2.5 text-[17px] font-bold text-tinta shadow-brutal-sm transition-transform hover:bg-[#EF9100] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none dark:border-papel"
          >
            Sair
          </button>

          <div className="mt-2 flex items-center justify-between px-2">
            <span className="text-sm font-bold text-muted dark:text-papel/60">Tema</span>
            <ThemeToggle size={16} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-papel text-tinta transition-colors duration-300 dark:bg-surface-dark dark:text-papel">
      {/* Sidebar desktop */}
      <aside
        className="fixed left-0 top-0 z-40 hidden h-screen flex-col border-r-[3px] border-tinta bg-white dark:border-papel/40 dark:bg-[#120C22] md:flex"
        style={{ width: DRAWER_WIDTH }}
      >
        {sidebarInner}
      </aside>

      {/* Drawer mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[900] overscroll-contain animate-fade-in md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 h-full w-full cursor-default bg-tinta/60"
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className="absolute left-0 top-0 z-10 flex h-full w-64 max-w-[85vw] flex-col border-r-[3px] border-tinta bg-white shadow-[8px_8px_0_#00D64B] dark:border-papel/40 dark:bg-[#120C22]"
          >
            {sidebarInner}
          </aside>
        </div>
      )}

      {/* Área principal */}
      <div className="flex min-h-screen min-w-0 max-w-full flex-col overflow-x-hidden pb-24 md:ml-[240px] md:pb-0">
        {/* Cabeçalho */}
        <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between gap-3 border-b-[3px] border-tinta bg-white px-4 transition-colors duration-300 dark:border-papel/40 dark:bg-[#120C22] md:px-8">
          {/* Mobile: marca */}
          <div className="flex min-w-0 items-center gap-2 md:hidden">
            <Logo size="sm" />
          </div>

          {/* Desktop: trilha */}
          <div className="hidden min-w-0 items-center gap-2.5 md:flex">
            <span className="rounded-[16px] border-[3px] border-tinta bg-pato px-3 py-0.5 text-sm font-bold text-tinta dark:border-papel">
              ENEM 2026
            </span>
            <span className="font-display text-lg font-bold text-muted dark:text-papel/50">/</span>
            <span className="truncate font-display text-lg font-bold text-tinta dark:text-papel">{pageLabel}</span>
          </div>

          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            {/* Ofensiva */}
            <button
              onClick={() => setStreakOpen(true)}
              className={cn(
                'dm-pill border-[3px] transition-transform hover:-translate-y-px active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
                streak > 0
                  ? 'border-tinta bg-bico text-tinta shadow-brutal-sm dark:border-papel'
                  : 'border-tinta bg-white text-tinta dark:border-papel dark:bg-transparent dark:text-papel',
              )}
              style={{ fontSize: 15, padding: '2px 12px' }}
            >
              {streak} {streak === 1 ? 'dia' : 'dias'}
            </button>

            {/* Cronômetro */}
            <button
              onClick={() => setTimerOpen(true)}
              aria-label="Abrir cronômetro"
              className="dm-pill hidden border-[3px] border-tinta bg-white text-tinta hover:bg-papel dark:border-papel dark:bg-transparent dark:text-papel sm:inline-flex"
              style={{ fontSize: 16 }}
            >
              Cronômetro
            </button>

            {/* Registrar estudo */}
            <button
              onClick={() => { setPendingMinutes(0); setLogOpen(true); }}
              aria-label="Registrar estudo"
              className="dm-pill hidden border-[3px] border-tinta bg-pato text-tinta shadow-brutal-sm transition-transform hover:-translate-y-px active:translate-x-[2px] active:translate-y-[2px] active:shadow-none dark:border-papel sm:inline-flex"
              style={{ fontSize: 16, padding: '6px 18px' }}
            >
              <Plus size={16} strokeWidth={3} />
              <span className="hidden md:inline">Registrar Estudo</span>
              <span className="md:hidden">Registrar</span>
            </button>

            {/* Menu (mobile) */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menu"
              className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-tinta bg-white text-tinta transition-transform active:translate-x-[2px] active:translate-y-[2px] dark:border-papel dark:bg-transparent dark:text-papel md:hidden"
            >
              <Menu size={18} strokeWidth={2.6} />
            </button>

            {/* Avatar */}
            <button
              onClick={() => go('profile')}
              aria-label="Meu perfil"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] border-tinta bg-mente text-base font-bold text-papel transition-transform hover:-translate-y-px active:translate-x-[2px] active:translate-y-[2px] dark:border-papel"
            >
              {avatarEmoji || initial}
            </button>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="min-w-0 max-w-full flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-7">
          {selectedSubjectId ? (
            <SubjectDetailPage subjectId={selectedSubjectId} onBack={() => setSelectedSubjectId(null)} />
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewTab
                  onNavigate={setActiveTab}
                  onLogStudy={(minutes) => { setPendingMinutes(minutes ?? 0); setLogOpen(true); }}
                  onOpenTimer={() => setTimerOpen(true)}
                  onOpenStreak={() => setStreakOpen(true)}
                />
              )}
              {activeTab === 'edital' && (
                <EditalTab
                  onOpenSubject={setSelectedSubjectId}
                  onOpenErrorNotebook={(subjectId, topicId) => {
                    setErrorFilterSubjectId(subjectId);
                    setErrorFilterTopicId(topicId ?? null);
                    setActiveTab('errors');
                  }}
                />
              )}
              {activeTab === 'activity' && <ActivityTab />}
              {activeTab === 'simulados' && <SimuladosTab />}
              {activeTab === 'redacao' && <RedacaoTab />}
              {activeTab === 'errors' && (
                <ErrorNotebookTab
                  filterSubjectId={errorFilterSubjectId ?? undefined}
                  filterTopicId={errorFilterTopicId ?? undefined}
                  onClearFilter={() => { setErrorFilterSubjectId(null); setErrorFilterTopicId(null); }}
                />
              )}
              {activeTab === 'stats' && <StatsTab />}
              {activeTab === 'profile' && <ProfileTab />}
              {activeTab === 'settings' && <SettingsTab />}
            </>
          )}
        </main>
      </div>

      {/* Navegação inferior (mobile) */}
      <nav
        aria-label="Navegação móvel"
        className="fixed inset-x-0 bottom-0 z-40 flex h-[76px] items-center justify-around border-t-[3px] border-tinta bg-white px-2 dark:border-papel/40 dark:bg-[#120C22] md:hidden"
      >
        {[
          { id: 'overview', label: 'Início' },
          { id: 'edital', label: 'Edital' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => go(t.id)}
            className={cn('tab-item', activeTab === t.id && !selectedSubjectId && 'tab-item-active')}
          >
            {t.label}
          </button>
        ))}

        {/* Ação central */}
        <button
          onClick={() => { setPendingMinutes(0); setLogOpen(true); }}
          aria-label="Registrar estudo"
          className="flex h-[58px] w-[58px] -translate-y-[30px] items-center justify-center rounded-full border-[3px] border-tinta bg-pato text-tinta shadow-brutal-sm transition-transform active:translate-y-[-28px] dark:border-papel"
        >
          <Plus size={30} strokeWidth={3} />
        </button>

        {[
          { id: 'activity', label: 'Atividade' },
          { id: 'profile', label: 'Perfil' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => go(t.id)}
            className={cn('tab-item', activeTab === t.id && !selectedSubjectId && 'tab-item-active')}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <LogStudyDialog open={logOpen} onClose={() => { setLogOpen(false); setPendingMinutes(0); }} initialMinutes={pendingMinutes} />
      <StudyTimerDialog open={timerOpen} onClose={() => setTimerOpen(false)} onComplete={handleTimerComplete} />
      <StreakDialog open={streakOpen} onClose={() => setStreakOpen(false)} />
    </div>
  );
}
