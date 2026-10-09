import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { listWorkshops, createWorkshop, updateWorkshopDetails, deleteWorkshop } from '../../services/classService';
import { getActivitiesByGroup } from '../../data/activities';
import { Table } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import type { Workshop, Activity } from '../../types';

interface WorkshopFormData {
  activityId: string;
  activityName: string;
  groupId: 1 | 2;
  days: string;
  startTime: string;
  vacancies: number;
  professor: string;
}

const GROUP_ACTIVITIES: Record<1 | 2, Activity[]> = {
  1: getActivitiesByGroup(1),
  2: getActivitiesByGroup(2),
};

export function ClassesPage() {
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<'all' | 1 | 2>('all');
  const [activityFilter, setActivityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativa' | 'inativa'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Workshop | null>(null);
  const [formData, setFormData] = useState<WorkshopFormData>({
    activityId: '',
    activityName: '',
    groupId: 1,
    days: 'Segundas e Quartas',
    startTime: '08:00',
    vacancies: 25,
    professor: '',
  });

  const workshops = listWorkshops();

  const filtered = workshops.filter((w) => {
    const matchesSearch = w.activityName.toLowerCase().includes(search.toLowerCase()) || w.professor.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = groupFilter === 'all' || w.groupId === groupFilter;
    const matchesActivity = !activityFilter || w.activityId === activityFilter;
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesGroup && matchesActivity && matchesStatus;
  });

  const activitiesForGroup = groupFilter === 'all'
    ? [...GROUP_ACTIVITIES[1], ...GROUP_ACTIVITIES[2]]
    : GROUP_ACTIVITIES[groupFilter];

  const handleOpenCreate = () => {
    setEditingWorkshop(null);
    setFormData({
      activityId: '',
      activityName: '',
      groupId: 1,
      days: 'Segundas e Quartas',
      startTime: '08:00',
      vacancies: 25,
      professor: '',
    });
    setModalOpen(true);
  };

  const handleEdit = (workshop: Workshop) => {
    setEditingWorkshop(workshop);
    setFormData({
      activityId: workshop.activityId,
      activityName: workshop.activityName,
      groupId: workshop.groupId,
      days: workshop.days,
      startTime: workshop.startTime,
      vacancies: workshop.vacancies,
      professor: workshop.professor,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWorkshop) {
      updateWorkshopDetails(editingWorkshop.id, {
        activityId: formData.activityId,
        activityName: formData.activityName,
        groupId: formData.groupId,
        days: formData.days,
        startTime: formData.startTime,
        vacancies: formData.vacancies,
        professor: formData.professor,
      });
    } else {
      createWorkshop(formData);
    }
    setModalOpen(false);
    setEditingWorkshop(null);
  };

  const handleDelete = (workshop: Workshop) => setConfirmDelete(workshop);
  const executeDelete = () => { if (confirmDelete) { deleteWorkshop(confirmDelete.id); setConfirmDelete(null); } };

  const columns = [
    { key: 'activityName', header: 'Atividade', render: (w: Workshop) => <p className="font-semibold text-[#1a1a1a]">{w.activityName}</p> },
    { key: 'groupId', header: 'Grupo', render: (w: Workshop) => <span className="text-xs font-semibold text-[#7b1113]">{w.groupId === 1 ? 'G1' : 'G2'}</span> },
    { key: 'days', header: 'Dias', render: (w: Workshop) => w.days },
    { key: 'startTime', header: 'Horário', render: (w: Workshop) => w.startTime },
    { key: 'vacancies', header: 'Vagas', render: (w: Workshop) => <span className="font-mono text-[#1a1a1a]">{w.vacancies}</span> },
    { key: 'professor', header: 'Professor(a)', render: (w: Workshop) => w.professor },
    { key: 'status', header: 'Status', render: (w: Workshop) => <StatusBadge status={w.status} /> },
    {
      key: 'actions',
      header: 'Ações',
      render: (w: Workshop) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-md text-[#1f4d6b] hover:bg-[#eaf2f7] transition-colors"
            onClick={() => handleEdit(w)}
            aria-label={`Editar ${w.activityName}`}
          >
            <Edit className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-md text-[#a61b1b] hover:bg-[#fbeaea] transition-colors"
            onClick={() => handleDelete(w)}
            aria-label={`Excluir ${w.activityName}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">Gerenciar Turmas</h1>
          <p className="mt-1 text-sm text-[#595959]">Cadastre e edite turmas, horários, vagas e professores</p>
        </div>
        <Button onClick={handleOpenCreate} leftIcon={<Plus className="h-4 w-4" />}>Nova Turma</Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-4 bg-[#fafafa] border border-[#d8d8d8] rounded-lg p-4">
        <Input
          label="Buscar"
          placeholder="Atividade ou professor"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          label="Grupo"
          value={groupFilter}
          onChange={(e) => { setGroupFilter(e.target.value as any); setActivityFilter(''); }}
          options={[{ value: 'all', label: 'Todos' }, { value: '1', label: 'Grupo 1' }, { value: '2', label: 'Grupo 2' }]}
          className="sm:max-w-xs"
        />
        <Select
          label="Atividade"
          value={activityFilter}
          onChange={(e) => setActivityFilter(e.target.value)}
          options={[{ value: '', label: 'Todas' }, ...activitiesForGroup.map((a) => ({ value: a.id, label: a.name }))]}
          disabled={groupFilter === 'all'}
          className="sm:max-w-xs"
        />
        <Select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          options={[{ value: 'all', label: 'Todos' }, { value: 'ativa', label: 'Ativa' }, { value: 'inativa', label: 'Inativa' }]}
          className="sm:max-w-xs"
        />
        <p className="text-sm text-[#595959]">
          Mostrando <strong>{filtered.length}</strong> de <strong>{workshops.length}</strong> turmas
        </p>
      </div>

      <div className="border border-[#d8d8d8] rounded-lg overflow-hidden bg-white">
        <Table columns={columns} data={filtered} keyExtractor={(w) => w.id} emptyMessage="Nenhuma turma encontrada" />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingWorkshop ? 'Editar Turma' : 'Nova Turma'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Grupo"
              value={formData.groupId}
              onChange={(e) => setFormData({ ...formData, groupId: Number(e.target.value) as 1 | 2, activityId: '', activityName: '' })}
              options={[{ value: '1', label: 'Grupo 1 — Físicas' }, { value: '2', label: 'Grupo 2 — Socioeducativas' }]}
            />
            <Select
              label="Atividade"
              value={formData.activityId}
              onChange={(e) => {
                const activity = activitiesForGroup.find((a) => a.id === e.target.value);
                setFormData({ ...formData, activityId: e.target.value, activityName: activity?.name || '' });
              }}
              options={[{ value: '', label: 'Selecione' }, ...activitiesForGroup.map((a) => ({ value: a.id, label: a.name }))]}
              disabled={!formData.groupId}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Dias da semana" value={formData.days} onChange={(e) => setFormData({ ...formData, days: e.target.value })} />
            <Input label="Horário de início" type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Vagas" type="number" min="1" max="100" value={formData.vacancies} onChange={(e) => setFormData({ ...formData, vacancies: Number(e.target.value) })} />
            <Input label="Professor(a)" value={formData.professor} onChange={(e) => setFormData({ ...formData, professor: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e5e5]">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingWorkshop ? 'Salvar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={executeDelete}
        title="Excluir turma"
        message={`Tem certeza que deseja excluir a turma "${confirmDelete?.activityName}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        variant="danger"
      />
    </div>
  );
}