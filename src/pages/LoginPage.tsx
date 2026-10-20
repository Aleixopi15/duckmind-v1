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
    <div className="flex min-h-screen bg-papel transition-colors duration-300 dark:bg-surface-dark">
      <AuthBrandPanel
        title="Bem-vindo de volta!"
        description="Continue sua jornada de estudos. Sua ofensiva está te esperando."
        mood="celebrating"
      />

      <div className="relative flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="absolute right-4 top-4"><ThemeToggle /></div>

        <div className="card w-full max-w-sm animate-fade-in p-6 sm:p-8">
          <div className="mb-5 flex items-center justify-center gap-2 md:hidden">
            <DuckMascot size={64} mood="happy" animate />
          </div>

          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-tinta dark:text-papel">
            Entrar
          </h2>
          <p className="mb-4 text-sm font-semibold text-muted dark:text-papel/60">
            Acesse sua conta para continuar
          </p>

          {isSecretKeyDetected && (
            <div className="mb-4 rounded-[14px] border-[3px] border-tinta bg-amber-100 p-3 text-xs font-semibold text-tinta dark:border-papel dark:bg-amber-950/70 dark:text-amber-200">
              <p className="mb-1 flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
                <AlertTriangle size={15} strokeWidth={2.8} /> Chave Secreta Detectada
              </p>
              Foi configurada a chave de servidor (<code className="rounded bg-black/10 px-1 py-0.5 dark:bg-white/10">sb_secret_...</code>). O Supabase bloqueia chaves secretas no navegador.
              <p className="mt-1">
                <strong>Solução:</strong> No Supabase, acesse <em>Project Settings &gt; API</em> e copie a chave <strong>Publishable / Anon</strong> (<code className="rounded bg-black/10 px-1 py-0.5 dark:bg-white/10">sb_publishable_...</code>).
              </p>
              <p className="mt-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                ✓ DuckMind ativou o modo local seguro para você navegar e testar normalmente.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-[14px] border-[3px] border-tinta bg-bico px-3.5 py-2.5 text-sm font-bold text-tinta dark:border-papel">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-bold">Email</label>
              <input
                id="login-email"
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="input" placeholder="seu@email.com" autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="login-senha" className="mb-1.5 block text-sm font-bold">Senha</label>
              <input
                id="login-senha"
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="input" placeholder="••••••••" autoComplete="current-password"
              />
            </div>

            <button type="submit" disabled={loading} className="btn mt-2 w-full bg-pato py-3 text-base text-tinta dark:border-papel">
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar'}
            </button>
          </form>

          <div className="my-5 text-center text-sm font-semibold text-muted dark:text-papel/60">
            Não tem conta?{' '}
            <Link to="/signup" className="font-bold text-mente hover:underline dark:text-pato">Cadastre-se grátis</Link>
          </div>

          <Link to="/" className="inline-flex items-center gap-1 text-sm font-bold text-muted transition hover:text-mente dark:text-papel/60 dark:hover:text-pato">
            <ArrowLeft size={14} strokeWidth={3} /> Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
}
