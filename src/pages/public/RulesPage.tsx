import { Link } from 'react-router-dom';

export function RulesPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#595959] hover:text-[#1a1a1a] transition-colors"
        >
          ← Voltar para início
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-[#1a1a1a] tracking-tight">Regras do Processo Seletivo</h1>
        <p className="mt-2 text-base text-[#3d3d3d]">Edital de Sorteio CATI 01/2027 — Inscrições e Sorteios.</p>
      </div>

      <section className="border border-[#d8d8d8] rounded-lg bg-white" aria-labelledby="requisitos">
        <h2 id="requisitos" className="px-6 py-4 text-lg font-semibold text-[#1a1a1a] border-b border-[#e5e5e5]">
          Requisitos de participação
        </h2>
        <ul className="px-6 py-5 space-y-4">
          {[
            'Ter 60 anos ou mais até a data de referência: 05/01/2027.',
            'A idade é calculada considerando o dia, mês e ano de nascimento (não apenas a diferença de anos).',
            'Pessoas com 80 anos ou mais têm prioridade no sorteio.',
            'CPF válido e único por participante (a inscrição mais recente prevalece em caso de duplicidade).',
          ].map((item) => (
            <li key={item} className="flex gap-3 text-[0.9375rem] text-[#3d3d3d] leading-relaxed">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#7b1113] mt-2" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="border border-[#d8d8d8] rounded-lg bg-white" aria-labelledby="grupos">
        <h2 id="grupos" className="px-6 py-4 text-lg font-semibold text-[#1a1a1a] border-b border-[#e5e5e5]">
          Grupos e atividades
        </h2>
        <div className="grid md:grid-cols-2 gap-px bg-[#e5e5e5]">
          <div className="bg-white px-6 py-5">
            <h3 className="text-base font-semibold text-[#7b1113]">Grupo 1 — Atividades Físicas</h3>
            <ul className="mt-3 space-y-1.5 text-[0.9375rem] text-[#3d3d3d]">
              <li>Dança de Salão</li>
              <li>Dança Ritmos</li>
              <li>Ginástica</li>
              <li>Ginástica na Cadeira</li>
              <li>Hidroginástica</li>
              <li>Pilates Solo</li>
              <li>Pilates Funcional</li>
              <li>Ginástica/Dance</li>
            </ul>
          </div>
          <div className="bg-white px-6 py-5">
            <h3 className="text-base font-semibold text-[#7b1113]">Grupo 2 — Atividades Socioeducativas</h3>
            <ul className="mt-3 space-y-1.5 text-[0.9375rem] text-[#3d3d3d]">
              <li>Teatro</li>
              <li>Canto</li>
            </ul>
          </div>
        </div>
        <p className="px-6 py-4 text-sm text-[#595959] border-t border-[#e5e5e5]">
          O participante pode escolher uma atividade no Grupo 1 e uma atividade no Grupo 2.
          Os grupos são independentes — a classificação e a lista de espera são separadas.
        </p>
      </section>

      <section className="border border-[#d8d8d8] rounded-lg bg-white" aria-labelledby="cronograma">
        <h2 id="cronograma" className="px-6 py-4 text-lg font-semibold text-[#1a1a1a] border-b border-[#e5e5e5]">
          Cronograma
        </h2>
        <dl className="px-6 py-5 space-y-4">
          {[
            ['Período de inscrições', '01/01/2027 a 31/01/2027'],
            ['Homologação das inscrições', '01/02/2027 a 04/02/2027'],
            ['Sorteio eletrônico', '05/02/2027'],
            ['Divulgação dos resultados', 'A partir de 06/02/2027'],
          ].map(([dt, dd]) => (
            <div key={dt} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
              <dt className="text-[0.9375rem] font-medium text-[#1a1a1a]">{dt}</dt>
              <dd className="text-[0.9375rem] text-[#3d3d3d]">{dd}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border border-[#d8d8d8] rounded-lg bg-white" aria-labelledby="regras-sorteio">
        <h2 id="regras-sorteio" className="px-6 py-4 text-lg font-semibold text-[#1a1a1a] border-b border-[#e5e5e5]">
          Regras do sorteio
        </h2>
        <ul className="px-6 py-5 space-y-4">
          {[
            'Apenas inscrições homologadas participam do sorteio.',
            'O sorteio é realizado por grupo (uma única ação para cada grupo).',
            'Dentro de cada turma, os candidatos são distribuídos nas vagas existentes.',
            'Participantes com 80+ anos são sorteados antes dos demais (prioridade).',
            'Quem não for classificado entra na lista de espera da turma escolhida.',
            'A classificação é independente por grupo — um participante pode ser classificado em um grupo e em lista de espera no outro.',
          ].map((item) => (
            <li key={item} className="flex gap-3 text-[0.9375rem] text-[#3d3d3d] leading-relaxed">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#7b1113] mt-2" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <div className="text-center">
        <Link
          to="/inscricao"
          className="inline-flex items-center gap-2.5 min-h-[48px] px-8 py-3 text-base font-semibold rounded-md bg-[#7b1113] text-white hover:bg-[#5c0d0f] active:bg-[#450a0c] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7b1113] focus:ring-offset-2"
        >
          Fazer Inscrição
        </Link>
        <p className="mt-3 text-sm text-[#595959]">
          Ou <Link to="/inscricao" className="font-medium text-[#7b1113] hover:underline">veja o formulário completo</Link>
        </p>
      </div>
    </div>
  );
}