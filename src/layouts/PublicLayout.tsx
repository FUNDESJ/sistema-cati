import { Outlet, Link } from 'react-router-dom';
import { Menu, X, Home } from 'lucide-react';
import { useState } from 'react';

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-[#7b1113] text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2" aria-label="CATI 2027 - Início">
                <Home className="h-8 w-8" aria-hidden="true" />
                <span className="text-xl font-bold">CATI 2027</span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-6" aria-label="Navegação principal">
              <Link to="/" className="text-sm font-medium hover:text-gray-200 transition-colors">
                Início
              </Link>
              <Link to="/inscricao" className="text-sm font-medium hover:text-gray-200 transition-colors">
                Inscrição
              </Link>
              <Link to="/inscricao/regras" className="text-sm font-medium hover:text-gray-200 transition-colors">
                Regras
              </Link>
            </nav>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-white/10">
            <nav className="flex flex-col gap-2">
              <Link to="/" className="px-4 py-2 text-sm font-medium hover:bg-white/10 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Início
              </Link>
              <Link to="/inscricao" className="px-4 py-2 text-sm font-medium hover:bg-white/10 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Inscrição
              </Link>
              <Link to="/inscricao/regras" className="px-4 py-2 text-sm font-medium hover:bg-white/10 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Regras
              </Link>
            </nav>
          </div>
        )}
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          CATI — Centro de Atendimento à Terceira Idade | Processo Seletivo 2027
        </div>
      </footer>
    </div>
  );
}