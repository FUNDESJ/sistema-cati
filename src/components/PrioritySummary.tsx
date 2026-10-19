import { Badge } from './ui/Badge';
import type { DrawPriorityStats, DrawResult } from '../types';

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/**
 * Estatísticas de prioridade a partir das entradas do resultado.
 * Usada como fallback para sorteios anteriores à adoção do campo
 * `priority` no DrawResult — a agregação é leitura pura das listas.
 */
function aggregateFromEntries(result: DrawResult): DrawPriorityStats {
  let classified = 0;
  let waiting = 0;
  for (const workshop of result.workshops) {
    classified += workshop.classified.filter((entry) => entry.isPriority80).length;
    waiting += workshop.waitingList.filter((entry) => entry.isPriority80).length;
  }
  return { candidates: classified + waiting, classified, waiting };
}

interface PrioritySummaryProps {
  result: DrawResult;
  className?: string;
}

/**
 * Resumo da prioridade 80+ aplicada no sorteio do grupo.
 *
 * Exibe quantos candidatos prioritários participaram, quantos foram
 * classificados e quantos estão em lista de espera — permitindo ao CATI
 * demonstrar, em prestação de contas e recursos, que a precedência dos
 * 80+ foi aplicada conforme o edital.
 */
export function PrioritySummary({ result, className = '' }: PrioritySummaryProps) {
  const stats = result.priority ?? aggregateFromEntries(result);

  return (
    <div className={`flex items-start gap-2.5 ${className}`}>
      <Badge variant="primary" className="flex-shrink-0 mt-0.5" aria-hidden="true">
        80+
      </Badge>
      <p className="text-sm text-[#3d3d3d] leading-relaxed">
        <strong className="text-[#1a1a1a]">Prioridade 80+:</strong>{' '}
        {stats.candidates === 0 ? (
          <>nenhum candidato prioritário participou deste grupo.</>
        ) : (
          <>
            {plural(stats.candidates, 'candidato', 'candidatos')}
            {' · '}
            {plural(stats.classified, 'classificado', 'classificados')}
            {' · '}
            {plural(stats.waiting, 'em espera', 'em espera')}
          </>
        )}
      </p>
    </div>
  );
}