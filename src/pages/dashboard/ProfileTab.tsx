import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import DuckMascot from '../../components/DuckMascot';
import { cn } from '../../lib/theme';
import { Check, Save, School, ShieldCheck, Flame, GraduationCap, Info } from 'lucide-react';
import { getSimulationQuestions, getSimulationDuration } from '../../lib/simulationUtils';
import type { UserMode } from '../../lib/supabase';

const EMOJIS = ['🦆', '🎓', '📚', '🔥', '⭐', '🚀', '💡', '🎯', '🏆', '🌱'];

export default function ProfileTab() {
  const {
    currentMode,
    setMode,
    profile,
    updateProfile,
    sessions,
    simulations,
    universitySessions,
    universitySubjects,
    universityGrades,
    universityTasks,
  } = useApp();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [avatarEmoji, setAvatarEmoji] = useState(profile?.avatar_emoji ?? '🦆');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [goal, setGoal] = useState(String(profile?.goal_daily_minutes ?? 120));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [modeSwitching, setModeSwitching] = useState(false);

  // Vestibular calculations
  const sessionMinutes = sessions.reduce((a, s) => a + s.duration_minutes, 0);
  const simMinutes = simulations.reduce((a, s) => a + getSimulationDuration(s), 0);
  const totalMinutes = sessionMinutes + simMinutes;

  const sessionCorrect = sessions.reduce((a, s) => a + s.questions_correct, 0);
  const sessionQuestions = sessions.reduce((a, s) => a + s.questions_correct + s.questions_wrong, 0);

  const simQuestionsTotal = simulations.reduce((a, s) => a + getSimulationQuestions(s).total, 0);
  const simCorrectTotal = simulations.reduce((a, s) => a + getSimulationQuestions(s).correct, 0);

  const totalCorrect = sessionCorrect + simCorrectTotal;
  const totalQuestions = sessionQuestions + simQuestionsTotal;
  const acc = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // University calculations
  const totalUniMinutes = universitySessions.reduce((a, s) => a + s.duration_minutes, 0);
  const uniCompletedGrades = universityGrades.filter(g => g.score !== null);
  const uniSumScore = uniCompletedGrades.reduce((a, g) => a + (g.score || 0) * (g.weight || 1), 0);
  const uniSumWeights = uniCompletedGrades.reduce((a, g) => a + (g.weight || 1), 0);
  const uniGpa = uniSumWeights > 0 ? (uniSumScore / uniSumWeights).toFixed(1) : '--';
  const uniDoneTasks = universityTasks.filter(t => t.status === 'done').length;

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({
      display_name: displayName,
      avatar_emoji: avatarEmoji,
      bio,
      goal_daily_minutes: parseInt(goal) || 120,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleModeChange = async (newMode: UserMode) => {
    if (newMode === currentMode) return;
    setModeSwitching(true);
    await setMode(newMode);
    setModeSwitching(false);
  };

  return (
    <div className="w-full max-w-3xl min-w-0 animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-[#F3F1FF]">
          Perfil do Estudante
        </h1>
        <p className="mt-1 text-sm font-medium text-[#645F78] dark:text-[#9D96B8]">
          Gerencie seu perfil, alterne entre os modos de estudo e acompanhe suas metas.
        </p>
      </div>

      {/* TOGGLE: MODO VESTIBULAR vs MODO UNIVERSITÁRIO (ISOLAMENTO COMPLETO) */}
      <section className="relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-white/5 dark:bg-[#131024]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#6F00D6]/15 text-[#6F00D6] dark:text-[#9B3DFF]">
                <School size={14} strokeWidth={2.4} />
              </span>
              <h2 className="font-display text-base sm:text-lg font-bold text-[#14102A] dark:text-white">
                Modo de Estudos Atual
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#645F78] dark:text-[#9D96B8]">
              Selecione o ambiente correspondente ao seu momento acadêmico.
            </p>
          </div>

          <span className="inline-flex items-center gap-1 self-start sm:self-auto rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-[#008E32] dark:text-[#19E85F]">
            <ShieldCheck size={13} strokeWidth={2.4} /> Dados 100% Isolados
          </span>
        </div>

        {/* Botoes de Alternancia */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {/* Card Modo Vestibular */}
          <button
            type="button"
            disabled={modeSwitching}
            onClick={() => handleModeChange('vestibular')}
            className={cn(
              'group relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all',
              currentMode === 'vestibular'
                ? 'border-[#00D64B] bg-[#00D64B]/10 shadow-[0_0_20px_rgba(0,214,75,0.15)] ring-2 ring-[#00D64B]'
                : 'border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/80 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10'
            )}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <GraduationCap size={18} strokeWidth={2.4} />
                </span>
                <div>
                  <div className="font-display text-sm font-bold text-[#14102A] dark:text-white">
                    Modo Vestibular
                  </div>
                  <div className="text-[11px] font-medium text-muted">
                    ENEM & Vestibulares
                  </div>
                </div>
              </div>
              {currentMode === 'vestibular' && (
                <span className="h-2.5 w-2.5 rounded-full bg-[#00D64B] ring-4 ring-[#00D64B]/20" />
              )}
            </div>
            <p className="mt-2.5 text-[11px] text-[#645F78] dark:text-[#9D96B8] leading-relaxed">
              Edital temático, simulados cronometrados com TRI, redações corrigidas e caderno de erros.
            </p>
          </button>

          {/* Card Modo Universitario */}
          <button
            type="button"
            disabled={modeSwitching}
            onClick={() => handleModeChange('universitario')}
            className={cn(
              'group relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all',
              currentMode === 'universitario'
                ? 'border-[#6F00D6] bg-[#6F00D6]/10 shadow-[0_0_20px_rgba(111,0,214,0.2)] ring-2 ring-[#6F00D6]'
                : 'border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/80 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10'
            )}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6F00D6]/15 text-[#6F00D6] dark:text-[#9B3DFF]">
                  <School size={18} strokeWidth={2.4} />
                </span>
                <div>
                  <div className="font-display text-sm font-bold text-[#14102A] dark:text-white">
                    Modo Universitário
                  </div>
                  <div className="text-[11px] font-medium text-muted">
                    Graduação & Semestre
                  </div>
                </div>
              </div>
              {currentMode === 'universitario' && (
                <span className="h-2.5 w-2.5 rounded-full bg-[#6F00D6] ring-4 ring-[#6F00D6]/20" />
              )}
            </div>
            <p className="mt-2.5 text-[11px] text-[#645F78] dark:text-[#9D96B8] leading-relaxed">
              Disciplinas do semestre, calculadora de médias e pesos, kanban de trabalhos e resumos com flashcards.
            </p>
          </button>
        </div>

        {/* Nota explicativa de isolamento */}
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-[11px] text-[#645F78] dark:bg-white/5 dark:text-[#9D96B8]">
          <Info size={15} className="mt-0.5 shrink-0 text-[#008E32] dark:text-[#19E85F]" />
          <span>
            <strong className="text-[#14102A] dark:text-white">Como funciona o isolamento:</strong> Cada modo possui seu próprio banco de dados isolado no Supabase. Nenhuma disciplina ou nota universitária aparece no modo vestibular, e vice-versa. O modo ativo fica salvo na sua conta.
          </span>
        </div>
      </section>

      {/* Cartão de identidade do Estudante */}
      <section className="flex flex-wrap items-center gap-5 rounded-[24px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-white/5 dark:bg-[#131024]">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#00D64B]/15 text-4xl shadow-inner">
          {avatarEmoji}
        </div>
        <div className="min-w-[180px] flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-[#14102A] dark:text-white">
              {displayName || 'Estudante'}
            </h2>
            <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-muted uppercase">
              {currentMode === 'universitario' ? 'Universidade' : 'Vestibular'}
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
            {profile?.bio || (currentMode === 'universitario' ? 'Graduando focado em excelência acadêmica' : 'Rumo à aprovação no ENEM')}
          </p>

          {/* Badges Condicionais por Modo */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {currentMode === 'universitario' ? (
              <>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-[#14102A] dark:bg-white/5 dark:text-white/80">
                  {universitySubjects.length} matérias
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-[#14102A] dark:bg-white/5 dark:text-white/80">
                  {Math.floor(totalUniMinutes / 60)}h estudado
                </span>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-[#008E32] dark:text-[#19E85F]">
                  Média: {uniGpa}
                </span>
                <span className="rounded-full bg-[#6F00D6]/15 px-3 py-1 text-xs font-bold text-[#6F00D6] dark:text-[#B379FF]">
                  {uniDoneTasks} entregas
                </span>
              </>
            ) : (
              <>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-[#14102A] dark:bg-white/5 dark:text-white/80">
                  {sessions.length} sessões
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-[#14102A] dark:bg-white/5 dark:text-white/80">
                  {Math.floor(totalMinutes / 60)}h estudado
                </span>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-[#008E32] dark:text-[#19E85F]">
                  {acc}% aprov.
                </span>
                <span className="rounded-full bg-[#6F00D6]/15 px-3 py-1 text-xs font-bold text-[#6F00D6] dark:text-[#B379FF]">
                  {totalQuestions} questões
                </span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Resumo de Foco e Consistência */}
      <section className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-[#131024]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <DuckMascot size={56} mood="happy" animate />
            <div>
              <div className="mb-0.5 flex items-center gap-2">
                <span className="font-display text-sm sm:text-base font-bold text-[#14102A] dark:text-white">
                  {currentMode === 'universitario' ? 'Desempenho Universitário' : 'Progresso do Vestibulando'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-[#008E32] dark:text-[#19E85F]">
                  <Flame size={12} strokeWidth={2.4} /> {profile?.current_streak ?? 0} dias de ofensiva
                </span>
              </div>
              <p className="text-xs text-[#645F78] dark:text-[#9D96B8]">
                {currentMode === 'universitario'
                  ? `${universitySubjects.length} disciplinas em andamento · ${uniDoneTasks} tarefas entregues`
                  : `${Math.floor(totalMinutes / 60)}h dedicadas · ${totalQuestions} questões resolvidas no total`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Formulário de Perfil */}
      <section className="flex flex-col gap-5 rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-xs dark:border-white/5 dark:bg-[#131024]">
        <h2 className="font-display text-lg font-bold text-[#14102A] dark:text-white">Editar Perfil</h2>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <label htmlFor="perfil-nome" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Nome
            </label>
            <input
              id="perfil-nome"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label htmlFor="perfil-meta" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
              Meta diária (minutos)
            </label>
            <input
              id="perfil-meta"
              type="number"
              min={1}
              value={goal}
              onChange={e => setGoal(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
        </div>

        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
            Avatar
          </span>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setAvatarEmoji(e)}
                aria-label={`Avatar ${e}`}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-2xl text-xl transition-all',
                  avatarEmoji === e
                    ? 'bg-[#00D64B]/20 border-2 border-[#00D64B] shadow-xs scale-105'
                    : 'border border-slate-200/80 bg-slate-50 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="perfil-bio" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
            Bio
          </label>
          <textarea
            id="perfil-bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs font-semibold text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-white"
            placeholder={currentMode === 'universitario' ? 'Curso, faculdade e interesses acadêmicos…' : 'Conte um pouco sobre você e seus objetivos no ENEM…'}
          />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-[#00D64B] px-6 py-2.5 text-xs font-bold text-[#14102A] shadow-xs transition-all hover:bg-[#19E85F] active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? 'Salvando…' : <><Save size={15} strokeWidth={2.4} /> Salvar alterações</>}
          </button>
          {saved && (
            <span className="flex animate-fade-in items-center gap-1 text-xs font-bold text-[#008E32] dark:text-[#19E85F]">
              <Check size={15} strokeWidth={2.6} /> Salvo com sucesso!
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
