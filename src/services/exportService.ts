import type { DrawResult } from '../types';

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsvRow(cells: (string | number)[]): string {
  return cells.map((c) => escapeCsv(String(c))).join(',');
}

export function exportDrawResultCsv(result: DrawResult): string {
  const rows: (string | number)[][] = [];

  rows.push(['CATI 2027 — Resultado do Sorteio']);
  rows.push([`Grupo ${result.groupId === 1 ? '1 (Físicas)' : '2 (Socioeducativas)'}`]);
  rows.push([`Data do sorteio: ${new Date(result.drawnAt).toLocaleString('pt-BR')}`]);
  rows.push([`Total de candidatos: ${result.totalCandidates}`]);
  rows.push([`Total classificados: ${result.totalClassified}`]);
  rows.push([`Total em lista de espera: ${result.totalWaiting}`]);
  rows.push([]);

  for (const workshop of result.workshops) {
    rows.push([
      `Turma: ${workshop.activityName}`,
      `Dias: ${workshop.days}`,
      `Horário: ${workshop.startTime}`,
      `Professor: ${workshop.professor}`,
      `Vagas: ${workshop.vacancies}`,
    ]);

    rows.push(['CLASSIFICADOS']);
    rows.push(['Posição', 'Inscrição', 'Nome', 'Prioridade 80+']);
    for (const entry of workshop.classified) {
      rows.push([entry.position, entry.registrationId, entry.participantName, entry.isPriority80 ? 'Sim' : 'Não']);
    }

    if (workshop.waitingList.length > 0) {
      rows.push([]);
      rows.push(['LISTA DE ESPERA']);
      rows.push(['Posição', 'Inscrição', 'Nome', 'Prioridade 80+']);
      for (const entry of workshop.waitingList) {
        rows.push([entry.position, entry.registrationId, entry.participantName, entry.isPriority80 ? 'Sim' : 'Não']);
      }
    }

    rows.push([]);
  }

  rows.push(['CLASSIFICAÇÃO GERAL DO GRUPO']);
  rows.push(['Posição', 'Inscrição', 'Nome']);
  const sortedByClassification = Object.entries(result.groupClassification)
    .sort(([, a], [, b]) => a - b);
  for (const [registrationId, position] of sortedByClassification) {
    rows.push([position, registrationId, '']);
  }

  return rows.map(toCsvRow).join('\n');
}

export function exportRegistrationsCsv(registrations: { id: string; participant: { name: string; cpf: string; birthDate: string }; group1WorkshopId: string | null; group2WorkshopId: string | null; status: string; createdAt: string }[]): string {
  const rows: (string | number)[][] = [];

  rows.push(['CATI 2027 — Inscrições']);
  rows.push([`Exportado em: ${new Date().toLocaleString('pt-BR')}`]);
  rows.push([]);

  rows.push(['Inscrição', 'Nome', 'CPF', 'Data Nasc.', 'Grupo 1', 'Grupo 2', 'Status', 'Criado em']);

  for (const r of registrations) {
    rows.push([
      r.id,
      r.participant.name,
      r.participant.cpf,
      r.participant.birthDate,
      r.group1WorkshopId ?? '—',
      r.group2WorkshopId ?? '—',
      r.status,
      new Date(r.createdAt).toLocaleString('pt-BR'),
    ]);
  }

  return rows.map(toCsvRow).join('\n');
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}