import { describe, expect, it } from 'vitest';
import {
  getWorkshopsByActivity,
  getWorkshopsByGroup,
  getWorkshopById,
  workshopLabel,
  INITIAL_WORKSHOPS,
} from './workshops';
import { getActivitiesByGroup } from './activities';

describe('getWorkshopsByActivity — Grupo 1', () => {
  it('selecionar Dança de Salão retorna somente turmas de Dança de Salão', () => {
    const workshops = getWorkshopsByActivity('danca-salao');

    expect(workshops).toHaveLength(6);
    expect(workshops.every((w) => w.activityId === 'danca-salao')).toBe(true);
    expect(workshops.every((w) => w.activityName === 'Dança de Salão')).toBe(true);
  });

  it('selecionar Pilates Solo retorna somente turmas de Pilates Solo', () => {
    const workshops = getWorkshopsByActivity('pilates-solo');

    expect(workshops).toHaveLength(6);
    expect(workshops.every((w) => w.activityId === 'pilates-solo')).toBe(true);
    expect(workshops.every((w) => w.activityName === 'Pilates Solo')).toBe(true);
  });

  it('turmas de atividades diferentes não se misturam', () => {
    const dancaSalao = getWorkshopsByActivity('danca-salao');
    const pilatesSolo = getWorkshopsByActivity('pilates-solo');

    const dancaIds = new Set(dancaSalao.map((w) => w.id));
    const pilatesIds = new Set(pilatesSolo.map((w) => w.id));

    for (const id of dancaIds) {
      expect(pilatesIds.has(id)).toBe(false);
    }
  });

  it('atividade sem turmas ativas retorna lista vazia', () => {
    const workshops = getWorkshopsByActivity('atividade-inexistente');
    expect(workshops).toHaveLength(0);
  });
});

describe('getWorkshopsByActivity — Grupo 2', () => {
  it('selecionar Teatro retorna somente turmas de Teatro', () => {
    const workshops = getWorkshopsByActivity('teatro');

    expect(workshops).toHaveLength(6);
    expect(workshops.every((w) => w.activityId === 'teatro')).toBe(true);
    expect(workshops.every((w) => w.activityName === 'Teatro')).toBe(true);
  });

  it('selecionar Canto retorna somente turmas de Canto', () => {
    const workshops = getWorkshopsByActivity('canto');

    expect(workshops).toHaveLength(8);
    expect(workshops.every((w) => w.activityId === 'canto')).toBe(true);
    expect(workshops.every((w) => w.activityName === 'Canto')).toBe(true);
  });

  it('turmas de Teatro e Canto não se misturam', () => {
    const teatro = getWorkshopsByActivity('teatro');
    const canto = getWorkshopsByActivity('canto');

    const teatroIds = new Set(teatro.map((w) => w.id));
    const cantoIds = new Set(canto.map((w) => w.id));

    for (const id of teatroIds) {
      expect(cantoIds.has(id)).toBe(false);
    }
  });
});

describe('getWorkshopsByGroup', () => {
  it('Grupo 1 contém apenas atividades físicas', () => {
    const workshops = getWorkshopsByGroup(1);
    expect(workshops.length).toBeGreaterThan(0);
    expect(workshops.every((w) => w.groupId === 1)).toBe(true);
  });

  it('Grupo 2 contém apenas atividades socioeducativas', () => {
    const workshops = getWorkshopsByGroup(2);
    expect(workshops.length).toBeGreaterThan(0);
    expect(workshops.every((w) => w.groupId === 2)).toBe(true);
  });

  it('Grupos são independentes — nenhuma turma compartilhada', () => {
    const g1 = getWorkshopsByGroup(1).map((w) => w.id);
    const g2 = getWorkshopsByGroup(2).map((w) => w.id);

    for (const id of g1) {
      expect(g2).not.toContain(id);
    }
  });
});

describe('getWorkshopById e workshopLabel', () => {
  it('encontra turma por id', () => {
    const first = INITIAL_WORKSHOPS[0];
    expect(getWorkshopById(first.id)?.id).toBe(first.id);
  });

  it('formata o rótulo da turma com dias e horário', () => {
    const workshop = INITIAL_WORKSHOPS[0];
    const label = workshopLabel(workshop);
    expect(label).toContain(workshop.days);
    expect(label).toMatch(/h/);
  });
});

describe('estrutura Grupo → Atividade → Turma', () => {
  it('todas as atividades possuem turmas consistentes com o grupo', () => {
    for (const group of [1, 2] as const) {
      const activities = getActivitiesByGroup(group);
      expect(activities.length).toBeGreaterThan(0);

      for (const activity of activities) {
        const workshops = getWorkshopsByActivity(activity.id);
        for (const workshop of workshops) {
          expect(workshop.groupId).toBe(group);
          expect(workshop.activityId).toBe(activity.id);
          expect(workshop.vacancies).toBeGreaterThan(0);
        }
      }
    }
  });
});