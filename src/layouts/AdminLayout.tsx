import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Shuffle, ListChecks, Menu, X, LogOut } from 'lucide-react';
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
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Menu administrativo"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#7b1113]">CATI 2027</span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Admin</span>
            </div>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
              aria-label="Fechar menu lateral"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto" aria-label="Navegação administrativa">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-[#7b1113] text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-[#7b1113]'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#7b1113] transition-colors"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              Área pública
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col lg:pl-64">
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Abrir menu lateral"
              aria-expanded={sidebarOpen}
              aria-controls="admin-sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="text-lg font-semibold text-[#7b1113]">CATI 2027 Admin</span>
            <div className="w-10" />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}