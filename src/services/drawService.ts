import type { DrawResult } from '../types';
import { getState, setDrawResult, subscribe, deleteDrawResult } from '../store';
import { runDrawForGroup, Rng } from '../domain/draw';

let drawInProgress = false;

export function isDrawInProgress(): boolean {
  return drawInProgress;
}

export function performDraw(groupId: 1 | 2, rng: Rng = Math.random): DrawResult {
  if (drawInProgress) {
    throw new Error('Sorteio já em andamento');
  }

  drawInProgress = true;
  try {
    const state = getState();
    const result = runDrawForGroup(state.registrations, state.workshops, groupId, rng, new Date());
    setDrawResult(groupId, result);
    return result;
  } finally {
    drawInProgress = false;
  }
}

export function getDrawResult(groupId: 1 | 2): DrawResult | undefined {
  return getState().drawResults.get(groupId);
}

export function hasDrawResult(groupId: 1 | 2): boolean {
  return getState().drawResults.has(groupId);
}

export function clearDrawResult(groupId: 1 | 2): void {
  deleteDrawResult(groupId);
}

export function subscribeToDraws(listener: () => void) {
  return subscribe(listener);
}