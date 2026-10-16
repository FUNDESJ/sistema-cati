import type { Workshop } from '../types';
import {
  getState,
  subscribe,
  setWorkshops,
  addWorkshop,
  updateWorkshop,
  removeWorkshop,
} from '../store';
import { apiGet, apiPost, apiPatch, apiDelete } from './api';

export interface CreateWorkshopInput {
  activityId: string;
  activityName: string;
  groupId: 1 | 2;
  days: string;
  startTime: string;
  vacancies: number;
  professor: string;
}

// ---------- Leituras síncronas (cache do store) ----------
function sortWorkshops(workshops: Workshop[]): Workshop[] {
  return [...workshops].sort((a, b) => {
    if (a.groupId !== b.groupId) return a.groupId - b.groupId;
    if (a.activityId !== b.activityId) return a.activityId.localeCompare(b.activityId);
    return a.startTime.localeCompare(b.startTime);
  });
}

export function listWorkshops(): Workshop[] {
  return sortWorkshops(getState().workshops);
}

/** Turmas ativas de um grupo (visão pública — nunca expõe inativas). */
export function listWorkshopsByGroup(groupId: 1 | 2): Workshop[] {
  return listWorkshops().filter((w) => w.groupId === groupId && w.status === 'ativa');
}

/** Turmas ativas de uma atividade (visão pública). */
export function listWorkshopsByActivity(activityId: string): Workshop[] {
  return listWorkshops().filter((w) => w.activityId === activityId && w.status === 'ativa');
}

export function getWorkshopById(id: string): Workshop | undefined {
  return getState().workshops.find((w) => w.id === id);
}

export function subscribeToWorkshops(listener: () => void): () => void {
  return subscribe(listener);
}

// ---------- Leituras no servidor ----------

/**
 * Turmas ativas do endpoint público. Busca apenas quando o cache está vazio
 * (a tela pública carrega uma vez por sessão do SPA).
 */
export async function refreshPublicWorkshops(): Promise<void> {
  if (getState().workshops.length > 0) {
    return;
  }
  const workshops = await apiGet<Workshop[]>('/workshops');
  setWorkshops(sortWorkshops(workshops));
}

/** Todas as turmas (inclusive inativas) — contexto administrativo. */
export async function refreshAdminWorkshops(): Promise<void> {
  const workshops = await apiGet<Workshop[]>('/admin/workshops', true);
  setWorkshops(workshops);
}

// ---------- Mutações (servidor + cache) ----------

export async function createWorkshop(input: CreateWorkshopInput): Promise<Workshop> {
  const workshop = await apiPost<Workshop>('/admin/workshops', input, true);
  addWorkshop(workshop);
  return workshop;
}

export async function updateWorkshopDetails(
  id: string,
  updates: Partial<Workshop>,
): Promise<Workshop> {
  const payload: Record<string, unknown> = {};
  if (updates.activityId !== undefined) payload.activityId = updates.activityId;
  if (updates.days !== undefined) payload.days = updates.days;
  if (updates.startTime !== undefined) payload.startTime = updates.startTime;
  if (updates.vacancies !== undefined) payload.vacancies = updates.vacancies;
  if (updates.professor !== undefined) payload.professor = updates.professor;

  const workshop = await apiPatch<Workshop>(`/admin/workshops/${id}`, payload, true);
  updateWorkshop(id, workshop);
  return workshop;
}

export async function updateWorkshopStatus(
  id: string,
  status: 'ativa' | 'inativa',
): Promise<Workshop> {
  const workshop = await apiPatch<Workshop>(`/admin/workshops/${id}/status`, { status }, true);
  updateWorkshop(id, workshop);
  return workshop;
}

export async function deleteWorkshop(id: string): Promise<void> {
  await apiDelete(`/admin/workshops/${id}`, true);
  removeWorkshop(id);
}
