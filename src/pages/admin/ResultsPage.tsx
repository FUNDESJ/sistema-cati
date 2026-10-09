import { useState } from 'react';
import { Download, Clock, CheckCircle, Shuffle, Eye } from 'lucide-react';
import { getDrawResult, hasDrawResult } from '../../services/drawService';
import { exportDrawResultCsv, downloadCsv } from '../../services/exportService';
import { Table } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import type { DrawnWorkshopResult } from '../../types';

const GROUP_LABELS: Record<1 | 2, string> = {
  1: 'Grupo 1 — Atividades Físicas',
  2: 'Grupo 2 — Atividades Socioeducativas',
};

interface EnrichedClassified {
  position: number;
  registrationId: string;
  participantName: string;
  isPriority80: boolean;
  workshopName: string;
  workshopDays: string;
  workshopTime: string;
}

interface EnrichedWaiting {
  position: number;
  registrationId: string;
  participantName: string;
  isPriority80: boolean;
  workshopName: string;
  workshopDays: string;
  workshopTime: string;
}

export function ResultsPage() {
  const [selectedGroup, setSelectedGroup] = useState<1 | 2>(1);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'turmas' | 'classificacao' | 'espera'>('turmas');
  const [selectedWorkshop, setSelectedWorkshop] = useState<DrawnWorkshopResult | null>(null);
  const [exporting, setExporting] = useState(false);

  const draw1Done = hasDrawResult(1);
  const draw2Done = hasDrawResult(2);
  const result = getDrawResult(selectedGroup);

  const handleExport = () => {
    if (!result) return;
    setExporting(true);
    const csv = exportDrawResultCsv(result);
    downloadCsv(csv, `resultado-grupo-${selectedGroup}-cati-${new Date().toISOString().split('T')[0]}.csv`);
    setExporting(false);
  };

  if (!draw1Done && !draw2Done) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#f4f4f4] mb-4" aria-hidden="true">
          <Shuffle className="h-7 w-7 text-[#595959]" />
        </div>
        <h1 className="text-xl font-bold text-[#1a1a1a] mb-2">Nenhum sorteio realizado</h1>
        <p className="text-sm text-[#595959] mb-6">Execute o sorteio na aba <strong>Sorteios</strong> para visualizar os resultados.</p>
        <Button variant="primary" onClick={() => window.location.href = '/admin/sorteios'} leftIcon={<Shuffle className="h-4 w-4" />}>
          Ir para Sorteios
        </Button>
      </div>
    );
  }

  const allClassified: EnrichedClassified[] = result?.workshops.flatMap((w) =>
    w.classified.map((c) => ({
      position: c.position,
      registrationId: c.registrationId,
      participantName: c.participantName,
      isPriority80: c.isPriority80,
      workshopName: w.activityName,
      workshopDays: w.days,
      workshopTime: w.startTime,
    })),
  ) || [];

  const allWaiting: EnrichedWaiting[] = result?.workshops.flatMap((w) =>
    w.waitingList.map((c) => ({
      position: c.position,
      registrationId: c.registrationId,
      participantName: c.participantName,
      isPriority80: c.isPriority80,
      workshopName: w.activityName,
      workshopDays: w.days,
      workshopTime: w.startTime,
    })),
  ) || [];

  const filteredClassified = allClassified.filter((e) =>
    e.participantName.toLowerCase().includes(search.toLowerCase()) ||
    e.registrationId.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredWaiting = allWaiting.filter((e) =>
    e.participantName.toLowerCase().includes(search.toLowerCase()) ||
    e.registrationId.toLowerCase().includes(search.toLowerCase()),
  );

  const tabs = [
    { id: 'turmas' as const, label: 'Por Turma', count: result?.workshops.length ?? 0 },
    { id: 'classificacao' as const, label: 'Classificação Geral', count: filteredClassified.length },
    { id: 'espera' as const, label: 'Lista de Espera', count: filteredWaiting.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">Resultados e Listas de Espera</h1>
          <p className="mt-1 text-sm text-[#595959]">Visualize classificação, listas de espera e exporte os dados</p>
        </div>
        <Button variant="secondary" onClick={handleExport} loading={exporting} leftIcon={<Download className="h-4 w-4" />} disabled={!result}>
          Exportar CSV
        </Button>
      </div>

      <div className="bg-white border border-[#d8d8d8] rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
          <Select
            label="Grupo"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(Number(e.target.value) as 1 | 2)}
            options={[
              { value: '1', label: draw1Done ? GROUP_LABELS[1] : `${GROUP_LABELS[1]} (pendente)` },
              { value: '2', label: draw2Done ? GROUP_LABELS[2] : `${GROUP_LABELS[2]} (pendente)` },
            ]}
            disabled={!draw1Done || !draw2Done}
            className="sm:max-w-xs"
          />
          <Input
            label="Buscar"
            placeholder="Nome ou número de inscrição"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
        </div>

        <div className="flex flex-wrap border-b border-[#d8d8d8]" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={viewMode === tab.id}
              onClick={() => setViewMode(tab.id)}
              className={`
                px-4 py-3 text-sm font-semibold border-b-2 transition-colors
                focus:outline-none focus:ring-2 focus:ring-[#7b1113] focus:ring-offset-1
                ${viewMode === tab.id
                  ? 'border-[#7b1113] text-[#7b1113] -mb-px'
                  : 'border-transparent text-[#3d3d3d] hover:text-[#1a1a1a] hover:bg-[#f4f4f4]'
                }
              `}
            >
              {tab.label}
              {tab.id !== 'turmas' && tab.count > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs font-normal rounded bg-[#e5e5e5] text-[#595959]">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'turmas' && result && (
        <div className="space-y-4">
          {result.workshops.map((workshop) => (
            <article key={workshop.workshopId} className="border border-[#d8d8d8] rounded-lg bg-white overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 border-b border-[#e5e5e5] bg-[#fafafa]">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-[#1a1a1a]">{workshop.activityName}</h3>
                  <p className="mt-1 text-sm text-[#595959]">{workshop.days} • {workshop.startTime} • Prof. {workshop.professor} • {workshop.vacancies} vagas</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedWorkshop(workshop)} leftIcon={<Eye className="h-4 w-4" />}>
                  Ver detalhes
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-px bg-[#e5e5e5]">
                <div className="bg-white p-4">
                  <h4 className="text-sm font-semibold text-[#1d6b2f] mb-3 flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4" aria-hidden="true" /> Classificados <span className="font-normal text-[#595959]">({workshop.classified.length}/{workshop.vacancies})</span>
                  </h4>
                  <ol className="space-y-1.5 max-h-48 overflow-y-auto">
                    {workshop.classified.slice(0, 5).map((entry) => (
                      <li key={entry.registrationId} className="flex items-center gap-2 text-sm text-[#1a1a1a] py-1.5 px-2 bg-[#f9f9f9] rounded">
                        <span className="w-6 font-mono text-[#595959] flex-shrink-0">{entry.position}.</span>
                        <span className="min-w-0 truncate font-medium">{entry.participantName}</span>
                        {entry.isPriority80 && <Badge variant="primary" className="flex-shrink-0">80+</Badge>}
                      </li>
                    ))}
                  </ol>
                  {workshop.classified.length > 5 && (
                    <p className="mt-2 text-xs text-[#595959] text-center">+{workshop.classified.length - 5} mais em "Ver detalhes"</p>
                  )}
                  {workshop.classified.length === 0 && (
                    <p className="py-6 text-center text-sm text-[#595959]">Nenhum classificado</p>
                  )}
                </div>

                <div className="bg-white p-4">
                  <h4 className="text-sm font-semibold text-[#8a5a00] mb-3 flex items-center gap-1.5">
                    <Clock className="h-4 w-4" aria-hidden="true" /> Lista de Espera <span className="font-normal text-[#595959]">({workshop.waitingList.length})</span>
                  </h4>
                  <ol className="space-y-1.5 max-h-48 overflow-y-auto">
                    {workshop.waitingList.slice(0, 5).map((entry) => (
                      <li key={entry.registrationId} className="flex items-center gap-2 text-sm text-[#1a1a1a] py-1.5 px-2 bg-[#f9f9f9] rounded">
                        <span className="w-6 font-mono text-[#595959] flex-shrink-0">{entry.position}.</span>
                        <span className="min-w-0 truncate font-medium">{entry.participantName}</span>
                        {entry.isPriority80 && <Badge variant="primary" className="flex-shrink-0">80+</Badge>}
                      </li>
                    ))}
                  </ol>
                  {workshop.waitingList.length > 5 && (
                    <p className="mt-2 text-xs text-[#595959] text-center">+{workshop.waitingList.length - 5} mais em "Ver detalhes"</p>
                  )}
                  {workshop.waitingList.length === 0 && (
                    <p className="py-6 text-center text-sm text-[#595959]">Nenhum em espera</p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {viewMode === 'classificacao' && result && (
        <div className="border border-[#d8d8d8] rounded-lg overflow-hidden bg-white">
          <Table
            columns={[
              { key: 'position', header: 'Pos.', render: (e: EnrichedClassified) => <span className="font-mono text-[#595959]">{e.position}</span> },
              { key: 'registrationId', header: 'Inscrição', render: (e: EnrichedClassified) => <code className="text-sm">{e.registrationId}</code> },
              { key: 'participantName', header: 'Nome', render: (e: EnrichedClassified) => <p className="font-semibold text-[#1a1a1a]">{e.participantName}</p> },
              { key: 'workshopName', header: 'Atividade', render: (e: EnrichedClassified) => e.workshopName },
              { key: 'workshopDays', header: 'Dias', render: (e: EnrichedClassified) => e.workshopDays },
              { key: 'workshopTime', header: 'Horário', render: (e: EnrichedClassified) => e.workshopTime },
              { key: 'isPriority80', header: '80+', render: (e: EnrichedClassified) => e.isPriority80 ? <Badge variant="primary">Sim</Badge> : <span className="text-[#595959]">Não</span> },
            ]}
            data={filteredClassified}
            keyExtractor={(e) => e.registrationId + e.position}
            emptyMessage="Nenhum classificado encontrado"
          />
        </div>
      )}

      {viewMode === 'espera' && result && (
        <div className="border border-[#d8d8d8] rounded-lg overflow-hidden bg-white">
          <Table
            columns={[
              { key: 'position', header: 'Pos.', render: (e: EnrichedWaiting) => <span className="font-mono text-[#595959]">{e.position}</span> },
              { key: 'registrationId', header: 'Inscrição', render: (e: EnrichedWaiting) => <code className="text-sm">{e.registrationId}</code> },
              { key: 'participantName', header: 'Nome', render: (e: EnrichedWaiting) => <p className="font-semibold text-[#1a1a1a]">{e.participantName}</p> },
              { key: 'workshopName', header: 'Atividade', render: (e: EnrichedWaiting) => e.workshopName },
              { key: 'workshopDays', header: 'Dias', render: (e: EnrichedWaiting) => e.workshopDays },
              { key: 'workshopTime', header: 'Horário', render: (e: EnrichedWaiting) => e.workshopTime },
              { key: 'isPriority80', header: '80+', render: (e: EnrichedWaiting) => e.isPriority80 ? <Badge variant="primary">Sim</Badge> : <span className="text-[#595959]">Não</span> },
            ]}
            data={filteredWaiting}
            keyExtractor={(e) => e.registrationId + e.position}
            emptyMessage="Nenhum participante em lista de espera"
          />
        </div>
      )}

      {selectedWorkshop && (
        <Modal isOpen onClose={() => setSelectedWorkshop(null)} title={`Detalhes: ${selectedWorkshop.activityName}`} size="lg">
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-[#1a1a1a]">{selectedWorkshop.activityName}</p>
                <p className="text-sm text-[#595959]">{selectedWorkshop.days} às {selectedWorkshop.startTime} • Prof. {selectedWorkshop.professor} • {selectedWorkshop.vacancies} vagas</p>
              </div>
              <StatusBadge status="ativa" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-[#1d6b2f] mb-2.5 flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" /> Classificados ({selectedWorkshop.classified.length}/{selectedWorkshop.vacancies})
                </h4>
                <ol className="space-y-1.5 max-h-72 overflow-y-auto">
                  {selectedWorkshop.classified.map((entry) => (
                    <li key={entry.registrationId} className="flex items-center gap-2 text-sm text-[#1a1a1a] py-1.5 px-2 bg-[#f9f9f9] rounded">
                      <span className="w-6 font-mono text-[#595959] flex-shrink-0">{entry.position}.</span>
                      <span className="min-w-0 truncate font-medium">{entry.participantName}</span>
                      {entry.isPriority80 && <Badge variant="primary" className="flex-shrink-0">80+</Badge>}
                    </li>
                  ))}
                  {selectedWorkshop.classified.length === 0 && <li className="text-center text-sm text-[#595959] py-4">Nenhum classificado</li>}
                </ol>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#8a5a00] mb-2.5 flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> Lista de Espera ({selectedWorkshop.waitingList.length})
                </h4>
                <ol className="space-y-1.5 max-h-72 overflow-y-auto">
                  {selectedWorkshop.waitingList.map((entry) => (
                    <li key={entry.registrationId} className="flex items-center gap-2 text-sm text-[#1a1a1a] py-1.5 px-2 bg-[#f9f9f9] rounded">
                      <span className="w-6 font-mono text-[#595959] flex-shrink-0">{entry.position}.</span>
                      <span className="min-w-0 truncate font-medium">{entry.participantName}</span>
                      {entry.isPriority80 && <Badge variant="primary" className="flex-shrink-0">80+</Badge>}
                    </li>
                  ))}
                  {selectedWorkshop.waitingList.length === 0 && <li className="text-center text-sm text-[#595959] py-4">Nenhum em espera</li>}
                </ol>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}