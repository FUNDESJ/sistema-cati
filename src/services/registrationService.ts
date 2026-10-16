import type { Registration } from '../types';
import {
  getState,
  subscribe,
  setRegistrations,
  updateRegistration,
  setStats,
  type RegistrationStats,
} from '../store';
import { apiGet, apiPost, apiPatch, ApiError } from './api';

export interface CreateRegistrationInput {
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
  neighborhood: string;
  group1WorkshopId: string | null;
  group2WorkshopId: string | null;
}

export interface RegistrationResult {
  success: boolean;
  registration?: Registration;
  errors: Record<string, string>;
}

const EMPTY_STATS: RegistrationStats = {
  total: 0,
  homologadas: 0,
  pendentes: 0,
  naoHomologadas: 0,
  duplicadas: 0,
  group1: 0,
  group2: 0,
  bothGroups: 0,
};

/**
 * Cria a inscrição no servidor. O servidor valida tudo (idade, CPF, celular,
 * bairro, turmas) e devolve os erros por campo no formato
 * `{ success: false, errors: { campo: mensagem } }` — mesmo contrato de antes.
 * CPF duplicado: a inscrição mais recente prevalece (regra do edital).
 */
export async function createRegistration(
  input: CreateRegistrationInput,
): Promise<RegistrationResult> {
  try {
    const response = await apiPost<{ success: boolean; registration: Registration }>(
      '/registrations',
      input,
    );
    return { success: true, registration: response.registration, errors: {} };
  } catch (error) {
    if (error instanceof ApiError && error.fields) {
      return { success: false, errors: error.fields };
    }
    return {
      success: false,
      errors: {
        _: error instanceof ApiError
          ? error.message
          : 'Não foi possível concluir a inscrição. Verifique os dados e tente novamente.',
      },
    };
  }
}

/** Busca a lista administrativa (exclui duplicadas; já ordenada por data). */
export async function refreshRegistrations(): Promise<void> {
  const registrations = await apiGet<Registration[]>('/admin/registrations', true);
  setRegistrations(registrations);
}

export function listRegistrations(): Registration[] {
  return [...getState().registrations].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listAllRegistrations(): Registration[] {
  return getState().registrations;
}

export function getRegistrationById(id: string): Registration | undefined {
  return getState().registrations.find((r) => r.id === id);
}

export async function homologateRegistration(
  id: string,
  decision: 'homologada' | 'nao_homologada',
): Promise<Registration> {
  const updated = await apiPatch<Registration>(
    `/admin/registrations/${id}/homologation`,
    { decision },
    true,
  );
  updateRegistration(id, updated);
  void refreshStats().catch(() => undefined);
  return updated;
}

export async function refreshStats(): Promise<void> {
  const stats = await apiGet<RegistrationStats>('/admin/registrations/stats', true);
  setStats(stats);
}

/** Estatísticas em cache (zeros até a primeira carga). */
export function getRegistrationStats(): RegistrationStats {
  return getState().stats ?? EMPTY_STATS;
}

export function subscribeToRegistrations(listener: () => void): () => void {
  return subscribe(listener);
}
