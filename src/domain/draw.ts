/**
 * SORTEIO COM PRIORIDADE 80+ — MECANISMO OPERACIONAL
 * ==================================================
 *
 * Prioridade 80+ significa PRECEDÊNCIA NA DISPUTA, não reserva de vagas.
 * O sorteio de cada turma acontece em DOIS ESTÁGIOS:
 *
 *   Estágio 1 (disputa prioritária)
 *     Os candidatos com 80+ anos na data de referência disputam as vagas
 *     primeiro, em ordem aleatória entre si (Fisher-Yates).
 *     - Se houver menos 80+ que vagas: TODOS os 80+ são classificados.
 *     - Se houver mais 80+ que vagas: as vagas são sorteadas ENTRE OS
 *       PRÓPRIOS 80+ e nenhum candidato de 60-79 anos é classificado
 *       nessa turma.
 *
 *   Estágio 2 (disputa comum)
 *     As vagas restantes — se houver — são sorteadas entre os candidatos
 *     de 60-79 anos, também em ordem aleatória entre si.
 *
 *   Lista de espera
 *     Não classificados entram na espera da turma NA MESMA ordem:
 *     80+ no topo (na ordem do sorteio), depois os demais. Assim, quando
 *     uma vaga abrir, a precedência dos 80+ continua valendo.
 *
 *   O que a prioridade NÃO é
 *     - Não é cota/reserva de vagas por turma;
 *     - Não move candidatos entre turmas (a escolha de turma é do
 *       participante e é respeitada);
 *     - Não altera a independência dos sorteios dos Grupos 1 e 2.
 *
 *   Observação
 *     Em produção o sorteio é executado pelo BACKEND (fonte de verdade),
 *     que semeia o RNG com entropia criptográfica e grava seed + hash
 *     canônico para auditoria. Este módulo mantém a mesma regra no
 *     frontend para testes e paridade de comportamento.
 *
 *   Transparência
 *     Cada entrada marcada com isPriority80; o resultado consolidado
 *     registra `priority` com o total de candidatos/classificados/em
 *     espera prioritários.
 */

import type {
  ClassifiedEntry,
  DrawPriorityStats,
  DrawResult,
  DrawnWorkshopResult,
  Registration,
  WaitingListEntry,
  Workshop,
} from '../types';
import { ageAtReferenceDate } from './age';
import { resolveDuplications } from './registration';

/** Função geradora de números pseudoaleatórios (injetável para testes). */
export type Rng = () => number;

/**
 * Embaralha uma lista usando Fisher-Yates.
 *
 * Cada elemento tem probabilidade idêntica de cair em qualquer posição.
 * O RNG é injetado: em testes, um seed fixo torna o sorteio
 * determinístico; em produção, o backend usa PRNG semeado com entropia
 * criptográfica (mulberry32) e grava o seed para auditoria.
 */
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

/**
 * Filtra as inscrições APTAS a disputar o sorteio de um grupo.
 *
 * Um candidato é apto quando, simultaneamente:
 * 1. Sua inscrição é a vigente do CPF (duplicidades resolvidas —
 *    prevalece a mais recente);
 * 2. Status é `homologada` (pendentes e não homologadas ficam de fora);
 * 3. Escolheu uma turma neste grupo;
 * 4. Tem 60+ anos na data de referência 05/01/2027 (defesa em
 *    profundidade: o formulário já valida, mas a regra pertence ao domínio).
 *
 * Violações de idade em inscrições homologadas são devolvidas em `issues`
 * para inspeção — apenas elegíveis participam do sorteio.
 */
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

/**
 * Verifica se o candidato tem direito à prioridade 80+.
 *
 * A condição é SEMPRE derivada da data de nascimento comparada à data de
 * referência (05/01/2027) — nunca declarada manualmente, garantindo que
 * o que aparece na interface reflita exatamente a lógica de negócio.
 */
function isPriority80(registration: Registration): boolean {
  const age = ageAtReferenceDate(registration.participant.birthDate);
  return age !== null && age >= 80;
}

/** Converte uma inscrição em entrada posicionada do resultado (classificado ou espera). */
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

/**
 * Ordena os candidatos de uma turma aplicando os DOIS ESTÁGIOS da
 * prioridade 80+ (ver mecanismo no cabeçalho do arquivo):
 *
 *   [ 80+ embaralhados entre si ]   →  disputam as vagas primeiro
 *   [ 60-79 embaralhados entre si ] →  disputam as vagas restantes
 *
 * O chamador percorre a lista em ordem e preenche as vagas: quem estiver
 * dentro do limite de vagas é classificado; o restante vai para a espera
 * na MESMA ordem — preservando a precedência também na fila.
 *
 * Dentro de cada estágio o sorteio é justo (aleatório); entre estágios,
 * a precedência dos 80+ é absoluta.
 */
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

/**
 * Agrega as estatísticas da prioridade 80+ a partir das listas prontas
 * do resultado — classificados e em espera por turma.
 *
 * `candidates = classified + waiting` por construção: todo candidato
 * prioritário apto ou é classificado ou entra na espera da sua turma.
 * Derivar das listas (em vez de contar durante os loops) garante que o
 * resumo nunca diverge do que está efetivamente publicado.
 */
function summarizePriority(results: DrawnWorkshopResult[]): DrawPriorityStats {
  let classified = 0;
  let waiting = 0;

  for (const workshop of results) {
    for (const entry of workshop.classified) {
      if (entry.isPriority80) classified++;
    }
    for (const entry of workshop.waitingList) {
      if (entry.isPriority80) waiting++;
    }
  }

  return { candidates: classified + waiting, classified, waiting };
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
    priority: summarizePriority(results),
    groupClassification,
    workshops: results,
  };
}