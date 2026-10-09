import { Outlet, Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">
      <header className="bg-[#7b1113] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="inline-flex items-baseline gap-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#7b1113] rounded-md"
              aria-label="CATI 2027 — Página inicial"
            >
              <span className="text-lg font-bold tracking-tight leading-none">CATI 2027</span>
              <span className="text-xs uppercase tracking-widest text-white/75">Inscrições</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1" aria-label="Navegação principal">
              {[
                { to: '/', label: 'Início' },
                { to: '/inscricao', label: 'Inscrição' },
                { to: '/inscricao/regras', label: 'Regras' },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `
                    px-4 py-2 text-sm font-medium rounded-md transition-colors
                    focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#7b1113]
                    ${isActive ? 'bg-white/10 text-white' : 'text-white/90 hover:text-white hover:bg-white/5'}
                  `}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              className="md:hidden p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#7b1113]"
              aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileOpen}
              aria-controls="public-mobile-menu"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div id="public-mobile-menu" className="md:hidden border-t border-white/15">
            <nav className="px-4 py-3 space-y-1" aria-label="Navegação principal mobile">
              {[
                { to: '/', label: 'Início' },
                { to: '/inscricao', label: 'Inscrição' },
                { to: '/inscricao/regras', label: 'Regras' },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `
                    block px-4 py-3 text-base font-medium rounded-md transition-colors
                    focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#7b1113]
                    ${isActive ? 'bg-white/10 text-white' : 'text-white/90 hover:text-white hover:bg-white/5'}
                  `}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Outlet />
      </main>

      <footer className="border-t border-[#e5e5e5] bg-[#fafafa]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center space-y-1">
          <p className="text-sm font-medium text-[#1a1a1a]">CATI — Centro de Atendimento à Terceira Idade</p>
          <p className="text-xs text-[#595959]">Processo seletivo 2027 · FUNDESJ</p>
        </div>
      </footer>
    </div>
  );
}