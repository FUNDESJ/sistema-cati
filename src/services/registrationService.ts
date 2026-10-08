import type { Registration, Workshop } from '../types';
import { getState, addRegistration, updateRegistration, subscribe } from '../store';
import { isDuplicatedCpf, resolveDuplications } from '../domain/registration';
import { ageAtReferenceDate } from '../domain/age';
import { isValidCpf, normalizeCpf } from '../domain/cpf';

function generateId(): string {
  return `insc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface CreateRegistrationInput {
  name: string;
  cpf: string;
  birthDate: string;
  group1WorkshopId: string | null;
  group2WorkshopId: string | null;
}

export interface RegistrationResult {
  success: boolean;
  registration?: Registration;
  errors: Record<string, string>;
}

export function validateRegistrationInput(
  input: CreateRegistrationInput,
  workshops: Workshop[],
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.name.trim()) {
    errors.name = 'Nome é obrigatório';
  }

  const normalizedCpf = normalizeCpf(input.cpf);
  if (!normalizedCpf) {
    errors.cpf = 'CPF é obrigatório';
  } else if (!isValidCpf(normalizedCpf)) {
    errors.cpf = 'CPF inválido';
  }

  const age = ageAtReferenceDate(input.birthDate);
  if (age === null) {
    errors.birthDate = 'Data de nascimento inválida';
  } else if (age < 60) {
    errors.birthDate = 'É necessário ter 60 anos ou mais até 05/01/2027';
  }

  if (input.group1WorkshopId) {
    const workshop = workshops.find((w) => w.id === input.group1WorkshopId);
    if (!workshop) {
      errors.group1WorkshopId = 'Turma inválida';
    } else if (workshop.status !== 'ativa') {
      errors.group1WorkshopId = 'Esta turma não está disponível';
    }
  }

  if (input.group2WorkshopId) {
    const workshop = workshops.find((w) => w.id === input.group2WorkshopId);
    if (!workshop) {
      errors.group2WorkshopId = 'Turma inválida';
    } else if (workshop.status !== 'ativa') {
      errors.group2WorkshopId = 'Esta turma não está disponível';
    }
  }

  if (!input.group1WorkshopId && !input.group2WorkshopId) {
    errors.groups = 'Selecione pelo menos uma turma (Grupo 1 ou Grupo 2)';
  }

  return errors;
}

export function createRegistration(
  input: CreateRegistrationInput,
  workshops: Workshop[],
): RegistrationResult {
  const validationErrors = validateRegistrationInput(input, workshops);
  if (Object.keys(validationErrors).length > 0) {
    return { success: false, errors: validationErrors };
  }

  const { registrations } = getState();

  if (isDuplicatedCpf(registrations, input.cpf)) {
    return { success: false, errors: { cpf: 'Já existe uma inscrição para este CPF. A mais recente prevalecerá.' } };
  }

  const registration: Registration = {
    id: generateId(),
    participant: {
      name: input.name.trim(),
      cpf: normalizeCpf(input.cpf),
      birthDate: input.birthDate,
    },
    group1WorkshopId: input.group1WorkshopId,
    group2WorkshopId: input.group2WorkshopId,
    status: 'pendente',
    createdAt: new Date().toISOString(),
    homologatedAt: null,
  };

  addRegistration(registration);

  const { active } = resolveDuplications([...registrations, registration]);
  const previous = active.find(
    (r) => r.id !== registration.id && normalizeCpf(r.participant.cpf) === registration.participant.cpf,
  );
  if (previous) {
    updateRegistration(previous.id, { status: 'duplicada' });
  }

  return { success: true, registration, errors: {} };
}

export function listRegistrations(): Registration[] {
  const { registrations } = getState();
  const { active } = resolveDuplications(registrations);
  return [...active].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listAllRegistrations(): Registration[] {
  return getState().registrations;
}

export function getRegistrationById(id: string): Registration | undefined {
  return getState().registrations.find((r) => r.id === id);
}

export function homologateRegistration(id: string, decision: 'homologada' | 'nao_homologada'): boolean {
  const registration = getState().registrations.find((r) => r.id === id);
  if (!registration) return false;

  updateRegistration(id, {
    status: decision,
    homologatedAt: new Date().toISOString(),
  });

  return true;
}

export function getRegistrationStats() {
  const { registrations } = getState();
  const { active } = resolveDuplications(registrations);

  const total = active.length;
  const homologadas = active.filter((r) => r.status === 'homologada').length;
  const pendentes = active.filter((r) => r.status === 'pendente').length;
  const naoHomologadas = active.filter((r) => r.status === 'nao_homologada').length;
  const duplicadas = registrations.filter((r) => r.status === 'duplicada').length;

  const group1 = active.filter((r) => r.group1WorkshopId).length;
  const group2 = active.filter((r) => r.group2WorkshopId).length;
  const bothGroups = active.filter((r) => r.group1WorkshopId && r.group2WorkshopId).length;

  return { total, homologadas, pendentes, naoHomologadas, duplicadas, group1, group2, bothGroups };
}

export function getEmailOutbox() {
  return getState().emailOutbox;
}

export function subscribeToRegistrations(listener: () => void) {
  return subscribe(listener);
}