import { Clock, Shield, Users, AlertCircle, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { REFERENCE_DATE } from '../../domain/age';

export function RulesPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Voltar">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Regras do Processo Seletivo</h1>
          <p className="text-gray-500">CATI 2027 — Inscrições e Sorteios</p>
        </div>
      </div>

      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#7b1113]" aria-hidden="true" />
          Requisitos de Participação
        </h2>
        <ul className="space-y-3 text-gray-600">
          <li className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-[#7b1113]" aria-hidden="true" />
            <span>Ter <strong>60 anos ou mais</strong> até a data de referência: <strong>{REFERENCE_DATE.toLocaleDateString('pt-BR')}</strong>.</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-[#7b1113]" aria-hidden="true" />
            <span>A idade é calculada considerando o dia, mês e ano de nascimento (não apenas a diferença de anos).</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-[#7b1113]" aria-hidden="true" />
            <span>Pessoas com <strong>80 anos ou mais</strong> têm prioridade no sorteio.</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-[#7b1113]" aria-hidden="true" />
            <span>CPF válido e único por participante (a inscrição mais recente prevalece em caso de duplicidade).</span>
          </li>
        </ul>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Users className="h-5 w-5 text-[#7b1113]" aria-hidden="true" />
          Grupos e Atividades
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <article>
            <h3 className="font-medium text-gray-900 mb-3 text-[#7b1113]">Grupo 1 — Atividades Físicas</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>Dança de Salão</li>
              <li>Dança Ritmos</li>
              <li>Ginástica</li>
              <li>Ginástica na Cadeira</li>
              <li>Hidroginástica</li>
              <li>Pilates Solo</li>
              <li>Pilates Funcional</li>
              <li>Ginástica/Dance</li>
            </ul>
          </article>
          <article>
            <h3 className="font-medium text-gray-900 mb-3 text-[#7b1113]">Grupo 2 — Atividades Socioeducativas</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>Teatro</li>
              <li>Canto</li>
            </ul>
          </article>
        </div>
        <p className="text-sm text-gray-500">
          O participante pode escolher <strong>uma atividade no Grupo 1</strong> e <strong>uma atividade no Grupo 2</strong>.
          Os grupos são independentes — a classificação e lista de espera são separadas.
        </p>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#7b1113]" aria-hidden="true" />
          Cronograma
        </h2>
        <dl className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg">
            <dt className="font-medium text-gray-900">Período de inscrições</dt>
            <dd className="text-gray-600">01/01/2027 a 31/01/2027</dd>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg">
            <dt className="font-medium text-gray-900">Homologação das inscrições</dt>
            <dd className="text-gray-600">01/02/2027 a 04/02/2027</dd>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg">
            <dt className="font-medium text-gray-900">Sorteio eletrônico</dt>
            <dd className="text-gray-600">05/02/2027</dd>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg">
            <dt className="font-medium text-gray-900">Divulgação dos resultados</dt>
            <dd className="text-gray-600">A partir de 06/02/2027</dd>
          </div>
        </dl>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#7b1113]" aria-hidden="true" />
          Regras do Sorteio
        </h2>
        <ul className="space-y-3 text-gray-600">
          <li className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-[#7b1113]" aria-hidden="true" />
            <span>Apenas inscrições <strong>homologadas</strong> participam do sorteio.</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-[#7b1113]" aria-hidden="true" />
            <span>O sorteio é realizado por <strong>grupo</strong> (uma única ação para cada grupo).</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-[#7b1113]" aria-hidden="true" />
            <span>Dentro de cada atividade, os candidatos são distribuídos nas turmas respeitando as vagas.</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-[#7b1113]" aria-hidden="true" />
            <span>Participantes com 80+ anos são sorteados <strong>antes</strong> dos demais (prioridade).</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-[#7b1113]" aria-hidden="true" />
            <span>Quem não for classificado entra na <strong>lista de espera</strong> da atividade escolhida.</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-[#7b1113]" aria-hidden="true" />
            <span>A classificação é <strong>independente por grupo</strong> — um participante pode ser classificado em um grupo e em lista de espera no outro.</span>
          </li>
        </ul>
      </section>

      <div className="text-center">
        <Link to="/inscricao" className="inline-flex items-center gap-2 px-6 py-2 bg-[#7b1113] text-white rounded-lg hover:bg-[#5c0d0f]">
          Fazer Inscrição
        </Link>
      </div>
    </div>
  );
}