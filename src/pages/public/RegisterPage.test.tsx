import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RegisterPage } from './RegisterPage';
import { ConfirmationPage } from './ConfirmationPage';
import { makeCpf } from '../../data/registrations.mock';

function renderRegisterPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  );
}

function renderWithRoutes() {
  return render(
    <MemoryRouter initialEntries={['/inscricao']}>
      <Routes>
        <Route path="/inscricao" element={<RegisterPage />} />
        <Route path="/inscricao/confirmacao" element={<ConfirmationPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function getComboboxByName(namePattern: RegExp): HTMLSelectElement {
  return screen.getByRole('combobox', { name: namePattern }) as HTMLSelectElement;
}

function getOptionValues(select: HTMLSelectElement): string[] {
  return Array.from(select.options).map((option) => option.value);
}

function getOptionTexts(select: HTMLSelectElement): string[] {
  return Array.from(select.options).map((option) => option.textContent ?? '');
}

function fillForm(user: ReturnType<typeof userEvent.setup>) {
  return (async () => {
    await user.type(screen.getByLabelText('Nome completo'), 'Maria da Silva Teste');
    await user.type(screen.getByLabelText('CPF'), makeCpf('999888777'));
    await user.type(screen.getByLabelText('Data de nascimento'), '1950-01-01');

    const activityG1 = getComboboxByName(/Grupo 1.*Grupo 1 — Atividades Físicas/);
    await user.selectOptions(activityG1, 'danca-salao');

    const workshopG1 = getComboboxByName(/Grupo 1.*Grupo 1 — Atividades Físicas/);
    await waitFor(() => expect(workshopG1).toBeEnabled());
    await user.selectOptions(workshopG1, getOptionValues(workshopG1)[1]);
  })();
}

describe('RegisterPage — seleção dinâmica de atividade e turma', () => {
  it('o select de turma começa desabilitado com indicação clara', () => {
    renderRegisterPage();

    const workshopSelect = getComboboxByName(/Grupo 1.*Grupo 1 — Atividades Físicas/);

    expect(workshopSelect).toBeDisabled();
    expect(screen.getByText('É necessário escolher uma atividade primeiro.')).toBeInTheDocument();
  });

  it('Grupo 1: selecionar Dança de Salão mostra somente turmas de Dança de Salão', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    const activitySelect = getComboboxByName(/Grupo 1.*Grupo 1 — Atividades Físicas/);
    await user.selectOptions(activitySelect, 'danca-salao');

    const workshopSelect = getComboboxByName(/Grupo 1.*Grupo 1 — Atividades Físicas/);

    await waitFor(() => expect(workshopSelect).toBeEnabled());

    const texts = getOptionTexts(workshopSelect);
    expect(texts).toHaveLength(7);
    expect(texts.filter((t) => t.includes('Segundas e Quartas'))).toHaveLength(3);
    expect(texts.filter((t) => t.includes('Terças e Quintas'))).toHaveLength(3);
    expect(texts.some((t) => t.includes('08:00'))).toBe(false);
    expect(texts.some((t) => t.includes('Pilates'))).toBe(false);
    expect(texts.some((t) => t.includes('Ginástica'))).toBe(false);
  });

  it('Grupo 1: selecionar Pilates Solo mostra somente turmas de Pilates Solo', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    const activitySelect = getComboboxByName(/Grupo 1.*Grupo 1 — Atividades Físicas/);
    await user.selectOptions(activitySelect, 'pilates-solo');

    const workshopSelect = getComboboxByName(/Grupo 1.*Grupo 1 — Atividades Físicas/);

    await waitFor(() => expect(workshopSelect).toBeEnabled());

    const texts = getOptionTexts(workshopSelect);
    expect(texts).toHaveLength(7);
    expect(texts.filter((t) => t.includes('Segundas e Quartas'))).toHaveLength(3);
    expect(texts.filter((t) => t.includes('Terças e Quintas'))).toHaveLength(3);
    expect(texts.some((t) => t.includes('Dança'))).toBe(false);
    expect(texts.some((t) => t.includes('Hidro'))).toBe(false);
  });

  it('Grupo 1: alterar a atividade limpa a turma anteriormente selecionada', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    const activitySelect = getComboboxByName(/Grupo 1.*Grupo 1 — Atividades Físicas/);
    await user.selectOptions(activitySelect, 'danca-salao');

    const workshopSelect = getComboboxByName(/Grupo 1.*Grupo 1 — Atividades Físicas/);
    await waitFor(() => expect(workshopSelect).toBeEnabled());

    const dancaOptions = getOptionValues(workshopSelect);
    await user.selectOptions(workshopSelect, dancaOptions[1]);
    expect(workshopSelect.value).toBe(dancaOptions[1]);

    await user.selectOptions(activitySelect, 'pilates-solo');

    await waitFor(() => expect(workshopSelect.value).toBe(''));

    const texts = getOptionTexts(workshopSelect);
    expect(texts.every((t) => !t.includes('Dança'))).toBe(true);
    expect(texts.every((t) => t.includes('Pilates') || t.includes('vagas'))).toBe(true);
  });

  it('Grupo 2: selecionar Teatro mostra somente turmas de Teatro', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    const activitySelect = getComboboxByName(/Grupo 2.*Grupo 2 — Atividades Socioeducativas/);
    await user.selectOptions(activitySelect, 'teatro');

    const workshopSelect = getComboboxByName(/Grupo 2.*Grupo 2 — Atividades Socioeducativas/);

    await waitFor(() => expect(workshopSelect).toBeEnabled());

    const texts = getOptionTexts(workshopSelect);
    expect(texts).toHaveLength(7);
    expect(texts.filter((t) => t.includes('Segundas e Quartas'))).toHaveLength(3);
    expect(texts.filter((t) => t.includes('Terças e Quintas'))).toHaveLength(3);
    expect(texts.some((t) => t.includes('Canto'))).toBe(false);
  });

  it('Grupo 2: selecionar Canto mostra somente turmas de Canto', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    const activitySelect = getComboboxByName(/Grupo 2.*Grupo 2 — Atividades Socioeducativas/);
    await user.selectOptions(activitySelect, 'canto');

    const workshopSelect = getComboboxByName(/Grupo 2.*Grupo 2 — Atividades Socioeducativas/);

    await waitFor(() => expect(workshopSelect).toBeEnabled());

    const texts = getOptionTexts(workshopSelect);
    expect(texts).toHaveLength(9);
    expect(texts.filter((t) => t.includes('Segundas e Quartas'))).toHaveLength(4);
    expect(texts.filter((t) => t.includes('Terças e Quintas'))).toHaveLength(2);
    expect(texts.filter((t) => t.startsWith('Quintas'))).toHaveLength(2);
    expect(texts.some((t) => t.includes('Teatro'))).toBe(false);
  });

  it('Grupo 2: alterar a atividade limpa a turma anteriormente selecionada', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    const activitySelect = getComboboxByName(/Grupo 2.*Grupo 2 — Atividades Socioeducativas/);
    await user.selectOptions(activitySelect, 'teatro');

    const workshopSelect = getComboboxByName(/Grupo 2.*Grupo 2 — Atividades Socioeducativas/);
    await waitFor(() => expect(workshopSelect).toBeEnabled());

    const teatroOptions = getOptionValues(workshopSelect);
    await user.selectOptions(workshopSelect, teatroOptions[1]);
    expect(workshopSelect.value).toBe(teatroOptions[1]);

    await user.selectOptions(activitySelect, 'canto');

    await waitFor(() => expect(workshopSelect.value).toBe(''));

    const texts = getOptionTexts(workshopSelect);
    expect(texts.every((t) => !t.includes('Teatro'))).toBe(true);
    expect(texts.every((t) => t.includes('Canto') || t.includes('Nenhuma'))).toBe(true);
  });

  it('os options de turma indicam as vagas disponíveis', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    const activitySelect = getComboboxByName(/Grupo 1.*Grupo 1 — Atividades Físicas/);
    await user.selectOptions(activitySelect, 'danca-salao');

    const workshopSelect = getComboboxByName(/Grupo 1.*Grupo 1 — Atividades Físicas/);
    await waitFor(() => expect(workshopSelect).toBeEnabled());

    const turmaTexts = getOptionTexts(workshopSelect).filter((t) => t !== 'Escolha um dia e horário');
    expect(turmaTexts.every((t) => t.includes('vagas'))).toBe(true);
  });
});

describe('RegisterPage — declaração de aceitação obrigatória', () => {
  it('bloqueia a submissão sem aceitar a declaração', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    await fillForm(user);

    await user.click(screen.getByRole('button', { name: 'Confirmar Inscrição' }));

    expect(
      await screen.findByText(/É necessário ler e aceitar os termos do Edital/),
    ).toBeInTheDocument();
  });

  it('a declaração exibe o texto completo do edital', () => {
    renderRegisterPage();

    expect(
      screen.getByText('Declaração de aceitação do Edital de Sorteio CATI 01/2027'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Declaro que compreendo e aceito os termos do Edital de Sorteio CATI 01\/2027/),
    ).toBeInTheDocument();
    expect(screen.getByText(/munícipe de São José/)).toBeInTheDocument();
  });

  it('permite submeter a inscrição com a declaração aceita', async () => {
    const user = userEvent.setup();
    renderWithRoutes();

    await fillForm(user);

    const checkbox = screen.getByLabelText(/Declaração de aceitação do Edital de Sorteio CATI 01\/2027/);
    await user.click(checkbox);

    await user.click(screen.getByRole('button', { name: 'Confirmar Inscrição' }));

    expect(
      await screen.findByText('Inscrição Confirmada!'),
    ).toBeInTheDocument();
  });
});