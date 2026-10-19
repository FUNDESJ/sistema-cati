export type GroupId = 1 | 2;

export type RegistrationStatus = 'pendente' | 'homologada' | 'nao_homologada' | 'duplicada';

export type WorkshopStatus = 'ativa' | 'inativa';

export interface Participant {
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
  neighborhood: string;
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

/**
 * Estatísticas da prioridade 80+ dentro de um grupo.
 *
 * Registradas no momento do sorteio (pelo backend) para demonstrar a
 * aplicação da regra de precedência em prestação de contas e recursos.
 * Opcional por compatibilidade com resultados anteriores ao campo.
 */
export interface DrawPriorityStats {
  /** Candidatos prioritários elegíveis no grupo (classificados + em espera). */
  candidates: number;
  /** Candidatos prioritários classificados em vagas. */
  classified: number;
  /** Candidatos prioritários em lista de espera. */
  waiting: number;
}

export interface DrawResult {
  groupId: GroupId;
  drawnAt: string;
  totalCandidates: number;
  totalClassified: number;
  totalWaiting: number;
  /**
   * Resumo da prioridade 80+ aplicada neste grupo.
   * Ausente em resultados anteriores à adoção do campo — a interface
   * recalcula a partir das entradas quando não presente.
   */
  priority?: DrawPriorityStats;
  groupClassification: Record<string, number>;
  workshops: DrawnWorkshopResult[];
}

export interface EmailConfirmation {
  id: string;
  to: string;
  subject: string;
  sentAt: string;
}
