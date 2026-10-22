import { useState } from 'react';
import { supabase, isRealSupabaseConfigured, isSecretKeyDetected } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { useTheme, cn } from '../../lib/theme';
import { Bell, Moon, Sun, Check, AlertTriangle, Target, Clock, HelpCircle, Database } from 'lucide-react';

export default function SettingsTab() {
  const { profile, updateProfile } = useApp();
  const { mode, setMode } = useTheme();
  const [notifications, setNotifications] = useState(profile?.notifications_enabled ?? true);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const [dailyMinutes, setDailyMinutes] = useState(profile?.goal_daily_minutes ?? 120);
  const [weeklyMinutes, setWeeklyMinutes] = useState(profile?.goal_weekly_minutes ?? 600);
  const [weeklyQuestions, setWeeklyQuestions] = useState(profile?.goal_weekly_questions ?? 300);

  const handleToggleNotifications = async () => {
    const next = !notifications;
    setNotifications(next);
    await updateProfile({ notifications_enabled: next });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveGoals = async () => {
    const safeDailyMinutes = Math.max(15, Math.min(480, dailyMinutes || 15));
    const safeWeeklyMinutes = Math.max(60, Math.min(2400, weeklyMinutes || 60));
    const safeWeeklyQuestions = Math.max(0, Math.min(1000, weeklyQuestions || 0));
    setDailyMinutes(safeDailyMinutes);
    setWeeklyMinutes(safeWeeklyMinutes);
    setWeeklyQuestions(safeWeeklyQuestions);
    await updateProfile({
      goal_daily_minutes: safeDailyMinutes,
      goal_weekly_minutes: safeWeeklyMinutes,
      goal_weekly_questions: safeWeeklyQuestions,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const goalPresets = [
    { label: 'Leve', daily: 60, weekly: 300, weeklyQ: 150 },
    { label: 'Moderado', daily: 120, weekly: 600, weeklyQ: 300 },
    { label: 'Intenso', daily: 180, weekly: 900, weeklyQ: 500 },
    { label: 'Master', daily: 240, weekly: 1200, weeklyQ: 700 },
  ];

  const applyPreset = (p: typeof goalPresets[0]) => {
    setDailyMinutes(p.daily);
    setWeeklyMinutes(p.weekly);
    setWeeklyQuestions(p.weeklyQ);
  };

  const activePreset = goalPresets.find(
    p => p.daily === dailyMinutes && p.weekly === weeklyMinutes && p.weeklyQ === weeklyQuestions,
  );

  const slider = (value: number, min: number, max: number, step: number, onChange: (v: number) => void, label: string) => (
    <input
      type="range"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#00D64B] dark:bg-white/10"
    />
  );

  return (
    <div className="w-full max-w-3xl min-w-0 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-[#F3F1FF]">
          Configurações
        </h1>
        <p className="mt-1 text-sm font-medium text-[#645F78] dark:text-[#9D96B8]">Preferências do aplicativo e metas de estudo</p>
      </div>

      {/* Metas */}
      <section className="mb-5 rounded-[22px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-white/5 dark:bg-[#151826]">
        <div className="mb-1 flex items-center gap-2">
          <Target size={18} strokeWidth={2.4} className="text-[#008E32] dark:text-[#19E85F]" />
          <h2 className="font-display text-base sm:text-lg font-bold text-[#14102A] dark:text-white">Metas de estudo</h2>
        </div>
        <p className="mb-4 text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
          Defina seus objetivos semanais e diários para o ENEM
        </p>

        <div className="mb-5 flex flex-wrap gap-2">
          {goalPresets.map(p => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-bold transition-all',
                activePreset?.label === p.label
                  ? 'bg-[#00D64B] text-[#14102A] shadow-xs'
                  : 'border border-slate-200/80 bg-slate-50 text-[#645F78] hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-[#9D96B8] dark:hover:bg-white/10',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="mb-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#14102A] dark:text-white">
              <Clock size={14} strokeWidth={2.4} className="text-[#645F78] dark:text-[#9D96B8]" /> Meta diária de tempo
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number" min={15} max={480} step={5} value={dailyMinutes}
                onChange={e => { const v = Number(e.target.value); if (!isNaN(v)) setDailyMinutes(v); }}
                onBlur={() => setDailyMinutes(Math.max(15, Math.min(480, dailyMinutes || 15)))}
                className="w-16 rounded-xl border border-slate-200 bg-slate-50 py-1 text-center font-display text-xs font-bold text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              <span className="text-xs font-semibold text-[#645F78] dark:text-[#9D96B8]">min</span>
              <span className="ml-1 font-display text-xs font-bold text-[#645F78] dark:text-white/40">
                ({Math.floor(dailyMinutes / 60)}h{dailyMinutes % 60 > 0 ? `${dailyMinutes % 60}m` : ''})
              </span>
            </div>
          </div>
          {slider(dailyMinutes, 15, 480, 5, setDailyMinutes, 'Meta diária de tempo')}
          <div className="mt-1.5 flex justify-between text-[11px] font-medium text-[#645F78] dark:text-white/40">
            <span>15 min</span>
            <span>8h</span>
          </div>
        </div>

        <div className="mb-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#14102A] dark:text-white">
              <Clock size={14} strokeWidth={2.4} className="text-[#645F78] dark:text-[#9D96B8]" /> Meta semanal de tempo
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number" min={60} max={2400} step={15} value={weeklyMinutes}
                onChange={e => { const v = Number(e.target.value); if (!isNaN(v)) setWeeklyMinutes(v); }}
                onBlur={() => setWeeklyMinutes(Math.max(60, Math.min(2400, weeklyMinutes || 60)))}
                className="w-16 rounded-xl border border-slate-200 bg-slate-50 py-1 text-center font-display text-xs font-bold text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              <span className="text-xs font-semibold text-[#645F78] dark:text-[#9D96B8]">min</span>
              <span className="ml-1 font-display text-xs font-bold text-[#645F78] dark:text-white/40">
                ({Math.floor(weeklyMinutes / 60)}h{weeklyMinutes % 60 > 0 ? `${weeklyMinutes % 60}m` : ''})
              </span>
            </div>
          </div>
          {slider(weeklyMinutes, 60, 2400, 15, setWeeklyMinutes, 'Meta semanal de tempo')}
          <div className="mt-1.5 flex justify-between text-[11px] font-medium text-[#645F78] dark:text-white/40">
            <span>1h</span>
            <span>40h</span>
          </div>
        </div>

        <div className="mb-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#14102A] dark:text-white">
              <HelpCircle size={14} strokeWidth={2.4} className="text-[#645F78] dark:text-[#9D96B8]" /> Meta semanal de questões
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number" min={0} max={1000} step={5} value={weeklyQuestions}
                onChange={e => { const v = Number(e.target.value); if (!isNaN(v)) setWeeklyQuestions(v); }}
                onBlur={() => setWeeklyQuestions(Math.max(0, Math.min(1000, weeklyQuestions || 0)))}
                className="w-16 rounded-xl border border-slate-200 bg-slate-50 py-1 text-center font-display text-xs font-bold text-[#14102A] focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              <span className="text-xs font-semibold text-[#645F78] dark:text-[#9D96B8]">questões</span>
            </div>
          </div>
          {slider(weeklyQuestions, 0, 1000, 5, setWeeklyQuestions, 'Meta semanal de questões')}
          <div className="mt-1.5 flex justify-between text-[11px] font-medium text-[#645F78] dark:text-white/40">
            <span>0</span>
            <span>1000</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSaveGoals}
            className="inline-flex items-center gap-2 rounded-full bg-[#00D64B] px-6 py-2.5 text-xs font-bold text-[#14102A] shadow-xs transition-all hover:bg-[#19E85F] active:scale-[0.98]"
          >
            Salvar metas
          </button>
          {saved && (
            <span className="flex animate-fade-in items-center gap-1 text-xs font-bold text-[#008E32] dark:text-[#19E85F]">
              <Check size={15} strokeWidth={2.6} /> Metas salvas com sucesso!
            </span>
          )}
        </div>
      </section>

      {/* Tema */}
      <section className="mb-5 rounded-[22px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-white/5 dark:bg-[#151826]">
        <div className="mb-1 flex items-center gap-2">
          <Moon size={18} strokeWidth={2.4} className="text-[#6F00D6] dark:text-[#B379FF]" />
          <h2 className="font-display text-base sm:text-lg font-bold text-[#14102A] dark:text-white">Tema</h2>
        </div>
        <p className="mb-3 text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">Escolha entre modo claro e escuro</p>
        <div className="flex gap-2">
          {[
            { id: 'light' as const, label: 'Claro', icon: Sun },
            { id: 'dark' as const, label: 'Escuro', icon: Moon },
          ].map(opt => {
            const Icon = opt.icon;
            const active = mode === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setMode(opt.id)}
                className={cn(
                  'flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all',
                  active
                    ? 'bg-[#00D64B] text-[#14102A] shadow-xs'
                    : 'border border-slate-200/80 bg-slate-50 text-[#645F78] hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-[#9D96B8] dark:hover:bg-white/10',
                )}
              >
                <Icon size={14} strokeWidth={2.4} /> {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Notificações */}
      <section className="mb-5 flex items-center justify-between gap-4 rounded-[22px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-white/5 dark:bg-[#151826]">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00D64B]/15 text-[#008E32] dark:text-[#19E85F]">
            <Bell size={18} strokeWidth={2.4} />
          </span>
          <div>
            <h2 className="font-display text-base font-bold text-[#14102A] dark:text-white">Notificações</h2>
            <p className="text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">Receber lembretes diários de estudos</p>
          </div>
        </div>
        <button
          onClick={handleToggleNotifications}
          role="switch"
          aria-checked={notifications}
          aria-label="Alternar notificações"
          className={cn(
            'relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#00D64B]',
            notifications ? 'bg-[#00D64B]' : 'bg-slate-200 dark:bg-white/10',
          )}
        >
          <span
            className={cn(
              'absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200',
              notifications ? 'translate-x-6' : 'translate-x-1',
            )}
          />
        </button>
      </section>

      {/* Status da Conexão Supabase */}
      <section className="mb-5 rounded-[22px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-white/5 dark:bg-[#151826]">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Database size={18} strokeWidth={2.4} className="text-[#6F00D6] dark:text-[#B379FF]" />
            <h2 className="font-display text-base font-bold text-[#14102A] dark:text-white">Integração Supabase</h2>
          </div>
          <span className={cn(
            'rounded-full px-3 py-0.5 text-xs font-bold',
            isRealSupabaseConfigured
              ? 'bg-emerald-500/15 text-[#008E32] dark:text-[#19E85F]'
              : isSecretKeyDetected
              ? 'bg-amber-500/15 text-[#D68200] dark:text-[#FFB84D]'
              : 'bg-slate-100 text-[#645F78] dark:bg-white/5 dark:text-[#9D96B8]'
          )}>
            {isRealSupabaseConfigured ? '● Conectado à Nuvem' : isSecretKeyDetected ? '▲ Chave Secreta Detectada' : '○ Modo Local / Demonstração'}
          </span>
        </div>
        <p className="text-xs font-medium leading-relaxed text-[#645F78] dark:text-[#9D96B8]">
          {isRealSupabaseConfigured
            ? 'A aplicação está conectada ao seu projeto do Supabase em nuvem. Suas sessões, simulados, redações e edital estão sincronizados com PostgreSQL.'
            : isSecretKeyDetected
            ? 'Atenção: A variável VITE_SUPABASE_ANON_KEY está configurada com uma chave de servidor/secreta (sb_secret_...). O Supabase bloqueia requisições com chave secreta disparadas pelo navegador por segurança. Para sincronizar na nuvem, acesse o painel do Supabase > Project Settings > API e copie a chave Publishable / Anon (sb_publishable_... ou anon public). O DuckMind está funcionando com segurança em modo local para que você possa utilizar e testar todos os recursos.'
            : 'As variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não foram fornecidas no ambiente. A aplicação está em modo local com banco de dados em memória e armazenamento seguro no navegador (localStorage), funcionando 100% de forma autônoma.'}
        </p>
      </section>

      {/* Zona de perigo */}
      <section className="rounded-[22px] border border-rose-500/20 bg-rose-500/5 p-5 sm:p-6 dark:border-rose-500/15">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle size={18} strokeWidth={2.4} className="text-rose-600 dark:text-rose-400" />
          <h2 className="font-display text-base font-bold text-rose-600 dark:text-rose-400">Zona de perigo</h2>
        </div>
        <p className="mb-4 text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
          Resetar seus dados de estudo. Esta ação apagará histórico de sessões, simulados e cadernos e não pode ser desfeita.
        </p>
        {confirmReset ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                  await Promise.all([
                    supabase.from('study_sessions').delete().eq('user_id', user.id),
                    supabase.from('simulations').delete().eq('user_id', user.id),
                    supabase.from('essays').delete().eq('user_id', user.id),
                    supabase.from('topic_completions').delete().eq('user_id', user.id),
                    supabase.from('error_notebook_entries').delete().eq('user_id', user.id),
                    supabase.from('topics').delete().eq('user_id', user.id),
                  ]);
                  window.location.reload();
                }
              }}
              className="rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-all active:scale-[0.98]"
            >
              Confirmar e apagar tudo
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#14102A] hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="rounded-full border border-rose-500/30 bg-white px-5 py-2 text-xs font-bold text-rose-600 shadow-xs hover:bg-rose-50 dark:border-rose-500/30 dark:bg-white/5 dark:text-rose-400 dark:hover:bg-rose-500/10 transition-all"
          >
            Resetar todos os dados
          </button>
        )}
      </section>
    </div>
  );
}
