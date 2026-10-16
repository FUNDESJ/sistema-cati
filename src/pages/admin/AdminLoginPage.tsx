import { useState } from 'react';
import { Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, LogIn } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { login } from '../../services/authService';
import { getAdminSession, ApiError } from '../../services/api';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getAdminSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (session) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    setError(null);
    if (!email.trim() || !password) {
      setError('Informe o e-mail e a senha para acessar a área administrativa.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from !== '/admin/login' ? from : '/admin', { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível entrar. Verifique suas credenciais e tente novamente.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <header className="bg-[#7b1113] text-white">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <p className="text-base font-bold tracking-tight">CATI 2027 · Administração</p>
          <Link
            to="/"
            className="text-sm font-medium text-white/90 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-[#7b1113] rounded px-2 py-1 transition-colors"
          >
            Área pública
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white border border-[#d8d8d8] rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-[#e5e5e5] bg-[#fafafa]">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#fdf0f0]" aria-hidden="true">
                  <Lock className="h-5 w-5 text-[#7b1113]" />
                </span>
                <div>
                  <h1 className="text-lg font-bold text-[#1a1a1a] tracking-tight">Acesso restrito</h1>
                  <p className="text-sm text-[#595959]">Entre com as credenciais da equipe do CATI</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>
              {error && (
                <div className="flex items-start gap-3 p-4 bg-[#fbeaea] border border-[#a61b1b] rounded-lg" role="alert">
                  <AlertCircle className="h-5 w-5 text-[#a61b1b] flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm text-[#a61b1b]">{error}</p>
                </div>
              )}

              <Input
                label="E-mail"
                type="email"
                placeholder="nome@exemplo.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                className="text-base py-3"
              />

              <Input
                label="Senha"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="text-base py-3"
              />

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={submitting}
                leftIcon={<LogIn className="h-4 w-4" />}
                className="text-base"
              >
                Entrar
              </Button>
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-[#595959]">
            Acesso monitorado: toda ação administrativa é registrada em trilha de auditoria.
          </p>
        </div>
      </main>
    </div>
  );
}
