import { Link } from 'react-router-dom';
import { Users, Building2, Shuffle, ListChecks, FileText, Clock, CheckCircle, AlertCircle, Users as UsersIcon } from 'lucide-react';
import { getRegistrationStats } from '../../services/registrationService';
import { hasDrawResult } from '../../services/drawService';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';

export function DashboardPage() {
  const stats = getRegistrationStats();
  const draw1Done = hasDrawResult(1);
  const draw2Done = hasDrawResult(2);

  const cards = [
    { label: 'Total de inscrições', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Homologadas', value: stats.homologadas, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pendentes', value: stats.pendentes, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Não homologadas', value: stats.naoHomologadas, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Grupo 1 (Físicas)', value: stats.group1, icon: UsersIcon, color: 'text-[#7b1113]', bg: 'bg-[#fdf0f0]' },
    { label: 'Grupo 2 (Socioeducativas)', value: stats.group2, icon: UsersIcon, color: 'text-[#7b1113]', bg: 'bg-[#fdf0f0]' },
    { label: 'Ambos os grupos', value: stats.bothGroups, icon: UsersIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Duplicadas (ignoradas)', value: stats.duplicadas, icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-500 mt-1">Visão geral do processo seletivo CATI 2027</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <Link key={card.label} to={i < 4 ? '/admin/inscricoes' : i < 6 ? '/admin/inscricoes' : '/admin/resultados'} className="block">
            <article className={`p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow ${card.bg}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <card.icon className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Ações Principais</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin/inscricoes" className="block">
            <Button variant="secondary" fullWidth leftIcon={<FileText className="h-4 w-4" />}>
              Gerenciar Inscrições
            </Button>
          </Link>
          <Link to="/admin/turmas" className="block">
            <Button variant="secondary" fullWidth leftIcon={<Building2 className="h-4 w-4" />}>
              Gerenciar Turmas
            </Button>
          </Link>
          <Link to="/admin/sorteios" className="block">
            <Button variant={draw1Done && draw2Done ? 'secondary' : 'primary'} fullWidth leftIcon={<Shuffle className="h-4 w-4" />} disabled={draw1Done && draw2Done}>
              {draw1Done && draw2Done ? 'Sorteios Realizados' : 'Realizar Sorteios'}
            </Button>
          </Link>
          <Link to="/admin/resultados" className="block">
            <Button variant="secondary" fullWidth leftIcon={<ListChecks className="h-4 w-4" />} disabled={!draw1Done && !draw2Done}>
              Ver Resultados
            </Button>
          </Link>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Status dos Sorteios</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <article className={`p-4 rounded-lg border ${draw1Done ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Grupo 1 — Atividades Físicas</h3>
              <StatusBadge status={draw1Done ? 'ativa' : 'inativa'} />
            </div>
            <p className="text-sm text-gray-600">
              {draw1Done ? 'Sorteio realizado. Resultados disponíveis.' : 'Aguardando homologação e realização do sorteio.'}
            </p>
          </article>
          <article className={`p-4 rounded-lg border ${draw2Done ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Grupo 2 — Atividades Socioeducativas</h3>
              <StatusBadge status={draw2Done ? 'ativa' : 'inativa'} />
            </div>
            <p className="text-sm text-gray-600">
              {draw2Done ? 'Sorteio realizado. Resultados disponíveis.' : 'Aguardando homologação e realização do sorteio.'}
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}