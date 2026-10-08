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
import { Badge, StatusBadge } from '../../components/ui/Badge';
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
    { key: 'name', header: 'Nome', render: (r: Registration) => <span className="font-medium">{r.participant.name}</span> },
    { key: 'cpf', header: 'CPF', render: (r: Registration) => <code className="text-sm">{formatCpf(r.participant.cpf)}</code> },
    { key: 'birthDate', header: 'Nascimento', render: (r: Registration) => r.participant.birthDate },
    {
      key: 'groups',
      header: 'Grupos',
      render: (r: Registration) => (
        <div className="flex gap-1">
          {r.group1WorkshopId && <Badge variant="info" size="sm">G1</Badge>}
          {r.group2WorkshopId && <Badge variant="success" size="sm">G2</Badge>}
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (r: Registration) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', header: 'Criado em', render: (r: Registration) => new Date(r.createdAt).toLocaleString('pt-BR') },
    {
      key: 'actions',
      header: 'Ações',
      render: (r: Registration) => (
        <div className="flex items-center gap-2">
          {r.status === 'pendente' && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleHomologate(r, 'homologada')}
                aria-label={`Homologar inscrição de ${r.participant.name}`}
              >
                <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleHomologate(r, 'nao_homologada')}
                aria-label={`Não homologar inscrição de ${r.participant.name}`}
              >
                <XCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
              </Button>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => setSelectedRegistration(r)} aria-label={`Ver detalhes de ${r.participant.name}`}>
            <Eye className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inscrições</h1>
          <p className="text-gray-500 mt-1">Gerencie e homologue as inscrições recebidas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExport} loading={exporting} leftIcon={<Download className="h-4 w-4" />}>
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            label="Buscar"
            placeholder="Nome ou CPF"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
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
            className="w-full sm:w-48"
          />
        </div>
        <p className="text-sm text-gray-500">
          Mostrando {filtered.length} de {registrations.length} inscrições ativas (duplicatas ignoradas)
        </p>
      </div>

      <Table
        columns={columns}
        data={filtered}
        keyExtractor={(r) => r.id}
        emptyMessage="Nenhuma inscrição encontrada"
        striped
        hoverable
      />

      {selectedRegistration && (
        <Modal isOpen onClose={() => setSelectedRegistration(null)} title={`Detalhes: ${selectedRegistration.participant.name}`} size="lg">
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div><dt className="text-gray-500">Nome</dt><dd className="font-medium">{selectedRegistration.participant.name}</dd></div>
            <div><dt className="text-gray-500">CPF</dt><dd className="font-medium font-mono">{maskCpf(selectedRegistration.participant.cpf)}</dd></div>
            <div><dt className="text-gray-500">Data de nascimento</dt><dd>{selectedRegistration.participant.birthDate}</dd></div>
            <div><dt className="text-gray-500">Grupo 1</dt><dd>{selectedRegistration.group1WorkshopId ? getWorkshopById(selectedRegistration.group1WorkshopId)?.activityName ?? selectedRegistration.group1WorkshopId : '—'}</dd></div>
            <div><dt className="text-gray-500">Grupo 2</dt><dd>{selectedRegistration.group2WorkshopId ? getWorkshopById(selectedRegistration.group2WorkshopId)?.activityName ?? selectedRegistration.group2WorkshopId : '—'}</dd></div>
            <div><dt className="text-gray-500">Status</dt><dd><StatusBadge status={selectedRegistration.status} /></dd></div>
            <div><dt className="text-gray-500">Criado em</dt><dd>{new Date(selectedRegistration.createdAt).toLocaleString('pt-BR')}</dd></div>
            {selectedRegistration.homologatedAt && (
              <div><dt className="text-gray-500">Homologado em</dt><dd>{new Date(selectedRegistration.homologatedAt).toLocaleString('pt-BR')}</dd></div>
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
          ? `Deseja homologar a inscrição de ${selectedRegistration?.participant.name}? Ela poderá participar do sorteio.`
          : `Deseja marcar como não homologada a inscrição de ${selectedRegistration?.participant.name}? Ela não participará do sorteio.`}
        confirmText={confirmAction === 'homologada' ? 'Homologar' : 'Não homologar'}
        variant={confirmAction === 'homologada' ? 'primary' : 'danger'}
      />
    </div>
  );
}