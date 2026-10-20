import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useGamification } from '../../lib/gamification';
import DuckMascot from '../../components/DuckMascot';
import AchievementsDialog from '../../components/AchievementsDialog';
import { cn } from '../../lib/theme';
import { Check, Save, Trophy, Sparkles, ChevronRight } from 'lucide-react';

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

  const totalMinutes = sessions.reduce((a, s) => a + s.duration_minutes, 0);
  const sessionCorrect = sessions.reduce((a, s) => a + s.questions_correct, 0);
  const sessionQuestions = sessions.reduce((a, s) => a + s.questions_correct + s.questions_wrong, 0);

  const simQuestionsTotal = simulations.reduce((a, s) => a + (s.questions_total ?? 0), 0);
  const simCorrectTotal = simulations.reduce((a, s) => a + (s.questions_correct ?? 0), 0);

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
      <div className="mb-5">
        <h1 className="font-display text-[2rem] font-bold leading-tight tracking-tight text-tinta dark:text-papel sm:text-[2.6rem]">
          Perfil
        </h1>
        <p className="mt-1 text-[17px] font-semibold text-muted dark:text-papel/70">
          Gerencie suas informações e veja seu progresso no DuckMind
        </p>
      </div>

      {/* Cartão de identidade */}
      <section className="card mb-5 flex flex-wrap items-center gap-5 bg-pato p-5 sm:p-6">
        <div className="flex h-[86px] w-[86px] shrink-0 items-center justify-center rounded-[24px] border-[3px] border-tinta bg-papel text-5xl dark:border-papel">
          {avatarEmoji}
        </div>
        <div className="min-w-[180px] flex-1">
          <h2 className="font-display text-[2rem] font-bold leading-none text-tinta sm:text-[2.4rem]">
            {displayName || 'Estudante'}
          </h2>
          <p className="mt-1.5 text-sm font-semibold text-tinta/75">{profile?.bio || 'Sem bio definida'}</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span className="chip bg-white text-tinta dark:border-papel dark:bg-transparent dark:text-papel">{sessions.length} sessões</span>
            <span className="chip bg-white text-tinta dark:border-papel dark:bg-transparent dark:text-papel">{Math.floor(totalMinutes / 60)}h estudado</span>
            <span className="chip bg-white text-tinta dark:border-papel dark:bg-transparent dark:text-papel">{acc}% aprov.</span>
            <span className="chip bg-mente text-papel dark:border-papel">{gamification.totalXp.toLocaleString('pt-BR')} XP</span>
          </div>
        </div>
      </section>

      {/* Nível e conquistas */}
      <section className="card mb-5 p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            <DuckMascot size={58} level={gamification.currentLevel.level} mood="celebrating" animate showAccessoryBadge />
            <div>
              <div className="mb-0.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-[10px] border-2 border-tinta bg-bico px-2 py-0.5 font-display text-[11px] font-bold uppercase tracking-wide text-tinta dark:border-papel">
                  <Sparkles size={11} strokeWidth={3} /> Nível {gamification.currentLevel.level}
                </span>
                <span className="text-sm font-bold text-tinta dark:text-papel">
                  {gamification.currentLevel.accessory} {gamification.currentLevel.title}
                </span>
              </div>
              <p className="text-sm font-semibold text-muted dark:text-papel/60">
                {gamification.unlockedCount} de {gamification.totalCount} conquistas · {gamification.totalXp.toLocaleString('pt-BR')} XP total
              </p>
            </div>
          </div>

          <button
            onClick={() => setAchievementsOpen(true)}
            className="btn shrink-0 self-start bg-mente px-4 py-2 text-sm text-papel dark:border-papel sm:self-auto"
          >
            <Trophy size={15} strokeWidth={2.8} /> Sala de Troféus <ChevronRight size={14} strokeWidth={3} />
          </button>
        </div>
      </section>

      {/* Formulário */}
      <section className="card flex flex-col gap-4 p-5 sm:p-6">
        <h2 className="font-display text-xl font-bold text-tinta dark:text-papel">Editar perfil</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="perfil-nome" className="mb-1.5 block text-sm font-bold">Nome</label>
            <input id="perfil-nome" value={displayName} onChange={e => setDisplayName(e.target.value)} className="input" placeholder="Seu nome" />
          </div>
          <div>
            <label htmlFor="perfil-meta" className="mb-1.5 block text-sm font-bold">Meta diária (minutos)</label>
            <input id="perfil-meta" type="number" min={1} value={goal} onChange={e => setGoal(e.target.value)} className="input" />
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-bold">Avatar</span>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setAvatarEmoji(e)}
                aria-label={`Avatar ${e}`}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-tinta text-2xl transition-transform dark:border-papel',
                  avatarEmoji === e
                    ? 'bg-pato shadow-brutal-sm'
                    : 'bg-white hover:-translate-y-px dark:bg-transparent',
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="perfil-bio" className="mb-1.5 block text-sm font-bold">Bio</label>
          <textarea
            id="perfil-bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            className="input resize-none"
            placeholder="Conte um pouco sobre você e seus objetivos…"
          />
        </div>

        <div className="mt-1 flex items-center gap-3">
          <button onClick={handleSave} disabled={saving} className="btn bg-pato px-4 py-2.5 text-tinta dark:border-papel">
            {saving ? 'Salvando…' : <><Save size={16} strokeWidth={2.8} /> Salvar alterações</>}
          </button>
          {saved && (
            <span className="flex animate-fade-in items-center gap-1 text-sm font-bold text-mente dark:text-pato">
              <Check size={16} strokeWidth={3} /> Salvo!
            </span>
          )}
        </div>
      </section>

      <AchievementsDialog open={achievementsOpen} onClose={() => setAchievementsOpen(false)} />
    </div>
  );
}
