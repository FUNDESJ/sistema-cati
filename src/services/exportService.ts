import { apiDownload } from './api';

function todaySuffix(): string {
  return new Date().toISOString().split('T')[0];
}

/** Exporta as inscrições em CSV gerado pelo servidor (contexto administrativo). */
export async function exportRegistrationsCsv(): Promise<void> {
  await apiDownload('/admin/registrations/export.csv', `inscricoes-cati-${todaySuffix()}.csv`);
}

/**
 * Exporta o resultado vigente do sorteio do grupo em planilha (.xlsx)
 * gerada pelo servidor: uma ABA por turma (classificados + lista de
 * espera), além de Resumo e Classificação Geral — pronta para abrir no
 * Google Sheets mantendo a estrutura de abas (CSV não suporta abas).
 */
export async function exportDrawResultXlsx(groupId: 1 | 2): Promise<void> {
  await apiDownload(
    `/admin/draws/group/${groupId}/export.xlsx`,
    `resultado-grupo-${groupId}-cati-${todaySuffix()}.xlsx`,
  );
}
