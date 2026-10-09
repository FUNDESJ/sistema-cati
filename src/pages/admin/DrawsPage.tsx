import { useState } from 'react';
import { Shuffle, AlertCircle, CheckCircle, Clock, ArrowRight, Loader2 } from 'lucide-react';
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">Realizar Sorteios</h1>
        <p className="mt-1 text-sm text-[#595959]">Execute o sorteio eletrônico para cada grupo</p>
      </div>

      <div className="grid md:grid-cols-2 gap-px bg-[#d8d8d8] border border-[#d8d8d8] rounded-lg overflow-hidden">
        {([1, 2] as const).map((groupId) => {
          const result = getDrawResult(groupId);
          const done = hasDrawResult(groupId);
          const isDrawing = drawing === groupId;

          return (
            <article key={groupId} className="bg-white flex flex-col min-h-[260px]">
              <div className="px-5 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
                <h2 className="text-base font-semibold text-[#1a1a1a]">{GROUP_LABELS[groupId]}</h2>
                <StatusBadge status={done ? 'ativa' : 'inativa'} />
              </div>

              <div className="flex-1 px-5 py-4 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-[#595959]">
                    {done
                      ? `Sorteio realizado em ${new Date(result!.drawnAt).toLocaleString('pt-BR')}.`
                      : 'Aguardando homologação das inscrições e execução do sorteio.'}
                  </p>

                  {done && result && (
                    <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-[#f4f4f4] rounded">
                        <p className="text-xs font-medium text-[#595959]">Candidatos</p>
                        <p className="text-xl font-bold text-[#1a1a1a]">{result.totalCandidates}</p>
                      </div>
                      <div className="p-3 bg-[#e9f4ec] rounded">
                        <p className="text-xs font-medium text-[#1d6b2f]">Classificados</p>
                        <p className="text-xl font-bold text-[#1d6b2f]">{result.totalClassified}</p>
                      </div>
                      <div className="p-3 bg-[#fbf3e0] rounded">
                        <p className="text-xs font-medium text-[#8a5a00]">Em espera</p>
                        <p className="text-xl font-bold text-[#8a5a00]">{result.totalWaiting}</p>
                      </div>
                    </div>
                  )}

                  {!done && (
                    <div className="mt-4 flex gap-2.5 p-3 bg-[#fbf3e0] border border-[#e8d9b0] rounded-lg">
                      <AlertCircle className="h-4 w-4 flex-shrink-0 text-[#8a5a00] mt-0.5" aria-hidden="true" />
                      <p className="text-sm text-[#3d3d3d]">Apenas inscrições homologadas participam do sorteio.</p>
                    </div>
                  )}
                </div>

                <div className="mt-5 space-y-2.5">
                  <Button
                    variant={done ? 'secondary' : 'primary'}
                    fullWidth
                    onClick={() => handleDraw(groupId)}
                    disabled={inProgress || isDrawing}
                    leftIcon={isDrawing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shuffle className="h-4 w-4" />}
                  >
                    {isDrawing ? 'Processando… (~2s)' : done ? 'Refazer Sorteio' : 'Realizar Sorteio'}
                  </Button>
                  {done && (
                    <div className="flex gap-2.5">
                      <Button variant="ghost" size="sm" fullWidth onClick={() => setShowResult(groupId)} leftIcon={<ArrowRight className="h-4 w-4" />}>
                        Ver Resultado
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleClear(groupId)}
                        className="text-[#a61b1b] hover:bg-[#fbeaea]"
                      >
                        Limpar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {showResult && (
        <Modal
          isOpen
          onClose={() => setShowResult(null)}
          title={`Resultado do Sorteio — ${GROUP_LABELS[showResult]}`}
          size="lg"
        >
          <DrawResultContent groupId={showResult} />
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

function DrawResultContent({ groupId }: { groupId: 1 | 2 }) {
  const result = getDrawResult(groupId);
  if (!result) return <p className="text-sm text-[#595959]">Resultado não disponível.</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-6 text-sm">
        <p><span className="font-semibold text-[#1a1a1a]">Realizado em:</span> <span className="text-[#3d3d3d]">{new Date(result.drawnAt).toLocaleString('pt-BR')}</span></p>
        <p><span className="font-semibold text-[#1a1a1a]">Candidatos:</span> <span className="text-[#3d3d3d]">{result.totalCandidates}</span></p>
        <p><span className="font-semibold text-[#1d6b2f]">Classificados:</span> <span className="text-[#3d3d3d]">{result.totalClassified}</span></p>
        <p><span className="font-semibold text-[#8a5a00]">Lista de espera:</span> <span className="text-[#3d3d3d]">{result.totalWaiting}</span></p>
      </div>

      <div className="space-y-5">
        <h3 className="text-base font-semibold text-[#1a1a1a]">Turmas</h3>
        {result.workshops.map((workshop) => (
          <article key={workshop.workshopId} className="border border-[#d8d8d8] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[#fafafa] border-b border-[#e5e5e5]">
              <h4 className="text-base font-semibold text-[#1a1a1a]">{workshop.activityName}</h4>
              <div className="flex items-center gap-4 text-xs text-[#595959] shrink-0">
                <span>{workshop.days} • {workshop.startTime}</span>
                <span>Prof. {workshop.professor}</span>
                <span>Vagas: <strong className="text-[#1a1a1a]">{workshop.vacancies}</strong></span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-px bg-[#e5e5e5]">
              {workshop.classified.length > 0 ? (
                <div className="bg-white p-4">
                  <h5 className="text-sm font-semibold text-[#1d6b2f] mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" aria-hidden="true" /> Classificados <span className="font-normal text-[#595959]">({workshop.classified.length}/{workshop.vacancies})</span>
                  </h5>
                  <ol className="space-y-1.5 max-h-56 overflow-y-auto">
                    {workshop.classified.map((entry) => (
                      <li key={entry.registrationId} className="flex items-center gap-2 text-sm text-[#1a1a1a] py-1.5 px-2 bg-[#f9f9f9] rounded">
                        <span className="w-6 font-mono text-[#595959] flex-shrink-0">{entry.position}.</span>
                        <span className="min-w-0 truncate font-medium">{entry.participantName}</span>
                        {entry.isPriority80 && <Badge variant="primary" className="flex-shrink-0">80+</Badge>}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <div className="bg-white p-4 flex items-center justify-center">
                  <p className="text-sm text-[#595959]">Nenhum classificado</p>
                </div>
              )}

              {workshop.waitingList.length > 0 ? (
                <div className="bg-white p-4">
                  <h5 className="text-sm font-semibold text-[#8a5a00] mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" aria-hidden="true" /> Lista de espera <span className="font-normal text-[#595959]">({workshop.waitingList.length})</span>
                  </h5>
                  <ol className="space-y-1.5 max-h-56 overflow-y-auto">
                    {workshop.waitingList.map((entry) => (
                      <li key={entry.registrationId} className="flex items-center gap-2 text-sm text-[#1a1a1a] py-1.5 px-2 bg-[#f9f9f9] rounded">
                        <span className="w-6 font-mono text-[#595959] flex-shrink-0">{entry.position}.</span>
                        <span className="min-w-0 truncate font-medium">{entry.participantName}</span>
                        {entry.isPriority80 && <Badge variant="primary" className="flex-shrink-0">80+</Badge>}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <div className="bg-white p-4 flex items-center justify-center">
                  <p className="text-sm text-[#595959]">Nenhum em espera</p>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      <article className="border border-[#d8d8d8] rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-[#fafafa] border-b border-[#e5e5e5]">
          <h4 className="text-base font-semibold text-[#1a1a1a]">Classificação Geral do Grupo</h4>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-white border-b border-[#e5e5e5]">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-[#595959]">Posição</th>
                <th className="text-left px-4 py-2.5 font-semibold text-[#595959]">Inscrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5]">
              {Object.entries(result.groupClassification)
                .sort(([, a], [, b]) => a - b)
                .map(([regId, pos]) => (
                  <tr key={regId} className="hover:bg-[#fafafa]">
                    <td className="px-4 py-2.5 font-mono text-[#595959]">{pos}</td>
                    <td className="px-4 py-2.5 text-[#1a1a1a]">{regId}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}