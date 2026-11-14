# Usuários (listagem, cadastro e edição)

## Objetivo
Permitir que administradores listem usuários (paginação por página), cadastrem novos usuários e editem usuários existentes (nome, senha e roles, respeitando regras de ownership). O menu "Usuário" deixa de ter 3 ações (Listar/Cadastrar/Editar) e passa a ter **uma única entrada: "Usuários"** (link para `/users`). Cadastrar e Editar são alcançados a partir da listagem.

## Rotas
| Rota | Tela | Roles que liberam |
|---|---|---|
| `/users` | Listagem | `users:read`, `users:write`, `*` |
| `/users/new` | Formulário de cadastro | `users:write`, `*` |
| `/users/:id/edit` | Formulário de edição | `users:write`, `*` |

Todas protegidas por token. Sem role -> `/forbidden` (defesa em profundidade, mesmo que o menu já oculte).

## Role matrix
| Elemento | `*` | `users:write` | `users:read` (puro) | outras |
|---|---|---|---|---|
| Entrada "Usuários" no menu | sim | sim | sim | não |
| Rota `/users` | sim | sim | sim | não (-> `/forbidden`) |
| Botão "Novo usuário" (topo direito) | sim | sim | **oculto** | n/a |
| Ícone editar na linha | sim | sim | **oculto** | n/a |
| Coluna "Ações" | sim | sim | **não renderizada** | n/a |
| Rota `/users/new` | sim | sim | não (-> `/forbidden`) | não |
| Rota `/users/:id/edit` | sim | sim | não (-> `/forbidden`) | não |

Observações:
- `hasRole(userRoles, ["users:write"])` já retorna true para `*`.
- **users:read puro**: o backend devolve apenas o próprio registro, então a lista terá 1 linha e `total = 1`. Mostrar aviso discreto acima da tabela: "Você tem permissão somente de leitura. Exibindo apenas o seu usuário." (exibir quando o usuário não tem `users:write` nem `*`).
- Menu declarativo (substitui as 3 entradas anteriores):
```
{ label: "Usuários", to: "/users", required: ["users:read", "users:write"] }
```

## Dados da API
- `GET /api/v1/users?name=&email=&page=&pageSize=20` -> `ListUsersResponse`
  - Paginação por **página 1-based** (NÃO cursor; não usar `useInfiniteQuery`, usar `useQuery` com `page` na key e `placeholderData: keepPreviousData`).
  - Item (`ListUsersItem`): `id`, `name`, `email`, `roles[]`, `createdAt`.
  - Página: `total`, `page`, `pageSize`. Total de páginas = `ceil(total / pageSize)`.
  - Filtros `name` e `email`: um único campo de busca "Buscar por nome ou e-mail" é **fora do escopo** (a API filtra por campos separados, AND). Nesta iteração: dois inputs opcionais (Nome, E-mail) com debounce 300 ms; ao mudar filtro, volta para `page=1`.
- `POST /api/v1/users` -> `CreateUserResponse` (201). Body `CreateUserRequest`: `name`, `email`, `password`, `roles[]` (todos obrigatórios).
- `GET /api/v1/users/{id}` -> `User`. **Atenção: chaves capitalizadas** (`ID`, `Name`, `Email`, `CreatedAt`) e **não retorna `roles`**. Exige ownership ou `*`, portanto pode dar 403 para `users:write` não-owner.
- `PATCH /api/v1/users/{id}` -> `PatchUserResponse`. Body parcial (`PatchUserRequest`): `name`, `password` (min 6), `roles[]` (enum: `users:read`, `users:write`, `movies:read`, `movies-watch:write`, `movies:write`). Enviar **apenas campos alterados**; ao menos um campo.
  - Owner (id do token == `:id`): pode alterar `name`, `password`, `roles`.
  - Não-owner: apenas `roles`; enviar `name`/`password` retorna 403.
- Roles do usuário logado vêm de `useAuth()`; o id do usuário logado vem do JWT (`sub`) / sessão, usado para decidir ownership.

### Estratégia de pré-carga na edição (decisão não trivial)
- `GET /users/{id}` não traz `roles` e pode ser 403 para não-owner. Portanto:
  1. Ao clicar no ícone de editar, navegar com `state: { user: ListUsersItem }` e/ou ler do cache do TanStack Query (`['users', page]`). Pré-preenche `name`, `email`, `roles` sem request.
  2. Acesso direto (F5/URL colada, sem state nem cache): fazer `GET /users?email=` não é possível sem o e-mail; então usar `GET /users/{id}` para obter `Name`/`Email` e, em seguida, `GET /users?email=<Email>&pageSize=1` e localizar o item com `id` igual para obter `roles`. Se o detalhe der 403 (não-owner), voltar para `/users` com toast "Abra a edição a partir da listagem."
  3. Nunca inventar endpoint; só os acima.
- Rota de edição também deve funcionar quando `GET` falhar com 404 -> estado "Usuário não encontrado".

## Wireframe: listagem (desktop >= 1024px), com `users:write` ou `*`
```
+----------------------------------------------------------------------------------+
| MOVIE SUGGEST  [ Catálogo | Usuários | Filme v ]              Olá, William [Sair] |
+----------------------------------------------------------------------------------+
|                                                                                  |
|  Usuários                                              [ + Novo usuário ]        |
|  Gerencie contas e permissões                                                    |
|                                                                                  |
|  Nome [____________________]   E-mail [____________________]  [Limpar]           |
|                                                                                  |
|  +----------------------------------------------------------------------------+  |
|  | Nome         | E-mail                | Roles                    | Criado em | Ações |
|  +----------------------------------------------------------------------------+  |
|  | Alice        | alice@example.com     | [users:read] [movies:read]| 30/05/26 | [✎]  |
|  | Bob          | bob@example.com       | [*]                       | 28/05/26 | [✎]  |
|  | Carol        | carol@example.com     | [movies:read] +2          | 27/05/26 | [✎]  |
|  | ...          |                       |                           |          |      |
|  +----------------------------------------------------------------------------+  |
|                                                                                  |
|  Exibindo 1-20 de 42            [ < Anterior ]  Página 1 de 3  [ Próxima > ]     |
+----------------------------------------------------------------------------------+
```
- Título à esquerda e botão `+ Novo usuário` (accent `#e50914`) alinhado ao **canto superior direito** do conteúdo, na mesma linha do título.
- Ícone `[✎]` (lápis) é o **último elemento da linha**, na coluna "Ações" alinhada à direita. `aria-label="Editar usuário <name>"`, `title="Editar"`. Navega para `/users/:id/edit`.
- Roles em chips (`bg-neutral-800 text-xs rounded`); mais de 2 -> `+N` com `title` listando todas.
- Datas formatadas `dd/MM/yy` (pt-BR).

## Wireframe: listagem somente leitura (`users:read` puro)
```
+----------------------------------------------------------------------------------+
| MOVIE SUGGEST  [ Catálogo | Usuários ]                     Olá, Ana     [Sair]   |
+----------------------------------------------------------------------------------+
|  Usuários                                                                        |
|                                                                                  |
|  (i) Você tem permissão somente de leitura. Exibindo apenas o seu usuário.       |
|                                                                                  |
|  +----------------------------------------------------------------------------+  |
|  | Nome         | E-mail                | Roles                     | Criado em  |  |
|  +----------------------------------------------------------------------------+  |
|  | Ana          | ana@example.com       | [users:read]              | 01/06/26   |  |
|  +----------------------------------------------------------------------------+  |
|                                                                                  |
|  Exibindo 1-1 de 1                                                               |
+----------------------------------------------------------------------------------+
```
- Sem botão "Novo usuário", sem coluna "Ações". Filtros e paginação ocultos quando `total <= pageSize` e usuário sem `users:write`/`*`.

## Wireframe: listagem (mobile < 640px)
Tabela vira lista de cards; o lápis fica ao final (direita) de cada card; o botão "Novo usuário" fica no topo direito, ao lado do título.
```
+--------------------------+
| LOGO     [☰]             |
+--------------------------+
| Olá, William    [Sair]   |
+--------------------------+
| Usuários  [+ Novo]       |
|                          |
| [Nome_________________]  |
| [E-mail_______________]  |
|                          |
| +----------------------+ |
| | Alice            [✎] | |
| | alice@example.com    | |
| | [users:read][movies..| |
| +----------------------+ |
| +----------------------+ |
| | Bob              [✎] | |
| | bob@example.com      | |
| | [*]                  | |
| +----------------------+ |
|                          |
| [< Ant.]  1/3  [Próx. >] |
+--------------------------+
```
- Em mobile o botão encurta para `[+ Novo]` com `aria-label="Novo usuário"`.
- Alvo de toque do lápis >= 44x44 px.

## Wireframe: formulário de cadastro (`/users/new`), desktop
```
+----------------------------------------------------------------------------------+
| MOVIE SUGGEST  [ Catálogo | Usuários | Filme v ]              Olá, William [Sair] |
+----------------------------------------------------------------------------------+
|  < Voltar para Usuários                                                          |
|                                                                                  |
|  Novo usuário                                                                    |
|                                                                                  |
|  +----------------------------------------------+                                |
|  | Nome *                                       |                                |
|  | [__________________________________________]|                                |
|  |                                              |                                |
|  | E-mail *                                     |                                |
|  | [__________________________________________]|                                |
|  |                                              |                                |
|  | Senha * (mínimo 6 caracteres)                |                                |
|  | [______________________________] [mostrar]   |                                |
|  |                                              |                                |
|  | Roles * (selecione ao menos uma)             |                                |
|  | [x] users:read          [ ] users:write      |                                |
|  | [x] movies:read         [ ] movies-watch:write|                               |
|  | [ ] movies:write                             |                                |
|  |                                              |                                |
|  |            [ Cancelar ]  [ Cadastrar ]       |                                |
|  +----------------------------------------------+                                |
+----------------------------------------------------------------------------------+
```
- Card `max-w-xl`, `bg-[#17171d]`. Roles como checkboxes agrupados em `<fieldset><legend>`.
- O wildcard `*` **não** é oferecido no formulário (não consta no enum do PATCH; atribuí-lo fica fora desta iteração).
- Default sugerido: `movies:read` marcado.
- Roles válidas no formulário: `users:read`, `users:write`, `movies:read`, `movies-watch:write`, `movies:write`.
- Validação client-side: nome obrigatório; e-mail formato válido; senha >= 6 (o contrato do POST não define mínimo, mas usamos o mesmo do PATCH por consistência); >= 1 role.

## Wireframe: formulário de edição (`/users/:id/edit`), desktop, usuário **owner** (editando a si mesmo)
```
+----------------------------------------------------------------------------------+
|  < Voltar para Usuários                                                          |
|                                                                                  |
|  Editar usuário                                                                  |
|                                                                                  |
|  +----------------------------------------------+                                |
|  | Nome                                         |                                |
|  | [William___________________________________]|                                |
|  |                                              |                                |
|  | E-mail (não pode ser alterado)               |                                |
|  | [william@example.com]  (desabilitado)        |                                |
|  |                                              |                                |
|  | Nova senha (opcional, mínimo 6)              |                                |
|  | [______________________________] [mostrar]   |                                |
|  | Deixe em branco para manter a atual.         |                                |
|  |                                              |                                |
|  | Roles                                        |                                |
|  | [x] users:read          [x] users:write      |                                |
|  | [x] movies:read         [x] movies-watch:write|                               |
|  | [ ] movies:write                             |                                |
|  |                                              |                                |
|  |            [ Cancelar ]  [ Salvar ]          |                                |
|  +----------------------------------------------+                                |
+----------------------------------------------------------------------------------+
```

## Wireframe: edição de **não-owner** (editando outro usuário)
```
|  Editar usuário                                                                  |
|                                                                                  |
|  (i) Você pode alterar apenas as roles deste usuário. Nome e senha só podem      |
|      ser alterados pelo próprio usuário.                                         |
|                                                                                  |
|  +----------------------------------------------+                                |
|  | Nome                                         |                                |
|  | [Alice]  (desabilitado)                      |                                |
|  | E-mail                                       |                                |
|  | [alice@example.com]  (desabilitado)          |                                |
|  | Nova senha                                   |                                |
|  | [__________]  (desabilitado)                 |                                |
|  |                                              |                                |
|  | Roles                                        |                                |
|  | [x] users:read          [ ] users:write      |                                |
|  | [x] movies:read         [ ] movies-watch:write|                               |
|  | [ ] movies:write                             |                                |
|  |            [ Cancelar ]  [ Salvar ]          |                                |
|  +----------------------------------------------+                                |
```
- Campos desabilitados usam `disabled` + `aria-disabled` + texto de ajuda; **nunca** são enviados no PATCH.
- E-mail é imutável em ambos os casos (PatchUserRequest não aceita `email`).
- `Salvar` desabilitado enquanto não houver alteração (form não "dirty"). Payload = diff dos campos alterados.

## Wireframe: formulário (mobile < 640px)
```
+--------------------------+
| LOGO     [☰]             |
+--------------------------+
| < Usuários               |
| Novo usuário             |
|                          |
| Nome *                   |
| [____________________]   |
| E-mail *                 |
| [____________________]   |
| Senha *                  |
| [_______________][olho]  |
| Roles *                  |
| [x] users:read           |
| [ ] users:write          |
| [x] movies:read          |
| [ ] movies-watch:write   |
| [ ] movies:write         |
|                          |
| [      Cadastrar       ] |
| [       Cancelar       ] |
+--------------------------+
```
- Botões em largura total, empilhados (primário primeiro).

## Estados

### Listagem: loading inicial
```
|  Usuários                                              [ + Novo usuário ]        |
|  +----------------------------------------------------------------------------+  |
|  | Nome         | E-mail                | Roles                    | Criado em | Ações |
|  | ▒▒▒▒▒▒▒▒     | ▒▒▒▒▒▒▒▒▒▒▒▒         | ▒▒▒▒▒▒▒▒                 | ▒▒▒▒▒▒   | ▒▒   |
|  | ▒▒▒▒▒▒▒▒     | ▒▒▒▒▒▒▒▒▒▒▒▒         | ▒▒▒▒▒▒▒▒                 | ▒▒▒▒▒▒   | ▒▒   |
|  | ▒▒▒▒▒▒▒▒     | ▒▒▒▒▒▒▒▒▒▒▒▒         | ▒▒▒▒▒▒▒▒                 | ▒▒▒▒▒▒   | ▒▒   |
|  +----------------------------------------------------------------------------+  |
```
- 8 linhas skeleton `animate-pulse`; `aria-busy="true"` na tabela. O botão "Novo usuário" já aparece (depende só de role).

### Listagem: troca de página (loading de página seguinte)
- Mantém dados anteriores visíveis (`keepPreviousData`) com `opacity-60` e botões de paginação desabilitados; `role="status"` "Carregando...".

### Listagem: vazio
```
|  +----------------------------------------------------------------------------+  |
|  |                     Nenhum usuário encontrado.                             |  |
|  |      (com filtro ativo)  Tente outros termos.  [ Limpar filtros ]          |  |
|  |      (sem filtro, com users:write)             [ + Novo usuário ]          |  |
|  +----------------------------------------------------------------------------+  |
```
- Sem paginação. Com filtros ativos mostra "Limpar filtros"; sem filtros e com `users:write`/`*` mostra CTA de cadastro.

### Listagem: erro
```
|                        +-------------------------------+                         |
|                        | ! Não foi possível carregar   |                         |
|                        |   os usuários.                |                         |
|                        |     [ Tentar novamente ]      |                         |
|                        +-------------------------------+                         |
```
- `role="alert"`; botão chama `refetch()`. `401` tratado pelo interceptor. `403` -> redireciona para `/forbidden`. `400` (filtro/página inválida) -> volta para `page=1`; persistindo, mensagem genérica.

### Listagem: sucesso
Wireframes principais acima. Botão "< Anterior" desabilitado na página 1; "Próxima >" desabilitado quando `page * pageSize >= total`. Se a página atual ficar vazia após exclusão/mudança (page > total de páginas), ir para a última página válida.

### Formulário: carregando dados (edição)
```
|  Editar usuário                                                                  |
|  +----------------------------------------------+                                |
|  | ▒▒▒▒▒▒▒▒▒▒▒▒                                 |                                |
|  | [▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒]          |                                |
|  | ▒▒▒▒▒▒▒▒▒▒▒▒                                 |                                |
|  | [▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒]          |                                |
|  +----------------------------------------------+                                |
```
- Só ocorre em acesso direto (sem state/cache).

### Formulário: enviando
- Botão primário vira `[ ⟳ Salvando... ]` (ou "Cadastrando..."), todos os campos e Cancelar desabilitados, `aria-busy="true"`.

### Formulário: erro 400 (validação)
```
|  | Nome *                                       |                                |
|  | [__________________________________________]|                                |
|  | ! O nome é obrigatório.                      |                                |
|  | Senha *                                      |                                |
|  | [***]                                        |                                |
|  | ! A senha deve ter no mínimo 6 caracteres.   |                                |
```
- Erros inline sob cada campo (`aria-invalid="true"`, `aria-describedby`), foco vai para o primeiro campo inválido. 400 do servidor sem campo identificável -> banner `role="alert"` "Dados inválidos. Revise os campos e tente novamente."

### Formulário: erro 409 (e-mail já existe, só no cadastro)
```
|  | E-mail *                                     |                                |
|  | [alice@example.com_________________________]|                                |
|  | ! Este e-mail já está cadastrado.            |                                |
```
- Erro inline no campo E-mail; dados preservados; foco no campo.

### Formulário: erro 403
```
|  +----------------------------------------------------------+                    |
|  | ! Você não tem permissão para realizar esta ação.        |                    |
|  +----------------------------------------------------------+                    |
```
- Banner `role="alert"` acima do formulário. Caso especial (PATCH não-owner com name/password): não deve ocorrer pois os campos estão desabilitados; se ocorrer, mesma mensagem. Na rota de edição, 403 no carregamento -> toast e volta para `/users`.

### Formulário: 404 (edição) e 500
- 404: card "Usuário não encontrado." com `[ Voltar para Usuários ]`.
- 500/rede: banner `role="alert"` "Não foi possível salvar. Tente novamente em instantes." com os dados preservados.

### Formulário: sucesso
- Cadastro 201: navega para `/users` com toast "Usuário cadastrado com sucesso." e invalida `['users']`.
- Edição 200: navega para `/users` com toast "Usuário atualizado com sucesso." e invalida `['users']`.
- Se o usuário editado for o próprio logado e as roles mudarem, avisar: "Suas permissões mudam no próximo login." (o token atual não é reemitido).

## Interações
- Menu "Usuários": clique navega para `/users` (item simples, sem dropdown).
- Botão `+ Novo usuário`: navega para `/users/new`.
- Ícone `[✎]`: navega para `/users/:id/edit` (com `state.user`).
- Linha inteira **não** é clicável (evita edição acidental); só o ícone.
- Filtros: debounce 300 ms, reset para `page=1`; filtros e página refletidos na query string (`/users?page=2&name=ali`) para permitir voltar/compartilhar.
- Anterior/Próxima: alteram `page`; scroll volta ao topo da tabela.
- Formulário: `Enter` envia; `Esc` não fecha; "Cancelar" e "< Voltar" voltam para `/users`. Se form sujo, confirmar "Descartar alterações?".
- Botão "mostrar" alterna tipo do campo senha (`aria-pressed`).
- Hover na linha: `bg-neutral-800/50`; hover no lápis: `text-white` + `bg-neutral-700`.

## Responsividade
- `< 640px`: lista em cards, filtros empilhados, botão `[+ Novo]` compacto no topo direito, formulário em largura total, botões empilhados.
- `640-1024px`: tabela com colunas Nome, E-mail, Roles, Ações (esconder "Criado em"); menu em drawer.
- `> 1024px`: tabela completa, menu inline.
- Menu mobile (drawer) passa a ter item simples:
```
+------------------+------------+
|  MOVIE SUGGEST   |     [x]    |
+------------------+------------+
|  Catálogo                     |
|  Usuários                     |
|  ─────────────                |
|  Filme                        |
|    · Importar                 |
+------------------------------+
|  Sair                         |
+------------------------------+
```

## Acessibilidade
- Tabela semântica (`<table>`, `<th scope="col">`); em mobile, `role="list"` nos cards.
- Ícone editar: `<button>`/`<a>` com `aria-label="Editar usuário <name>"`; ícone SVG `aria-hidden="true"`.
- Botão novo usuário com texto visível (`aria-label="Novo usuário"` na versão compacta).
- Paginação em `<nav aria-label="Paginação de usuários">`; página atual com `aria-current="page"`.
- Labels associados (`<label htmlFor>`), erros com `aria-describedby`, `role="alert"` para banners, roles em `<fieldset>/<legend>`.
- Foco visível `focus-visible:ring-2 focus-visible:ring-red-500`; foco inicial no primeiro campo do formulário.
- Contraste AA: chips `text-neutral-200` sobre `bg-neutral-800`; erros em `text-red-400` sobre `#17171d`.

## Componentes reutilizáveis sugeridos
`Header`, `Menu` (atualizar para item único "Usuários"), `EmptyState`, `ErrorState`, `Skeleton`, `Pagination` (page-based), `RoleChips`, `UserForm` (modo `create` | `edit`, compartilhado por `/users/new` e `/users/:id/edit`), `useUsers(page, filters)`, `useCreateUser`, `useUpdateUser`.

## Notas
- Os stubs atuais `UsersListPage` e `UserFormPage` serão substituídos.
- A senha nunca é logada nem exibida em toasts.
- Exclusão de usuário e atribuição de `*` não fazem parte desta iteração (não há endpoint/enum correspondente). A UI nunca oferece `*` como opção atribuível; ver decisão abaixo sobre preservação.

## Decisões registradas (pós-implementação)

### Wildcard `*` é preservado ao salvar e não pode ser removido pela UI
- Se o usuário editado possui a role `*`, ela é mantida no array `roles` enviado no `PATCH /api/v1/users/{id}`, mesmo que o usuário altere as demais roles.
- O `*` não aparece como checkbox no fieldset de roles; portanto não pode ser marcado nem desmarcado pela UI. Também não pode ser adicionado a quem não o tem.
- O formulário exibe o aviso "Roles especiais mantidas ao salvar" quando o usuário editado possui roles não gerenciáveis pela UI (hoje, `*`).
- Implementação de referência: `src/components/UserForm/UserForm.tsx`, `src/components/UserForm/RolesFieldset.tsx`, `src/pages/UserEditPage.tsx`.

### Edição por acesso direto: usuário não encontrado
- Ao acessar `/users/:id/edit` sem `state.user`, a página busca via `GET /users?email=`. Se nenhum usuário for encontrado, exibe o erro específico "Usuário não encontrado." (mesmo card do 404, com `[ Voltar para Usuários ]`).

### Toast de sucesso é consumido uma única vez
- O toast recebido via `location.state` na listagem é lido e limpo do `location.state` após exibido, para não reaparecer ao recarregar a página.

### Pontos em aberto
- O enum de `roles` do `PATCH /api/v1/users/{id}` em `openapi.yml` não inclui `*`. Como o `*` preservado é reenviado, o backend pode rejeitar a requisição com 400. A confirmar com o backend (ajustar o enum no contrato ou deixar de enviar o `*`).
