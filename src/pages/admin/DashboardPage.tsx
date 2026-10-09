import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getRegistrationStats } from '../../services/registrationService';
import { hasDrawResult } from '../../services/drawService';

interface StatItemProps {
  label: string;
  value: number;
  href: string;
  active?: boolean;
}

function StatItem({ label, value, href }: StatItemProps) {
  return (
    <Link
      to={href}
      className="group block border border-[#d8d8d8] bg-white hover:border-[#7b1113] transition-colors"
    >
      <div className="px-5 py-6">
        <p className="text-sm font-medium text-[#595959]">{label}</p>
        <p className="mt-2 text-3xl sm:text-4xl font-bold text-[#1a1a1a] tracking-tight">{value}</p>
        <p className="mt-3 text-sm font-medium text-[#7b1113] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          Abrir <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </p>
      </div>
    </Link>
  );
}

function DrawStatus({ group, done }: { group: 1 | 2; done: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 border border-[#d8d8d8] rounded-lg bg-white">
      <div className="min-w-0">
        <p className="text-base font-semibold text-[#1a1a1a]">
          {group === 1 ? 'Grupo 1 — Atividades Físicas' : 'Grupo 2 — Atividades Socioeducativas'}
        </p>
        <p className="mt-1 text-sm text-[#595959] truncate">
          {done
            ? 'Sorteio realizado. Resultados disponíveis.'
            : 'Aguardando homologação e execução do sorteio.'}
        </p>
      </div>
      <span
        className={`
          flex-shrink-0 inline-flex items-center gap-2 px-2.5 py-1 text-xs font-semibold rounded
          ${done
            ? 'bg-[#e9f4ec] text-[#1d6b2f]'
            : 'bg-[#f4f4f4] text-[#595959]'
          }
        `}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${done ? 'bg-[#1d6b2f]' : 'bg-[#8a8a8a]'}`} aria-hidden="true" />
        {done ? 'Realizado' : 'Pendente'}
      </span>
    </div>
  );
}

export function DashboardPage() {
  const stats = getRegistrationStats();
  const draw1Done = hasDrawResult(1);
  const draw2Done = hasDrawResult(2);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">Painel Administrativo</h1>
        <p className="mt-1 text-sm text-[#595959]">Visão operacional do processo seletivo CATI 2027</p>
      </div>

      <section aria-label="Indicadores principais" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#d8d8d8] border border-[#d8d8d8] rounded-lg overflow-hidden">
        <StatItem label="Total de inscrições" value={stats.total} href="/admin/inscricoes" />
        <StatItem label="Homologadas" value={stats.homologadas} href="/admin/inscricoes" />
        <StatItem label="Pendentes" value={stats.pendentes} href="/admin/inscricoes" />
        <StatItem label="Não homologadas" value={stats.naoHomologadas} href="/admin/inscricoes" />
      </section>

      <section aria-label="Visão por grupo" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#d8d8d8] border border-[#d8d8d8] rounded-lg overflow-hidden">
        <StatItem label="Grupo 1 (Físicas)" value={stats.group1} href="/admin/inscricoes" />
        <StatItem label="Grupo 2 (Socioeducativas)" value={stats.group2} href="/admin/inscricoes" />
        <StatItem label="Ambos os grupos" value={stats.bothGroups} href="/admin/inscricoes" />
        <StatItem label="Duplicadas (ignoradas)" value={stats.duplicadas} href="/admin/inscricoes" />
      </section>

      <section aria-label="Ações principais" className="border border-[#d8d8d8] rounded-lg bg-white p-5">
        <h2 className="text-lg font-semibold text-[#1a1a1a]">Ações Principais</h2>
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Link
            to="/admin/inscricoes"
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 text-sm font-semibold rounded-md border border-[#7b1113] text-[#7b1113] bg-white hover:bg-[#fdf0f0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7b1113] focus:ring-offset-2"
          >
            Gerenciar Inscrições
          </Link>
          <Link
            to="/admin/turmas"
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 text-sm font-semibold rounded-md border border-[#7b1113] text-[#7b1113] bg-white hover:bg-[#fdf0f0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7b1113] focus:ring-offset-2"
          >
            Gerenciar Turmas
          </Link>
          <Link
            to="/admin/sorteios"
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 text-sm font-semibold rounded-md bg-[#7b1113] text-white hover:bg-[#5c0d0f] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7b1113] focus:ring-offset-2"
          >
            Realizar Sorteios
          </Link>
          <Link
            to="/admin/resultados"
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 text-sm font-semibold rounded-md border border-[#d8d8d8] text-[#3d3d3d] bg-white hover:bg-[#f4f4f4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7b1113] focus:ring-offset-2"
          >
            Ver Resultados
          </Link>
        </div>
      </section>

      <section aria-label="Status dos sorteios" className="space-y-4">
        <h2 className="text-lg font-semibold text-[#1a1a1a]">Status dos Sorteios</h2>
        <div className="space-y-3">
          <DrawStatus group={1} done={draw1Done} />
          <DrawStatus group={2} done={draw2Done} />
        </div>
      </section>
    </div>
  );
}