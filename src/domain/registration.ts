import type { Registration } from '../types';
import { normalizeCpf } from './cpf';

export interface DuplicationResolution {
  active: Registration[];
  superseded: Registration[];
}

export function resolveDuplications(registrations: Registration[]): DuplicationResolution {
  const byCpf = new Map<string, Registration>();

  const sorted = [...registrations].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );

  for (const registration of sorted) {
    if (registration.status === 'duplicada') continue;
    const key = normalizeCpf(registration.participant.cpf);
    byCpf.set(key, registration);
  }

  const active: Registration[] = [];
  const superseded: Registration[] = [];

  for (const registration of registrations) {
    if (registration.status === 'duplicada') {
      superseded.push(registration);
      continue;
    }
    const key = normalizeCpf(registration.participant.cpf);
    if (byCpf.get(key)?.id === registration.id) {
      active.push(registration);
    } else {
      superseded.push(registration);
    }
  }

  return { active, superseded };
}

export function isDuplicatedCpf(
  registrations: Registration[],
  cpf: string,
  ignoreRegistrationId?: string,
): boolean {
  const key = normalizeCpf(cpf);
  return registrations.some(
    (registration) =>
      registration.id !== ignoreRegistrationId &&
      registration.status !== 'duplicada' &&
      normalizeCpf(registration.participant.cpf) === key,
  );
}

export function findRegistrationByCpf(
  registrations: Registration[],
  cpf: string,
): Registration | undefined {
  const key = normalizeCpf(cpf);
  const { active } = resolveDuplications(registrations);
  return active.find(
    (registration) => normalizeCpf(registration.participant.cpf) === key,
  );
}
