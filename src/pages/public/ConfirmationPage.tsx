import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, Shield, User, Users, Activity } from 'lucide-react';
import { maskCpf } from '../../domain/cpf';
import { getWorkshopById } from '../../data/workshops';
import type { Registration } from '../../types';

export function ConfirmationPage() {
  const location = useLocation();
  const registration = location.state?.registration as Registration | undefined;

  if (!registration) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" aria-hidden="true" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Nenhuma inscrição encontrada</h1>
        <p className="text-gray-500 mb-6">Volte à página inicial e faça sua inscrição.</p>
        <Link to="/inscricao" className="inline-flex items-center gap-2 px-6 py-2 bg-[#7b1113] text-white rounded-lg hover:bg-[#5c0d0f]">
          Fazer Inscrição
        </Link>
      </div>
    );
  }

  const group1Workshop = registration.group1WorkshopId ? getWorkshopById(registration.group1WorkshopId) : null;
  const group2Workshop = registration.group2WorkshopId ? getWorkshopById(registration.group2WorkshopId) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <CheckCircle className="h-8 w-8 text-green-600" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Inscrição Confirmada!</h1>
        <p className="text-gray-600">Sua inscrição foi recebida com sucesso.</p>
      </div>

      <article className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <User className="h-5 w-5 text-[#7b1113]" aria-hidden="true" />
          Dados do Participante
        </h2>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">Nome</dt>
            <dd className="font-medium text-gray-900">{registration.participant.name}</dd>
          </div>
          <div>
            <dt className="text-gray-500">CPF</dt>
            <dd className="font-medium text-gray-900 font-mono">{maskCpf(registration.participant.cpf)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Data de nascimento</dt>
            <dd className="font-medium text-gray-900">{registration.participant.birthDate}</dd>
          </div>
        </dl>
      </article>

      <article className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Activity className="h-5 w-5 text-[#7b1113]" aria-hidden="true" />
          Turmas Escolhidas
        </h2>
        <dl className="space-y-3 text-sm">
          {group1Workshop ? (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#fdf0f0] rounded-lg text-[#7b1113]">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <dt className="text-gray-500 text-xs">Grupo 1 — Atividades Físicas</dt>
                  <dd className="font-medium text-gray-900">{group1Workshop.activityName}</dd>
                  <dd className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    {group1Workshop.days} às {group1Workshop.startTime}
                  </dd>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg text-gray-500">Nenhuma turma escolhida no Grupo 1</div>
          )}
          {group2Workshop ? (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#fdf0f0] rounded-lg text-[#7b1113]">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <dt className="text-gray-500 text-xs">Grupo 2 — Atividades Socioeducativas</dt>
                  <dd className="font-medium text-gray-900">{group2Workshop.activityName}</dd>
                  <dd className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    {group2Workshop.days} às {group2Workshop.startTime}
                  </dd>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg text-gray-500">Nenhuma turma escolhida no Grupo 2</div>
          )}
        </dl>
      </article>

      <article className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#7b1113]" aria-hidden="true" />
          Próximos Passos
        </h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <Calendar className="h-5 w-5 flex-shrink-0 text-[#7b1113]" aria-hidden="true" />
            <span>A equipe do CATI analisará sua inscrição (<strong>homologação</strong>).</span>
          </li>
          <li className="flex items-start gap-2">
            <Calendar className="h-5 w-5 flex-shrink-0 text-[#7b1113]" aria-hidden="true" />
            <span>O <strong>sorteio eletrônico</strong> será realizado conforme cronograma do edital.</span>
          </li>
          <li className="flex items-start gap-2">
            <Clock className="h-5 w-5 flex-shrink-0 text-[#7b1113]" aria-hidden="true" />
            <span>Os resultados (classificação e lista de espera) serão divulgados nas unidades do CATI e neste sistema.</span>
          </li>
        </ul>
      </article>

      <article className="bg-[#fdf0f0] border border-[#7b1113]/20 rounded-xl p-4">
        <p className="text-sm text-[#7b1113]">
          <strong>Identificação da inscrição:</strong> <code className="font-mono bg-white px-1.5 py-0.5 rounded">{registration.id}</code>
        </p>
        <p className="text-sm text-[#7b1113] mt-1">Guarde este número para acompanhamento.</p>
      </article>

      <div className="flex gap-3 justify-center">
        <Link to="/inscricao" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          Nova Inscrição
        </Link>
        <Link to="/" className="px-6 py-2 bg-[#7b1113] text-white rounded-lg hover:bg-[#5c0d0f] transition-colors">
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}