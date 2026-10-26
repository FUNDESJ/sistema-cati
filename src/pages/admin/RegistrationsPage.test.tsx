import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { RegistrationsPage } from './RegistrationsPage';
import type { Registration, Workshop } from '../../types';

vi.mock('../../services/api', () => ({
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
  apiGet: vi.fn((path: string) => {
    if (path === '/admin/registrations') return Promise.resolve(mockRegistrations);
    if (path === '/admin/workshops') return Promise.resolve(mockWorkshops);
    return Promise.resolve([]);
  }),
  apiPost: vi.fn(),
  apiPatch: vi.fn(),
  apiDelete: vi.fn(),
}));

const mockWorkshops: Workshop[] = [
  {
    id: 't001',
    activityId: 'ginastica',
    activityName: 'Ginástica',
    groupId: 1,
    days: 'Segundas e Quartas',
    startTime: '08:00',
    vacancies: 25,
    professor: 'Ana Ribeiro',
    status: 'ativa',
  },
  {
    id: 't002',
    activityId: 'teatro',
    activityName: 'Teatro',
    groupId: 2,
    days: 'Terças e Quintas',
    startTime: '15:00',
    vacancies: 15,
    professor: 'Carlos Menezes',
    status: 'ativa',
  },
];

function makeRegistration(overrides: Partial<Registration>): Registration {
  return {
    id: 'insc-1',
    participant: {
      name: 'Participante Um',
      cpf: '12345678909',
      birthDate: '1950-01-01',
      phone: '48999999999',
      neighborhood: 'Campinas',
    },
    group1WorkshopId: 't001',
    group2WorkshopId: 't002',
    status: 'homologada',
    createdAt: '2026-10-21T18:35:55.000Z',
    homologatedAt: '2026-10-21T18:35:55.000Z',
    ...overrides,
  };
}

const mockRegistrations: Registration[] = [
  makeRegistration({ id: 'insc-1' }),
  makeRegistration({
    id: 'insc-2',
    participant: {
      name: 'Participante Dois',
      cpf: '98765432100',
      birthDate: '1948-05-10',
      phone: '48988888888',
      neighborhood: 'Kobrasol',
    },
    group1WorkshopId: 't001',
    group2WorkshopId: null,
  }),
  makeRegistration({
    id: 'insc-3',
    participant: {
      name: 'Participante Três',
      cpf: '45678912300',
      birthDate: '1955-09-20',
      phone: '48977777777',
      neighborhood: 'Campinas',
    },
    group1WorkshopId: null,
    group2WorkshopId: 't002',
  }),
];

function getSelectByLabel(label: string): HTMLSelectElement {
  return screen.getByLabelText(label) as HTMLSelectElement;
}

/** O contador "Mostrando X de Y" usa <strong> aninhado — lê o textContent do <p>. */
function getCounterText(): string {
  const counter = Array.from(document.querySelectorAll('p')).find((p) =>
    p.textContent?.includes('Mostrando'),
  );
  return counter?.textContent ?? '';
}

async function renderLoaded() {
  render(
    <MemoryRouter>
      <RegistrationsPage />
    </MemoryRouter>,
  );
  await waitFor(() => {
    expect(screen.getByText('Participante Um')).toBeInTheDocument();
  });
}

describe('RegistrationsPage — filtros', () => {
  it('mostra todas as inscrições sem filtros ativos', async () => {
    await renderLoaded();

    expect(getCounterText()).toBe('Mostrando 3 de 3 inscrições');
  });

  it('filtra por bairro', async () => {
    const user = userEvent.setup();
    await renderLoaded();

    await user.selectOptions(getSelectByLabel('Bairro'), 'Kobrasol');

    expect(getCounterText()).toBe('Mostrando 1 de 3 inscrições');
    expect(screen.getByText('Participante Dois')).toBeInTheDocument();
    expect(screen.queryByText('Participante Um')).not.toBeInTheDocument();
  });

  it('filtra por grupo', async () => {
    const user = userEvent.setup();
    await renderLoaded();

    await user.selectOptions(getSelectByLabel('Grupo'), 'g1');

    expect(getCounterText()).toBe('Mostrando 2 de 3 inscrições');

    await user.selectOptions(getSelectByLabel('Grupo'), 'both');

    expect(getCounterText()).toBe('Mostrando 1 de 3 inscrições');
    expect(screen.getByText('Participante Um')).toBeInTheDocument();
  });

  it('filtra por atividade', async () => {
    const user = userEvent.setup();
    await renderLoaded();

    await user.selectOptions(getSelectByLabel('Atividade'), 'ginastica');

    expect(getCounterText()).toBe('Mostrando 2 de 3 inscrições');

    await user.selectOptions(getSelectByLabel('Atividade'), 'teatro');

    expect(getCounterText()).toBe('Mostrando 2 de 3 inscrições');
  });

  it('combina filtros e limpa com o botão Limpar filtros', async () => {
    const user = userEvent.setup();
    await renderLoaded();

    await user.selectOptions(getSelectByLabel('Bairro'), 'Campinas');
    await user.selectOptions(getSelectByLabel('Grupo'), 'both');

    expect(getCounterText()).toBe('Mostrando 1 de 3 inscrições');

    await user.click(screen.getByRole('button', { name: /Limpar filtros/i }));

    await waitFor(() => {
      expect(getCounterText()).toBe('Mostrando 3 de 3 inscrições');
    });
    expect(getSelectByLabel('Bairro').value).toBe('all');
    expect(getSelectByLabel('Grupo').value).toBe('all');
  });
});