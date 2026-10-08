import { getEmailOutbox, addEmailConfirmation } from '../store';

export interface ConfirmationEmailData {
  registrationId: string;
  participantName: string;
  participantEmail: string;
  group1Activity?: string;
  group2Activity?: string;
}

export function sendRegistrationConfirmation(data: ConfirmationEmailData): void {
  const subject = 'Confirmação de Inscrição — CATI 2027';
  const body = buildConfirmationBody(data);
  const email = {
    id: `email-${Date.now()}`,
    to: data.participantEmail,
    subject,
    body,
    sentAt: new Date().toISOString(),
  };
  addEmailConfirmation(email);
}

function buildConfirmationBody(data: ConfirmationEmailData): string {
  const lines = [
    `Olá, ${data.participantName}!`,
    '',
    'Sua inscrição no CATI 2027 foi recebida com sucesso.',
    '',
    'Detalhes da inscrição:',
    `• Identificação: ${data.registrationId}`,
  ];

  if (data.group1Activity) {
    lines.push(`• Grupo 1 (Atividades Físicas): ${data.group1Activity}`);
  }
  if (data.group2Activity) {
    lines.push(`• Grupo 2 (Atividades Socioeducativas): ${data.group2Activity}`);
  }

  lines.push(
    '',
    'A homologação e o sorteio ocorrerão conforme o cronograma do edital.',
    'Você será notificado sobre o resultado.',
    '',
    'Atenciosamente,',
    'Equipe CATI',
  );

  return lines.join('\n');
}

export function getConfirmationEmails(): ReturnType<typeof getEmailOutbox> {
  return getEmailOutbox();
}