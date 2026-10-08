import { useState } from 'react';
import { Download, ListChecks, Clock, CheckCircle, Shuffle, Eye } from 'lucide-react';
import { getDrawResult, hasDrawResult } from '../../services/drawService';
import { exportDrawResultCsv, downloadCsv } from '../../services/exportService';
import { Table } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import type { DrawnWorkshopResult, ClassifiedEntry, WaitingListEntry } from '../../types';

const GROUP_LABELS: Record<1 | 2, string> = {
  1: 'Grupo 1 — Atividades Físicas',
  2: 'Grupo 2 — Atividades Socioeducativas',
};

export function ResultsPage() {
  const [selectedGroup, setSelectedGroup] = useState<1 | 2>(1);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'turmas' | 'classificacao' | 'espera'>('turmas');
  const [selectedWorkshop, setSelectedWorkshop] = useState<DrawnWorkshopResult | null>(null);
  const [exporting, setExporting] = useState(false);

  const result = getDrawResult(selectedGroup);
  const draw1Done = hasDrawResult(1);
  const draw2Done = hasDrawResult(2);

  const handleExport = () => {
    if (!result) return;
    setExporting(true);
    const csv = exportDrawResultCsv(result);
    downloadCsv(csv, `resultado-grupo-${selectedGroup}-cati-${new Date().toISOString().split('T')[0]}.csv`);
    setExporting(false);
  };

  if (!draw1Done && !draw2Done) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <ListChecks className="h-8 w-8 text-gray-400" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Nenhum sorteio realizado</h1>
        <p className="text-gray-500 mb-6">Execute o sorteio na aba <strong>Sorteios</strong> para visualizar os resultados.</p>
        <Button variant="primary" onClick={() => window.location.href = '/admin/sorteios'} leftIcon={<Shuffle className="h-4 w-4" />}>
          Ir para Sorteios
        </Button>
      </div>
    );
  }

  // Collect all entries for search
  const allClassified = result?.workshops.flatMap((w) =>
    w.classified.map((c) => ({ ...c, workshopName: w.activityName, workshopDays: w.days, workshopTime: w.startTime }))
  ) || [];
  const allWaiting = result?.workshops.flatMap((w) =>
    w.waitingList.map((c) => ({ ...c, workshopName: w.activityName, workshopDays: w.days, workshopTime: w.startTime }))
  ) || [];

  const filteredClassified = allClassified.filter((e) =>
    e.participantName.toLowerCase().includes(search.toLowerCase()) ||
    e.registrationId.toLowerCase().includes(search.toLowerCase())
  );
  const filteredWaiting = allWaiting.filter((e) =>
    e.participantName.toLowerCase().includes(search.toLowerCase()) ||
    e.registrationId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resultados e Listas de Espera</h1>
          <p className="text-gray-500 mt-1">Visualize classificação, listas de espera e exporte os dados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExport} loading={exporting} leftIcon={<Download className="h-4 w-4" />} disabled={!result}>
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            label="Grupo"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(Number(e.target.value) as 1 | 2)}
            options={[
              { value: '1', label: draw1Done ? GROUP_LABELS[1] : `${GROUP_LABELS[1]} (pendente)` },
              { value: '2', label: draw2Done ? GROUP_LABELS[2] : `${GROUP_LABELS[2]} (pendente)` },
            ]}
            disabled={!draw1Done || !draw2Done}
            className="w-full sm:w-64"
          />
          <div className="flex gap-2 border-b border-gray-200" role="tablist">
            {[
              { id: 'turmas', label: 'Por Turma', icon: ListChecks },
              { id: 'classificacao', label: 'Classificação Geral', icon: CheckCircle },
              { id: 'espera', label: 'Lista de Espera', icon: Clock },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={viewMode === tab.id}
                onClick={() => setViewMode(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  viewMode === tab.id
                    ? 'border-[#7b1113] text-[#7b1113]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" aria-hidden="true" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Buscar participante"
          placeholder="Nome ou número de inscrição"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {viewMode === 'turmas' && result && (
        <div className="space-y-4">
          {result.workshops.map((workshop) => (
            <article key={workshop.workshopId} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{workshop.activityName}</h3>
                  <p className="text-sm text-gray-500">{workshop.days} às {workshop.startTime} • Prof. {workshop.professor} • Vagas: {workshop.vacancies}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedWorkshop(workshop)} leftIcon={<Eye className="h-4 w-4" />}>
                  Ver detalhes
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Classificados ({workshop.classified.length}/{workshop.vacancies})
                  </h4>
                  <ol className="space-y-1 max-h-32 overflow-y-auto text-sm">
                    {workshop.classified.slice(0, 5).map((entry) => (
                      <li key={entry.registrationId} className="flex items-center gap-2 text-gray-700 py-1 px-2 bg-green-50 rounded">
                        <span className="font-mono text-gray-400 w-8">{entry.position}.</span>
                        <span className="font-medium truncate">{entry.participantName}</span>
                        {entry.isPriority80 && <Badge variant="warning" size="sm">80+</Badge>}
                      </li>
                    ))}
                    {workshop.classified.length > 5 && (
                      <li className="text-center text-gray-500 text-xs py-1">+{workshop.classified.length - 5} mais...</li>
                    )}
                    {workshop.classified.length === 0 && <li className="text-center text-gray-400 py-2">Nenhum classificado</li>}
                  </ol>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-amber-700 mb-2 flex items-center gap-1">
                    <Clock className="h-4 w-4" /> Lista de Espera ({workshop.waitingList.length})
                  </h4>
                  <ol className="space-y-1 max-h-32 overflow-y-auto text-sm">
                    {workshop.waitingList.slice(0, 5).map((entry) => (
                      <li key={entry.registrationId} className="flex items-center gap-2 text-gray-700 py-1 px-2 bg-amber-50 rounded">
                        <span className="font-mono text-gray-400 w-8">{entry.position}.</span>
                        <span className="font-medium truncate">{entry.participantName}</span>
                        {entry.isPriority80 && <Badge variant="warning" size="sm">80+</Badge>}
                      </li>
                    ))}
                    {workshop.waitingList.length > 5 && (
                      <li className="text-center text-gray-500 text-xs py-1">+{workshop.waitingList.length - 5} mais...</li>
                    )}
                    {workshop.waitingList.length === 0 && <li className="text-center text-gray-400 py-2">Nenhum em espera</li>}
                  </ol>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {viewMode === 'classificacao' && result && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <Table
            columns={[
              { key: 'position', header: 'Pos.', render: (e: ClassifiedEntry & { workshopName: string }) => <span className="font-mono text-gray-400">{e.position}</span> },
              { key: 'registrationId', header: 'Inscrição' },
              { key: 'participantName', header: 'Nome' },
              { key: 'workshopName', header: 'Atividade' },
              { key: 'workshopDays', header: 'Dias' },
              { key: 'workshopTime', header: 'Horário' },
              { key: 'isPriority80', header: '80+', render: (e: ClassifiedEntry & { workshopName: string }) => e.isPriority80 ? <Badge variant="warning" size="sm">Sim</Badge> : <span className="text-gray-300">Não</span> },
            ]}
            data={filteredClassified}
            keyExtractor={(e) => e.registrationId + e.position}
            emptyMessage="Nenhum classificado encontrado"
            striped
            hoverable
          />
        </div>
      )}

      {viewMode === 'espera' && result && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <Table
            columns={[
              { key: 'position', header: 'Pos.', render: (e: WaitingListEntry & { workshopName: string }) => <span className="font-mono text-gray-400">{e.position}</span> },
              { key: 'registrationId', header: 'Inscrição' },
              { key: 'participantName', header: 'Nome' },
              { key: 'workshopName', header: 'Atividade' },
              { key: 'workshopDays', header: 'Dias' },
              { key: 'workshopTime', header: 'Horário' },
              { key: 'isPriority80', header: '80+', render: (e: WaitingListEntry & { workshopName: string }) => e.isPriority80 ? <Badge variant="warning" size="sm">Sim</Badge> : <span className="text-gray-300">Não</span> },
            ]}
            data={filteredWaiting}
            keyExtractor={(e) => e.registrationId + e.position}
            emptyMessage="Nenhum participante em lista de espera"
            striped
            hoverable
          />
        </div>
      )}

      {selectedWorkshop && (
        <Modal isOpen onClose={() => setSelectedWorkshop(null)} title={`Detalhes: ${selectedWorkshop.activityName}`} size="xl">
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedWorkshop.activityName}</h3>
              <span className="text-sm text-gray-500">{selectedWorkshop.days} às {selectedWorkshop.startTime} • Prof. {selectedWorkshop.professor}</span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-green-700 mb-3">Classificados ({selectedWorkshop.classified.length}/{selectedWorkshop.vacancies})</h4>
                <ol className="space-y-1 max-h-64 overflow-y-auto text-sm">
                  {selectedWorkshop.classified.map((entry) => (
                    <li key={entry.registrationId} className="flex items-center gap-2 py-1 px-2 bg-green-50 rounded">
                      <span className="font-mono text-gray-400 w-8">{entry.position}.</span>
                      <span className="font-medium">{entry.participantName}</span>
                      <span className="text-gray-400">{entry.registrationId}</span>
                      {entry.isPriority80 && <Badge variant="warning" size="sm">80+</Badge>}
                    </li>
                  ))}
                  {selectedWorkshop.classified.length === 0 && <li className="text-center text-gray-400 py-2">Nenhum classificado</li>}
                </ol>
              </div>
              <div>
                <h4 className="font-medium text-amber-700 mb-3">Lista de Espera ({selectedWorkshop.waitingList.length})</h4>
                <ol className="space-y-1 max-h-64 overflow-y-auto text-sm">
                  {selectedWorkshop.waitingList.map((entry) => (
                    <li key={entry.registrationId} className="flex items-center gap-2 py-1 px-2 bg-amber-50 rounded">
                      <span className="font-mono text-gray-400 w-8">{entry.position}.</span>
                      <span className="font-medium">{entry.participantName}</span>
                      <span className="text-gray-400">{entry.registrationId}</span>
                      {entry.isPriority80 && <Badge variant="warning" size="sm">80+</Badge>}
                    </li>
                  ))}
                  {selectedWorkshop.waitingList.length === 0 && <li className="text-center text-gray-400 py-2">Nenhum em espera</li>}
                </ol>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}