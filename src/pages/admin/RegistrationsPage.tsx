import { useEffect, useMemo, useSyncExternalStore, useState } from 'react';
import { Eye, Download, AlertCircle, FilterX } from 'lucide-react';
import { subscribe, getState } from '../../store';
import { refreshRegistrations } from '../../services/registrationService';
import { getWorkshopById, listWorkshops, refreshAdminWorkshops } from '../../services/classService';
import { exportRegistrationsCsv } from '../../services/exportService';
import { ApiError } from '../../services/api';
import { Table } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { maskCpf, formatCpf } from '../../domain/cpf';
import type { Registration } from '../../types';

type GroupFilter = 'all' | 'g1' | 'g2' | 'both';

function useStore() {
  return useSyncExternalStore(subscribe, getState);
}

function mutationErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.fields && Object.keys(error.fields).length > 0) {
      return Object.values(error.fields).join(' ');
    }
    return error.message;
  }
  return 'Não foi possível concluir a operação. Tente novamente.';
}

function matchesGroupFilter(registration: Registration, group: GroupFilter): boolean {
  const hasG1 = registration.group1WorkshopId !== null;
  const hasG2 = registration.group2WorkshopId !== null;
  switch (group) {
    case 'g1':
      return hasG1;
    case 'g2':
      return hasG2;
    case 'both':
      return hasG1 && hasG2;
    default:
      return true;
  }
}

function matchesActivityFilter(
  registration: Registration,
  activityId: string,
): boolean {
  const g1 = registration.group1WorkshopId
    ? getWorkshopById(registration.group1WorkshopId)
    : undefined;
  const g2 = registration.group2WorkshopId
    ? getWorkshopById(registration.group2WorkshopId)
    : undefined;
  return g1?.activityId === activityId || g2?.activityId === activityId;
}

export function RegistrationsPage() {
  const state = useStore();
  const [search, setSearch] = useState('');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(state.registrations.length === 0);
  const [mutationError, setMutationError] = useState<string | null>(null);

  useEffect(() => {
    refreshRegistrations()
      .catch(() => undefined)
      .finally(() => setLoading(false));
    if (getState().workshops.length === 0) {
      refreshAdminWorkshops().catch(() => undefined);
    }
  }, []);

  const registrations = [...state.registrations].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const neighborhoodOptions = useMemo(() => {
    const unique = [...new Set(registrations.map((r) => r.participant.neighborhood))].sort((a, b) => a.localeCompare(b));
    return [
      { value: 'all', label: 'Todos os bairros' },
      ...unique.map((name) => ({ value: name, label: name })),
    ];
  }, [registrations]);

  const activityOptions = useMemo(() => {
    const byId = new Map<string, string>();
    for (const workshop of listWorkshops()) {
      byId.set(workshop.activityId, workshop.activityName);
    }
    const sorted = [...byId.entries()].sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB));
    return [
      { value: 'all', label: 'Todas as atividades' },
      ...sorted.map(([id, name]) => ({ value: id, label: name })),
    ];
  }, [state.workshops]);

  const filtered = registrations.filter((r) => {
    const matchesSearch =
      r.participant.name.toLowerCase().includes(search.toLowerCase()) ||
      r.participant.cpf.includes(search.replace(/\D/g, '')) ||
      r.participant.phone.includes(search.replace(/\D/g, ''));
    const matchesNeighborhood =
      neighborhoodFilter === 'all' || r.participant.neighborhood === neighborhoodFilter;
    const matchesGroup = matchesGroupFilter(r, groupFilter);
    const matchesActivity =
      activityFilter === 'all' || matchesActivityFilter(r, activityFilter);
    return matchesSearch && matchesNeighborhood && matchesGroup && matchesActivity;
  });

  const hasActiveFilters =
    neighborhoodFilter !== 'all' || groupFilter !== 'all' || activityFilter !== 'all' || search !== '';

  const clearFilters = () => {
    setSearch('');
    setNeighborhoodFilter('all');
    setGroupFilter('all');
    setActivityFilter('all');
  };

  const handleExport = async () => {
    setExporting(true);
    setMutationError(null);
    try {
      await exportRegistrationsCsv();
    } catch (error) {
      setMutationError(mutationErrorMessage(error));
    } finally {
      setExporting(false);
    }
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
      key: 'neighborhood',
      header: 'Bairro',
      render: (r: Registration) => r.participant.neighborhood,
    },
    {
      key: 'phone',
      header: 'Celular',
      render: (r: Registration) => <code className="text-sm">{r.participant.phone}</code>,
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
          <p className="mt-1 text-sm text-[#595959]">Inscrições concluídas — aptas automaticamente para o sorteio</p>
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
          label="Bairro"
          value={neighborhoodFilter}
          onChange={(e) => setNeighborhoodFilter(e.target.value)}
          options={neighborhoodOptions}
          className="sm:max-w-xs"
        />
        <Select
          label="Grupo"
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value as GroupFilter)}
          options={[
            { value: 'all', label: 'Todos os grupos' },
            { value: 'g1', label: 'Somente Grupo 1' },
            { value: 'g2', label: 'Somente Grupo 2' },
            { value: 'both', label: 'Ambos os grupos' },
          ]}
          className="sm:max-w-xs"
        />
        <Select
          label="Atividade"
          value={activityFilter}
          onChange={(e) => setActivityFilter(e.target.value)}
          options={activityOptions}
          className="sm:max-w-xs"
        />
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} leftIcon={<FilterX className="h-4 w-4" />}>
            Limpar filtros
          </Button>
        )}
        <p className="text-sm text-[#595959] sm:ml-auto">
          Mostrando <strong>{filtered.length}</strong> de <strong>{registrations.length}</strong> inscrições
        </p>
      </div>

      {mutationError && (
        <div className="flex items-start gap-3 p-4 bg-[#fbeaea] border border-[#a61b1b] rounded-lg" role="alert">
          <AlertCircle className="h-5 w-5 text-[#a61b1b] flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-[#a61b1b]">{mutationError}</p>
        </div>
      )}

      <div className="border border-[#d8d8d8] rounded-lg overflow-hidden bg-white">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-12" role="status">
            <LoadingSpinner />
            <p className="text-sm text-[#595959]">Carregando inscrições…</p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={filtered}
            keyExtractor={(r) => r.id}
            emptyMessage="Nenhuma inscrição encontrada"
          />
        )}
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
              <dt className="font-medium text-[#595959]">Celular</dt>
              <dd className="mt-0.5 font-semibold text-[#1a1a1a]">{selectedRegistration.participant.phone}</dd>
            </div>
            <div>
              <dt className="font-medium text-[#595959]">Bairro</dt>
              <dd className="mt-0.5 font-semibold text-[#1a1a1a]">{selectedRegistration.participant.neighborhood}</dd>
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
    </div>
  );
}