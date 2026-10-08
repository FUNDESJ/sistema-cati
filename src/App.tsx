import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { HomePage } from './pages/public/HomePage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ConfirmationPage } from './pages/public/ConfirmationPage';
import { RulesPage } from './pages/public/RulesPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { RegistrationsPage } from './pages/admin/RegistrationsPage';
import { ClassesPage } from './pages/admin/ClassesPage';
import { DrawsPage } from './pages/admin/DrawsPage';
import { ResultsPage } from './pages/admin/ResultsPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/inscricao" element={<RegisterPage />} />
          <Route path="/inscricao/confirmacao" element={<ConfirmationPage />} />
          <Route path="/inscricao/regras" element={<RulesPage />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/inscricoes" element={<RegistrationsPage />} />
          <Route path="/admin/turmas" element={<ClassesPage />} />
          <Route path="/admin/sorteios" element={<DrawsPage />} />
          <Route path="/admin/resultados" element={<ResultsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}