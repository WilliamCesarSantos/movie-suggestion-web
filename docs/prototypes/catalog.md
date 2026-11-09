# Catálogo

## Objetivo
Tela principal após o login. Exibe as recomendações personalizadas para o usuário autenticado em um grid de posters com scroll infinito. Hospeda o header global (logo, nome do usuário, logout) e o menu de navegação condicional por `roles` (ações administrativas aparecem apenas para quem tem permissão). O clique em um poster inicia a simulação de reprodução (ver `player-simulation.md`).

## Rota
`/catalog` — rota protegida. Sem token válido redireciona para `/login`.

Acesso ao catálogo exige uma das roles: `movies:read`, `movies:write` ou `*`. Caso o usuário autenticado não tenha nenhuma delas, redirecionar para `/forbidden` (stub) com mensagem "Você não tem permissão para acessar o catálogo."

## Dados da API
- `GET /api/v1/movies?limit=20&cursor=<opaque>` → `RecommendationsPageResponse`
  - **Campos consumidos do item (`MovieSummary`)**: `id`, `title`, `poster`.
  - **Campos consumidos da página**: `nextCursor`, `hasNext`.
  - `year` e `imdbRating` **não** são renderizados nesta iteração (ficam disponíveis para a tela de detalhes).
- O cliente usa `useInfiniteMovies` (`src/hooks/useInfiniteMovies.ts`) que já encapsula a paginação por cursor.
- O nome e as roles do usuário no header vêm de `useAuth()` — populados a partir de `LoginResponse` (`email`, `roles`) persistido na sessão.

### Enum de roles consumidas
Referência: `components.schemas.Role` no `openapi.yml`. Valores possíveis:
- `*` — wildcard (tudo)
- `users:read`
- `users:write`
- `movies:read`
- `movies-watch:write`
- `movies:write`

### Role matrix (quem vê o quê)
| Item do menu | Roles que liberam |
|---|---|
| Catálogo (acesso à página) | `movies:read`, `movies:write`, `*` |
| Usuários > Listar | `users:read`, `users:write`, `*` |
| Usuários > Cadastrar | `users:write`, `*` |
| Usuários > Editar (link abre a tela que escolhe o usuário) | `users:write`, `*` |
| Filme > Importar (OMDB) | `movies:write`, `*` |
| Avaliar filme (ação do card → player) | `movies-watch:write`, `*` |

Função utilitária esperada (a ser implementada em `src/lib/roles.ts`):
```
hasRole(userRoles: string[], required: string[]): boolean
  → true se userRoles inclui "*" OU se userRoles tem interseção com required
```

A lista do menu é construída declarativamente:
```
const MENU = [
  { label: "Catálogo",             to: "/catalog",         required: ["movies:read", "movies:write"] },
  { label: "Usuários > Listar",    to: "/users",           required: ["users:read", "users:write"]  },
  { label: "Usuários > Cadastrar", to: "/users/new",       required: ["users:write"]                },
  { label: "Usuários > Editar",    to: "/users",           required: ["users:write"]                },
  { label: "Filme > Importar",     to: "/movies/import",   required: ["movies:write"]               },
];
```
O componente `Menu` filtra `MENU` com `hasRole(user.roles, item.required)` antes de renderizar. Wildcard `*` sempre passa.

> **Exemplo de leitura literal**: *"Se `roles` inclui `'users:read'` ou `'*'`, mostrar `'Usuários > Listar'`. Se inclui `'users:write'` ou `'*'`, mostrar `'Usuários > Cadastrar'` e `'Usuários > Editar'`. Se inclui `'movies:write'` ou `'*'`, mostrar `'Filme > Importar'`."*

> **Páginas secundárias (stubs nesta iteração)**: `/users`, `/users/new`, `/users/:id/edit` e `/movies/import` renderizam apenas um placeholder "Em breve". O foco desta iteração é o menu condicional, não o conteúdo.

## Wireframe (desktop ≥ 1024px)
```
+----------------------------------------------------------------------------------+
| MOVIE SUGGEST   [ Catálogo | Usuários v | Filme v ]        Olá, William  [Sair]  |
+----------------------------------------------------------------------------------+
|                                                                                  |
|  Recomendados para você                                                          |
|                                                                                  |
|  +--------+  +--------+  +--------+  +--------+  +--------+  +--------+          |
|  |        |  |        |  |        |  |        |  |        |  |        |         |
|  | poster |  | poster |  | poster |  | poster |  | poster |  | poster |         |
|  |        |  |        |  |        |  |        |  |        |  |        |         |
|  +--------+  +--------+  +--------+  +--------+  +--------+  +--------+         |
|   Matrix     Inception   Interstlr   Arrival    Dune        Tenet              |
|                                                                                  |
|  +--------+  +--------+  +--------+  +--------+  +--------+  +--------+         |
|  |        |  |        |  |        |  |        |  |        |  |        |         |
|  | poster |  | poster |  | poster |  | poster |  | poster |  | poster |         |
|  |        |  |        |  |        |  |        |  |        |  |        |         |
|  +--------+  +--------+  +--------+  +--------+  +--------+  +--------+         |
|   Blade...   Prestige    Memento     Shutter...  Oppenh...   Dunkirk            |
|                                                                                  |
|                       ... scroll infinito (sentinel) ...                         |
|                             [⟳ carregando mais...]                               |
|                                                                                  |
|            ====  "Não há mais filmes para exibir"  ==== (quando hasNext=false)   |
+----------------------------------------------------------------------------------+
|                           fundo #0b0b0f                                          |
|                           card/surface #17171d                                   |
|                           accent #e50914 (links ativos, botões)                  |
+----------------------------------------------------------------------------------+
```

Detalhamento do **menu** em desktop:
- O header ocupa a largura total, altura fixa `h-16`, `sticky top-0 z-20`, com `bg-[#17171d]/90 backdrop-blur`.
- Ordem esquerda → direita: logo | separador | links principais (horizontal) | spacer | nome do usuário | botão "Sair".
- Dropdowns ("Usuários v", "Filme v") são `<button>` com `aria-haspopup="menu"` + `aria-expanded`. Abrem um painel absoluto com os sub-itens que o usuário tem permissão. Se **nenhum** sub-item passar no filtro de role, o grupo inteiro (ex.: "Usuários v") **não é renderizado**.

Detalhamento do **grid**:
- Container `max-w-[1280px] mx-auto px-6`.
- Grid `grid grid-cols-6 gap-4` em desktop.
- Cada card: `aspect-[2/3]` com `rounded-lg overflow-hidden`, poster como `<img>` cobrindo (`object-cover w-full h-full`), título em `<p class="mt-2 text-sm text-neutral-200 line-clamp-1">`.
- Hover (desktop): `scale-[1.03]` com `transition` e overlay escuro + ícone de play central.

## Wireframe (tablet 640–1024px)
```
+-------------------------------------------------------------+
| MOVIE SUGGEST  [☰]              Olá, William    [Sair]      |
+-------------------------------------------------------------+
|                                                             |
|  Recomendados para você                                     |
|                                                             |
|  +-------+  +-------+  +-------+  +-------+                 |
|  |       |  |       |  |       |  |       |                |
|  | post. |  | post. |  | post. |  | post. |                |
|  |       |  |       |  |       |  |       |                |
|  +-------+  +-------+  +-------+  +-------+                |
|   Matrix     Inception  Intstlr    Arrival                  |
|                                                             |
|  +-------+  +-------+  +-------+  +-------+                 |
|   Dune       Tenet      Blade...   Prestige                 |
|                                                             |
|                   [⟳ carregando mais...]                    |
+-------------------------------------------------------------+
```

## Wireframe (mobile < 640px)
```
+--------------------------+
| LOGO     [☰]             |
+--------------------------+
| Olá, William    [Sair]   |
+--------------------------+
|                          |
| Recomendados para você   |
|                          |
| +--------+  +--------+   |
| |        |  |        |   |
| | poster |  | poster |   |
| |        |  |        |   |
| +--------+  +--------+   |
|  Matrix      Inception   |
|                          |
| +--------+  +--------+   |
| |        |  |        |   |
| | poster |  | poster |   |
| |        |  |        |   |
| +--------+  +--------+   |
|  Intstlr     Arrival     |
|                          |
|    [⟳ carregando...]     |
|                          |
+--------------------------+
```

Em mobile, `[☰]` abre um **drawer** lateral (slide-in da esquerda, `w-72`) com os mesmos itens de menu condicionais:
```
+------------------+------------+
|  MOVIE SUGGEST   |     [x]    |
+------------------+------------+
|  Catálogo                     |
|  ─────────────                |
|  Usuários                     |
|    · Listar                   |
|    · Cadastrar                |
|    · Editar                   |
|  ─────────────                |
|  Filme                        |
|    · Importar                 |
+------------------------------+
|  Sair                         |
+------------------------------+
```
(itens aparecem/somem conforme as roles do usuário autenticado.)

## Estados

### 1. loading-initial (sem dados)
```
+----------------------------------------------------------------------------------+
| MOVIE SUGGEST   [ Catálogo ]                          Olá, William  [Sair]       |
+----------------------------------------------------------------------------------+
|  Recomendados para você                                                          |
|                                                                                  |
|  +--------+  +--------+  +--------+  +--------+  +--------+  +--------+          |
|  |▒▒▒▒▒▒▒▒|  |▒▒▒▒▒▒▒▒|  |▒▒▒▒▒▒▒▒|  |▒▒▒▒▒▒▒▒|  |▒▒▒▒▒▒▒▒|  |▒▒▒▒▒▒▒▒|         |
|  |▒ skel ▒|  |▒ skel ▒|  |▒ skel ▒|  |▒ skel ▒|  |▒ skel ▒|  |▒ skel ▒|         |
|  |▒▒▒▒▒▒▒▒|  |▒▒▒▒▒▒▒▒|  |▒▒▒▒▒▒▒▒|  |▒▒▒▒▒▒▒▒|  |▒▒▒▒▒▒▒▒|  |▒▒▒▒▒▒▒▒|         |
|  +--------+  +--------+  +--------+  +--------+  +--------+  +--------+         |
|  ▒▒▒▒▒▒     ▒▒▒▒▒▒     ▒▒▒▒▒▒     ▒▒▒▒▒▒     ▒▒▒▒▒▒     ▒▒▒▒▒▒                |
|  (12 skeletons pulsando — animate-pulse)                                        |
+----------------------------------------------------------------------------------+
```
- 12 cards skeleton (`bg-neutral-800 animate-pulse`) com a mesma razão de aspecto dos reais, mais barrinha curta para o título.
- Nenhum CTA, nenhum spinner — o skeleton é o indicador.
- `aria-busy="true"` no container do grid.

### 2. error (falha na primeira chamada)
```
+----------------------------------------------------------------------------------+
| MOVIE SUGGEST   [ Catálogo ]                          Olá, William  [Sair]       |
+----------------------------------------------------------------------------------+
|                                                                                  |
|                        +-------------------------------+                         |
|                        | ! Não foi possível carregar   |                         |
|                        |   as recomendações.           |                         |
|                        |                               |                         |
|                        |     [ Tentar novamente ]      |                         |
|                        +-------------------------------+                         |
|                                                                                  |
+----------------------------------------------------------------------------------+
```
- Container `role="alert"` centralizado, ícone de alerta + mensagem + botão de retry.
- Mapeamento de mensagens (nunca expor detalhes técnicos):
  - `401` → **não exibir aqui**; o interceptor já desloga e manda para `/login`.
  - `400` ("invalid cursor") → recomeça do zero automaticamente (resetar cursor para `undefined`). Se persistir, cair no genérico.
  - `500` / falha de rede → "Não foi possível carregar as recomendações. Tente novamente em instantes."
- Botão "Tentar novamente" chama `refetch()`.

### 3. empty (200 com `data: []` e `hasNext=false`)
```
+----------------------------------------------------------------------------------+
| MOVIE SUGGEST   [ Catálogo ]                          Olá, William  [Sair]       |
+----------------------------------------------------------------------------------+
|                                                                                  |
|                        +-------------------------------+                         |
|                        |     Nenhum filme ainda.       |                         |
|                        |                               |                         |
|                        |  Peça ao administrador para   |                         |
|                        |  importar títulos no sistema. |                         |
|                        +-------------------------------+                         |
|                                                                                  |
+----------------------------------------------------------------------------------+
```
- Mensagem centralizada, sem botão de retry (não é erro).
- Se o usuário tiver `movies:write` ou `*`, exibir CTA secundário `[ Importar filmes ]` que leva a `/movies/import`.

### 4. success (grid populado, `hasNext=true`)
Wireframe idêntico ao principal (acima). Scroll até o final dispara `fetchNextPage()` via `IntersectionObserver` em uma `<div ref={sentinelRef} />` posicionada depois do último card.

### 5. loading-next-page (paginação em andamento)
```
|  +--------+  +--------+  +--------+  +--------+  +--------+  +--------+   |
|  | poster |  | poster |  | poster |  | poster |  | poster |  | poster |  |
|  +--------+  +--------+  +--------+  +--------+  +--------+  +--------+  |
|                                                                           |
|                        [⟳  Carregando mais...]                            |
|                                                                           |
+---------------------------------------------------------------------------+
```
- Spinner (`<Spinner />`) + texto discreto em `text-neutral-400`.
- Apenas 1 fetch simultâneo — enquanto `isFetchingNextPage=true`, o sentinel não dispara outro.
- Linha com `role="status"` e `aria-live="polite"` para leitores de tela.

### 6. end-of-list (`hasNext=false` depois de pelo menos 1 página)
```
|  +--------+  +--------+  +--------+                                       |
|  | poster |  | poster |  | poster |                                       |
|  +--------+  +--------+  +--------+                                       |
|                                                                           |
|          ======  Não há mais filmes para exibir  ======                   |
|                                                                           |
+---------------------------------------------------------------------------+
```
- Mensagem **exatamente** `"Não há mais filmes para exibir"` (literal, sem ponto final, sem variação) para satisfazer o acceptance criteria.
- Renderizada em `<p class="text-center text-neutral-500 py-8">` com `role="status"`.
- Nenhum novo `fetchNextPage` é disparado (`enabled: hasNext`).

### 7. error-next-page (sucesso inicial, falha ao buscar mais)
```
|  +--------+  +--------+  +--------+  +--------+                           |
|  | poster |  | poster |  | poster |  | poster |                           |
|  +--------+  +--------+  +--------+  +--------+                           |
|                                                                           |
|          ! Falha ao carregar mais.  [ Tentar novamente ]                  |
|                                                                           |
+---------------------------------------------------------------------------+
```
- Preserva os itens já carregados (não limpa o grid).
- Botão chama `fetchNextPage()` novamente.

## Interações
- **Hover em card (desktop)**: leve zoom + overlay escuro + ícone de play.
- **Clique em card**: abre o modal `PlayerSimulation` (ver `player-simulation.md`) com o `id` e `title` do filme. O usuário sem role `movies-watch:write` (nem `*`) **não** vê o ícone de play no hover e o clique mostra toast "Você não tem permissão para avaliar filmes." — a listagem continua acessível.
- **Scroll até 90% da altura visível do grid**: `IntersectionObserver` dispara `fetchNextPage()` enquanto `hasNext === true && !isFetchingNextPage`.
- **Pull-to-refresh (mobile)**: não suportado nesta iteração (deixar como follow-up).
- **Clique em "Sair"**: chama `useAuth().logout()`, limpa token (`storage.clearToken()`), redireciona para `/login` com `replace`.
- **Clique em item de menu**: navega para a rota correspondente (`/users`, `/users/new`, `/movies/import`, etc.). Rotas protegidas verificam role de novo no mount (defesa em profundidade).
- **Drawer mobile**: clique no `[☰]` abre; clique no backdrop ou no `[x]` fecha; `Esc` também fecha; foco é movido para o primeiro item ao abrir.
- **Dropdown desktop**: abre no clique (não hover) para funcionar em teclado/touch; `Esc` fecha; foco retorna ao botão de abertura.

## Responsividade
- `< 640px` (mobile): grid 2 colunas, header compacto (logo + `☰` + nome truncado + Sair), menu em drawer lateral.
- `640–1024px` (tablet): grid 4 colunas, mesmo header do mobile (menu continua no drawer até o espaço crescer).
- `> 1024px` (desktop): grid 6 colunas, menu horizontal inline com dropdowns.
- Mobile-first: classes base para mobile, prefixos `sm:` / `md:` / `lg:` para refinar.

## Acessibilidade
- Cada `<img>` do card com `alt={movie.title}`.
- Botão "Sair" com `aria-label="Sair da conta"`.
- Dropdowns do menu com `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`.
- Drawer mobile com `role="dialog"` `aria-modal="true"` e focus trap.
- Grid com `role="list"` e cada card dentro de `role="listitem"`.
- Mensagem "Não há mais filmes para exibir" em `role="status"` `aria-live="polite"`.
- Erro inicial em `role="alert"` `aria-live="assertive"`.
- Foco visível em todos os elementos interativos: `focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none`.
- Contraste mínimo WCAG AA: texto `text-neutral-200` sobre `#0b0b0f` → > 12:1.
- Ordem de tab lógica: logo → links do menu (filtrados) → nome → Sair → primeiro card → ... → sentinel.
- Navegação por teclado no grid: `Tab` percorre cards; `Enter`/`Space` ativa o card (abre o player).

## Componentes reutilizáveis sugeridos
- `Header` (logo + nome + botão Sair) — reusado em todas as rotas autenticadas.
- `Menu` (desktop inline + mobile drawer, recebe `items: MenuItem[]` já filtrados por role).
- `MovieCard` (poster + título, estados hover/disabled).
- `Skeleton` genérico para os cards.
- `EmptyState` e `ErrorState` (compartilháveis com outras listagens).
- `hasRole(userRoles, required)` em `src/lib/roles.ts`.
- `useInfiniteMovies` (já existe) — a página consome `data`, `fetchNextPage`, `hasNextPage`, `isLoading`, `isFetchingNextPage`, `isError`, `refetch`.

## Notas
- `/login` continua sendo porta de entrada; o catálogo é a primeira tela autenticada.
- A tela de detalhes (`/movies/:id`) **não** é desta iteração — o fluxo sai do card direto para `PlayerSimulation` e depois `/movies/:id/rate`.
- A role `movies-watch:write` controla apenas a avaliação, não o acesso à listagem. Um usuário com só `movies:read` vê o catálogo, mas não consegue iniciar o player.
