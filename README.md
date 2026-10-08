# CATI 2027 — Sistema de Inscrições e Sorteios

Frontend institucional para o processo de inscrições, homologação, sorteio eletrônico, classificação e listas de espera do CATI — Centro de Atendimento à Terceira Idade.

## Stack

- **React 18** + **TypeScript** + **Vite 6**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **React Router v6** (roteamento SPA)
- **React Hook Form** + **Zod** (formulários e validação)
- **Lucide React** (ícones)
- **Vitest** + **Testing Library** (testes unitários)
- **Playwright** (testes E2E / browser QA)

## Estrutura do Projeto

```
src/
├── components/ui/          # Componentes base reutilizáveis
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Badge.tsx
│   ├── Table.tsx
│   ├── Modal.tsx
│   ├── ConfirmDialog.tsx
│   ├── EmptyState.tsx
│   └── LoadingSpinner.tsx
├── layouts/                # Layouts de página
│   ├── PublicLayout.tsx
│   └── AdminLayout.tsx
├── pages/
│   ├── public/             # Área pública
│   │   ├── HomePage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ConfirmationPage.tsx
│   │   └── RulesPage.tsx
│   └── admin/              # Área administrativa
│       ├── DashboardPage.tsx
│       ├── RegistrationsPage.tsx
│       ├── ClassesPage.tsx
│       ├── DrawsPage.tsx
│       └── ResultsPage.tsx
├── services/               # Camada de serviços (preparada para backend)
│   ├── registrationService.ts
│   ├── classService.ts
│   ├── drawService.ts
│   ├── emailService.ts
│   └── exportService.ts
├── domain/                 # Regras de negócio puras (testáveis)
│   ├── age.ts              # Cálculo de idade (ref: 05/01/2027)
│   ├── cpf.ts              # Validação e formatação de CPF
│   ├── registration.ts     # Duplicidade (mais recente prevalece)
│   └── draw.ts             # Algoritmo de sorteio/classificação
├── data/                   # Dados iniciais e mocks
│   ├── activities.ts
│   ├── workshops.ts        # 67 turmas do CATI (Grupo 1 e 2)
│   └── registrations.mock.ts
├── store.ts                # Store mock reativo em memória
├── types/index.ts          # Tipos TypeScript compartilhados
├── App.tsx                 # Roteamento
├── main.tsx                # Entry point
└── index.css               # Tailwind + estilos base
```

## Regras de Negócio Implementadas

### Idade
- Data de referência: **05/01/2027**
- Elegibilidade: **60 anos ou mais** (cálculo exato considerando dia/mês)
- Prioridade: **80 anos ou mais** (sorteados primeiro)

### CPF
- Aceita com ou sem pontuação (`12345678909` ou `123.456.789-09`)
- Validação completa com dígitos verificadores
- Rejeita CPFs inválidos e sequências repetidas

### Duplicidade
- Uma inscrição por CPF por processo
- A **mais recente prevalece** (inscrições anteriores marcadas como `duplicada`)

### Grupos
- **Grupo 1**: Atividades físicas (8 atividades, 53 turmas)
- **Grupo 2**: Atividades socioeducativas (2 atividades, 14 turmas)
- Participante escolhe **uma atividade por grupo** (pode escolher apenas um grupo)

### Classificação
- Independente por grupo
- Participante pode ser classificado em um, ambos ou nenhum grupo
- Lista de espera por atividade

### Sorteio
- Uma ação única por grupo: **"REALIZAR SORTEIO DO GRUPO 1/2"**
- Processa todas as turmas do grupo de uma vez
- Prioridade 80+ sorteada primeiro
- Distribuição sequencial nas turmas respeitando vagas
- Gera classificação geral do grupo + classificados/espera por turma

### Homologação
- Estados: `pendente` → `homologada` | `nao_homologada`
- Apenas homologadas participam do sorteio

## Como Executar

### Pré-requisitos
- Node.js 18+
- npm 9+

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:5173`

### Testes
```bash
npm test           # Executa todos os testes (43 testes de domínio)
npm run test:watch # Modo watch
```

### Build de Produção
```bash
npm run build
```
Gera arquivos otimizados em `dist/`

### Type Check
```bash
npx tsc -b
```

## Browser QA (Playwright)

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Em outro terminal, executar testes E2E
npx playwright test
```

## Áreas do Sistema

### Área Pública (`/`)
- **Home**: Apresentação do processo, cronograma, regras, CTA para inscrição
- **Inscrição (`/inscricao`)**: Formulário validado (nome, CPF, nascimento, e-mail, escolha de atividades)
- **Confirmação (`/inscricao/confirmacao`)**: Comprovante com dados da inscrição
- **Regras (`/inscricao/regras`)**: Detalhamento completo do edital

### Área Administrativa (`/admin`)
- **Painel (`/admin`)**: Estatísticas gerais, atalhos para ações principais, status dos sorteios
- **Inscrições (`/admin/inscricoes`)**: Lista com busca/filtro, homologação (aprovar/reprovar), exportação CSV
- **Turmas (`/admin/turmas`)**: CRUD completo, filtros por grupo/atividade/status
- **Sorteios (`/admin/sorteios`)**: Botões de ação única por grupo, feedback visual de processamento (~2s), link para resultados
- **Resultados (`/admin/resultados`)**: Abas (Por Turma, Classificação Geral, Lista de Espera), busca, exportação CSV

## Integração Futura com Backend

A arquitetura segue o padrão:
```
UI → Hooks → Services → Domain Logic → Mock/API
```

Para conectar um backend real:
1. Substitua as funções em `src/services/*.ts` por chamadas HTTP
2. O `src/store.ts` pode ser removido/substituído
3. Os tipos em `src/types/index.ts` já definem os contratos
4. Os testes de domínio em `src/domain/*.test.ts` continuam válidos

## Acessibilidade

- HTML semântico
- Navegação por teclado completa
- Foco visível
- Labels associados a inputs
- Contraste adequado (WCAG AA)
- `prefers-reduced-motion` respeitado
- ARIA apenas quando necessário

## Design

Paleta institucional:
- **Primária**: `#7b1113` (vinho/bordô)
- **Secundária**: Branco, cinzas neutros
- **Estados**: Verde (sucesso), Amarelo (atenção), Vermelho (erro/perigo)
- Sem gradientes, glassmorphism, neon ou sombras excessivas

## Licença

Uso institucional — CATI 2027.# sistema-cati
