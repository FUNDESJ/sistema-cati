import type { Workshop } from '../types';
import { ACTIVITIES } from './activities';

const PROFESSORS = [
  'Ana Ribeiro',
  'Carlos Menezes',
  'Helena Duarte',
  'Jorge Salles',
  'Marta Fonseca',
  'Paulo Andrade',
  'Regina Castro',
  'Sérgio Ramos',
  'Tereza Lima',
  'Vera Nogueira',
];

interface WorkshopSeed {
  activityId: string;
  groupId: 1 | 2;
  slots: [days: string, startTime: string, vacancies: number][];
}

const SEEDS: WorkshopSeed[] = [
  {
    activityId: 'danca-salao',
    groupId: 1,
    slots: [
      ['Segundas e Quartas', '13:45', 25],
      ['Segundas e Quartas', '14:45', 25],
      ['Segundas e Quartas', '15:45', 25],
      ['Terças e Quintas', '13:45', 25],
      ['Terças e Quintas', '14:45', 25],
      ['Terças e Quintas', '15:45', 25],
    ],
  },
  {
    activityId: 'danca-ritmos',
    groupId: 1,
    slots: [
      ['Segundas e Quartas', '10:30', 25],
      ['Terças e Quintas', '15:30', 25],
    ],
  },
  {
    activityId: 'ginastica',
    groupId: 1,
    slots: [
      ['Segundas e Quartas', '08:00', 25],
      ['Segundas e Quartas', '08:15', 25],
      ['Segundas e Quartas', '09:00', 25],
      ['Segundas e Quartas', '09:30', 25],
      ['Segundas e Quartas', '10:15', 25],
      ['Segundas e Quartas', '13:15', 25],
      ['Segundas e Quartas', '15:30', 25],
      ['Terças e Quintas', '08:00', 25],
      ['Terças e Quintas', '08:15', 25],
      ['Terças e Quintas', '09:00', 25],
      ['Terças e Quintas', '10:15', 25],
      ['Terças e Quintas', '10:30', 25],
      ['Terças e Quintas', '13:15', 25],
      ['Terças e Quintas', '14:30', 25],
    ],
  },
  {
    activityId: 'ginastica-cadeira',
    groupId: 1,
    slots: [['Terças e Quintas', '09:30', 25]],
  },
  {
    activityId: 'hidroginastica',
    groupId: 1,
    slots: [
      ['Segundas e Quartas', '08:00', 18],
      ['Segundas e Quartas', '09:15', 18],
      ['Segundas e Quartas', '10:30', 18],
      ['Segundas e Quartas', '13:00', 18],
      ['Segundas e Quartas', '14:30', 18],
      ['Segundas e Quartas', '15:30', 18],
      ['Terças e Quintas', '08:00', 18],
      ['Terças e Quintas', '09:15', 18],
      ['Terças e Quintas', '10:30', 18],
      ['Terças e Quintas', '13:00', 18],
      ['Terças e Quintas', '14:30', 18],
      ['Terças e Quintas', '15:30', 18],
    ],
  },
  {
    activityId: 'pilates-solo',
    groupId: 1,
    slots: [
      ['Segundas e Quartas', '08:00', 9],
      ['Segundas e Quartas', '09:15', 9],
      ['Segundas e Quartas', '10:30', 9],
      ['Terças e Quintas', '08:00', 9],
      ['Terças e Quintas', '09:15', 9],
      ['Terças e Quintas', '10:30', 9],
    ],
  },
  {
    activityId: 'pilates-funcional',
    groupId: 1,
    slots: [
      ['Segundas e Quartas', '13:30', 9],
      ['Segundas e Quartas', '14:30', 9],
      ['Segundas e Quartas', '15:45', 9],
      ['Terças e Quintas', '13:30', 9],
      ['Terças e Quintas', '14:30', 9],
      ['Terças e Quintas', '15:45', 9],
    ],
  },
  {
    activityId: 'ginastica-dance',
    groupId: 1,
    slots: [
      ['Segundas e Quartas', '08:00', 36],
      ['Segundas e Quartas', '09:00', 36],
      ['Segundas e Quartas', '10:00', 36],
      ['Terças e Quintas', '08:00', 36],
      ['Terças e Quintas', '09:00', 36],
      ['Terças e Quintas', '10:00', 36],
    ],
  },
  {
    activityId: 'teatro',
    groupId: 2,
    slots: [
      ['Segundas e Quartas', '09:00', 15],
      ['Segundas e Quartas', '14:00', 15],
      ['Segundas e Quartas', '15:00', 15],
      ['Terças e Quintas', '09:00', 15],
      ['Terças e Quintas', '14:00', 15],
      ['Terças e Quintas', '15:00', 15],
    ],
  },
  {
    activityId: 'canto',
    groupId: 2,
    slots: [
      ['Segundas e Quartas', '08:30', 7],
      ['Segundas e Quartas', '10:10', 7],
      ['Terças e Quintas', '08:30', 7],
      ['Terças e Quintas', '10:10', 7],
      ['Segundas e Quartas', '13:30', 7],
      ['Segundas e Quartas', '15:10', 7],
      ['Quintas', '13:30', 7],
      ['Quintas', '15:15', 7],
    ],
  },
];

export function buildInitialWorkshops(): Workshop[] {
  const workshops: Workshop[] = [];
  let counter = 0;

  for (const seed of SEEDS) {
    const activity = ACTIVITIES.find((item) => item.id === seed.activityId);
    if (!activity) continue;

    seed.slots.forEach(([days, startTime, vacancies]) => {
      counter += 1;
      workshops.push({
        id: `t${String(counter).padStart(3, '0')}`,
        activityId: seed.activityId,
        activityName: activity.name,
        groupId: seed.groupId,
        days,
        startTime,
        vacancies,
        professor: PROFESSORS[counter % PROFESSORS.length],
        status: 'ativa',
      });
    });
  }

  return workshops;
}

export const INITIAL_WORKSHOPS = buildInitialWorkshops();

export function getWorkshopsByGroup(groupId: 1 | 2): Workshop[] {
  return INITIAL_WORKSHOPS.filter((w) => w.groupId === groupId && w.status === 'ativa');
}

export function getWorkshopsByActivity(activityId: string): Workshop[] {
  return INITIAL_WORKSHOPS.filter(
    (w) => w.activityId === activityId && w.status === 'ativa',
  );
}

export function getWorkshopById(id: string): Workshop | undefined {
  return INITIAL_WORKSHOPS.find((w) => w.id === id);
}

export function workshopLabel(workshop: Workshop): string {
  return `${workshop.days} — ${workshop.startTime.replace(':', 'h')}`;
}
