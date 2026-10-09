import { Outlet, Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Shuffle, ListChecks, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/admin', label: 'Painel', icon: LayoutDashboard },
  { path: '/admin/inscricoes', label: 'Inscrições', icon: Users },
  { path: '/admin/turmas', label: 'Turmas', icon: Building2 },
  { path: '/admin/sorteios', label: 'Sorteios', icon: Shuffle },
  { path: '/admin/resultados', label: 'Resultados', icon: ListChecks },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f4f4] lg:flex">
      <aside
        id="admin-sidebar"
        aria-label="Menu administrativo"
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#d8d8d8]
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between h-16 px-5 border-b border-[#e5e5e5]">
            <div className="leading-tight">
              <p className="text-base font-bold text-[#7b1113]">CATI 2027</p>
              <p className="text-xs font-medium text-[#595959] uppercase tracking-widest">Administração</p>
            </div>
            <button
              type="button"
              className="lg:hidden p-2 rounded-md hover:bg-[#f4f4f4] transition-colors"
              onClick={() => setSidebarOpen(false)}
              aria-label="Fechar menu lateral"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto" aria-label="Navegação administrativa">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors
                  focus:outline-none focus:ring-2 focus:ring-[#7b1113] focus:ring-offset-1
                  ${isActive
                    ? 'bg-[#7b1113] text-white'
                    : 'text-[#3d3d3d] hover:bg-[#f4f4f4] hover:text-[#1a1a1a]'}
                `}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-[#e5e5e5]">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md text-[#3d3d3d] hover:bg-[#f4f4f4] hover:text-[#1a1a1a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7b1113] focus:ring-offset-1"
            >
              Área pública
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col lg:pl-72">
        <header className="sticky top-0 z-40 bg-white border-b border-[#d8d8d8] lg:hidden">
          <div className="flex items-center justify-between h-14 px-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-[#f4f4f4] transition-colors"
              aria-label="Abrir menu lateral"
              aria-expanded={sidebarOpen}
              aria-controls="admin-sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <p className="text-sm font-bold text-[#7b1113]">CATI 2027</p>
            <div className="w-9" aria-hidden="true" />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden cursor-default"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fechar menu lateral"
          aria-hidden="true"
        />
      )}
    </div>
  );
}