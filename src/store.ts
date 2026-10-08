import type { Registration, Workshop, DrawResult, EmailConfirmation } from './types';
import { INITIAL_WORKSHOPS } from './data/workshops';
import { MOCK_REGISTRATIONS } from './data/registrations.mock';

interface StoreState {
  registrations: Registration[];
  workshops: Workshop[];
  drawResults: Map<1 | 2, DrawResult>;
  emailOutbox: EmailConfirmation[];
}

function createInitialState(): StoreState {
  return {
    registrations: [...MOCK_REGISTRATIONS],
    workshops: [...INITIAL_WORKSHOPS],
    drawResults: new Map(),
    emailOutbox: [],
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