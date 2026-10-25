import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSecretKeyDetected } from '../lib/supabase';
import ThemeToggle from '../components/ThemeToggle';
import AuthBrandPanel from '../components/AuthBrandPanel';
import { Loader2, Mail, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      if (err.message.includes('Forbidden use of secret API key')) {
        setError('Chave secreta detectada: O Supabase proíbe o uso de sb_secret_ no navegador. Utilize a chave pública (sb_publishable_ ou anon) no seu painel.');
      } else if (err.message === 'Invalid login credentials') {
        setError('E-mail ou senha incorretos.');
      } else {
        setError(err.message);
      }
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (err) throw err;
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com o Google');
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Por favor, informe seu e-mail no campo acima para redefinir a senha.');
      return;
    }
    setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard`,
    });
    if (err) {
      setError(err.message);
    } else {
      setForgotSent(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F7FC] transition-colors duration-300 dark:bg-[#0B0819]">
      {/* Left Purple Brand Panel (Desktop) */}
      <AuthBrandPanel
        title="Sua rotina de estudos, do vestibular à faculdade."
        description="Edital, simulados, disciplinas e provas — tudo num só lugar."
      />

      {/* Right Login Form Container */}
      <div className="relative flex flex-1 flex-col justify-center px-6 py-10 sm:px-12 md:px-16 lg:px-24">
        {/* Top bar controls */}
        <div className="absolute right-6 top-6 flex items-center gap-3">
          <ThemeToggle />
        </div>

        <div className="mx-auto w-full max-w-[390px]">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center justify-center md:hidden">
            <Link to="/" className="font-display text-2xl font-bold tracking-tight text-[#14102A] dark:text-white">
              Duck<span className="text-[#6F00D6] dark:text-[#19E85F]">Mind</span>
            </Link>
          </div>

          {/* Heading */}
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-white">
            Bem-vindo de volta
          </h2>
          <p className="mt-1 text-sm font-normal text-[#645F78] dark:text-[#9D96B8]">
            Entre para continuar sua rotina de estudos.
          </p>

          {isSecretKeyDetected && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
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
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </div>
          )}

          {forgotSent && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              Enviamos um link de recuperação para seu e-mail!
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
            {/* E-mail */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-xs font-semibold text-[#14102A] dark:text-[#E2E0EC]"
              >
                E-mail
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                  <Mail size={16} />
                </span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200/90 bg-[#FBFBFE] pl-10 pr-4 py-3 text-sm font-medium text-[#14102A] placeholder-slate-400 focus:border-[#6F00D6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6F00D6]/20 transition-all dark:border-white/10 dark:bg-[#131126] dark:text-white dark:placeholder-slate-500 dark:focus:border-[#00D64B]"
                  placeholder="voce@email.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="login-senha"
                className="mb-1.5 block text-xs font-semibold text-[#14102A] dark:text-[#E2E0EC]"
              >
                Senha
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  id="login-senha"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200/90 bg-[#FBFBFE] pl-10 pr-10 py-3 text-sm font-medium text-[#14102A] placeholder-slate-400 focus:border-[#6F00D6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6F00D6]/20 transition-all dark:border-white/10 dark:bg-[#131126] dark:text-white dark:placeholder-slate-500 dark:focus:border-[#00D64B]"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-medium text-[#6F00D6] hover:underline dark:text-[#B26BFF]"
                >
                  Esqueci minha senha
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-[#00D64B] py-3.5 text-sm font-bold text-[#14102A] shadow-md shadow-[#00D64B]/20 transition-all hover:bg-[#19E85F] hover:shadow-lg active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Entrar'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center justify-center">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">ou</span>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200/90 bg-white py-3 text-sm font-semibold text-[#14102A] shadow-xs transition-all hover:bg-slate-50 active:scale-[0.99] disabled:opacity-50 dark:border-white/10 dark:bg-[#131126] dark:text-white dark:hover:bg-white/5"
          >
            {googleLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continuar com Google</span>
          </button>

          {/* Bottom signup link */}
          <div className="mt-8 text-center text-xs font-normal text-[#645F78] dark:text-[#9D96B8]">
            Não tem conta?{' '}
            <Link to="/signup" className="font-bold text-[#6F00D6] hover:underline dark:text-[#B26BFF]">
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
