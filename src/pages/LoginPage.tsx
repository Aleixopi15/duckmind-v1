import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSecretKeyDetected } from '../lib/supabase';
import DuckMascot from '../components/DuckMascot';
import ThemeToggle from '../components/ThemeToggle';
import AuthBrandPanel from '../components/AuthBrandPanel';
import { Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      if (err.message.includes('Forbidden use of secret API key')) {
        setError('Chave secreta detectada: O Supabase proíbe o uso de sb_secret_ no navegador. Utilize a chave pública (sb_publishable_ ou anon) no seu painel.');
      } else if (err.message === 'Invalid login credentials') {
        setError('Email ou senha incorretos.');
      } else {
        setError(err.message);
      }
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F7FC] transition-colors duration-300 dark:bg-[#0F0C1E]">
      <AuthBrandPanel
        title="Bem-vindo de volta!"
        description="Continue sua jornada rumo à aprovação. Sua ofensiva está te esperando."
        mood="celebrating"
      />

      <div className="relative flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm animate-fade-in rounded-[28px] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-white/10 dark:bg-[#151826]">
          <div className="mb-5 flex items-center justify-center gap-2 md:hidden">
            <DuckMascot size={64} mood="happy" animate />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-white">
            Entrar
          </h2>
          <p className="mb-5 mt-1 text-xs sm:text-sm font-medium text-[#645F78] dark:text-[#9D96B8]">
            Acesse sua conta para continuar seus estudos
          </p>

          {isSecretKeyDetected && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
              <p className="mb-1 flex items-center gap-1.5 font-bold">
                <AlertTriangle size={15} /> Chave Secreta Detectada
              </p>
              Foi configurada a chave de servidor (<code className="rounded bg-black/10 px-1 py-0.5 dark:bg-white/10">sb_secret_...</code>).
              <p className="mt-1 font-semibold text-emerald-700 dark:text-emerald-400">
                ✓ Modo local seguro ativado para testes normais.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-[#14102A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="login-senha" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#645F78] dark:text-[#9D96B8]">
                Senha
              </label>
              <input
                id="login-senha"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-[#14102A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00D64B] dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-[#00D64B] py-3 text-sm font-bold text-[#14102A] shadow-xs transition-all hover:bg-[#19E85F] hover:shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Entrar'}
            </button>
          </form>

          <div className="my-5 text-center text-xs font-medium text-[#645F78] dark:text-[#9D96B8]">
            Não tem conta?{' '}
            <Link to="/signup" className="font-bold text-[#6F00D6] hover:underline dark:text-[#00D64B]">
              Cadastre-se grátis
            </Link>
          </div>

          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#645F78] transition-colors hover:text-[#14102A] dark:text-[#9D96B8] dark:hover:text-white"
            >
              <ArrowLeft size={13} strokeWidth={2.4} /> Voltar para o início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
