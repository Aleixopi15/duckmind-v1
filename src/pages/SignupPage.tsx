import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSecretKeyDetected } from '../lib/supabase';
import type { UserMode } from '../lib/supabase';
import ThemeToggle from '../components/ThemeToggle';
import AuthBrandPanel from '../components/AuthBrandPanel';
import { Loader2, Mail, Lock, User, Eye, EyeOff, ClipboardCheck, GraduationCap, AlertTriangle, Check } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<UserMode>('vestibular');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreeTerms) {
      setError('Você precisa aceitar os termos de uso para continuar.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({ email, password });
    if (err) {
      if (err.message.includes('Forbidden use of secret API key')) {
        setError('Chave secreta detectada: O Supabase proíbe o uso de sb_secret_ no navegador. Utilize a chave pública (sb_publishable_ ou anon) no seu painel.');
      } else if (err.message === 'User already registered') {
        setError('Este e-mail já está cadastrado.');
      } else {
        setError(err.message);
      }
      setLoading(false);
      return;
    }

    if (data.user) {
      // Salva o modo escolhido tanto localmente quanto no perfil
      localStorage.setItem('duckmind_current_mode', selectedMode);
      await supabase.from('user_profiles').upsert({
        id: data.user.id,
        display_name: name || email.split('@')[0],
        current_mode: selectedMode,
      });
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F7FC] transition-colors duration-300 dark:bg-[#0B0819]">
      {/* Left Purple Brand Panel (Desktop) */}
      <AuthBrandPanel
        title="Do vestibular à faculdade, numa rotina só."
        description="Escolha seu modo agora — você pode trocar quando quiser."
      />

      {/* Right Signup Form Container */}
      <div className="relative flex flex-1 flex-col justify-center px-6 py-10 sm:px-12 md:px-16 lg:px-24">
        {/* Top bar controls */}
        <div className="absolute right-6 top-6 flex items-center gap-3">
          <ThemeToggle />
        </div>

        <div className="mx-auto w-full max-w-[400px]">
          {/* Mobile Logo */}
          <div className="mb-6 flex items-center justify-center md:hidden">
            <Link to="/" className="font-display text-2xl font-bold tracking-tight text-[#14102A] dark:text-white">
              Duck<span className="text-[#6F00D6] dark:text-[#19E85F]">Mind</span>
            </Link>
          </div>

          {/* Heading */}
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#14102A] dark:text-white">
            Criar conta
          </h2>
          <p className="mt-1 text-sm font-normal text-[#645F78] dark:text-[#9D96B8]">
            Comece sua rotina de estudos em poucos minutos.
          </p>

          {isSecretKeyDetected && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
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

          {/* Selector "Qual é o seu momento?" */}
          <div className="mt-6">
            <label className="mb-2 block text-xs font-semibold text-[#14102A] dark:text-[#E2E0EC]">
              Qual é o seu momento?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Vestibular Selector Card */}
              <button
                type="button"
                onClick={() => setSelectedMode('vestibular')}
                className={`flex flex-col items-center justify-center rounded-2xl py-3.5 px-3 transition-all ${
                  selectedMode === 'vestibular'
                    ? 'border-2 border-[#00D64B] bg-[#EAFBF1] dark:bg-[#00D64B]/15 text-[#008E32] dark:text-[#00D64B]'
                    : 'border border-slate-200/90 bg-white dark:border-white/10 dark:bg-[#131126] text-[#645F78] dark:text-[#9D96B8] hover:border-slate-300'
                }`}
              >
                <div
                  className={`mb-1.5 flex h-9 w-9 items-center justify-center rounded-xl ${
                    selectedMode === 'vestibular'
                      ? 'bg-[#00D64B]/20 text-[#008E32] dark:text-[#00D64B]'
                      : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'
                  }`}
                >
                  <ClipboardCheck size={18} strokeWidth={2.4} />
                </div>
                <span className="text-xs font-bold">Vestibular</span>
              </button>

              {/* Universitário Selector Card */}
              <button
                type="button"
                onClick={() => setSelectedMode('universitario')}
                className={`flex flex-col items-center justify-center rounded-2xl py-3.5 px-3 transition-all ${
                  selectedMode === 'universitario'
                    ? 'border-2 border-[#6F00D6] dark:border-[#B26BFF] bg-[#F4EBFF] dark:bg-[#6F00D6]/20 text-[#6F00D6] dark:text-[#B26BFF]'
                    : 'border border-slate-200/90 bg-white dark:border-white/10 dark:bg-[#131126] text-[#645F78] dark:text-[#9D96B8] hover:border-slate-300'
                }`}
              >
                <div
                  className={`mb-1.5 flex h-9 w-9 items-center justify-center rounded-xl ${
                    selectedMode === 'universitario'
                      ? 'bg-[#6F00D6]/20 text-[#6F00D6] dark:text-[#B26BFF]'
                      : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'
                  }`}
                >
                  <GraduationCap size={18} strokeWidth={2.4} />
                </div>
                <span className="text-xs font-bold">Universitário</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSignup} className="mt-4 flex flex-col gap-3.5">
            {/* Nome */}
            <div>
              <label
                htmlFor="signup-nome"
                className="mb-1.5 block text-xs font-semibold text-[#14102A] dark:text-[#E2E0EC]"
              >
                Nome
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                  <User size={16} />
                </span>
                <input
                  id="signup-nome"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/90 bg-[#FBFBFE] pl-10 pr-4 py-3 text-sm font-medium text-[#14102A] placeholder-slate-400 focus:border-[#6F00D6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6F00D6]/20 transition-all dark:border-white/10 dark:bg-[#131126] dark:text-white dark:placeholder-slate-500 dark:focus:border-[#00D64B]"
                  placeholder="Seu nome"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* E-mail */}
            <div>
              <label
                htmlFor="signup-email"
                className="mb-1.5 block text-xs font-semibold text-[#14102A] dark:text-[#E2E0EC]"
              >
                E-mail
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                  <Mail size={16} />
                </span>
                <input
                  id="signup-email"
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
                htmlFor="signup-senha"
                className="mb-1.5 block text-xs font-semibold text-[#14102A] dark:text-[#E2E0EC]"
              >
                Senha
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  id="signup-senha"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200/90 bg-[#FBFBFE] pl-10 pr-10 py-3 text-sm font-medium text-[#14102A] placeholder-slate-400 focus:border-[#6F00D6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6F00D6]/20 transition-all dark:border-white/10 dark:bg-[#131126] dark:text-white dark:placeholder-slate-500 dark:focus:border-[#00D64B]"
                  placeholder="Crie uma senha"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="mt-1 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setAgreeTerms(!agreeTerms)}
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                  agreeTerms
                    ? 'border-[#00D64B] bg-[#00D64B] text-black'
                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-white/5'
                }`}
              >
                {agreeTerms && <Check size={12} strokeWidth={3} />}
              </button>
              <span
                onClick={() => setAgreeTerms(!agreeTerms)}
                className="cursor-pointer text-xs font-normal text-[#645F78] dark:text-[#9D96B8]"
              >
                Li e aceito os termos de uso
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-[#00D64B] py-3.5 text-sm font-bold text-[#14102A] shadow-md shadow-[#00D64B]/20 transition-all hover:bg-[#19E85F] hover:shadow-lg active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Criar minha conta'}
            </button>
          </form>

          {/* Bottom login link */}
          <div className="mt-6 text-center text-xs font-normal text-[#645F78] dark:text-[#9D96B8]">
            Já tem conta?{' '}
            <Link to="/login" className="font-bold text-[#6F00D6] hover:underline dark:text-[#B26BFF]">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
