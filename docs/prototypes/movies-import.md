# Importar filmes

## Objetivo
Permitir que quem tem permissão de escrita em filmes dispare a importação de títulos do OMDB digitando um termo de busca por linha. A tela é simples e direta: um textarea, um contador de termos válidos e um botão. A importação é **assíncrona** (202): a tela só confirma que o pedido foi aceito; os filmes aparecem no catálogo depois do processamento.

## Rota
`/movies-import` — rota protegida. Sem token -> `/login`. Sem role -> `/forbidden`.

### Decisão de rota
Usamos `/movies-import` (e não `/movies/import`) porque:
- já existe no código (`src/App.tsx`, `Menu`), nos testes e no stub "Em breve";
- espelha o path da API (`POST /api/v1/movies-import`);
- evita conflito conceitual com `/movies/:id`.
`docs/prototypes/catalog.md` foi atualizado de `/movies/import` para `/movies-import`.

## Menu
O menu mantém o **grupo "Filme"** com o item **"Importar"** (link para `/movies-import`), como no `Menu.tsx` atual. O título da tela e o botão continuam "Importar filmes".
```
{ group: "Filme", items: [{ label: "Importar", to: "/movies-import", required: ["movies:write"] }] }
```
Filtrado por `hasRole(user.roles, required)`; `*` sempre passa. Se o grupo ficar sem sub-itens permitidos, ele não é renderizado.

## Role matrix
| Elemento | `*` | `movies:write` | `movies:read` / `movies-watch:write` / `users:*` |
|---|---|---|---|
| Menu Filme > Importar | sim | sim | não |
| Rota `/movies-import` | sim | sim | não (-> `/forbidden`) |
| CTA "Importar filmes" no estado vazio do catálogo | sim | sim | não |

O backend também exige `movies:write`; um 403 do servidor é tratado (ver estados).

## Dados da API
- `POST /api/v1/movies-import` -> `202 { status: "import triggered" }`
  - Body (`TriggerImportRequest`):
    ```json
    { "searchTerms": ["inception", "matrix"], "maxPages": 5 }
    ```
  - `searchTerms` (string[], obrigatório, `minItems: 1`): resultado da normalização do textarea.
  - `maxPages` (integer, min 1): **sempre `5`**, constante no código, **não aparece na UI** (equivale a até 50 resultados por termo).
  - Resposta 202: o corpo `status` não é exibido; a UI usa mensagem própria.
  - Erros: `400` (corpo inválido), `401` (interceptor desloga e redireciona para `/login`; nada a exibir), `403` (sem permissão), `500`/rede.
- Nenhum `GET` nesta tela. Após o sucesso, invalidar a query do catálogo (`useInfiniteMovies`) é opcional e inócuo; os filmes só chegam após o processamento assíncrono.

## Regras de normalização (textarea -> `searchTerms`)
Aplicadas, nesta ordem, a cada mudança do texto:
1. Separar o texto por quebra de linha (`\r\n`, `\n`).
2. `trim()` em cada linha.
3. Descartar linhas vazias.
4. Remover duplicadas, **sem diferenciar maiúsculas/minúsculas** ("Matrix" e "matrix" são o mesmo termo), mantendo a **primeira ocorrência** e a ordem original.
5. O resultado é `searchTerms`; `N = searchTerms.length` alimenta o contador.
Não há limite máximo de termos definido no contrato. O texto exibido no textarea nunca é reescrito pela normalização (ela só afeta o contador e o payload).

## Wireframe (desktop >= 1024px), idle com termos digitados
```
+----------------------------------------------------------------------------------+
| MOVIE SUGGEST  [ Catálogo | Usuários | Filme v ]    Olá, William [Sair]         |
+----------------------------------------------------------------------------------+
|                                                                                  |
|   Importar filmes                                                                |
|   Informe um título por linha. Buscaremos cada um no OMDB.                       |
|                                                                                  |
|   +--------------------------------------------------------------+               |
|   | Títulos para importar                                        |               |
|   | +----------------------------------------------------------+ |               |
|   | | inception                                                | |               |
|   | | matrix                                                   | |               |
|   | | interstellar                                             | |               |
|   | |                                                          | |               |
|   | +----------------------------------------------------------+ |               |
|   | Um título por linha. Linhas vazias e repetidas são ignoradas.|               |
|   |                                                              |               |
|   | 3 filmes para importar                  [ Importar filmes ]  |               |
|   +--------------------------------------------------------------+               |
|                                                                                  |
+----------------------------------------------------------------------------------+
```
- Card `max-w-2xl`, `bg-[#17171d]`, centralizado em `max-w-[1280px] mx-auto px-6`.
- Textarea `rows=8`, redimensionável na vertical, `bg-neutral-900 border-neutral-700`, placeholder: `inception` / `matrix` / `interstellar` (um por linha).
- Contador à esquerda do botão: "N filme(s) para importar" (singular "1 filme para importar"; zero: "Nenhum título válido").
- Botão primário accent `#e50914` alinhado à direita.

## Wireframe (mobile < 640px)
```
+--------------------------+
| LOGO     [☰]             |
+--------------------------+
| Olá, William    [Sair]   |
+--------------------------+
| Importar filmes          |
| Informe um título por    |
| linha.                   |
|                          |
| Títulos para importar    |
| +----------------------+ |
| | inception            | |
| | matrix               | |
| | interstellar         | |
| |                      | |
| +----------------------+ |
| Linhas vazias e          |
| repetidas são ignoradas. |
|                          |
| 3 filmes para importar   |
| [   Importar filmes    ] |
+--------------------------+
```
- Botão em largura total abaixo do contador; textarea `rows=6`.
- Drawer mobile: grupo "Filme" com item "Importar":
```
+------------------+------------+
|  MOVIE SUGGEST   |     [x]    |
+------------------+------------+
|  Catálogo                     |
|  Usuários                     |
|  FILME                        |
|    Importar                   |
+------------------------------+
|  Sair                         |
+------------------------------+
```

## Estados

### 1. idle vazio (nenhum termo válido)
```
|   | Títulos para importar                                        |
|   | +----------------------------------------------------------+ |
|   | | inception, matrix...  (placeholder)                      | |
|   | +----------------------------------------------------------+ |
|   | Um título por linha. Linhas vazias e repetidas são ignoradas.|
|   | Nenhum título válido                  [ Importar filmes ]    |
|   |                                       (desabilitado)         |
```
- Botão `disabled` + `aria-disabled="true"` (opacidade 50%, `cursor-not-allowed`) enquanto `N = 0` (texto só com espaços/linhas vazias também cai aqui). Vale por `minItems: 1`.

### 2. idle com termos (ver wireframe principal)
- Botão habilitado; contador reflete `N` após normalização (ex.: digitar "matrix", "Matrix", "" e "dune" mostra "2 filmes para importar").

### 3. enviando
```
|   | +----------------------------------------------------------+ |
|   | | inception                    (desabilitado)              | |
|   | | matrix                                                   | |
|   | +----------------------------------------------------------+ |
|   | 2 filmes para importar            [ ⟳ Enviando... ]          |
```
- Textarea `disabled`/`readOnly`, botão desabilitado com spinner e texto "Enviando...", `aria-busy="true"` no formulário. Impede duplo envio.

### 4. sucesso (202)
```
|   +--------------------------------------------------------------+               |
|   | (✓) Importação iniciada para 3 filmes. Eles aparecerão no    |  role="status"|
|   |     catálogo depois que o processamento terminar, o que pode |  aria-live=   |
|   |     levar alguns instantes.            [ Ver catálogo ]      |  "polite"     |
|   +--------------------------------------------------------------+               |
|   | Títulos para importar                                        |               |
|   | +----------------------------------------------------------+ |               |
|   | |                                    (textarea limpo)      | |               |
|   | +----------------------------------------------------------+ |               |
|   | Nenhum título válido                  [ Importar filmes ]    |               |
|   |                                       (desabilitado)         |               |
```
- Mensagem literal: **"Importação iniciada para N filme(s). Eles aparecerão no catálogo depois que o processamento terminar, o que pode levar alguns instantes."** (singular: "para 1 filme"). Deixa claro que é assíncrono e que o filme não está disponível imediatamente.
- **Decisão: o textarea é limpo no sucesso.** Evita reenvio acidental dos mesmos termos (cada POST enfileira novos jobs) e deixa a tela pronta para um novo lote. O número N na mensagem preserva o contexto.
- Banner verde discreto (`border-green-600/40 bg-green-900/20 text-green-200`), persistente até o usuário digitar de novo ou enviar outro lote (some ao primeiro input no textarea). Link/botão secundário "Ver catálogo" -> `/catalog`.
- Foco permanece no botão/volta ao textarea; o anúncio é feito pelo `aria-live`, não por movimento de foco.

### 5. erro 400
```
|   | ! Os títulos informados são inválidos. Revise a lista e      |  role="alert"
|   |   tente novamente.                                           |
|   | (textarea preservado com o texto digitado)                   |
```
- Não deveria ocorrer com a normalização, mas é tratado. Texto preservado.

### 6. erro 403
```
|   | ! Você não tem permissão para importar filmes.               |  role="alert"
```
- Texto preservado; botão volta a habilitar. (O guard de rota normalmente já impede chegar aqui.)

### 7. erro 500 / rede
```
|   | ! Não foi possível iniciar a importação. Tente novamente     |  role="alert"
|   |   em instantes.                          [ Tentar novamente ]|
```
- Texto preservado; "Tentar novamente" reenvia o mesmo payload (equivale ao botão principal). Nunca expor detalhes técnicos.
- `401`: não exibir mensagem; o interceptor limpa o token e redireciona para `/login`.
- Erros somem ao editar o textarea ou ao reenviar.

## Interações
- Digitar/colar no textarea: recalcula `searchTerms` e o contador; limpa banners de sucesso/erro.
- Clique em "Importar filmes" (ou `Ctrl/Cmd+Enter` no textarea): envia `POST` com `{ searchTerms, maxPages: 5 }` se `N >= 1`.
- `Enter` no textarea insere nova linha (não envia).
- Clique em "Ver catálogo" no banner de sucesso: navega para `/catalog`.
- Menu Filme > Importar: navega para `/movies-import`.
- Sem confirmação de saída; sem polling de progresso (fora de escopo: a API não expõe status do job).

## Responsividade
- `< 640px`: card em largura total, textarea `rows=6`, contador acima do botão, botão largura total, menu em drawer.
- `640-1024px`: card `max-w-2xl` centralizado, contador e botão na mesma linha, menu em drawer.
- `> 1024px`: igual ao tablet, menu inline no header.

## Acessibilidade
- `<label htmlFor="titles">Títulos para importar</label>` associado ao textarea; texto de ajuda ligado via `aria-describedby`.
- Contador em `aria-live="polite"` (`role="status"`) para anunciar mudanças de `N`.
- Sucesso em `role="status"`/`aria-live="polite"`; erros em `role="alert"`.
- Botão desabilitado usa `disabled` real; durante o envio `aria-busy="true"`.
- Foco visível `focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none`.
- Contraste AA: texto `text-neutral-200` sobre `#17171d`; erro `text-red-400`; sucesso `text-green-200` sobre fundo escuro.
- `maxPages` não é exposto na UI nem a leitores de tela.

## Componentes reutilizáveis sugeridos
`Header`, `Menu` (mantém grupo "Filme" com item "Importar" -> `/movies-import`), `useImportMovies` (mutation TanStack Query chamando `api` de `client.ts`), constante `IMPORT_MAX_PAGES = 5`, função pura `normalizeSearchTerms(text: string): string[]` (testável isoladamente).

## Notas
- A página `MoviesImportPage` substitui o stub "Em breve".
- Sem novas dependências.
- Nenhum `<video>`/reprodução envolvida.
