import { useSyncExternalStore } from 'react';
import { useState } from 'react';
import { CheckCircle, XCircle, Eye, Download } from 'lucide-react';
import { subscribe, getState } from '../../store';
import { homologateRegistration } from '../../services/registrationService';
import { resolveDuplications } from '../../domain/registration';
import { Table } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { exportRegistrationsCsv, downloadCsv } from '../../services/exportService';
import { maskCpf, formatCpf } from '../../domain/cpf';
import { getWorkshopById } from '../../data/workshops';
import type { Registration } from '../../types';

function useStore() {
  return useSyncExternalStore(subscribe, getState);
}

export function RegistrationsPage() {
  const state = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendente' | 'homologada' | 'nao_homologada'>('all');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'homologada' | 'nao_homologada' | null>(null);
  const [exporting, setExporting] = useState(false);

  const { active } = resolveDuplications(state.registrations);
  const registrations = active.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const filtered = registrations.filter((r) => {
    const matchesSearch =
      r.participant.name.toLowerCase().includes(search.toLowerCase()) ||
      r.participant.cpf.includes(search.replace(/\D/g, ''));
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleHomologate = (registration: Registration, decision: 'homologada' | 'nao_homologada') => {
    setSelectedRegistration(registration);
    setConfirmAction(decision);
    setConfirmOpen(true);
  };

  const executeHomologate = () => {
    if (selectedRegistration && confirmAction) {
      homologateRegistration(selectedRegistration.id, confirmAction);
      setConfirmOpen(false);
      setSelectedRegistration(null);
      setConfirmAction(null);
    }
  };

  const handleExport = () => {
    setExporting(true);
    const csv = exportRegistrationsCsv(state.registrations);
    downloadCsv(csv, `inscricoes-cati-${new Date().toISOString().split('T')[0]}.csv`);
    setExporting(false);
  };

  const columns = [
    {
      key: 'name',
      header: 'Nome',
      render: (r: Registration) => <p className="font-semibold text-[#1a1a1a]">{r.participant.name}</p>,
    },
    {
      key: 'cpf',
      header: 'CPF',
      render: (r: Registration) => <code className="text-sm">{formatCpf(r.participant.cpf)}</code>,
    },
    {
      key: 'birthDate',
      header: 'Nascimento',
      render: (r: Registration) => r.participant.birthDate,
    },
    {
      key: 'groups',
      header: 'Grupo(s)',
      render: (r: Registration) => (
        <div className="flex gap-1.5">
          {r.group1WorkshopId && <span className="text-xs font-semibold text-[#7b1113]">G1</span>}
          {r.group2WorkshopId && <span className="text-xs font-semibold text-[#7b1113]">G2</span>}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: Registration) => <StatusBadge status={r.status} />,
    },
    {
      key: 'createdAt',
      header: 'Criada em',
      render: (r: Registration) => new Date(r.createdAt).toLocaleString('pt-BR'),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (r: Registration) => (
        <div className="flex items-center gap-1">
          {r.status === 'pendente' && (
            <>
              <button
                type="button"
                className="w-10 h-10 flex items-center justify-center rounded-md text-[#1d6b2f] hover:bg-[#e9f4ec] transition-colors"
                onClick={() => handleHomologate(r, 'homologada')}
                aria-label={`Homologar inscrição de ${r.participant.name}`}
              >
                <CheckCircle className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="w-10 h-10 flex items-center justify-center rounded-md text-[#a61b1b] hover:bg-[#fbeaea] transition-colors"
                onClick={() => handleHomologate(r, 'nao_homologada')}
                aria-label={`Não homologar inscrição de ${r.participant.name}`}
              >
                <XCircle className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          )}
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-md text-[#3d3d3d] hover:bg-[#f4f4f4] hover:text-[#1a1a1a] transition-colors"
            onClick={() => setSelectedRegistration(r)}
            aria-label={`Ver detalhes de ${r.participant.name}`}
          >
            <Eye className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">Inscrições</h1>
          <p className="mt-1 text-sm text-[#595959]">Gerencie e homologue as inscrições recebidas</p>
        </div>
        <Button variant="secondary" onClick={handleExport} loading={exporting} leftIcon={<Download className="h-4 w-4" />}>
          Exportar CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-4 bg-[#fafafa] border border-[#d8d8d8] rounded-lg p-4">
        <Input
          label="Buscar"
          placeholder="Nome ou CPF"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          options={[
            { value: 'all', label: 'Todos' },
            { value: 'pendente', label: 'Pendente' },
            { value: 'homologada', label: 'Homologada' },
            { value: 'nao_homologada', label: 'Não homologada' },
          ]}
          className="sm:max-w-xs"
        />
        <p className="text-sm text-[#595959]">
          Mostrando <strong>{filtered.length}</strong> de <strong>{registrations.length}</strong> inscrições
        </p>
      </div>

      <div className="border border-[#d8d8d8] rounded-lg overflow-hidden bg-white">
        <Table
          columns={columns}
          data={filtered}
          keyExtractor={(r) => r.id}
          emptyMessage="Nenhuma inscrição encontrada"
        />
      </div>

      {selectedRegistration && (
        <Modal
          isOpen
          onClose={() => setSelectedRegistration(null)}
          title={`Detalhes: ${selectedRegistration.participant.name}`}
          size="lg"
        >
          <dl className="grid sm:grid-cols-2 gap-5 text-sm">
            <div>
              <dt className="font-medium text-[#595959]">Nome</dt>
              <dd className="mt-0.5 font-semibold text-[#1a1a1a]">{selectedRegistration.participant.name}</dd>
            </div>
            <div>
              <dt className="font-medium text-[#595959]">CPF</dt>
              <dd className="mt-0.5 font-mono font-semibold text-[#1a1a1a]">{maskCpf(selectedRegistration.participant.cpf)}</dd>
            </div>
            <div>
              <dt className="font-medium text-[#595959]">Data de nascimento</dt>
              <dd className="mt-0.5 font-semibold text-[#1a1a1a]">{selectedRegistration.participant.birthDate}</dd>
            </div>
            <div>
              <dt className="font-medium text-[#595959]">Grupo 1</dt>
              <dd className="mt-0.5 font-semibold text-[#1a1a1a]">
                {selectedRegistration.group1WorkshopId
                  ? getWorkshopById(selectedRegistration.group1WorkshopId)?.activityName ?? '—'
                  : 'Não inscrito no Grupo 1'}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[#595959]">Grupo 2</dt>
              <dd className="mt-0.5 font-semibold text-[#1a1a1a]">
                {selectedRegistration.group2WorkshopId
                  ? getWorkshopById(selectedRegistration.group2WorkshopId)?.activityName ?? '—'
                  : 'Não inscrito no Grupo 2'}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[#595959]">Status</dt>
              <dd className="mt-1.5"><StatusBadge status={selectedRegistration.status} /></dd>
            </div>
            <div>
              <dt className="font-medium text-[#595959]">Criada em</dt>
              <dd className="mt-0.5 font-semibold text-[#1a1a1a]">{new Date(selectedRegistration.createdAt).toLocaleString('pt-BR')}</dd>
            </div>
            {selectedRegistration.homologatedAt && (
              <div>
                <dt className="font-medium text-[#595959]">Homologada em</dt>
                <dd className="mt-0.5 font-semibold text-[#1a1a1a]">
                  {new Date(selectedRegistration.homologatedAt).toLocaleString('pt-BR')}
                </dd>
              </div>
            )}
          </dl>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setSelectedRegistration(null); setConfirmAction(null); }}
        onConfirm={executeHomologate}
        title={confirmAction === 'homologada' ? 'Homologar inscrição' : 'Não homologar inscrição'}
        message={confirmAction === 'homologada'
          ? `Deseja homologar a inscrição de ${selectedRegistration?.participant.name}? Esta inscrição poderá participar do sorteio.`
          : `Deseja marcar como não homologada a inscrição de ${selectedRegistration?.participant.name}? Ela não participará do sorteio.`}
        confirmText={confirmAction === 'homologada' ? 'Homologar' : 'Não homologar'}
        variant={confirmAction === 'homologada' ? 'default' : 'danger'}
      />
    </div>
  );
}