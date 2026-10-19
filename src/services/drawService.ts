import type { DrawResult } from '../types';
import { deleteDrawResult, getState, setDrawResult, subscribe } from '../store';
import { apiDelete, apiGet, apiPost, ApiError } from './api';

type DrawFetchState =
  | { state: 'found'; result: DrawResult }
  | { state: 'empty' }
  | { state: 'error' };

async function fetchDraw(groupId: 1 | 2): Promise<DrawFetchState> {
  try {
    const result = await apiGet<DrawResult>(`/admin/draws/group/${groupId}`, true);
    return { state: 'found', result };
  } catch (error) {
    // 404 = não existe sorteio vigente para o grupo (estado legítimo).
    if (error instanceof ApiError && error.status === 404) {
      return { state: 'empty' };
    }
    // Qualquer outro erro (rede, 401, 500...) NÃO apaga o cache local:
    // preservar um resultado conhecido é mais seguro do que limpar.
    console.error(`[drawService] falha ao consultar sorteio do grupo ${groupId}:`, error);
    return { state: 'error' };
  }
}

/**
 * Atualiza o cache com o resultado vigente de cada grupo.
 * - 404 → remove do cache (não há sorteio vigente no servidor);
 * - erro de rede/servidor → preserva o cache local (fail-safe);
 * - 200 → substitui pelo resultado do servidor (fonte de verdade).
 */
export async function refreshDrawResults(): Promise<void> {
  const [draw1, draw2] = await Promise.all([fetchDraw(1), fetchDraw(2)]);

  const draws: Record<1 | 2, DrawFetchState> = { 1: draw1, 2: draw2 };
  for (const groupId of [1, 2] as const) {
    const draw = draws[groupId];
    if (draw.state === 'found') {
      setDrawResult(groupId, draw.result);
    } else if (draw.state === 'empty') {
      deleteDrawResult(groupId);
    }
    // 'error': mantém o estado local intacto.
  }
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