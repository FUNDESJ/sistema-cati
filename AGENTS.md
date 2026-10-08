# AGENTS.md

## 1. IDENTIDADE DO PROJETO

Este repositório contém o frontend do sistema de inscrições e sorteios do CATI — Centro de Atendimento à Terceira Idade.

O sistema será utilizado pela equipe do CATI para organizar o processo de inscrições, homologação, sorteios eletrônicos, classificação e listas de espera das atividades oferecidas.

O projeto deve ser desenvolvido como um sistema institucional real, com foco em:

- clareza;
- confiabilidade;
- segurança;
- acessibilidade;
- facilidade de manutenção;
- facilidade de operação;
- baixo acoplamento;
- escalabilidade futura;
- código limpo;
- experiência de uso profissional.

O sistema NÃO deve parecer um protótipo genérico produzido por inteligência artificial.

---

# 2. ESCOPO ATUAL

## 2.1 O QUE DEVE EXISTIR

O frontend deverá estar preparado para contemplar:

- inscrição de participantes;
- validação de idade;
- validação de CPF;
- seleção de uma atividade do Grupo 1;
- seleção de uma atividade do Grupo 2;
- identificação de pessoas com 80 anos ou mais;
- confirmação da inscrição;
- homologação das inscrições;
- gerenciamento de atividades;
- gerenciamento de turmas;
- gerenciamento de horários;
- gerenciamento de professores;
- realização do sorteio do Grupo 1;
- realização do sorteio do Grupo 2;
- classificação;
- listas de espera;
- visualização dos resultados administrativos;
- exportação/preparação de dados para Excel/Google Sheets;
- interface administrativa para o CATI.

---

# 3. O QUE NÃO FAZ PARTE DO PROJETO

Não implementar funcionalidades que não estejam expressamente previstas neste escopo.

O sistema NÃO deverá implementar:

- matrícula;
- controle de frequência;
- prontuário;
- histórico médico;
- troca de oficina pelo participante;
- gestão anual completa;
- alocação de vagas do SAS;
- sistema público definitivo de divulgação dos resultados;
- gestão de pagamentos;
- gestão financeira;
- sistema completo de comunicação;
- múltiplos níveis complexos de usuários;
- funcionalidades administrativas não solicitadas.

O sistema termina conceitualmente na:

> classificação + lista de espera.

A publicação pública definitiva dos resultados será realizada por outro sistema/URL.

---

# 4. ARQUITETURA

## 4.1 FASE ATUAL

A fase atual é EXCLUSIVAMENTE frontend.

Não implementar nesta fase:

- backend;
- Supabase;
- Render;
- banco de dados real;
- APIs reais;
- autenticação real;
- envio real de e-mails;
- integração real com Google Sheets.

Esses recursos poderão ser integrados posteriormente.

O frontend, entretanto, DEVE ser arquitetado para permitir essa integração posteriormente sem necessidade de reescrever toda a aplicação.

---

# 5. STACK PREFERENCIAL

Utilizar, quando tecnicamente adequado:

- React;
- TypeScript;
- Vite;
- Tailwind CSS;
- React Router;
- React Hook Form;
- Zod;
- Lucide React;
- Vitest;
- Testing Library;
- Playwright, caso esteja disponível no ambiente.

Não adicionar bibliotecas desnecessárias.

Antes de instalar uma dependência nova, verificar se ela realmente resolve uma necessidade do projeto.

Evitar dependências utilizadas apenas para facilitar uma implementação simples.

---

# 6. PRINCÍPIO FUNDAMENTAL DE ARQUITETURA

O frontend deve ser desenvolvido com separação clara entre:

- interface;
- regras de negócio;
- tipos;
- validações;
- dados simulados;
- serviços;
- componentes;
- páginas;
- estado.

Nunca espalhar regras de negócio diretamente pelos componentes visuais.

---

# 7. FUTURO BACKEND

A aplicação deverá possuir uma camada de serviços.

Exemplo conceitual:

```text
src/
├── services/
│   ├── registrations/
│   ├── workshops/
│   ├── draws/
│   └── exports/
```

Durante a fase frontend, os serviços poderão utilizar mocks.

Posteriormente, esses mesmos serviços deverão poder ser substituídos por chamadas HTTP sem que as páginas precisem ser reconstruídas.

Evitar:

```tsx
fetch(...)
```

espalhado por componentes.

Preferir:

```text
Página
 ↓
Hook
 ↓
Service
 ↓
Mock/API
```

---

# 8. REGRAS DE INSCRIÇÃO

## 8.1 IDADE

Somente participantes com 60 anos ou mais podem se inscrever.

A idade deve ser calculada considerando a data de referência definida pelo edital:

> 05/01/2027.

Não utilizar simplesmente:

```text
ano atual - ano nascimento
```

porque isso pode produzir resultado incorreto antes do aniversário.

---

# 9. CPF

O CPF deve possuir validação adequada.

A validação deve:

- aceitar CPF digitado com ou sem pontuação;
- normalizar o valor internamente;
- rejeitar CPFs inválidos;
- impedir CPFs evidentemente inválidos;
- preservar máscara apenas na apresentação quando necessário.

Não confiar apenas em uma expressão regular para determinar se um CPF é válido.

---

# 10. INSCRIÇÃO DUPLICADA

Cada CPF deve possuir uma inscrição válida por processo.

Caso existam inscrições duplicadas:

> a inscrição mais recente prevalece.

Essa regra deverá existir na camada de domínio/serviço, e não somente na interface.

---

# 11. GRUPOS

Existem exatamente dois grupos independentes.

## GRUPO 1

Atividades físicas.

## GRUPO 2

Atividades socioeducativas.

O participante pode escolher:

- uma atividade do Grupo 1;
- uma atividade do Grupo 2.

Os grupos são independentes.

---

# 12. CLASSIFICAÇÃO

Um participante deve possuir classificação independente em cada grupo escolhido.

Exemplo:

```text
Participante:
Grupo 1 → classificação 18
Grupo 2 → classificação 4
```

Não utilizar uma classificação global única.

É possível que o participante:

- seja classificado nos dois grupos;
- seja classificado somente no Grupo 1;
- seja classificado somente no Grupo 2;
- esteja na espera em um grupo e classificado no outro;
- esteja na espera nos dois grupos.

---

# 13. PESSOAS COM 80 ANOS OU MAIS

A identificação de participantes com 80 anos ou mais deve ser tratada como informação de prioridade do processo de sorteio.

Essa informação deve ser derivada de forma confiável a partir da data de nascimento e da data de referência.

Não criar uma regra visual que não esteja refletida na lógica de negócio.

---

# 14. HOMOLOGAÇÃO

O processo possui uma etapa de homologação antes do sorteio.

A interface administrativa deverá permitir distinguir, de forma clara:

- inscrição recebida;
- inscrição válida;
- inscrição homologada;
- inscrição não homologada.

Não permitir que uma inscrição não homologada seja tratada como participante elegível para o sorteio.

---

# 15. SORTEIO

Existem exatamente dois sorteios principais.

## 15.1 SORTEIO DO GRUPO 1

Deve existir uma ação administrativa clara:

> REALIZAR SORTEIO DO GRUPO 1

Ao executar o sorteio:

1. processar as inscrições elegíveis;
2. aplicar as regras de prioridade;
3. distribuir os participantes nas turmas;
4. respeitar as vagas;
5. gerar classificação;
6. gerar lista de espera;
7. apresentar o resultado consolidado.

O usuário NÃO deverá precisar executar manualmente um sorteio para cada turma.

---

## 15.2 SORTEIO DO GRUPO 2

Deve existir uma ação:

> REALIZAR SORTEIO DO GRUPO 2

O comportamento deverá ser equivalente ao Grupo 1, respeitando as atividades e vagas do Grupo 2.

---

# 16. EXPERIÊNCIA DO SORTEIO

A experiência administrativa desejada é:

```text
REALIZAR SORTEIO
        ↓
processamento
        ↓
aproximadamente 2 segundos
        ↓
resultado completo
```

Os aproximadamente 2 segundos são uma decisão de UX para representar visualmente o processamento.

Não utilizar delays artificiais indiscriminadamente.

Se o processamento real futuramente for assíncrono, a interface deverá estar preparada para isso.

---

# 17. TURMAS

As turmas NÃO devem ser consideradas constantes rígidas do código.

O sistema deve ser preparado para que a administração possa futuramente alterar:

- atividade;
- grupo;
- professor;
- dias;
- horário;
- quantidade de vagas;
- status da turma;
- demais informações administrativas pertinentes.

Não criar telas que exijam alteração de código para modificar uma turma.

---

# 18. DADOS INICIAIS

Os dados fornecidos para desenvolvimento representam a configuração inicial do CATI.

## GRUPO 1

### Dança de Salão

- Segundas e Quartas — 13h45 — 25 vagas
- Segundas e Quartas — 14h45 — 25 vagas
- Segundas e Quartas — 15h45 — 25 vagas
- Terças e Quintas — 13h45 — 25 vagas
- Terças e Quintas — 14h45 — 25 vagas
- Terças e Quintas — 15h45 — 25 vagas

### Dança Ritmos

- Segundas e Quartas — 10h30 — 25 vagas
- Terças e Quintas — 15h30 — 25 vagas

### Ginástica

- Segundas e Quartas — 08h00 — 25 vagas
- Segundas e Quartas — 08h15 — 25 vagas
- Segundas e Quartas — 09h00 — 25 vagas
- Segundas e Quartas — 09h30 — 25 vagas
- Segundas e Quartas — 10h15 — 25 vagas
- Segundas e Quartas — 13h15 — 25 vagas
- Segundas e Quartas — 15h30 — 25 vagas
- Terças e Quintas — 08h00 — 25 vagas
- Terças e Quintas — 08h15 — 25 vagas
- Terças e Quintas — 09h00 — 25 vagas
- Terças e Quintas — 10h15 — 25 vagas
- Terças e Quintas — 10h30 — 25 vagas
- Terças e Quintas — 13h15 — 25 vagas
- Terças e Quintas — 14h30 — 25 vagas

### Ginástica na Cadeira

- Terças e Quintas — 09h30 — 25 vagas

### Hidroginástica

- Segundas e Quartas — 08h00 — 18 vagas
- Segundas e Quartas — 09h15 — 18 vagas
- Segundas e Quartas — 10h30 — 18 vagas
- Segundas e Quartas — 13h00 — 18 vagas
- Segundas e Quartas — 14h30 — 18 vagas
- Segundas e Quartas — 15h30 — 18 vagas
- Terças e Quintas — 08h00 — 18 vagas
- Terças e Quintas — 09h15 — 18 vagas
- Terças e Quintas — 10h30 — 18 vagas
- Terças e Quintas — 13h00 — 18 vagas
- Terças e Quintas — 14h30 — 18 vagas
- Terças e Quintas — 15h30 — 18 vagas

### Pilates Solo

- Segundas e Quartas — 08h00 — 9 vagas
- Segundas e Quartas — 09h15 — 9 vagas
- Segundas e Quartas — 10h30 — 9 vagas
- Terças e Quintas — 08h00 — 9 vagas
- Terças e Quintas — 09h15 — 9 vagas
- Terças e Quintas — 10h30 — 9 vagas

### Pilates Funcional

- Segundas e Quartas — 13h30 — 9 vagas
- Segundas e Quartas — 14h30 — 9 vagas
- Segundas e Quartas — 15h45 — 9 vagas
- Terças e Quintas — 13h30 — 9 vagas
- Terças e Quintas — 14h30 — 9 vagas
- Terças e Quintas — 15h45 — 9 vagas

### Ginástica/Dance

- Segundas e Quartas — 08h00 — 36 vagas
- Segundas e Quartas — 09h00 — 36 vagas
- Segundas e Quartas — 10h00 — 36 vagas
- Terças e Quintas — 08h00 — 36 vagas
- Terças e Quintas — 09h00 — 36 vagas
- Terças e Quintas — 10h00 — 36 vagas

---

# 19. GRUPO 2

### Teatro

- Segundas e Quartas — 09h00 — 15 vagas
- Segundas e Quartas — 14h00 — 15 vagas
- Segundas e Quartas — 15h00 — 15 vagas
- Terças e Quintas — 09h00 — 15 vagas
- Terças e Quintas — 14h00 — 15 vagas
- Terças e Quintas — 15h00 — 15 vagas

### Canto

- Segundas e Quartas — 08h30 — 7 vagas
- Segundas e Quartas — 10h10 — 7 vagas
- Terças e Quintas — 08h30 — 7 vagas
- Terças e Quintas — 10h10 — 7 vagas
- Segundas e Quartas — 13h30 — 7 vagas
- Segundas e Quartas — 15h10 — 7 vagas
- Quintas — 13h30 — 7 vagas
- Quintas — 15h15 — 7 vagas

---

# 20. DADOS MOCK

Os dados mock devem ser claramente separados dos serviços.

Nunca espalhar arrays enormes de participantes diretamente nas páginas.

Utilizar estrutura semelhante a:

```text
src/mocks/
src/services/
src/types/
```

Os mocks devem simular situações reais:

- participantes válidos;
- participantes 80+;
- inscrições duplicadas;
- inscrições homologadas;
- inscrições não homologadas;
- participantes classificados;
- participantes em espera;
- turmas lotadas;
- turmas com vagas;
- inscrições nos dois grupos;
- inscrição em apenas um grupo.

Não utilizar apenas 2 ou 3 registros fictícios genéricos.

---

# 21. E-MAIL

O frontend deverá representar o fluxo de confirmação de inscrição.

Durante esta fase não enviar e-mail real.

Criar uma abstração que futuramente permita:

```text
registrationService
        ↓
emailService
```

O usuário deverá receber visualmente uma confirmação de que sua inscrição foi realizada.

A confirmação deve apresentar, quando aplicável:

- nome;
- identificação da inscrição;
- atividade escolhida;
- grupo;
- dia/horário.

---

# 22. SEGURANÇA

Dados pessoais devem ser tratados como informações sensíveis do ponto de vista operacional.

Não expor CPF completo desnecessariamente.

Utilizar máscaras e dados minimizados quando a informação completa não for necessária na interface.

Não colocar dados pessoais reais no repositório.

Nunca utilizar:

- CPF real;
- e-mail pessoal real;
- telefone real;
- endereço real;
- dados reais de participantes.

Os dados utilizados durante desenvolvimento devem ser fictícios.

---

# 23. LGPD

O frontend deve seguir princípios de:

- finalidade;
- necessidade;
- minimização;
- segurança;
- controle de acesso futuro;
- redução de exposição;
- separação de responsabilidades.

Não afirmar que o sistema é "100% LGPD compliant" apenas por implementar algumas proteções.

A conformidade completa dependerá também de backend, infraestrutura, políticas institucionais e procedimentos administrativos.

---

# 24. DESIGN

O sistema deve ter identidade institucional.

Paleta visual preferencial:

- branco;
- vinho/bordô;
- vermelho;
- preto;
- cinza;
- tons neutros.

Evitar:

- roxo como cor principal;
- gradientes excessivos;
- neon;
- glassmorphism;
- cards gigantes;
- sombras exageradas;
- dashboards genéricos;
- excesso de animações;
- elementos decorativos sem função;
- aparência de template de IA.

A interface deve parecer desenvolvida por uma equipe profissional para uma instituição pública/educacional.

---

# 25. USABILIDADE

Prioridades:

1. clareza;
2. facilidade de uso;
3. acessibilidade;
4. consistência;
5. confiabilidade;
6. performance;
7. estética.

Não sacrificar usabilidade para deixar uma tela visualmente mais sofisticada.

---

# 26. ACESSIBILIDADE

Implementar:

- HTML semântico;
- navegação por teclado;
- foco visível;
- labels associados;
- mensagens de erro compreensíveis;
- contraste adequado;
- estados de loading;
- estados vazios;
- estados de erro;
- aria apenas quando necessário;
- tamanho de texto adequado.

Não utilizar apenas cor para transmitir informação.

---

# 27. RESPONSIVIDADE

O sistema deve funcionar adequadamente em:

- desktop;
- notebook;
- tablet;
- celular.

A interface administrativa pode priorizar desktop, mas não deve quebrar em telas menores.

---

# 28. COMPONENTIZAÇÃO

Criar componentes reutilizáveis.

Exemplos:

```text
Button
Input
Select
Modal
Dialog
Badge
Table
Pagination
EmptyState
LoadingState
ErrorState
ConfirmDialog
FormField
StatusBadge
```

Não criar abstrações excessivamente genéricas apenas por princípio.

Componentes devem resolver problemas reais.

---

# 29. FORMULÁRIOS

Formulários devem:

- validar em tempo adequado;
- apresentar mensagens claras;
- preservar informações quando houver erro;
- indicar campos obrigatórios;
- impedir submissões obviamente inválidas;
- funcionar corretamente com teclado;
- possuir estados de loading;
- possuir estados de sucesso/erro.

---

# 30. TABELAS

As tabelas administrativas devem priorizar leitura e operação.

Evitar excesso de colunas.

Quando necessário:

- filtros;
- busca;
- ordenação;
- paginação;
- ações contextuais.

---

# 31. DASHBOARD

Não transformar o sistema em um dashboard cheio de gráficos apenas porque isso é visualmente comum.

O painel inicial deve mostrar somente informações úteis para o trabalho da equipe.

Exemplos:

- inscrições recebidas;
- inscrições homologadas;
- inscrições pendentes;
- quantidade de participantes por grupo;
- status dos sorteios;
- atalhos para ações principais.

---

# 32. GESTÃO DE TURMAS

A administração deve conseguir visualizar claramente:

- grupo;
- atividade;
- dia;
- horário;
- professor;
- vagas;
- inscritos;
- vagas disponíveis;
- status.

A interface deve permitir futuramente:

- criar;
- editar;
- ativar;
- desativar.

---

# 33. RESULTADO DO SORTEIO

O resultado deve ser apresentado de maneira operacional.

Para cada turma:

```text
Atividade
Dia
Horário
Professor
Vagas

CLASSIFICADOS
1.
2.
3.
...

LISTA DE ESPERA
1.
2.
3.
...
```

O sistema deve permitir visualizar o resultado consolidado do grupo.

---

# 34. EXPORTAÇÃO

Preparar a arquitetura para exportação.

O resultado poderá futuramente ser enviado para:

- Excel;
- CSV;
- Google Sheets.

Durante o frontend, pode existir uma implementação local/mock para demonstrar o fluxo.

---

# 35. TESTES

O projeto deve possuir testes para regras críticas.

Priorizar:

- cálculo de idade;
- validação de CPF;
- duplicidade;
- inscrição mais recente;
- identificação 80+;
- seleção de grupo;
- classificação independente;
- capacidade das turmas;
- lista de espera;
- sorteio;
- separação entre Grupo 1 e Grupo 2.

Testes de interface devem cobrir fluxos importantes.

Se Playwright estiver disponível, utilizar testes E2E para fluxos críticos.

---

# 36. QUALIDADE

Antes de considerar uma etapa concluída:

- verificar TypeScript;
- verificar lint;
- verificar build;
- executar testes;
- verificar rotas;
- verificar console;
- verificar responsividade;
- verificar acessibilidade;
- verificar fluxos principais;
- revisar código.

Não declarar sucesso apenas porque o servidor iniciou.

---

# 37. ECC

O projeto utiliza ECC através do OpenCode.

O agente deve aproveitar os recursos ECC efetivamente disponíveis no ambiente.

Não inventar skills.

Não assumir que determinada skill existe sem verificar.

Quando houver recursos relacionados a:

- React;
- frontend;
- performance;
- acessibilidade;
- segurança;
- testes;
- E2E;
- browser QA;
- arquitetura;
- documentação;
- Git;
- revisão;
- verificação;

eles devem ser utilizados quando forem pertinentes.

---

# 38. METODOLOGIA

O trabalho deve seguir:

```text
ANALISAR
↓
ENTENDER
↓
PLANEJAR
↓
IMPLEMENTAR
↓
TESTAR
↓
VALIDAR
↓
REVISAR
↓
CORRIGIR
↓
VERIFICAR NOVAMENTE
```

Nunca iniciar uma grande implementação sem compreender primeiro o estado atual do repositório.

---

# 39. REGRA CONTRA INVENÇÃO

Quando faltar informação:

1. verificar o código existente;
2. verificar documentação;
3. verificar os arquivos do projeto;
4. verificar recursos disponíveis;
5. identificar explicitamente a lacuna;
6. somente então escolher uma solução compatível.

Não inventar requisitos de negócio.

Não inventar regras do edital.

Não criar funcionalidades apenas porque parecem interessantes.

---

# 40. REGRA DE ESCOPO

Se uma funcionalidade não estiver neste arquivo, no edital fornecido ou explicitamente solicitada pelo responsável pelo projeto, não assumir que ela deve ser implementada.

Perguntar ou sinalizar antes de expandir significativamente o escopo.

---

# 41. CÓDIGO

Preferir:

- nomes claros;
- funções pequenas;
- componentes coesos;
- tipos explícitos;
- baixo acoplamento;
- responsabilidade única;
- tratamento de erros;
- código legível.

Evitar:

- `any` sem justificativa;
- duplicação;
- arquivos gigantes;
- componentes monolíticos;
- lógica de negócio na UI;
- comentários explicando código óbvio;
- abstrações prematuras.

---

# 42. DOCUMENTAÇÃO

Manter documentação suficiente para que outro desenvolvedor consiga:

- instalar;
- executar;
- testar;
- entender a arquitetura;
- entender os mocks;
- compreender as regras;
- substituir mocks por API posteriormente.

---

# 43. REGRA FINAL

Este projeto deve ser tratado como software institucional real.

O objetivo não é produzir uma demonstração visual.

O objetivo é construir uma base frontend sólida, clara, testável, acessível, segura e preparada para integração com o backend real.