# Feature Specification: Login Screen

**Feature Branch**: `[001-login-screen]`  
**Created**: 2026-06-13  
**Status**: Draft  
**Input**: User description: "crie um tela de login"

## Clarifications

### Session 2026-06-15

- Q: Após login bem-sucedido, para onde o usuário é redirecionado? → A: Rota de listagem de filmes (`/movies`).
- Q: Onde os dados de sessão retornados pelo login devem ser armazenados? → A: `localStorage` — persiste entre recarregamentos e abas.
- Q: O que acontece quando o usuário tenta submeter com campos obrigatórios vazios? → A: Bloquear submit + exibir erro inline abaixo de cada campo vazio, sem chamar a API.
- Q: Quando a API de login está indisponível (rede ou 5xx), como o erro deve ser exibido? → A: Banner de erro genérico no topo do formulário, campos preservados.
- Q: Quando a resposta da API chega sem os campos esperados (`token`, `roles`, `expiresAt`), como o sistema deve reagir? → A: Tratar como falha — exibir banner de erro genérico, não redirecionar.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Login With Valid Credentials (Priority: P1)

Como usuario, quero informar e-mail e senha para entrar na aplicacao e acessar funcionalidades autenticadas.

**Why this priority**: Sem autenticacao funcional, o usuario nao consegue iniciar a jornada principal no produto.

**Independent Test**: Pode ser testado isoladamente ao informar credenciais validas e confirmar que o sistema retorna estado de acesso concedido.

**Acceptance Scenarios**:

1. **Given** que o usuario esta na tela de login, **When** ele informa e-mail e senha validos e envia, **Then** o sistema confirma login bem-sucedido e redireciona o usuario para a tela de listagem de filmes (`/movies`).
2. **Given** que o login foi bem-sucedido, **When** a resposta de autenticacao chega, **Then** os dados de sessao do usuario ficam disponiveis para uso na aplicacao.

---

### User Story 2 - Handle Invalid Credentials (Priority: P2)

Como usuario, quero receber uma mensagem clara quando minhas credenciais estiverem incorretas para corrigir e tentar novamente.

**Why this priority**: Evita abandono por erro silencioso e reduz friccao no processo de autenticacao.

**Independent Test**: Pode ser testado isoladamente ao submeter credenciais invalidas e verificar exibicao de erro amigavel sem travar a tela.

**Acceptance Scenarios**:

1. **Given** que o usuario envia credenciais invalidas, **When** o sistema recebe resposta de falha de autenticacao, **Then** uma mensagem clara e acionavel e exibida.
2. **Given** que houve falha anterior, **When** o usuario corrige os dados e envia novamente, **Then** o sistema permite nova tentativa normalmente.

---

### User Story 3 - Prevent Duplicate Submissions (Priority: P3)

Como usuario, quero ver que o login esta em processamento para evitar multiplos envios acidentais.

**Why this priority**: Melhora experiencia e previne chamadas duplicadas desnecessarias.

**Independent Test**: Pode ser testado ao enviar o formulario e verificar estado visual de processamento com bloqueio de envio duplicado.

**Acceptance Scenarios**:

1. **Given** que o formulario foi enviado, **When** a solicitacao ainda esta em andamento, **Then** o botao de envio fica temporariamente indisponivel e o estado de carregamento e exibido.

### Edge Cases

- **Campos vazios ao submeter**: Submit bloqueado client-side; erro inline exibido abaixo de cada campo vazio. Nenhuma chamada à API é feita.
- **API indisponível (rede / 5xx)**: Banner de erro genérico exibido no topo do formulário; campos e e-mail/senha preservados para nova tentativa.
- **Resposta da API incompleta** (campos `token`, `roles` ou `expiresAt` ausentes): Tratado como falha — banner de erro genérico exibido, usuário não é redirecionado, sessão não é persistida.
- O que acontece se o usuario clicar varias vezes em enviar muito rapido?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST exibir uma tela de login simples com campos de e-mail e senha.
- **FR-002**: O sistema MUST validar obrigatoriedade dos campos antes de enviar a solicitacao: se algum campo estiver vazio ao submeter, o submit e bloqueado e uma mensagem de erro e exibida inline abaixo do campo correspondente, sem realizar chamada a API.
- **FR-003**: O usuario MUST poder submeter o formulario de login via acao explicita de envio.
- **FR-004**: O sistema MUST enviar credenciais para o endpoint de autenticacao `/api/v1/login`.
- **FR-005**: O sistema MUST informar sucesso de autenticacao quando a API retornar resposta positiva e redirecionar automaticamente o usuario para a rota `/movies`.
- **FR-006**: O sistema MUST exibir erro claro quando a autenticacao falhar por credenciais invalidas.
- **FR-007**: O sistema MUST exibir um banner de erro generico no topo do formulario quando ocorrer falha de rede ou indisponibilidade de servico (5xx), preservando os dados ja preenchidos nos campos.
- **FR-008**: O sistema MUST impedir envio duplicado enquanto a solicitacao estiver em andamento.
- **FR-009**: O sistema MUST disponibilizar os dados de autenticacao retornados (`token`, `email`, `roles`, `expiresAt`) para etapas posteriores da aplicacao, persistindo-os em `localStorage`. Se qualquer campo obrigatorio (`token`, `roles`, `expiresAt`) estiver ausente na resposta, o sistema MUST tratar como falha: exibir banner de erro generico e nao redirecionar.
- **FR-010**: O sistema MUST alinhar os dados de entrada e saida ao contrato oficial de API publicado para autenticacao.

### Key Entities *(include if feature involves data)*

- **Login Credentials**: Dados de entrada de autenticacao contendo e-mail e senha informados pelo usuario.
- **Login Session**: Dados retornados apos autenticacao (`token`, `email`, `roles`, `expiresAt`). Persistidos em `localStorage` para uso em rotas protegidas e chamadas autenticadas subsequentes.
- **Login Feedback State**: Estado de interface que representa carregamento, sucesso e erro no processo de login.

## Technical Constraints *(mandatory)*

- A implementacao MUST seguir os padroes aprovados na constituicao do projeto.
- A arquitetura MUST manter separacao clara entre apresentacao e integracoes externas.
- A estrutura de pastas MUST permanecer simples e modular.
- A solucao MUST priorizar legibilidade para perfil backend senior em aprendizado de frontend.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% das tentativas com credenciais validas finalizam com confirmacao de sucesso em ate 3 segundos em condicoes normais de rede.
- **SC-002**: 100% das tentativas com credenciais invalidas exibem mensagem de erro compreensivel sem recarregar a pagina.
- **SC-003**: 100% das tentativas durante estado de carregamento bloqueiam novo envio ate o termino da requisicao.
- **SC-004**: Pelo menos 90% dos usuarios conseguem concluir o login na primeira tentativa quando possuem credenciais validas.

## Assumptions

- O endpoint `/api/v1/login` ja esta disponivel e segue o contrato OpenAPI informado.
- A autenticacao inicial desta feature usa apenas e-mail e senha (sem MFA nesta entrega).
- Persistencia de sessao alem do estado imediato de login sera tratada em feature posterior.
- A tela de login e o primeiro ponto de entrada para usuarios nao autenticados.
