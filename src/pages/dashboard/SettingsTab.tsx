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
      className="h-3 w-full cursor-pointer appearance-none rounded-full border-[3px] border-tinta bg-papel accent-mente dark:border-papel dark:bg-surface-dark"
    />
  );

  return (
    <div className="w-full max-w-3xl min-w-0 animate-fade-in">
      <div className="mb-5">
        <h1 className="font-display text-[2rem] font-bold leading-tight tracking-tight text-tinta dark:text-papel sm:text-[2.6rem]">
          Configurações
        </h1>
        <p className="mt-1 text-[17px] font-semibold text-muted dark:text-papel/70">Preferências do aplicativo</p>
      </div>

      {/* Metas */}
      <section className="card mb-4 p-5">
        <div className="mb-1 flex items-center gap-2">
          <Target size={18} strokeWidth={2.8} className="text-mente dark:text-pato" />
          <h2 className="font-display text-xl font-bold text-tinta dark:text-papel">Metas de estudo</h2>
        </div>
        <p className="mb-4 text-sm font-semibold text-muted dark:text-papel/60">
          Defina seus objetivos semanais e diários
        </p>

        <div className="mb-5 flex flex-wrap gap-2">
          {goalPresets.map(p => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className={cn(
                'rounded-[14px] border-[3px] border-tinta px-3.5 py-1.5 font-display text-sm font-bold transition-transform dark:border-papel',
                activePreset?.label === p.label
                  ? 'bg-pato text-tinta shadow-brutal-sm'
                  : 'bg-white text-tinta hover:-translate-y-px dark:bg-transparent dark:text-papel',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="mb-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-bold">
              <Clock size={15} strokeWidth={2.8} className="text-muted dark:text-papel/50" /> Meta diária de tempo
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number" min={15} max={480} step={5} value={dailyMinutes}
                onChange={e => { const v = Number(e.target.value); if (!isNaN(v)) setDailyMinutes(v); }}
                onBlur={() => setDailyMinutes(Math.max(15, Math.min(480, dailyMinutes || 15)))}
                className="input w-20 py-1 text-center font-display text-sm font-bold"
              />
              <span className="text-xs font-bold text-muted dark:text-papel/60">min</span>
              <span className="ml-1 font-display text-xs font-bold text-muted dark:text-papel/40">
                ({Math.floor(dailyMinutes / 60)}h{dailyMinutes % 60 > 0 ? `${dailyMinutes % 60}m` : ''})
              </span>
            </div>
          </div>
          {slider(dailyMinutes, 15, 480, 5, setDailyMinutes, 'Meta diária de tempo')}
          <div className="mt-1 flex justify-between text-[11px] font-bold text-muted dark:text-papel/40">
            <span>15 min</span>
            <span>8h</span>
          </div>
        </div>

        <div className="mb-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-bold">
              <Clock size={15} strokeWidth={2.8} className="text-muted dark:text-papel/50" /> Meta semanal de tempo
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number" min={60} max={2400} step={15} value={weeklyMinutes}
                onChange={e => { const v = Number(e.target.value); if (!isNaN(v)) setWeeklyMinutes(v); }}
                onBlur={() => setWeeklyMinutes(Math.max(60, Math.min(2400, weeklyMinutes || 60)))}
                className="input w-20 py-1 text-center font-display text-sm font-bold"
              />
              <span className="text-xs font-bold text-muted dark:text-papel/60">min</span>
              <span className="ml-1 font-display text-xs font-bold text-muted dark:text-papel/40">
                ({Math.floor(weeklyMinutes / 60)}h{weeklyMinutes % 60 > 0 ? `${weeklyMinutes % 60}m` : ''})
              </span>
            </div>
          </div>
          {slider(weeklyMinutes, 60, 2400, 15, setWeeklyMinutes, 'Meta semanal de tempo')}
          <div className="mt-1 flex justify-between text-[11px] font-bold text-muted dark:text-papel/40">
            <span>1h</span>
            <span>40h</span>
          </div>
        </div>

        <div className="mb-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-bold">
              <HelpCircle size={15} strokeWidth={2.8} className="text-muted dark:text-papel/50" /> Meta semanal de questões
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number" min={0} max={1000} step={5} value={weeklyQuestions}
                onChange={e => { const v = Number(e.target.value); if (!isNaN(v)) setWeeklyQuestions(v); }}
                onBlur={() => setWeeklyQuestions(Math.max(0, Math.min(1000, weeklyQuestions || 0)))}
                className="input w-20 py-1 text-center font-display text-sm font-bold"
              />
              <span className="text-xs font-bold text-muted dark:text-papel/60">questões</span>
            </div>
          </div>
          {slider(weeklyQuestions, 0, 1000, 5, setWeeklyQuestions, 'Meta semanal de questões')}
          <div className="mt-1 flex justify-between text-[11px] font-bold text-muted dark:text-papel/40">
            <span>0</span>
            <span>1000</span>
          </div>
        </div>

        <button onClick={handleSaveGoals} className="btn bg-pato px-4 py-2 text-sm text-tinta dark:border-papel">
          Salvar metas
        </button>
        {saved && (
          <div className="mt-3 flex animate-fade-in items-center gap-1 text-sm font-bold text-mente dark:text-pato">
            <Check size={16} strokeWidth={3} /> Metas salvas com sucesso
          </div>
        )}
      </section>

      {/* Tema */}
      <section className="card mb-4 p-5">
        <div className="mb-1 flex items-center gap-2">
          <Moon size={18} strokeWidth={2.8} className="text-mente dark:text-pato" />
          <h2 className="font-display text-xl font-bold text-tinta dark:text-papel">Tema</h2>
        </div>
        <p className="mb-3 text-sm font-semibold text-muted dark:text-papel/60">Escolha entre modo claro e escuro</p>
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
                  'flex items-center gap-2 rounded-[14px] border-[3px] border-tinta px-4 py-1.5 font-display text-sm font-bold transition-transform dark:border-papel',
                  active ? 'bg-pato text-tinta shadow-brutal-sm' : 'bg-white text-tinta hover:-translate-y-px dark:bg-transparent dark:text-papel',
                )}
              >
                <Icon size={16} strokeWidth={2.8} /> {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Notificações */}
      <section className="card mb-4 flex items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[14px] border-[3px] border-tinta bg-pato text-tinta dark:border-papel">
            <Bell size={20} strokeWidth={2.6} />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-tinta dark:text-papel">Notificações</h2>
            <p className="text-sm font-semibold text-muted dark:text-papel/60">Receber lembretes de estudos</p>
          </div>
        </div>
        <button
          onClick={handleToggleNotifications}
          role="switch"
          aria-checked={notifications}
          aria-label="Alternar notificações"
          className={cn(
            'relative h-8 w-14 shrink-0 rounded-full border-[3px] border-tinta transition-colors dark:border-papel',
            notifications ? 'bg-pato' : 'bg-slate-200 dark:bg-surface-dark',
          )}
        >
          <span
            className={cn(
              'absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-tinta bg-white transition-transform dark:border-papel',
              notifications ? 'translate-x-[1.6rem]' : 'translate-x-[0.15rem]',
            )}
          />
        </button>
      </section>

      {/* Status da Conexão Supabase */}
      <section className="card mb-4 p-5">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Database size={18} strokeWidth={2.8} className="text-mente dark:text-pato" />
            <h2 className="font-display text-xl font-bold text-tinta dark:text-papel">Integração Supabase</h2>
          </div>
          <span className={cn(
            'chip text-xs font-bold',
            isRealSupabaseConfigured ? 'bg-pato text-tinta dark:border-papel' : isSecretKeyDetected ? 'bg-amber-300 text-tinta dark:border-papel' : 'bg-bico text-tinta dark:border-papel'
          )}>
            {isRealSupabaseConfigured ? '● Conectado à Nuvem' : isSecretKeyDetected ? '▲ Chave Secreta Detectada' : '○ Modo Local / Demonstração'}
          </span>
        </div>
        <p className="mt-1 text-sm font-semibold text-muted dark:text-papel/60">
          {isRealSupabaseConfigured
            ? 'A aplicação está conectada ao seu projeto do Supabase em nuvem. Suas sessões, simulados, redações e edital estão sincronizados com PostgreSQL.'
            : isSecretKeyDetected
            ? 'Atenção: A variável VITE_SUPABASE_ANON_KEY está configurada com uma chave de servidor/secreta (sb_secret_...). O Supabase bloqueia requisições com chave secreta disparadas pelo navegador por segurança. Para sincronizar na nuvem, acesse o painel do Supabase > Project Settings > API e copie a chave Publishable / Anon (sb_publishable_... ou anon public). O DuckMind está funcionando com segurança em modo local para que você possa utilizar e testar todos os recursos.'
            : 'As variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não foram fornecidas no ambiente. A aplicação está em modo local com banco de dados em memória e armazenamento seguro no navegador (localStorage), funcionando 100% de forma autônoma.'}
        </p>
      </section>

      {/* Zona de perigo */}
      <section className="card border-bico p-5 dark:border-papel">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle size={18} strokeWidth={2.8} className="text-tinta dark:text-papel" />
          <h2 className="font-display text-xl font-bold text-tinta dark:text-papel">Zona de perigo</h2>
        </div>
        <p className="mb-3 text-sm font-semibold text-muted dark:text-papel/60">
          Resetar seus dados de estudo. Esta ação não pode ser desfeita.
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
              className="btn bg-bico px-4 py-2 text-sm text-tinta dark:border-papel"
            >
              Confirmar e apagar tudo
            </button>
            <button onClick={() => setConfirmReset(false)} className="btn bg-white px-4 py-2 text-sm dark:border-papel dark:bg-transparent dark:text-papel">
              Cancelar
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmReset(true)} className="btn bg-bico px-4 py-2.5 text-sm text-tinta dark:border-papel">
            Resetar todos os dados
          </button>
        )}
      </section>
    </div>
  );
}
