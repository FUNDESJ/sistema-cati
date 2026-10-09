import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function HomePage() {
  const periodStart = '01/01/2027';
  const periodEnd = '31/01/2027';
  const drawDate = '05/02/2027';

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] tracking-tight">
          Inscrições e Sorteios <span className="text-[#7b1113]">CATI 2027</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-[#3d3d3d] max-w-2xl leading-relaxed">
          Centro de Atendimento à Terceira Idade — processo seletivo para atividades físicas e socioeducativas.
        </p>
      </section>

      <section aria-label="Informações rápidas">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#d8d8d8] border border-[#d8d8d8] rounded-lg overflow-hidden">
          <div className="bg-white p-5 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#595959]">Período de Inscrição</h2>
            <p className="mt-3 text-lg font-semibold text-[#1a1a1a]">De {periodStart} a {periodEnd}</p>
            <p className="mt-1 text-sm text-[#595959]">As inscrições são realizadas exclusivamente online.</p>
          </div>
          <div className="bg-white p-5 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#595959]">Quem pode se inscrever</h2>
            <p className="mt-3 text-lg font-semibold text-[#1a1a1a]">60 anos ou mais até 05/01/2027</p>
            <p className="mt-1 text-sm text-[#595959]">Prioridade para pessoas com 80 anos ou mais.</p>
          </div>
          <div className="bg-white p-5 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#595959]">Sorteio Eletrônico</h2>
            <p className="mt-3 text-lg font-semibold text-[#1a1a1a]">Previsão: {drawDate}</p>
            <p className="mt-1 text-sm text-[#595959]">Realizado eletronicamente pela equipe do CATI.</p>
          </div>
        </div>
      </section>

      <section className="bg-[#fafafa] border border-[#d8d8d8] rounded-lg p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-[#1a1a1a]">Como funciona</h2>
        <ol className="mt-6 space-y-5">
          {[
            { label: 'Inscrição', desc: 'Preencha o formulário online com seus dados e escolha as turmas desejadas.' },
            { label: 'Homologação', desc: 'A equipe do CATI valida seus dados antes do sorteio.' },
            { label: 'Sorteio', desc: 'Eletrônico, por grupo, seguindo as regras do edital.' },
            { label: 'Resultado', desc: 'Classificação e lista de espera divulgadas nesta página.' },
          ].map((step, i) => (
            <li key={step.label} className="flex gap-4 items-start">
              <span
                className="flex-shrink-0 w-8 h-8 rounded-md bg-[#7b1113] text-white flex items-center justify-center text-base font-bold"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <div>
                <h3 className="text-base font-semibold text-[#1a1a1a]">{step.label}</h3>
                <p className="mt-0.5 text-sm text-[#595959] leading-relaxed">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="text-center">
        <Link
          to="/inscricao"
          className="inline-flex items-center gap-2.5 min-h-[48px] px-8 py-3 text-base font-semibold rounded-md bg-[#7b1113] text-white hover:bg-[#5c0d0f] active:bg-[#450a0c] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7b1113] focus:ring-offset-2"
        >
          Fazer Inscrição
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
        <p className="mt-3 text-sm text-[#595959]">
          Ou <Link to="/inscricao/regras" className="font-medium text-[#7b1113] hover:underline">consulte as regras completas</Link>
        </p>
      </section>
    </div>
  );
}