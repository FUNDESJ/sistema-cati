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
  phone: '48999999999',
  neighborhood: 'Campinas',
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

describe('runDrawForGroup — prioridade 80+ (mecanismo operacional)', () => {
  const priority80 = (index: number, name?: string) =>
    makeRegistration({
      id: `p80-${index}`,
      participant: {
        ...makeRegistration({}).participant,
        birthDate: '1940-01-01', // 86 anos na referência 05/01/2027
        name: name ?? `Prioritário ${index}`,
        cpf: makeValidCpf(500 + index),
      },
    });

  const regular = (index: number, name?: string) =>
    makeRegistration({
      id: `reg-${index}`,
      participant: {
        ...makeRegistration({}).participant,
        birthDate: '1955-01-01', // 71 anos na referência
        name: name ?? `Regular ${index}`,
        cpf: makeValidCpf(700 + index),
      },
    });

  it('Estágio 1: com vagas suficientes, TODOS os 80+ são classificados antes dos demais', () => {
    const prioritized = [priority80(1), priority80(2), priority80(3)];
    const regulars = [regular(1), regular(2), regular(3), regular(4), regular(5)];
    const workshop = makeWorkshop({ vacancies: 6 });

    const result = runDrawForGroup([...prioritized, ...regulars], [workshop], 1, seededRng(11));

    const classified = result.workshops[0].classified;
    expect(classified).toHaveLength(6);
    // As 3 primeiras posições da turma são dos 80+ (precedência absoluta)
    expect(classified.slice(0, 3).every((entry) => entry.isPriority80)).toBe(true);
    // Todas as entradas 80+ marcadas
    expect(classified.filter((e) => e.isPriority80)).toHaveLength(3);
    // Nenhum 80+ em espera
    expect(result.workshops[0].waitingList.every((e) => !e.isPriority80)).toBe(true);
  });

  it('Estágio 1 com superlotação prioritária: vagas sorteadas ENTRE OS 80+; nenhum 60-79 classificado', () => {
    const prioritized = [priority80(1), priority80(2), priority80(3), priority80(4), priority80(5)];
    const regulars = [regular(1), regular(2), regular(3)];
    const workshop = makeWorkshop({ vacancies: 3 });

    const result = runDrawForGroup([...prioritized, ...regulars], [workshop], 1, seededRng(23));

    const turma = result.workshops[0];
    expect(turma.classified).toHaveLength(3);
    // TODOS os classificados são 80+ — o estágio 2 nem abre
    expect(turma.classified.every((entry) => entry.isPriority80)).toBe(true);
    // Espera: 2 prioritários no TOPO, depois os 3 regulares
    expect(turma.waitingList).toHaveLength(5);
    expect(turma.waitingList.slice(0, 2).every((entry) => entry.isPriority80)).toBe(true);
    expect(turma.waitingList.slice(2).every((entry) => !entry.isPriority80)).toBe(true);
  });

  it('Lista de espera segue a mesma precedência: 80+ no topo, na ordem do sorteio', () => {
    const prioritized = [priority80(1), priority80(2), priority80(3)];
    const regulars = [regular(1), regular(2)];
    const workshop = makeWorkshop({ vacancies: 2 });

    const result = runDrawForGroup([...prioritized, ...regulars], [workshop], 1, seededRng(37));

    const espera = result.workshops[0].waitingList;
    // 3 prioritários, 2 vagas: 2 classificam, 1 prioritário fica no TOPO da espera
    expect(result.workshops[0].classified.every((e) => e.isPriority80)).toBe(true);
    expect(espera.slice(0, 1).every((entry) => entry.isPriority80)).toBe(true);
    expect(espera.slice(1).every((entry) => !entry.isPriority80)).toBe(true);
  });

  it('Estatísticas priority refletem candidatos/classificados/espera do grupo', () => {
    const prioritized = [priority80(1), priority80(2), priority80(3), priority80(4)];
    const regulars = [regular(1), regular(2), regular(3)];
    const workshop = makeWorkshop({ vacancies: 4 });

    const result = runDrawForGroup([...prioritized, ...regulars], [workshop], 1, seededRng(41));

    // 4 vagas e 4 prioritários: Estágio 1 classifica TODOS os 80+
    // e o Estágio 2 fica sem vagas — os 3 regulares vão para a espera.
    expect(result.priority).toBeDefined();
    expect(result.priority!.candidates).toBe(4);
    expect(result.priority!.classified).toBe(4);
    expect(result.priority!.waiting).toBe(0);
    expect(result.totalClassified).toBe(4);
    expect(result.totalWaiting).toBe(3);
  });

  it('Estatísticas priority somam candidatos em espera corretamente', () => {
    const prioritized = [priority80(1), priority80(2)];
    const regulars = [regular(1), regular(2), regular(3)];
    const workshop = makeWorkshop({ vacancies: 1 });

    const result = runDrawForGroup([...prioritized, ...regulars], [workshop], 1, seededRng(53));

    // 1 vaga: 1 prioritário classifica; espera = 1 prioritário + 3 regulares
    expect(result.priority!.candidates).toBe(2);
    expect(result.priority!.classified).toBe(1);
    expect(result.priority!.waiting).toBe(1);
    expect(result.totalWaiting).toBe(4);
  });

  it('sem prioritários, estatísticas priority ficam zeradas e o sorteio prossegue normalmente', () => {
    const regulars = [regular(1), regular(2)];
    const workshop = makeWorkshop({ vacancies: 1 });

    const result = runDrawForGroup(regulars, [workshop], 1, seededRng(59));

    expect(result.priority).toEqual({ candidates: 0, classified: 0, waiting: 0 });
    expect(result.totalClassified).toBe(1);
    expect(result.totalWaiting).toBe(1);
  });

  it('prioridade NÃO redistribui candidatos entre turmas — escolha do participante é respeitada', () => {
    const prioritized = [priority80(1), priority80(2)].map((r) => ({ ...r, group1WorkshopId: 't001' }));
    const others = [regular(1)].map((r) => ({ ...r, group1WorkshopId: 't001' }));

    const workshops = [
      makeWorkshop({ id: 't001', vacancies: 1 }),
      makeWorkshop({ id: 't002', startTime: '09:00', vacancies: 25 }),
    ];

    const result = runDrawForGroup([...prioritized, ...others], workshops, 1, seededRng(67));

    const t001 = result.workshops.find((w) => w.workshopId === 't001')!;
    const t002 = result.workshops.find((w) => w.workshopId === 't002')!;

    // Ninguém foi movido: t002 segue vazia
    expect(t002.classified).toHaveLength(0);
    expect(t002.waitingList).toHaveLength(0);
    // Em t001: 1 classificado (80+) e 2 em espera (1 prioritário + 1 regular)
    expect(t001.classified.every((e) => e.isPriority80)).toBe(true);
    expect(t001.waitingList.slice(0, 1).every((e) => e.isPriority80)).toBe(true);
  });

  it('isPriority80 é derivado da idade na referência, não da ordem de chegada', () => {
    // Nasce em 05/01/1947 → completa 80 anos EXATAMENTE na data de referência
    const exactly80 = makeRegistration({
      id: 'exato-80',
      participant: {
        ...makeRegistration({}).participant,
        birthDate: '1947-01-05',
        cpf: makeValidCpf(900),
        name: 'Exatamente 80',
      },
    });
    // Nasce em 06/01/1947 → 79 anos e 364 dias na referência
    const oneDayShort = makeRegistration({
      id: 'um-dia-a-menos',
      participant: {
        ...makeRegistration({}).participant,
        birthDate: '1947-01-06',
        cpf: makeValidCpf(901),
        name: 'Um Dia a Menos',
      },
    });

    const workshop = makeWorkshop({ vacancies: 2 });
    const result = runDrawForGroup([exactly80, oneDayShort], [workshop], 1, seededRng(71));

    const classified = result.workshops[0].classified;
    expect(classified.find((e) => e.participantName === 'Exatamente 80')?.isPriority80).toBe(true);
    expect(classified.find((e) => e.participantName === 'Um Dia a Menos')?.isPriority80).toBe(false);
    expect(result.priority!.candidates).toBe(1);
  });
});