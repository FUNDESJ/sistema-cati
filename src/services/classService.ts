import type { Workshop, WorkshopStatus } from '../types';
import { getState, setWorkshops, addWorkshop, updateWorkshop, subscribe } from '../store';

function generateId(): string {
  return `t${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export interface CreateWorkshopInput {
  activityId: string;
  activityName: string;
  groupId: 1 | 2;
  days: string;
  startTime: string;
  vacancies: number;
  professor: string;
}

export function validateWorkshopInput(input: CreateWorkshopInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.activityId) errors.activityId = 'Atividade é obrigatória';
  if (!input.activityName.trim()) errors.activityName = 'Nome da atividade é obrigatório';
  if (!input.groupId) errors.groupId = 'Grupo é obrigatório';
  if (!input.days.trim()) errors.days = 'Dias da semana são obrigatórios';
  if (!input.startTime) errors.startTime = 'Horário é obrigatório';
  if (!input.vacancies || input.vacancies < 1) errors.vacancies = 'Vagas deve ser maior que zero';
  if (!input.professor.trim()) errors.professor = 'Professor é obrigatório';

  return errors;
}

export function createWorkshop(input: CreateWorkshopInput): { success: boolean; workshop?: Workshop; errors: Record<string, string> } {
  const errors = validateWorkshopInput(input);
  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const workshop: Workshop = {
    id: generateId(),
    activityId: input.activityId,
    activityName: input.activityName.trim(),
    groupId: input.groupId,
    days: input.days.trim(),
    startTime: input.startTime,
    vacancies: input.vacancies,
    professor: input.professor.trim(),
    status: 'ativa',
  };

  addWorkshop(workshop);
  return { success: true, workshop, errors: {} };
}

export function listWorkshops(): Workshop[] {
  return [...getState().workshops].sort((a, b) => {
    if (a.groupId !== b.groupId) return a.groupId - b.groupId;
    if (a.activityId !== b.activityId) return a.activityId.localeCompare(b.activityId);
    return a.startTime.localeCompare(b.startTime);
  });
}

export function listWorkshopsByGroup(groupId: 1 | 2): Workshop[] {
  return listWorkshops().filter((w) => w.groupId === groupId);
}

export function listWorkshopsByActivity(activityId: string): Workshop[] {
  return listWorkshops().filter((w) => w.activityId === activityId);
}

export function getWorkshopById(id: string): Workshop | undefined {
  return getState().workshops.find((w) => w.id === id);
}

export function updateWorkshopStatus(id: string, status: WorkshopStatus): boolean {
  const workshop = getState().workshops.find((w) => w.id === id);
  if (!workshop) return false;
  updateWorkshop(id, { status });
  return true;
}

export function updateWorkshopDetails(id: string, updates: Partial<Workshop>): boolean {
  const workshop = getState().workshops.find((w) => w.id === id);
  if (!workshop) return false;
  updateWorkshop(id, updates);
  return true;
}

export function deleteWorkshop(id: string): boolean {
  const state = getState();
  const index = state.workshops.findIndex((w) => w.id === id);
  if (index === -1) return false;
  const newWorkshops = state.workshops.filter((w) => w.id !== id);
  setWorkshops(newWorkshops);
  return true;
}

export function subscribeToWorkshops(listener: () => void) {
  return subscribe(listener);
}