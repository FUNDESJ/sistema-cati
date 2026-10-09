import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Calendar, Clock, Info } from 'lucide-react';
import { maskCpf } from '../../domain/cpf';
import { getWorkshopById } from '../../data/workshops';
import type { Registration } from '../../types';

export function ConfirmationPage() {
  const location = useLocation();
  const registration = location.state?.registration as Registration | undefined;

  if (!registration) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#fbf3e0] mb-4" aria-hidden="true">
          <Info className="h-7 w-7 text-[#8a5a00]" />
        </div>
        <h1 className="text-xl font-bold text-[#1a1a1a] mb-2">Nenhuma inscrição encontrada</h1>
        <p className="text-sm text-[#595959] mb-6">Volte à página inicial e faça sua inscrição.</p>
        <Link
          to="/inscricao"
          className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 text-sm font-semibold rounded-md bg-[#7b1113] text-white hover:bg-[#5c0d0f] transition-colors"
        >
          Fazer Inscrição
        </Link>
      </div>
    );
  }

  const group1Workshop = registration.group1WorkshopId ? getWorkshopById(registration.group1WorkshopId) : null;
  const group2Workshop = registration.group2WorkshopId ? getWorkshopById(registration.group2WorkshopId) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#e9f4ec]" aria-hidden="true">
          <CheckCircle2 className="h-7 w-7 text-[#1d6b2f]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] tracking-tight">Inscrição Confirmada!</h1>
          <p className="mt-2 text-base text-[#3d3d3d]">Sua inscrição foi recebida com sucesso.</p>
        </div>
      </div>

      <section className="border border-[#d8d8d8] rounded-lg bg-white overflow-hidden" aria-labelledby="dados">
        <h2 id="dados" className="px-6 py-4 text-lg font-semibold text-[#1a1a1a] border-b border-[#e5e5e5] bg-[#fafafa]">
          Dados do Participante
        </h2>
        <dl className="px-6 py-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
            <dt className="text-sm font-medium text-[#595959] w-40 flex-shrink-0">Nome completo</dt>
            <dd className="text-base font-semibold text-[#1a1a1a]">{registration.participant.name}</dd>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
            <dt className="text-sm font-medium text-[#595959] w-40 flex-shrink-0">CPF</dt>
            <dd className="text-base font-semibold text-[#1a1a1a] font-mono">{maskCpf(registration.participant.cpf)}</dd>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
            <dt className="text-sm font-medium text-[#595959] w-40 flex-shrink-0">Data de nascimento</dt>
            <dd className="text-base font-semibold text-[#1a1a1a]">{registration.participant.birthDate}</dd>
          </div>
        </dl>
      </section>

      <section className="border border-[#d8d8d8] rounded-lg bg-white overflow-hidden" aria-labelledby="turmas">
        <h2 id="turmas" className="px-6 py-4 text-lg font-semibold text-[#1a1a1a] border-b border-[#e5e5e5] bg-[#fafafa]">
          Turmas Escolhidas
        </h2>
        <div className="p-6 space-y-5">
          {group1Workshop ? (
            <div className="pb-5 border-b border-[#e5e5e5]">
              <p className="text-xs font-medium uppercase tracking-widest text-[#7b1113]">Grupo 1 — Atividades Físicas</p>
              <p className="mt-1 text-base font-semibold text-[#1a1a1a]">{group1Workshop.activityName}</p>
              <div className="mt-2 flex items-center gap-4 text-sm text-[#595959]">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  {group1Workshop.days}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {group1Workshop.startTime}
                </span>
              </div>
            </div>
          ) : null}

          {group2Workshop ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[#7b1113]">Grupo 2 — Atividades Socioeducativas</p>
              <p className="mt-1 text-base font-semibold text-[#1a1a1a]">{group2Workshop.activityName}</p>
              <div className="mt-2 flex items-center gap-4 text-sm text-[#595959]">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  {group2Workshop.days}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {group2Workshop.startTime}
                </span>
              </div>
            </div>
          ) : null}

          {!group1Workshop && !group2Workshop && (
            <p className="text-sm text-[#595959]">Nenhuma turma selecionada.</p>
          )}
        </div>
      </section>

      <div className="bg-[#fdf0f0] border border-[#e5c6c8] rounded-lg p-5">
        <p className="text-sm text-[#7b1113]">
          <strong>Identificação da inscrição:</strong>{' '}
          <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#e5c6c8]">
            {registration.id}
          </code>
        </p>
        <p className="mt-1.5 text-sm text-[#7b1113]">Guarde este número para acompanhamento.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link
          to="/inscricao"
          className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 text-sm font-semibold rounded-md border border-[#7b1113] text-[#7b1113] bg-white hover:bg-[#fdf0f0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7b1113] focus:ring-offset-2"
        >
          Nova Inscrição
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 text-sm font-semibold rounded-md bg-[#7b1113] text-white hover:bg-[#5c0d0f] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7b1113] focus:ring-offset-2"
        >
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}