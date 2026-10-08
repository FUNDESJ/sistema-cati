import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { ageAtReferenceDate, REFERENCE_DATE } from '../../domain/age';
import { getActivitiesByGroup } from '../../data/activities';
import { getWorkshopsByGroup, getWorkshopsByActivity, workshopLabel } from '../../data/workshops';
import { createRegistration } from '../../services/registrationService';

const registrationSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  group1ActivityId: z.string().nullable(),
  group1WorkshopId: z.string().nullable(),
  group2ActivityId: z.string().nullable(),
  group2WorkshopId: z.string().nullable(),
  acceptDeclaration: z.boolean().refine((accepted) => accepted, {
    message: 'É necessário ler e aceitar os termos do Edital de Sorteio CATI 01/2027 para prosseguir com a inscrição',
  }),
}).refine((data) => data.group1WorkshopId || data.group2WorkshopId, {
  message: 'Selecione pelo menos uma turma (Grupo 1 ou Grupo 2)',
  path: ['groups'],
});

type RegistrationForm = z.infer<typeof registrationSchema>;

const GROUP_LABELS: Record<1 | 2, string> = {
  1: 'Grupo 1 — Atividades Físicas',
  2: 'Grupo 2 — Atividades Socioeducativas',
};

interface GroupSelectorProps {
  groupId: 1 | 2;
  activityId: string | null;
  workshopId: string | null;
  onActivityChange: (activityId: string | null) => void;
  onWorkshopChange: (workshopId: string | null) => void;
  groupsError?: string;
  activityError?: string;
}

function GroupSelector({
  groupId,
  activityId,
  workshopId,
  onActivityChange,
  onWorkshopChange,
  groupsError,
  activityError,
}: GroupSelectorProps) {
  const activities = getActivitiesByGroup(groupId);
  const availableWorkshops = activityId ? getWorkshopsByActivity(activityId) : [];

  const activitySelectId = `group${groupId}-activity`;
  const workshopSelectId = `group${groupId}-workshop`;

  const hasNoWorkshops = activityId !== null && availableWorkshops.length === 0;

  const workshopOptions = availableWorkshops.map((workshop) => ({
    value: workshop.id,
    label: `${workshopLabel(workshop)} · ${workshop.vacancies} vagas`,
  }));

  return (
    <div className="space-y-5 p-4 sm:p-5 bg-gray-50 rounded-xl border border-gray-200">
      <h3 id={`group${groupId}-title`} className="text-base font-semibold text-gray-900">{GROUP_LABELS[groupId]}</h3>

      <div>
        <p id={`${activitySelectId}-step`} className="text-sm font-medium text-gray-700 mb-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#7b1113] text-white text-sm font-semibold mr-2" aria-hidden="true">1</span>
          Escolha uma atividade
        </p>
        <Select
          id={activitySelectId}
          label=""
          placeholder="Selecione uma atividade"
          options={activities.map((a) => ({ value: a.id, label: a.name }))}
          value={activityId ?? ''}
          onChange={(e) => onActivityChange(e.target.value || null)}
          error={activityError}
          className="text-base py-3"
          aria-labelledby={`group${groupId}-title ${activitySelectId}-step`}
        />
      </div>

      <div>
        <p id={`${workshopSelectId}-step`} className="text-sm font-medium text-gray-700 mb-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#7b1113] text-white text-sm font-semibold mr-2" aria-hidden="true">2</span>
          Escolha o dia e horário
        </p>
        <Select
          id={workshopSelectId}
          label=""
          placeholder={hasNoWorkshops ? 'Nenhuma turma disponível' : activityId ? 'Selecione o dia e horário' : 'Escolha uma atividade primeiro'}
          options={hasNoWorkshops ? [{ value: '', label: 'Nenhuma turma disponível para esta atividade' }] : workshopOptions}
          value={workshopId ?? ''}
          onChange={(e) => onWorkshopChange(e.target.value || null)}
          disabled={activityId === null || hasNoWorkshops}
          className="text-base py-3"
          aria-labelledby={`group${groupId}-title ${workshopSelectId}-step`}
          aria-describedby={activityId === null ? `${workshopSelectId}-hint` : undefined}
        />
        {activityId === null && (
          <p id={`${workshopSelectId}-hint`} className="mt-1.5 text-sm text-gray-500">
            É necessário escolher uma atividade primeiro.
          </p>
        )}
        {hasNoWorkshops && (
          <p className="mt-1.5 text-sm text-amber-700" role="status">
            Esta atividade não possui turmas disponíveis no momento.
          </p>
        )}
      </div>

      {groupsError && (
        <p className="text-sm text-red-600" role="alert">{groupsError}</p>
      )}
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [isPriority, setIsPriority] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      cpf: '',
      birthDate: '',
      group1ActivityId: null,
      group1WorkshopId: null,
      group2ActivityId: null,
      group2WorkshopId: null,
      acceptDeclaration: false,
    },
  });

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBirthDate(value);
    setValue('birthDate', value, { shouldValidate: true });
    const calculatedAge = ageAtReferenceDate(value);
    setAge(calculatedAge);
    setIsPriority(calculatedAge !== null && calculatedAge >= 80);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 9) formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    else if (digits.length > 6) formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    else if (digits.length > 3) formatted = `${digits.slice(0, 3)}.${digits.slice(3)}`;
    setCpf(formatted);
    setValue('cpf', digits, { shouldValidate: true });
  };

  const handleActivityChange = (group: 1 | 2, activityId: string | null) => {
    const activityField = group === 1 ? 'group1ActivityId' : 'group2ActivityId';
    const workshopField = group === 1 ? 'group1WorkshopId' : 'group2WorkshopId';
    setValue(activityField, activityId);
    setValue(workshopField, null, { shouldValidate: true });
  };

  const handleWorkshopChange = (group: 1 | 2, workshopId: string | null) => {
    const workshopField = group === 1 ? 'group1WorkshopId' : 'group2WorkshopId';
    setValue(workshopField, workshopId, { shouldValidate: true });
  };

  const onSubmit = async (data: RegistrationForm) => {
    setSubmitting(true);
    setServiceError(null);
    try {
      const allWorkshops = [...getWorkshopsByGroup(1), ...getWorkshopsByGroup(2)];

      const result = createRegistration({
        name: data.name,
        cpf: data.cpf,
        birthDate: data.birthDate,
        group1WorkshopId: data.group1WorkshopId,
        group2WorkshopId: data.group2WorkshopId,
      }, allWorkshops);

      if (result.success && result.registration) {
        navigate('/inscricao/confirmacao', { state: { registration: result.registration } });
      } else {
        setServiceError(
          Object.values(result.errors).join(' ') ||
            'Não foi possível concluir a inscrição. Verifique os dados e tente novamente.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const groupsError = (errors as unknown as { groups?: { message?: string } }).groups?.message;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Formulário de Inscrição</h1>
        <p className="text-gray-600 mt-2 text-base">Preencha seus dados e escolha as turmas desejadas.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
        <fieldset className="space-y-5">
          <legend className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Dados Pessoais</legend>

          <Input
            {...register('name')}
            label="Nome completo"
            placeholder="João da Silva"
            error={errors.name?.message}
            autoComplete="name"
            className="text-base py-3"
            required
          />

          <Input
            label="CPF"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={handleCpfChange}
            error={errors.cpf?.message}
            helperText="Digite apenas os 11 números. Ex: 123.456.789-00"
            maxLength={14}
            autoComplete="off"
            inputMode="numeric"
            className="text-base py-3"
            required
          />

          <Input
            label="Data de nascimento"
            type="date"
            value={birthDate}
            onChange={handleBirthDateChange}
            error={errors.birthDate?.message}
            max={REFERENCE_DATE.toISOString().split('T')[0]}
            autoComplete="bday"
            className="text-base py-3"
            required
          />

          {age !== null && (
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-lg ${isPriority ? 'bg-amber-50 border border-amber-300' : 'bg-blue-50 border border-blue-200'}`}
              role="status"
            >
              <Info className={`h-5 w-5 flex-shrink-0 ${isPriority ? 'text-amber-600' : 'text-blue-600'}`} aria-hidden="true" />
              <span className="text-base font-medium">
                Idade na data de referência (05/01/2027): <strong>{age} anos</strong>
                {isPriority && (
                  <> — <strong className="text-amber-700">Prioridade 80+</strong></>
                )}
              </span>
            </div>
          )}
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Escolha das Turmas</legend>
          <p className="text-base text-gray-600">
            Escolha <strong>uma turma por grupo</strong>. É obrigatório escolher pelo menos um grupo.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            <GroupSelector
              groupId={1}
              activityId={watch('group1ActivityId')}
              workshopId={watch('group1WorkshopId')}
              onActivityChange={(id) => handleActivityChange(1, id)}
              onWorkshopChange={(id) => handleWorkshopChange(1, id)}
              groupsError={groupsError}
            />

            <GroupSelector
              groupId={2}
              activityId={watch('group2ActivityId')}
              workshopId={watch('group2WorkshopId')}
              onActivityChange={(id) => handleActivityChange(2, id)}
              onWorkshopChange={(id) => handleWorkshopChange(2, id)}
              groupsError={groupsError}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Declaração de Aceitação</legend>

          <label
            htmlFor="accept-declaration"
            className={`
              flex items-start gap-4 p-4 sm:p-5 rounded-xl border-2 cursor-pointer transition-colors
              ${errors.acceptDeclaration
                ? 'border-red-400 bg-red-50'
                : 'border-gray-300 bg-gray-50 hover:border-[#7b1113] hover:bg-[#fdf0f0]'
              }
            `}
          >
            <input
              {...register('acceptDeclaration')}
              id="accept-declaration"
              type="checkbox"
              className="mt-1 h-6 w-6 flex-shrink-0 rounded border-gray-400 text-[#7b1113] accent-[#7b1113] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7b1113] focus:ring-offset-2"
              aria-invalid={errors.acceptDeclaration ? 'true' : 'false'}
              aria-describedby={errors.acceptDeclaration ? 'accept-declaration-error' : undefined}
            />
            <span className="text-base text-gray-700 leading-relaxed">
              <strong className="block text-gray-900 mb-1">
                Declaração de aceitação do Edital de Sorteio CATI 01/2027
              </strong>
              Declaro que compreendo e aceito os termos do Edital de Sorteio CATI 01/2027,
              que sou munícipe de São José e que minha matrícula no CATI é vinculada a
              veracidade das informações prestadas neste formulário.
            </span>
          </label>

          {errors.acceptDeclaration && (
            <p id="accept-declaration-error" className="text-sm text-red-600" role="alert">
              {errors.acceptDeclaration.message}
            </p>
          )}
        </fieldset>

        {serviceError && (
          <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
            <Info className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-red-700">{serviceError}</p>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <Button type="submit" loading={submitting} fullWidth size="lg" className="text-base py-3.5">
            Confirmar Inscrição
          </Button>
        </div>
      </form>

      <div className="mt-8 p-5 bg-gray-50 rounded-xl border border-gray-200 text-base text-gray-600 space-y-2">
        <p><strong>Data de referência para cálculo de idade:</strong> 05/01/2027</p>
        <p><strong>Idade mínima:</strong> 60 anos completos até a data de referência</p>
        <p><strong>Prioridade:</strong> Pessoas com 80 anos ou mais têm prioridade no sorteio</p>
        <p><strong>Uma inscrição por CPF:</strong> A mais recente prevalece em caso de duplicidade</p>
      </div>
    </div>
  );
}