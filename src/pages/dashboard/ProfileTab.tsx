import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useGamification } from '../../lib/gamification';
import DuckMascot from '../../components/DuckMascot';
import AchievementsDialog from '../../components/AchievementsDialog';
import { cn } from '../../lib/theme';
import { Check, Save, Trophy, Sparkles, ChevronRight } from 'lucide-react';
import { getSimulationQuestions, getSimulationDuration } from '../../lib/simulationUtils';

const EMOJIS = ['🦆', '🎓', '📚', '🔥', '⭐', '🚀', '💡', '🎯', '🏆', '🌱'];

export default function ProfileTab() {
  const { profile, updateProfile, sessions, simulations } = useApp();
  const gamification = useGamification();
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [avatarEmoji, setAvatarEmoji] = useState(profile?.avatar_emoji ?? '🦆');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [goal, setGoal] = useState(String(profile?.goal_daily_minutes ?? 120));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({
      display_name: displayName, avatar_emoji: avatarEmoji, bio,
      goal_daily_minutes: parseInt(goal) || 120,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="w-full max-w-3xl min-w-0 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-[#F3F1FF]">
          Perfil
        </h1>
        <p className="mt-1 text-sm font-medium text-[#645F78] dark:text-[#9D96B8]">
          Gerencie suas informações e acompanhe sua trajetória no DuckMind
        </p>
      </div>

      {/* Cartão de identidade */}
      <section className="mb-6 flex flex-wrap items-center gap-5 rounded-[24px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-white/5 dark:bg-[#151826]">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#00D64B]/15 text-4xl shadow-inner">
          {avatarEmoji}
        </div>
        <div className="min-w-[180px] flex-1">
          <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-[#14102A] dark:text-white">
            {displayName || 'Estudante'}
          </h2>
          <p className="mt-1 text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
            {profile?.bio || 'Rumo à aprovação no ENEM'}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
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
              {gamification.totalXp.toLocaleString('pt-BR')} XP
            </span>
          </div>
        </div>
      </section>

      {/* Nível e conquistas */}
      <section className="mb-6 rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-[#151826]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            <DuckMascot size={58} level={gamification.currentLevel.level} mood="celebrating" animate showAccessoryBadge />
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-[#D68200] dark:text-[#FFB84D]">
                  <Sparkles size={11} strokeWidth={2.6} /> Nível {gamification.currentLevel.level}
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#14102A] dark:text-white">
                  {gamification.currentLevel.accessory} {gamification.currentLevel.title}
                </span>
              </div>
              <p className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
                {gamification.unlockedCount} de {gamification.totalCount} conquistas · {gamification.totalXp.toLocaleString('pt-BR')} XP total
              </p>
            </div>
          </div>

          <button
            onClick={() => setAchievementsOpen(true)}
            className="inline-flex items-center gap-1.5 self-start rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-[#14102A] transition-all hover:bg-slate-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:self-auto"
          >
            <Trophy size={14} strokeWidth={2.4} /> Sala de Troféus <ChevronRight size={13} strokeWidth={2.6} />
          </button>
        </div>
      </section>

      {/* Formulário */}
      <section className="flex flex-col gap-5 rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-xs dark:border-white/5 dark:bg-[#151826]">
        <h2 className="font-display text-lg font-bold text-[#14102A] dark:text-white">Editar perfil</h2>

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
                    : 'border border-slate-200/80 bg-slate-50 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10',
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
            placeholder="Conte um pouco sobre você e seus objetivos no ENEM…"
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

      <AchievementsDialog open={achievementsOpen} onClose={() => setAchievementsOpen(false)} />
    </div>
  );
}
