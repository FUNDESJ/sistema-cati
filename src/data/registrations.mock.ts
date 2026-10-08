import type { Registration } from '../types';
import { getWorkshopsByGroup } from './workshops';

function computeCheckDigit(base: number[]): number {
  const weightStart = base.length + 1;
  let sum = 0;
  for (let i = 0; i < base.length; i++) {
    sum += base[i] * (weightStart - i);
  }
  const remainder = (sum * 10) % 11;
  return remainder === 10 ? 0 : remainder;
}

export function makeCpf(base9: string): string {
  const digits = base9.split('').map(Number);
  const d1 = computeCheckDigit(digits);
  const d2 = computeCheckDigit([...digits, d1]);
  return `${base9}${d1}${d2}`;
}

const NAMES = [
  'Alzira Fernandes', 'Beatriz Souza', 'Caetano Almeida', 'Dalva Pereira',
  'Eduardo Bastos', 'Fátima Cardoso', 'Geraldo Pinto', 'Hilda Moraes',
  'Ivan Correia', 'Joana Bezerra', 'Kleber Amorim', 'Lúcia Teixeira',
  'Marlene Vieira', 'Nelson Barros', 'Olívia Ramos', 'Paulo César Lopes',
  'Quitéria Araújo', 'Roberto Campos', 'Sônia Marques', 'Tarcísio Neves',
  'Ursulina Prado', 'Válter Machado', 'Zilda Antunes', 'Antônio Freitas',
  'Bernadete Coelho', 'Cleonice Rodrigues', 'Dorival Sampaio', 'Elza Chaves',
  'Francisco Bueno', 'Gilda Rezende', 'Horácio Pinheiro', 'Isaura Melo',
  'Joaquim Furtado', 'Lourdes Aguiar', 'Milton Carvalho', 'Neusa Gomes',
  'Osvaldo Dias', 'Petronilha Silva', 'Raimundo Nogueira', 'Sebastiana Rocha',
  'Therezinha Paiva', 'Ubirajara Costa', 'Vanda Peixoto', 'Waldir Braga',
  'Yolanda Tavares', 'Zulmira Abreu', 'Alfredo Siqueira', 'Bertha Menezes',
  'César Augusto Reis', 'Diana Loureiro', 'Emílio Guerra', 'Flora Bernardes',
  'Gilberto Tavares Melo', 'Heloísa Sarmento', 'Ítalo Bianchi', 'Jandira Moreno',
  'Kátia Cilene Duarte', 'Luiz Gonzaga Matos', 'Maria Aparecida Cruz',
  'Nadir Fontes', 'Ondina Beltrão', 'Pedro Henrique Sales', 'Quirino Assis',
  'Rosângela Pires', 'Salvador Lombardi', 'Teresa Cristina Lemos',
  'Ulisses Guimarães Neto', 'Valentina Rossi', 'Wanderley Pires Filho',
  'Xenia Albuquerque', 'Zenóbia Falcão', 'Ademar Vieira Neto',
];

function birthDateFor(age: number, month: number, day: number): string {
  const year = month === 1 && day <= 5 ? 2027 - age : 2026 - age;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildBase(age: number, index: number): string {
  const year = 27 + (100 - age);
  return `${String(year).padStart(2, '0')}${String(index).padStart(3, '0')}${String((index * 37) % 100).padStart(2, '0')}0${index % 2}`;
}

const workshopsG1 = getWorkshopsByGroup(1);
const workshopsG2 = getWorkshopsByGroup(2);

export function buildMockRegistrations(): Registration[] {
  const registrations: Registration[] = [];
  let sequence = 0;

  const push = (
    name: string,
    cpf: string,
    birthDate: string,
    group1WorkshopId: string | null,
    group2WorkshopId: string | null,
    status: Registration['status'],
    day: number,
    hour: number,
  ) => {
    sequence += 1;
    registrations.push({
      id: `insc-${String(sequence).padStart(4, '0')}`,
      participant: {
        name,
        cpf,
        birthDate,
      },
      group1WorkshopId,
      group2WorkshopId,
      status,
      createdAt: `2027-01-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:30:00.000Z`,
      homologatedAt: status === 'homologada' ? `2027-01-${String(day + 2).padStart(2, '0')}T14:00:00.000Z` : null,
    });
  };

  NAMES.forEach((name, index) => {
    const i = index + 1;
    let age = 60 + ((i * 7) % 30);
    if (i % 11 === 0) age = 80 + (i % 7);
    const birthDate = birthDateFor(age, ((i * 5) % 12) + 1, ((i * 3) % 27) + 1);
    const cpf = makeCpf(buildBase(age, i));

    let group1WorkshopId: string | null = workshopsG1[i % workshopsG1.length]?.id ?? null;
    let group2WorkshopId: string | null = workshopsG2[i % workshopsG2.length]?.id ?? null;
    if (i % 13 === 0) group1WorkshopId = null;
    if (i % 17 === 0) group2WorkshopId = null;

    let status: Registration['status'] = 'homologada';
    if (i % 9 === 0) status = 'pendente';
    if (i % 21 === 0) status = 'nao_homologada';

    push(name, cpf, birthDate, group1WorkshopId, group2WorkshopId, status, 1 + (i % 5), 8 + (i % 10));
  });

  const duplicateSource = registrations[0];
  const dupWorkshopG1 = workshopsG1.find((w) => w.activityId === 'pilates-solo')?.id ?? null;
  const dupWorkshopG2 = workshopsG2.find((w) => w.activityId === 'canto')?.id ?? null;
  push(
    duplicateSource.participant.name,
    duplicateSource.participant.cpf,
    duplicateSource.participant.birthDate,
    dupWorkshopG1,
    dupWorkshopG2,
    'homologada',
    6,
    19,
  );

  const secondDuplicate = registrations[10];
  const secondWorkshopG1 = workshopsG1.find((w) => w.activityId === 'ginastica')?.id ?? null;
  push(
    secondDuplicate.participant.name,
    secondDuplicate.participant.cpf,
    secondDuplicate.participant.birthDate,
    secondWorkshopG1,
    null,
    'pendente',
    6,
    20,
  );

  return registrations;
}

export const MOCK_REGISTRATIONS = buildMockRegistrations();