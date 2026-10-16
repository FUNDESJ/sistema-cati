import { apiDownload } from './api';

function todaySuffix(): string {
  return new Date().toISOString().split('T')[0];
}

/** Exporta as inscrições em CSV gerado pelo servidor (contexto administrativo). */
export async function exportRegistrationsCsv(): Promise<void> {
  await apiDownload('/admin/registrations/export.csv', `inscricoes-cati-${todaySuffix()}.csv`);
}

/** Exporta o resultado vigente do sorteio do grupo em CSV gerado pelo servidor. */
export async function exportDrawResultCsv(groupId: 1 | 2): Promise<void> {
  await apiDownload(
    `/admin/draws/group/${groupId}/export.csv`,
    `resultado-grupo-${groupId}-cati-${todaySuffix()}.csv`,
  );
}
