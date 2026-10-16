import type { Registration, Workshop, DrawResult, EmailConfirmation } from './types';

export interface RegistrationStats {
  total: number;
  homologadas: number;
  pendentes: number;
  naoHomologadas: number;
  duplicadas: number;
  group1: number;
  group2: number;
  bothGroups: number;
}

interface StoreState {
  registrations: Registration[];
  workshops: Workshop[];
  drawResults: Map<1 | 2, DrawResult>;
  emailOutbox: EmailConfirmation[];
  stats: RegistrationStats | null;
}

// O store é um CACHE da API — não é mais fonte de verdade.
// Os services hidratam este estado a partir do backend.
function createInitialState(): StoreState {
  return {
    registrations: [],
    workshops: [],
    drawResults: new Map(),
    emailOutbox: [],
    stats: null,
  };
}

let state = createInitialState();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function getState(): StoreState {
  return state;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setRegistrations(registrations: Registration[]) {
  state = { ...state, registrations };
  notify();
}

export function addRegistration(registration: Registration) {
  state = { ...state, registrations: [...state.registrations, registration] };
  notify();
}

export function updateRegistration(id: string, updates: Partial<Registration>) {
  state = {
    ...state,
    registrations: state.registrations.map((r) => (r.id === id ? { ...r, ...updates } : r)),
  };
  notify();
}

export function setWorkshops(workshops: Workshop[]) {
  state = { ...state, workshops };
  notify();
}

export function addWorkshop(workshop: Workshop) {
  state = { ...state, workshops: [...state.workshops, workshop] };
  notify();
}

export function updateWorkshop(id: string, updates: Partial<Workshop>) {
  state = {
    ...state,
    workshops: state.workshops.map((w) => (w.id === id ? { ...w, ...updates } : w)),
  };
  notify();
}

export function removeWorkshop(id: string) {
  state = {
    ...state,
    workshops: state.workshops.filter((w) => w.id !== id),
  };
  notify();
}

export function setDrawResult(groupId: 1 | 2, result: DrawResult) {
  const newDrawResults = new Map(state.drawResults);
  newDrawResults.set(groupId, result);
  state = { ...state, drawResults: newDrawResults };
  notify();
}

export function deleteDrawResult(groupId: 1 | 2) {
  const newDrawResults = new Map(state.drawResults);
  newDrawResults.delete(groupId);
  state = { ...state, drawResults: newDrawResults };
  notify();
}

export function getDrawResult(groupId: 1 | 2): DrawResult | undefined {
  return state.drawResults.get(groupId);
}

export function setStats(stats: RegistrationStats) {
  state = { ...state, stats };
  notify();
}

export function addEmailConfirmation(email: EmailConfirmation) {
  state = { ...state, emailOutbox: [...state.emailOutbox, email] };
  notify();
}

export function getEmailOutbox(): EmailConfirmation[] {
  return state.emailOutbox;
}

export function resetStore() {
  state = createInitialState();
  notify();
}
