import { describe, expect, it } from 'vitest';
import type { Registration, Workshop } from '../types';
import { getEligibleRegistrations, runDrawForGroup, shuffle } from './draw';

function seededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

function makeValidCpf(index: number): string {
  const base = `52998224${String(index).padStart(2, '0')}`;
  const digits = base.split('').map(Number);
  const d1 = (digits.reduce((s, d, i) => s + d * (10 - i), 0) * 10) % 11;
  const d1v = d1 === 10 ? 0 : d1;
  const d2 = ([...digits, d1v].reduce((s, d, i) => s + d * (11 - i), 0) * 10) % 11;
  const d2v = d2 === 10 ? 0 : d2;
  return `${base}${d1v}${d2v}`;
}

let cpfCounter = 0;

const baseParticipant = {
  name: 'Participante',
  cpf: '52998224725',
  birthDate: '1950-01-01',
};

function makeRegistration(overrides: Partial<Registration>): Registration {
  cpfCounter += 1;
  return {
    id: 'r1',
    participant: {
      ...baseParticipant,
      cpf: makeValidCpf(cpfCounter),
    },
    group1WorkshopId: 't001',
    group2WorkshopId: null,
    status: 'homologada',
    createdAt: '2027-01-03T10:00:00.000Z',
    homologatedAt: null,
    ...overrides,
  };
}

function makeWorkshop(overrides: Partial<Workshop>): Workshop {
  return {
    id: 't001',
    activityId: 'ginastica',
    activityName: 'Ginástica',
    groupId: 1,
    days: 'Segundas e Quartas',
    startTime: '08:00',
    vacancies: 2,
    professor: 'Prof. Teste',
    status: 'ativa',
    ...overrides,
  };
}

describe('shuffle', () => {
  it('mantém todos os elementos', () => {
    const items = [1, 2, 3, 4, 5];
    const result = shuffle(items, seededRng(42));
    expect([...result].sort()).toEqual(items);
  });

  it('não altera o array original', () => {
    const items = [1, 2, 3];
    shuffle(items, seededRng(42));
    expect(items).toEqual([1, 2, 3]);
  });
});

describe('getEligibleRegistrations', () => {
  it('somente homologadas com escolha no grupo e idade 60+', () => {
    const registrations = [
      makeRegistration({ id: 'homologada' }),
      makeRegistration({ id: 'pendente', status: 'pendente' }),
      makeRegistration({ id: 'nao-homologada', status: 'nao_homologada' }),
      makeRegistration({ id: 'sem-escolha', group1WorkshopId: null }),
      makeRegistration({ id: 'menor-idade', participant: { ...makeRegistration({}).participant, birthDate: '1970-01-01' } }),
    ];

    const { eligible, issues } = getEligibleRegistrations(registrations, 1);

    expect(eligible.map((r) => r.id)).toEqual(['homologada']);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toEqual({
      registrationId: 'menor-idade',
      reason: 'idade_insuficiente',
    });
  });

  it('respeita a separação entre grupos', () => {
    const onlyGroup1 = makeRegistration({ id: 'g1', group1WorkshopId: 't001', group2WorkshopId: null });
    const onlyGroup2 = makeRegistration({ id: 'g2', group1WorkshopId: null, group2WorkshopId: 't002' });

    const result1 = getEligibleRegistrations([onlyGroup1, onlyGroup2], 1);
    const result2 = getEligibleRegistrations([onlyGroup1, onlyGroup2], 2);

    expect(result1.eligible.map((r) => r.id)).toEqual(['g1']);
    expect(result2.eligible.map((r) => r.id)).toEqual(['g2']);
  });

  it('inscrição duplicada: apenas a mais recente participa', () => {
    const sharedCpf = makeValidCpf(999);
    const older = makeRegistration({ id: 'antiga', createdAt: '2027-01-02T10:00:00.000Z', participant: { ...baseParticipant, cpf: sharedCpf } });
    const newer = makeRegistration({ id: 'recente', createdAt: '2027-01-04T10:00:00.000Z', participant: { ...baseParticipant, cpf: sharedCpf } });

    const { eligible } = getEligibleRegistrations([older, newer], 1);

    expect(eligible.map((r) => r.id)).toEqual(['recente']);
  });
});

describe('runDrawForGroup', () => {
  it('respeita a capacidade das turmas', () => {
    const candidates = Array.from({ length: 5 }, (_, i) =>
      makeRegistration({ id: `r${i + 1}` }),
    );
    const workshop = makeWorkshop({ vacancies: 2 });

    const result = runDrawForGroup(candidates, [workshop], 1, seededRng(7));

    expect(result.workshops).toHaveLength(1);
    expect(result.workshops[0].classified).toHaveLength(2);
    expect(result.workshops[0].waitingList).toHaveLength(3);
    expect(result.totalClassified).toBe(2);
    expect(result.totalWaiting).toBe(3);
  });

  it('prioriza 80+ dentro da turma', () => {
    const regular = Array.from({ length: 3 }, (_, i) =>
      makeRegistration({ id: `regular-${i + 1}`, participant: { ...makeRegistration({}).participant, birthDate: '1955-01-01', name: `Regular ${i + 1}` } }),
    );
    const priority = makeRegistration({
      id: 'p80',
      participant: { ...makeRegistration({}).participant, birthDate: '1940-01-01', name: 'Prioritária 80+' },
    });

    const workshop = makeWorkshop({ vacancies: 1 });

    const result = runDrawForGroup([...regular, priority], [workshop], 1, seededRng(7));

    expect(result.workshops[0].classified[0].participantName).toBe('Prioritária 80+');
    expect(result.workshops[0].classified[0].isPriority80).toBe(true);
  });

  it('gera classificação independente por grupo', () => {
    const g1 = makeRegistration({ id: 'g1' });
    const g2 = makeRegistration({ id: 'g2', group1WorkshopId: null, group2WorkshopId: 't002' });

    const workshops = [
      makeWorkshop({ id: 't001', activityId: 'ginastica', activityName: 'Ginástica', groupId: 1 }),
      makeWorkshop({ id: 't002', activityId: 'teatro', activityName: 'Teatro', groupId: 2, vacancies: 5 }),
    ];

    const result1 = runDrawForGroup([g1, g2], workshops, 1, seededRng(7));
    const result2 = runDrawForGroup([g1, g2], workshops, 2, seededRng(7));

    expect(Object.keys(result1.groupClassification)).toEqual(['g1']);
    expect(Object.keys(result2.groupClassification)).toEqual(['g2']);
    expect(result1.workshops.every((w) => w.activityName === 'Ginástica')).toBe(true);
    expect(result2.workshops.every((w) => w.activityName === 'Teatro')).toBe(true);
  });

  it('não mistura participantes do Grupo 1 e Grupo 2', () => {
    const g1 = makeRegistration({ id: 'g1' });
    const g2 = makeRegistration({ id: 'g2', group1WorkshopId: null, group2WorkshopId: 't002' });

    const workshops = [
      makeWorkshop({ id: 't001', activityId: 'ginastica', groupId: 1, vacancies: 5 }),
      makeWorkshop({ id: 't002', activityId: 'teatro', groupId: 2, vacancies: 5 }),
    ];

    const result1 = runDrawForGroup([g1, g2], workshops, 1, seededRng(7));

    expect(result1.workshops).toHaveLength(1);
    expect(result1.workshops[0].classified).toHaveLength(1);
    expect(result1.workshops[0].classified[0].participantName).toBe('Participante');
  });

  it('processa múltiplas turmas na mesma execução', () => {
    const workshops = [
      makeWorkshop({ id: 't001', vacancies: 1 }),
      makeWorkshop({ id: 't002', startTime: '09:00', vacancies: 1 }),
      makeWorkshop({ id: 't003', startTime: '10:00', vacancies: 1 }),
    ];
    const candidates = Array.from({ length: 4 }, (_, i) =>
      makeRegistration({
        id: `r${i + 1}`,
        participant: { ...makeRegistration({}).participant, cpf: makeValidCpf(i + 1), name: `P${i + 1}` },
        group1WorkshopId: workshops[i % 3].id,
      }),
    );

    const result = runDrawForGroup(candidates, workshops, 1, seededRng(7));

    expect(result.workshops).toHaveLength(3);
    expect(result.totalClassified).toBe(3);
    expect(result.totalWaiting).toBe(1);
  });

  it('turma inativa não participa do sorteio — candidatos vão para lista de espera', () => {
    const candidate = makeRegistration({ id: 'r1' });
    const inactive = makeWorkshop({ id: 't001', status: 'inativa' });

    const result = runDrawForGroup([candidate], [inactive], 1, seededRng(7));

    expect(result.workshops).toHaveLength(1);
    expect(result.workshops[0].waitingList).toHaveLength(1);
    expect(result.totalCandidates).toBe(1);
    expect(result.totalWaiting).toBe(1);
  });

  it('distribui em ordem determinística com rng semeado', () => {
    const candidates = Array.from({ length: 4 }, (_, i) =>
      makeRegistration({ id: `r${i + 1}`, participant: { ...makeRegistration({}).participant, cpf: makeValidCpf(i + 1), name: `P${i + 1}` } }),
    );
    const workshop = makeWorkshop({ vacancies: 4 });

    const result1 = runDrawForGroup(candidates, [workshop], 1, seededRng(123));
    const result2 = runDrawForGroup(candidates, [workshop], 1, seededRng(123));

    expect(result1.workshops[0].classified.map((c) => c.participantName)).toEqual(
      result2.workshops[0].classified.map((c) => c.participantName),
    );
  });

  it('sem candidatos elegíveis gera resultado com turmas vazias', () => {
    const result = runDrawForGroup([], [makeWorkshop({})], 1, seededRng(7));

    expect(result.totalCandidates).toBe(0);
    expect(result.workshops).toHaveLength(1);
    expect(result.workshops[0].classified).toHaveLength(0);
    expect(result.workshops[0].waitingList).toHaveLength(0);
    expect(result.totalClassified).toBe(0);
    expect(result.totalWaiting).toBe(0);
  });
});