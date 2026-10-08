import { Link } from 'react-router-dom';
import { Calendar, Clock, Shield, ArrowRight } from 'lucide-react';

export function HomePage() {
  const periodStart = '01/01/2027';
  const periodEnd = '31/01/2027';
  const drawDate = '05/02/2027';

  return (
    <div className="space-y-8">
      <section className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Inscrições e Sorteios <span className="text-[#7b1113]">CATI 2027</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Centro de Atendimento à Terceira Idade — Processo seletivo para atividades físicas e socioeducativas.
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <article className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#fdf0f0] rounded-lg text-[#7b1113]">
              <Calendar className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Período de Inscrição</h2>
          </div>
          <p className="text-gray-600">De <strong>{periodStart}</strong> a <strong>{periodEnd}</strong></p>
          <p className="text-sm text-gray-500">As inscrições são realizadas exclusivamente online.</p>
        </article>

        <article className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#fdf0f0] rounded-lg text-[#7b1113]">
              <Shield className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Quem pode se inscrever</h2>
          </div>
          <p className="text-gray-600">Pessoas com <strong>60 anos ou mais</strong> até 05/01/2027.</p>
          <p className="text-sm text-gray-500">Prioridade para pessoas com 80 anos ou mais.</p>
        </article>

        <article className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#fdf0f0] rounded-lg text-[#7b1113]">
              <Clock className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Sorteio Eletrônico</h2>
          </div>
          <p className="text-gray-600">Previsão: <strong>{drawDate}</strong></p>
          <p className="text-sm text-gray-500">Realizado eletronicamente pela equipe do CATI.</p>
        </article>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Como funciona</h2>
        <div className="grid md:grid-cols-4 gap-4 text-center">
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 bg-[#fdf0f0] rounded-full flex items-center justify-center text-[#7b1113]">
              <span className="text-2xl font-bold">1</span>
            </div>
            <p className="font-medium text-gray-900">Inscrição</p>
            <p className="text-sm text-gray-500">Preencha o formulário online</p>
          </div>
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 bg-[#fdf0f0] rounded-full flex items-center justify-center text-[#7b1113]">
              <span className="text-2xl font-bold">2</span>
            </div>
            <p className="font-medium text-gray-900">Homologação</p>
            <p className="text-sm text-gray-500">Equipe valida os dados</p>
          </div>
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 bg-[#fdf0f0] rounded-full flex items-center justify-center text-[#7b1113]">
              <span className="text-2xl font-bold">3</span>
            </div>
            <p className="font-medium text-gray-900">Sorteio</p>
            <p className="text-sm text-gray-500">Eletrônico, por grupo</p>
          </div>
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 bg-[#fdf0f0] rounded-full flex items-center justify-center text-[#7b1113]">
              <span className="text-2xl font-bold">4</span>
            </div>
            <p className="font-medium text-gray-900">Resultado</p>
            <p className="text-sm text-gray-500">Classificação e lista de espera</p>
          </div>
        </div>
      </section>

      <section className="text-center space-y-4">
        <Link
          to="/inscricao"
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#7b1113] text-white font-medium rounded-lg hover:bg-[#5c0d0f] transition-colors"
        >
          Fazer Inscrição
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
        <p className="text-sm text-gray-500">
          Ou <Link to="/inscricao/regras" className="text-[#7b1113] hover:underline">consulte as regras completas</Link>
        </p>
      </section>
    </div>
  );
}