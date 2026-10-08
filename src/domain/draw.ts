import type {
  ClassifiedEntry,
  DrawResult,
  DrawnWorkshopResult,
  Registration,
  WaitingListEntry,
  Workshop,
} from '../types';
import { ageAtReferenceDate } from './age';
import { resolveDuplications } from './registration';

export type Rng = () => number;

export function shuffle<T>(items: T[], rng: Rng): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface DrawEligibilityIssue {
  registrationId: string;
  reason: 'sem_escolha_no_grupo' | 'idade_insuficiente';
}

export function getEligibleRegistrations(
  registrations: Registration[],
  groupId: 1 | 2,
): { eligible: Registration[]; issues: DrawEligibilityIssue[] } {
  const { active } = resolveDuplications(registrations);
  const eligible: Registration[] = [];
  const issues: DrawEligibilityIssue[] = [];

  for (const registration of active) {
    if (registration.status !== 'homologada') continue;

    const workshopId =
      groupId === 1 ? registration.group1WorkshopId : registration.group2WorkshopId;

    if (!workshopId) continue;

    const age = ageAtReferenceDate(registration.participant.birthDate);
    if (age === null || age < 60) {
      issues.push({ registrationId: registration.id, reason: 'idade_insuficiente' });
      continue;
    }

    eligible.push(registration);
  }

  return { eligible, issues };
}

function isPriority80(registration: Registration): boolean {
  const age = ageAtReferenceDate(registration.participant.birthDate);
  return age !== null && age >= 80;
}

function toEntry(
  registration: Registration,
  position: number,
): ClassifiedEntry & WaitingListEntry {
  return {
    position,
    registrationId: registration.id,
    participantName: registration.participant.name,
    isPriority80: isPriority80(registration),
  };
}

function buildOrderedCandidates(
  candidates: Registration[],
  rng: Rng,
): Registration[] {
  const prioritized = shuffle(
    candidates.filter(isPriority80),
    rng,
  );
  const regular = shuffle(
    candidates.filter((registration) => !isPriority80(registration)),
    rng,
  );
  return [...prioritized, ...regular];
}

export function runDrawForGroup(
  registrations: Registration[],
  workshops: Workshop[],
  groupId: 1 | 2,
  rng: Rng = Math.random,
  drawnAt: Date = new Date(),
): DrawResult {
  const groupWorkshops = workshops.filter(
    (workshop) => workshop.groupId === groupId,
  );
  const activeWorkshops = groupWorkshops.filter((w) => w.status === 'ativa');

  const { eligible } = getEligibleRegistrations(registrations, groupId);

  const byWorkshop = new Map<string, Registration[]>();
  for (const registration of eligible) {
    const workshopId =
      groupId === 1 ? registration.group1WorkshopId : registration.group2WorkshopId;
    if (!workshopId) continue;
    const list = byWorkshop.get(workshopId) ?? [];
    list.push(registration);
    byWorkshop.set(workshopId, list);
  }

  const groupClassification: Record<string, number> = {};
  const results: DrawnWorkshopResult[] = [];
  let totalClassified = 0;
  let totalWaiting = 0;

  for (const workshop of activeWorkshops) {
    const workshopCandidates = byWorkshop.get(workshop.id) ?? [];
    const ordered = buildOrderedCandidates(workshopCandidates, rng);

    const classified: ClassifiedEntry[] = [];
    const waitingList: WaitingListEntry[] = [];

    ordered.forEach((registration, index) => {
      const entry = toEntry(registration, index + 1);
      if (index < workshop.vacancies) {
        classified.push(entry);
      } else {
        waitingList.push(entry);
      }
    });

    ordered.forEach((registration, index) => {
      groupClassification[registration.id] = index + 1;
    });

    results.push({
      workshopId: workshop.id,
      activityName: workshop.activityName,
      days: workshop.days,
      startTime: workshop.startTime,
      professor: workshop.professor,
      vacancies: workshop.vacancies,
      classified,
      waitingList,
    });

    totalClassified += classified.length;
    totalWaiting += waitingList.length;
  }

  const processedWorkshops = new Set(activeWorkshops.map((w) => w.id));
  for (const [workshopId, workshopCandidates] of byWorkshop) {
    if (processedWorkshops.has(workshopId)) continue;

    const workshop = groupWorkshops.find((w) => w.id === workshopId);
    if (!workshop) continue;

    const ordered = buildOrderedCandidates(workshopCandidates, rng);

    const waitingList: WaitingListEntry[] = ordered.map((registration, index) =>
      toEntry(registration, index + 1),
    );

    for (let i = 0; i < ordered.length; i++) {
      groupClassification[ordered[i].id] = i + 1;
    }

    const isActive = activeWorkshops.some((w) => w.id === workshopId);
    results.push({
      workshopId: workshop.id,
      activityName: workshop.activityName,
      days: workshop.days,
      startTime: workshop.startTime,
      professor: workshop.professor,
      vacancies: isActive ? workshop.vacancies : 0,
      classified: isActive ? [] : [],
      waitingList,
    });

    totalWaiting += waitingList.length;
  }

  return {
    groupId,
    drawnAt: drawnAt.toISOString(),
    totalCandidates: eligible.length,
    totalClassified,
    totalWaiting,
    groupClassification,
    workshops: results,
  };
}