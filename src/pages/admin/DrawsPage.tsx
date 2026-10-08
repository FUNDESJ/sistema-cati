import { useState } from 'react';
import { Shuffle, AlertCircle, CheckCircle, Clock, Loader2, ArrowRight } from 'lucide-react';
import { performDraw, isDrawInProgress, getDrawResult, hasDrawResult, clearDrawResult } from '../../services/drawService';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

const GROUP_LABELS: Record<1 | 2, string> = {
  1: 'Grupo 1 — Atividades Físicas',
  2: 'Grupo 2 — Atividades Socioeducativas',
};

export function DrawsPage() {
  const [drawing, setDrawing] = useState<1 | 2 | null>(null);
  const [showResult, setShowResult] = useState<1 | 2 | null>(null);
  const [confirmClear, setConfirmClear] = useState<1 | 2 | null>(null);

  const inProgress = isDrawInProgress();

  const handleDraw = async (groupId: 1 | 2) => {
    setDrawing(groupId);
    try {
      performDraw(groupId);
      setShowResult(groupId);
    } catch (err) {
      console.error(err);
    } finally {
      setDrawing(null);
    }
  };

  const handleClear = (groupId: 1 | 2) => setConfirmClear(groupId);
  const executeClear = () => { if (confirmClear) { clearDrawResult(confirmClear); setConfirmClear(null); } };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Realizar Sorteios</h1>
        <p className="text-gray-500 mt-1">Execute o sorteio eletrônico para cada grupo</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {([1, 2] as const).map((groupId) => {
          const result = getDrawResult(groupId);
          const done = hasDrawResult(groupId);
          const isDrawing = drawing === groupId;

          return (
            <article key={groupId} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{GROUP_LABELS[groupId]}</h2>
                <StatusBadge status={done ? 'ativa' : 'inativa'} />
              </div>

              <p className="text-gray-600 text-sm">
                {done
                  ? `Sorteio realizado em ${new Date(result!.drawnAt).toLocaleString('pt-BR')}. ${result!.totalClassified} classificados, ${result!.totalWaiting} em espera.`
                  : 'Aguardando homologação das inscrições e execução do sorteio.'}
              </p>

              {done && (
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg"><p className="text-gray-500">Candidatos</p><p className="font-bold text-lg">{result!.totalCandidates}</p></div>
                  <div className="p-3 bg-green-50 rounded-lg"><p className="text-gray-500">Classificados</p><p className="font-bold text-lg text-green-600">{result!.totalClassified}</p></div>
                  <div className="p-3 bg-amber-50 rounded-lg"><p className="text-gray-500">Lista de espera</p><p className="font-bold text-lg text-amber-600">{result!.totalWaiting}</p></div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
<Button
                  variant={isDrawing ? 'secondary' : 'primary'}
                  size="lg"
                  fullWidth
                  onClick={() => handleDraw(groupId)}
                  disabled={inProgress || isDrawing}
                  leftIcon={isDrawing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shuffle className="h-4 w-4" />}
                >
                  {isDrawing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                      Processando... ~2s
                    </span>
                  ) : done ? (
                    'Refazer Sorteio'
                  ) : (
                    'Realizar Sorteio'
                  )}
                </Button>

                {done && (
                  <>
                    <Button variant="secondary" fullWidth onClick={() => setShowResult(groupId)} leftIcon={<ArrowRight className="h-4 w-4" />}>
                      Ver Resultado
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleClear(groupId)} className="text-red-600 hover:bg-red-50">
                      Limpar resultado
                    </Button>
                  </>
                )}
              </div>

              {!done && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                  <AlertCircle className="h-4 w-4 inline mr-1" aria-hidden="true" />
                  Certifique-se de que as inscrições estejam homologadas antes de realizar o sorteio.
                </div>
              )}
            </article>
          );
        })}
      </div>

      {showResult && (
        <Modal isOpen onClose={() => setShowResult(null)} title={`Resultado do Sorteio — ${GROUP_LABELS[showResult]}`} size="xl">
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            <p className="text-sm text-gray-500">Sorteio realizado em {new Date(getDrawResult(showResult)!.drawnAt).toLocaleString('pt-BR')}</p>
            <ResultsView groupId={showResult} />
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!confirmClear}
        onClose={() => setConfirmClear(null)}
        onConfirm={executeClear}
        title="Limpar resultado do sorteio"
        message="Tem certeza? O resultado será removido e o sorteio poderá ser refeito."
        confirmText="Limpar"
        variant="danger"
      />
    </div>
  );
}

function ResultsView({ groupId }: { groupId: 1 | 2 }) {
  const result = getDrawResult(groupId);
  if (!result) return null;

  return (
    <div className="space-y-6">
      {result.workshops.map((workshop) => (
        <article key={workshop.workshopId} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="font-semibold text-gray-900">{workshop.activityName}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{workshop.days} às {workshop.startTime}</span>
              <span>Prof. {workshop.professor}</span>
              <span>Vagas: <strong>{workshop.vacancies}</strong></span>
            </div>
          </div>

          {workshop.classified.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Classificados ({workshop.classified.length})
              </h4>
              <ol className="space-y-1 max-h-40 overflow-y-auto">
                {workshop.classified.map((entry) => (
                  <li key={entry.registrationId} className="flex items-center gap-2 text-sm text-gray-700 py-1 px-2 bg-green-50 rounded">
                    <span className="font-mono text-gray-400 w-8">{entry.position}.</span>
                    <span className="font-medium">{entry.participantName}</span>
                    {entry.isPriority80 && <Badge variant="warning" size="sm">80+</Badge>}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {workshop.waitingList.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-amber-700 mb-2 flex items-center gap-1">
                <Clock className="h-4 w-4" /> Lista de Espera ({workshop.waitingList.length})
              </h4>
              <ol className="space-y-1 max-h-40 overflow-y-auto">
                {workshop.waitingList.map((entry) => (
                  <li key={entry.registrationId} className="flex items-center gap-2 text-sm text-gray-700 py-1 px-2 bg-amber-50 rounded">
                    <span className="font-mono text-gray-400 w-8">{entry.position}.</span>
                    <span className="font-medium">{entry.participantName}</span>
                    {entry.isPriority80 && <Badge variant="warning" size="sm">80+</Badge>}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {workshop.classified.length === 0 && workshop.waitingList.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">Nenhum candidato para esta turma</p>
          )}
        </article>
      ))}

      <div className="pt-4 border-t border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3">Classificação Geral do Grupo</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="text-left py-2 px-3">Posição</th><th className="text-left py-2 px-3">Inscrição</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(result.groupClassification)
                .sort(([, a], [, b]) => a - b)
                .map(([regId, pos]) => (
                  <tr key={regId} className="hover:bg-gray-50">
                    <td className="py-2 px-3 font-mono text-gray-400">{pos}</td>
                    <td className="py-2 px-3">{regId}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}