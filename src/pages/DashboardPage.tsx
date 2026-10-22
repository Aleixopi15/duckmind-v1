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
import {
  LayoutDashboard,
  BookOpen,
  History,
  ClipboardList,
  PenLine,
  AlertCircle,
  BarChart3,
  User,
  Settings,
  Menu,
  X,
  Plus,
  Flame,
  LogOut,
} from 'lucide-react';

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

type NavTab = { id: string; label: string; icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }> };

function NavButton({ tab, active, onClick }: { tab: NavTab; active: boolean; onClick: () => void }) {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left',
        active
          ? 'bg-[#00D64B]/15 text-[#008E32] dark:text-[#19E85F] font-bold shadow-xs'
          : 'text-muted hover:text-tinta hover:bg-gray-100/70 dark:text-gray-400 dark:hover:text-texto dark:hover:bg-white/5'
      )}
    >
      <Icon
        size={18}
        strokeWidth={active ? 2.6 : 2}
        className={cn(
          'shrink-0 transition-colors',
          active ? 'text-[#008E32] dark:text-[#19E85F]' : 'text-muted/80 group-hover:text-tinta dark:text-gray-400 dark:group-hover:text-texto'
        )}
      />
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
  const initial = (profile?.display_name ?? 'Pedro').trim().charAt(0).toUpperCase() || 'P';

  const handleTimerComplete = (minutes: number) => {
    setTimerOpen(false); setPendingMinutes(minutes); setLogOpen(true);
  };

  const pageLabel = TABS.concat(BOTTOM_TABS).find(t => t.id === activeTab)?.label || 'Início';

  const go = (id: string) => { setSelectedSubjectId(null); setActiveTab(id); setDrawerOpen(false); };

  const sidebarInner = (
    <div className="flex h-full select-none flex-col justify-between overflow-hidden">
      {/* Marca DuckMind com Mascote em Telas Grandes */}
      <div className="flex shrink-0 items-center justify-between gap-2 px-1 pb-6">
        <Logo size="md" showMascot />
        {drawerOpen && (
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setDrawerOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-gray-100 dark:hover:bg-white/10 md:hidden"
          >
            <X size={18} strokeWidth={2.4} />
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

        <div className="border-t border-gray-100 dark:border-white/5 pt-3 flex shrink-0 flex-col gap-1.5">
          {BOTTOM_TABS.map(t => (
            <NavButton key={t.id} tab={t} active={activeTab === t.id && !selectedSubjectId} onClick={() => go(t.id)} />
          ))}

          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-red-600/80 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all text-left"
          >
            <LogOut size={18} strokeWidth={2} className="shrink-0" />
            <span>Sair</span>
          </button>

          <div className="mt-2 flex items-center justify-between px-3.5 py-1 text-xs text-muted">
            <span className="font-medium">Modo escuro</span>
            <ThemeToggle size={16} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#F6F5FB] text-[#14102A] transition-colors duration-300 dark:bg-[#0B0819] dark:text-[#F3F1FF]">
      {/* Background Ambient Glow (Fiel ao design DuckMind 2.0 das imagens) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Top purple ambient glow */}
        <div className="absolute -top-32 right-[-5%] h-[550px] w-[550px] rounded-full bg-[#6F00D6]/12 blur-[120px] dark:bg-[#6F00D6]/30" />
        {/* Bottom emerald ambient glow */}
        <div className="absolute top-[35%] -left-32 h-[480px] w-[480px] rounded-full bg-[#00D64B]/8 blur-[130px] dark:bg-[#00D64B]/14" />
        {/* Center-bottom violet glow */}
        <div className="absolute -bottom-36 right-[25%] h-[500px] w-[500px] rounded-full bg-[#6F00D6]/8 blur-[140px] dark:bg-[#6F00D6]/20" />
      </div>

      {/* Sidebar desktop: Menu lateral flutuante conforme V2 · Web Início (escuro) */}
      <aside
        className="fixed left-4 top-4 bottom-4 z-40 hidden w-[240px] flex-col rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-2xl backdrop-blur-md dark:border-white/5 dark:bg-[#131024]/90 md:flex"
      >
        {sidebarInner}
      </aside>

      {/* Drawer mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[900] overscroll-contain animate-fade-in md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 h-full w-full cursor-default bg-black/50 backdrop-blur-xs"
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className="absolute left-0 top-0 z-10 flex h-full w-64 max-w-[85vw] flex-col border-r border-slate-200/80 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#0D0A1F]"
          >
            {sidebarInner}
          </aside>
        </div>
      )}

      {/* Área principal integrada */}
      <div className="relative z-10 flex min-h-screen min-w-0 max-w-full flex-col overflow-x-hidden pb-28 md:ml-[264px] md:pb-8">
        {/* Cabeçalho sem limitações/separadores rígidos: Totalmente integrado ao fundo */}
        <header className="flex h-[72px] shrink-0 items-center justify-between gap-3 px-4 pt-3 pb-2 md:px-8 md:pt-6 md:pb-4 transition-colors">
          {/* Mobile: Apenas Logo DuckMind à esquerda (sem menu aqui) */}
          <div className="flex min-w-0 items-center gap-2 md:hidden">
            <Logo size="md" />
          </div>

          {/* Desktop: Trilha / Breadcrumb */}
          <div className="hidden min-w-0 items-center gap-2 md:flex">
            <span className="rounded-full bg-[#00D64B]/15 px-3.5 py-1 font-display text-xs font-bold text-[#008E32] dark:text-[#19E85F]">
              ENEM 2026
            </span>
            <span className="text-slate-300 dark:text-white/20 font-display">/</span>
            <span className="truncate font-display text-sm font-bold text-[#14102A] dark:text-white">
              {pageLabel}
            </span>
          </div>

          {/* Ações da Direita */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5 md:gap-3">
            {/* Ofensiva: Pílula moderna de ofensivas */}
            <button
              onClick={() => setStreakOpen(true)}
              aria-label="Ver ofensiva"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 text-[#D68200] dark:text-[#FFB84D] hover:bg-amber-500/20 text-xs font-bold transition-all hover:scale-102"
            >
              <Flame size={14} strokeWidth={2.6} className="text-[#D68200] dark:text-[#FFB84D] hidden xs:inline-block" />
              <span>{streak} {streak === 1 ? 'dia' : 'dias'}</span>
            </button>

            {/* Botão Cronômetro */}
            <button
              onClick={() => setTimerOpen(true)}
              aria-label="Abrir cronômetro"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-full bg-slate-200/70 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-[#14102A] dark:text-white text-xs font-bold transition-colors"
            >
              Cronômetro
            </button>

            {/* Registrar Estudo */}
            <button
              onClick={() => { setPendingMinutes(0); setLogOpen(true); }}
              aria-label="Registrar estudo"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#00D64B] hover:bg-[#19E85F] text-[#14102A] text-xs font-bold shadow-[0_4px_16px_rgba(25,232,95,0.3)] transition-all active:scale-[0.98] dark:bg-[#19E85F] dark:hover:bg-[#25f46c]"
            >
              <Plus size={15} strokeWidth={3} />
              <span>Registrar Estudo</span>
            </button>

            {/* Alternador de tema */}
            <ThemeToggle />

            {/* Avatar circular moderno: CLIQUE ABRE O PERFIL */}
            <button
              onClick={() => go('profile')}
              aria-label="Meu perfil"
              title="Acessar Perfil"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#6F00D6] dark:bg-[#7D12EC] text-white font-display text-sm font-bold shadow-xs hover:opacity-90 transition-opacity active:scale-95"
            >
              {initial}
            </button>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="min-w-0 max-w-full flex-1 px-4 py-4 sm:px-6 md:px-8 md:py-5">
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

      {/* Menu flutuante na parte inferior da tela (Mobile conforme V2 · Mobile Início) */}
      <nav
        aria-label="Navegação móvel"
        className="fixed bottom-4 inset-x-4 max-w-[420px] mx-auto z-40 flex h-[66px] items-center justify-around rounded-[32px] bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_12px_36px_rgba(20,16,42,0.18)] dark:border-white/10 dark:bg-[#14102A]/90 dark:shadow-[0_12px_36px_rgba(0,0,0,0.5)] px-2 md:hidden"
      >
        {/* 1: Início */}
        <button
          onClick={() => go('overview')}
          className={cn('tab-item flex-1', activeTab === 'overview' && !selectedSubjectId && 'tab-item-active')}
        >
          <LayoutDashboard size={20} strokeWidth={activeTab === 'overview' ? 2.6 : 2} />
          <span>Início</span>
        </button>

        {/* 2: Edital */}
        <button
          onClick={() => go('edital')}
          className={cn('tab-item flex-1', activeTab === 'edital' && !selectedSubjectId && 'tab-item-active')}
        >
          <BookOpen size={20} strokeWidth={activeTab === 'edital' ? 2.6 : 2} />
          <span>Edital</span>
        </button>

        {/* 3: Botão de ação flutuante elevado no centro com glow verde */}
        <div className="flex-1 flex justify-center">
          <button
            onClick={() => { setPendingMinutes(0); setLogOpen(true); }}
            aria-label="Registrar estudo"
            className="flex h-14 w-14 -translate-y-5 items-center justify-center rounded-full bg-[#00D64B] text-[#14102A] shadow-[0_10px_28px_rgba(25,232,95,0.5)] transition-all active:scale-95 hover:scale-105 dark:bg-[#19E85F]"
          >
            <Plus size={30} strokeWidth={2.8} />
          </button>
        </div>

        {/* 4: Atividade */}
        <button
          onClick={() => go('activity')}
          className={cn('tab-item flex-1', activeTab === 'activity' && !selectedSubjectId && 'tab-item-active')}
        >
          <History size={20} strokeWidth={activeTab === 'activity' ? 2.6 : 2} />
          <span>Atividade</span>
        </button>

        {/* 5: Menu de três barras substituindo o perfil */}
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menu de navegação"
          className={cn(
            'tab-item flex-1',
            drawerOpen && 'tab-item-active'
          )}
        >
          <Menu size={22} strokeWidth={2.4} />
          <span>Menu</span>
        </button>
      </nav>

      <LogStudyDialog open={logOpen} onClose={() => { setLogOpen(false); setPendingMinutes(0); }} initialMinutes={pendingMinutes} />
      <StudyTimerDialog open={timerOpen} onClose={() => setTimerOpen(false)} onComplete={handleTimerComplete} />
      <StreakDialog open={streakOpen} onClose={() => setStreakOpen(false)} />
    </div>
  );
}
