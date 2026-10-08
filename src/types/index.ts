export type GroupId = 1 | 2;

export type RegistrationStatus = 'pendente' | 'homologada' | 'nao_homologada' | 'duplicada';

export type WorkshopStatus = 'ativa' | 'inativa';

export interface Participant {
  name: string;
  cpf: string;
  birthDate: string;
}

export interface Registration {
  id: string;
  participant: Participant;
  group1WorkshopId: string | null;
  group2WorkshopId: string | null;
  status: RegistrationStatus;
  createdAt: string;
  homologatedAt: string | null;
}

export interface Workshop {
  id: string;
  activityId: string;
  activityName: string;
  groupId: GroupId;
  days: string;
  startTime: string;
  vacancies: number;
  professor: string;
  status: WorkshopStatus;
}

export interface Activity {
  id: string;
  name: string;
  groupId: GroupId;
}

export interface ClassifiedEntry {
  position: number;
  registrationId: string;
  participantName: string;
  isPriority80: boolean;
}

export interface WaitingListEntry {
  position: number;
  registrationId: string;
  participantName: string;
  isPriority80: boolean;
}

export interface DrawnWorkshopResult {
  workshopId: string;
  activityName: string;
  days: string;
  startTime: string;
  professor: string;
  vacancies: number;
  classified: ClassifiedEntry[];
  waitingList: WaitingListEntry[];
}

export interface DrawResult {
  groupId: GroupId;
  drawnAt: string;
  totalCandidates: number;
  totalClassified: number;
  totalWaiting: number;
  groupClassification: Record<string, number>;
  workshops: DrawnWorkshopResult[];
}

export interface EmailConfirmation {
  id: string;
  to: string;
  subject: string;
  sentAt: string;
}
