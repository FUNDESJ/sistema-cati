import { describe, expect, it } from 'vitest';
import type { Registration } from '../types';
import { findRegistrationByCpf, isDuplicatedCpf, resolveDuplications } from './registration';

function makeRegistration(overrides: Partial<Registration>): Registration {
  return {
    id: 'r1',
    participant: {
      name: 'Participante Teste',
      cpf: '52998224725',
      birthDate: '1950-03-10',
    },
    group1WorkshopId: 't001',
    group2WorkshopId: 't002',
    status: 'homologada',
    createdAt: '2027-01-03T10:00:00.000Z',
    homologatedAt: null,
    ...overrides,
  };
}

describe('resolveDuplications', () => {
  it('a inscrição mais recente prevalece', () => {
    const older = makeRegistration({ id: 'antiga', createdAt: '2027-01-02T10:00:00.000Z' });
    const newer = makeRegistration({ id: 'recente', createdAt: '2027-01-04T10:00:00.000Z' });

    const { active, superseded } = resolveDuplications([older, newer]);

    expect(active).toHaveLength(1);
    expect(active[0].id).toBe('recente');
    expect(superseded.map((r) => r.id)).toEqual(['antiga']);
  });

  it('ordenação independente da ordem do array', () => {
    const older = makeRegistration({ id: 'antiga', createdAt: '2027-01-02T10:00:00.000Z' });
    const newer = makeRegistration({ id: 'recente', createdAt: '2027-01-04T10:00:00.000Z' });

    const { active } = resolveDuplications([newer, older]);

    expect(active).toHaveLength(1);
    expect(active[0].id).toBe('recente');
  });

  it('mantém inscrições de CPFs distintos', () => {
    const a = makeRegistration({ id: 'a' });
    const b = makeRegistration({
      id: 'b',
      participant: { ...makeRegistration({}).participant, cpf: '16899535009' },
    });

    const { active, superseded } = resolveDuplications([a, b]);

    expect(active).toHaveLength(2);
    expect(superseded).toHaveLength(0);
  });

  it('ignora inscrições já marcadas como duplicada', () => {
    const marked = makeRegistration({ id: 'marcada', status: 'duplicada' });
    const current = makeRegistration({ id: 'atual' });

    const { active, superseded } = resolveDuplications([marked, current]);

    expect(active.map((r) => r.id)).toEqual(['atual']);
    expect(superseded.map((r) => r.id)).toEqual(['marcada']);
  });
});

describe('isDuplicatedCpf', () => {
  it('detecta CPF duplicado', () => {
    const existing = makeRegistration({ id: 'r1' });
    expect(isDuplicatedCpf([existing], '52998224725')).toBe(true);
    expect(isDuplicatedCpf([existing], '529.982.247-25')).toBe(true);
  });

  it('ignora a própria inscrição ao editar', () => {
    const existing = makeRegistration({ id: 'r1' });
    expect(isDuplicatedCpf([existing], '52998224725', 'r1')).toBe(false);
  });

  it('não considera inscrições duplicadas', () => {
    const marked = makeRegistration({ id: 'r1', status: 'duplicada' });
    expect(isDuplicatedCpf([marked], '52998224725')).toBe(false);
  });
});

describe('findRegistrationByCpf', () => {
  it('encontra a inscrição ativa mais recente', () => {
    const older = makeRegistration({ id: 'antiga', createdAt: '2027-01-02T10:00:00.000Z' });
    const newer = makeRegistration({ id: 'recente', createdAt: '2027-01-04T10:00:00.000Z' });

    const found = findRegistrationByCpf([older, newer], '52998224725');

    expect(found?.id).toBe('recente');
  });
});