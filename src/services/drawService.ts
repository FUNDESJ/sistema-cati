import type { DrawResult } from '../types';
import { deleteDrawResult, getState, setDrawResult, subscribe } from '../store';
import { apiDelete, apiGet, apiPost, ApiError } from './api';

async function fetchDraw(groupId: 1 | 2): Promise<DrawResult | null> {
  try {
    return await apiGet<DrawResult>(`/admin/draws/group/${groupId}`, true);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Atualiza o cache com o resultado vigente de cada grupo (404 = sem sorteio).
 * Erros de rede/inesperados são registrados sem quebrar a tela.
 */
export async function refreshDrawResults(): Promise<void> {
  const [result1, result2] = await Promise.all([
    fetchDraw(1).catch((error: unknown) => {
      console.error('[drawService] falha ao consultar sorteio do grupo 1:', error);
      return null;
    }),
    fetchDraw(2).catch((error: unknown) => {
      console.error('[drawService] falha ao consultar sorteio do grupo 2:', error);
      return null;
    }),
  ]);

  if (result1) setDrawResult(1, result1);
  else deleteDrawResult(1);
  if (result2) setDrawResult(2, result2);
  else deleteDrawResult(2);
}

/** Executa o sorteio do grupo no servidor (uma ação por grupo). */
export async function performDraw(groupId: 1 | 2): Promise<DrawResult> {
  const result = await apiPost<DrawResult>(`/admin/draws/group/${groupId}`, undefined, true);
  setDrawResult(groupId, result);
  return result;
}

export function getDrawResult(groupId: 1 | 2): DrawResult | undefined {
  return getState().drawResults.get(groupId);
}

export function hasDrawResult(groupId: 1 | 2): boolean {
  return getState().drawResults.has(groupId);
}

/** Torna o resultado não vigente (histórico preservado no servidor). */
export async function clearDrawResult(groupId: 1 | 2): Promise<void> {
  await apiDelete(`/admin/draws/group/${groupId}`, true);
  deleteDrawResult(groupId);
}

export function subscribeToDraws(listener: () => void): () => void {
  return subscribe(listener);
}
