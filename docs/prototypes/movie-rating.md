# Movie Rating

## Objetivo
Permitir que o usuário avalie, de 1 a 10 estrelas, o filme que acabou de "assistir" (simulação). A tela recebe a nota, classifica em `liked` / `neutral` / `disliked`, envia via POST ao backend e redireciona de volta ao catálogo.

## Rota
`/movies/:id/rate` — rota protegida, exige role `movies-watch:write` **ou** `*`. Sem essa role: redirecionar para `/forbidden` (stub) com mensagem "Você não tem permissão para avaliar filmes."

Pode ser alcançada:
- Pela tela `PlayerSimulation` (fluxo principal, `title` chega via `location.state`).
- Diretamente pela URL (deep link) — nesse caso, o componente faz fallback de `title` para "Filme" até ter detalhes.

## Pré-condições
- Usuário autenticado.
- `id` presente na URL (uuid).
- Idealmente `location.state.title` populado pelo modal do player.

## Dados da API
- `POST /api/v1/movies/{id}/watched` → `WatchedResponse`
  - **Request body** (`RecordWatchedRequest`):
    ```json
    { "rating": 8, "reaction": "liked" }
    ```
  - **Request validation (cliente)**:
    - `rating` inteiro `1..10` (nunca 0 — se o usuário não escolheu, o submit está desabilitado).
    - `reaction` derivado de `rating` conforme a regra abaixo.
  - **Mapa rating → reaction** (constraint da task):
    | Rating | Reaction |
    |---|---|
    | `rating < 5` (1,2,3,4) | `disliked` |
    | `5 ≤ rating ≤ 7` (5,6,7) | `neutral` |
    | `rating > 7` (8,9,10) | `liked` |
  - **Response** (`WatchedResponse`): campos ignorados nesta tela (o retorno existe mas não precisamos mostrar nada — o redirect é o feedback).
  - **Erros**:
    - `400` → "Avaliação inválida. Tente novamente."
    - `401` → interceptor desloga e manda para `/login`.
    - `403` → "Você não tem permissão para avaliar filmes." + botão "Voltar ao catálogo".
    - `404` → "Filme não encontrado." + botão "Voltar ao catálogo".
    - `500` / rede → "Não foi possível registrar sua avaliação agora. Tente novamente."

### Label dinâmico (reação em tempo real)
Enquanto o usuário faz hover/clica, mostrar texto abaixo das estrelas. **Fonte da verdade**: a nota selecionada (`value`) com override temporário pelo `hoverValue`.

| Nota corrente (hover ou clique) | Label exibido |
|---|---|
| nenhuma (0) | "Toque numa estrela para avaliar" |
| 1–4 (`< 5`) | "Você odiou — disliked" |
| 5–7 (`5..7`) | "Meh — neutral" |
| 8–10 (`> 7`) | "Você amou! — liked" |

O sufixo `— disliked/neutral/liked` deixa visível para o usuário qual é a `reaction` que será enviada. Em `aria-live="polite"` para leitores de tela.

## Wireframe (desktop ≥ 1024px)
```
+----------------------------------------------------------------------------------+
| MOVIE SUGGEST                                         Olá, William    [Sair]     |
+----------------------------------------------------------------------------------+
|                                                                                  |
|          +--------------------------------------------------------+              |
|          |                                                        |              |
|          |            Como você avalia este filme?                |              |
|          |                                                        |              |
|          |                  The Matrix (1999)                     |              |
|          |                                                        |              |
|          |     ★   ★   ★   ★   ★   ★   ★   ★   ☆   ☆             |              |
|          |     1   2   3   4   5   6   7   8   9   10             |              |
|          |                                                        |              |
|          |                 Você amou! — liked                     |              |
|          |                                                        |              |
|          |     [ Cancelar ]              [  Enviar avaliação  ]   |              |
|          |                                                        |              |
|          +--------------------------------------------------------+              |
|                                                                                  |
+----------------------------------------------------------------------------------+
```
- Container `max-w-2xl mx-auto px-6 py-16`.
- Card `bg-[#17171d] rounded-2xl shadow-xl p-10`.
- Título `text-xl font-semibold text-white` + subtítulo com o nome do filme `text-neutral-400`.
- Estrelas em linha horizontal, espaçadas (`gap-2`), cada uma `h-10 w-10` em desktop.
  - Preenchidas: `text-[#e50914]` ou `text-yellow-400` (decisão de estilo — manter o **accent** da marca `#e50914` para consistência com login/player).
  - Vazias: `text-neutral-600`.
- Botões: `Cancelar` secundário (outline neutro) à esquerda, `Enviar avaliação` primário accent à direita.
- Label dinâmico em `text-base text-neutral-300` com transição suave.

## Wireframe (mobile < 640px)
```
+--------------------------+
| MOVIE SUGGEST    [Sair]  |
+--------------------------+
|                          |
| Como você avalia este    |
| filme?                   |
|                          |
| The Matrix (1999)        |
|                          |
|  ★  ★  ★  ★  ★           |
|  1  2  3  4  5           |
|  ★  ★  ★  ☆  ☆           |
|  6  7  8  9  10          |
|                          |
| Você amou! — liked       |
|                          |
| +----------------------+ |
| |  Enviar avaliação    | |
| +----------------------+ |
| +----------------------+ |
| |      Cancelar        | |
| +----------------------+ |
|                          |
+--------------------------+
```
- Estrelas em **duas linhas** (5 + 5) em telas estreitas, cada estrela `h-9 w-9`.
- Botões empilhados em full width: `Enviar avaliação` primeiro (primário), `Cancelar` depois.
- Números abaixo das estrelas ajudam a legibilidade e contagem.

## Estados

### 1. idle (nenhuma estrela selecionada ainda)
```
|     ☆   ☆   ☆   ☆   ☆   ☆   ☆   ☆   ☆   ☆            |
|     1   2   3   4   5   6   7   8   9   10            |
|                                                        |
|        Toque numa estrela para avaliar                 |
|                                                        |
|  [ Cancelar ]         [ Enviar avaliação (disabled) ]  |
```
- Todas as estrelas vazias (`☆`).
- Label: "Toque numa estrela para avaliar".
- Botão `Enviar avaliação` **desabilitado** (`disabled` + `aria-disabled="true"`).
- Foco inicial na **primeira estrela**.

### 2. hover (desktop) ou touch-preview
```
|     ★   ★   ★   ★   ★   ★   ★   ☆   ☆   ☆             |
|     1   2   3   4   5   6   7   8   9   10            |
|                                                        |
|                 Meh — neutral                          |
```
- Quando o mouse paira sobre a estrela `n`, preenche as estrelas `1..n` com accent.
- Label atualiza em tempo real conforme a tabela "Label dinâmico".
- O estado `value` (clique) **não** muda com hover; ao sair, o preview reverte para `value`.

### 3. selected (clique)
```
|     ★   ★   ★   ★   ★   ★   ★   ★   ☆   ☆             |
|     1   2   3   4   5   6   7   8   9   10            |
|                                                        |
|             Você amou! — liked                         |
|                                                        |
|  [ Cancelar ]          [  Enviar avaliação  ]          |
```
- `value = n` fica persistido; clicar na mesma estrela novamente **não desseleciona** (evita acidente). Para "desmarcar", clique no "0" (não mostrado) ou use `Cancelar`.
- Botão `Enviar avaliação` **habilitado**.

### 4. submitting
```
|     ★   ★   ★   ★   ★   ★   ★   ★   ☆   ☆             |
|     (estrelas desabilitadas / não focáveis)            |
|                                                        |
|             Você amou! — liked                         |
|                                                        |
|  [ Cancelar (disabled) ]  [ ⟳ Enviando... (disabled) ] |
```
- Botão de envio com spinner e rótulo "Enviando..." + `aria-busy="true"`.
- Botão `Cancelar` também desabilitado para evitar dupla navegação.
- Estrelas `aria-disabled="true"`, não respondem a clique/hover.
- Nenhum feedback adicional — a UI só precisa comunicar "em progresso".

### 5. error
```
|     ★   ★   ★   ★   ★   ★   ★   ★   ☆   ☆             |
|                                                        |
|             Você amou! — liked                         |
|                                                        |
|  [ ! Não foi possível registrar sua avaliação agora.   |
|      Tente novamente. ]                                |
|                                                        |
|  [ Cancelar ]          [  Enviar avaliação  ]          |
```
- Mensagem em `role="alert"` acima dos botões, cor `text-red-400`.
- Botão `Enviar avaliação` volta ao estado idle (habilitado, com rótulo original).
- A nota (`value`) é preservada.
- Foco vai para a mensagem de erro (ou o botão de enviar com `aria-describedby` apontando para o alerta).

### 6. success-redirecting
```
|                                                        |
|            ✓ Avaliação registrada!                     |
|            Voltando ao catálogo...                     |
|                                                        |
```
- Overlay simples (ou toast) com texto curto.
- Redireciona para `/catalog` com `replace: true` em até `800ms`.
- Nenhum botão interativo nesse instante — o foco não precisa estar em nada; o leitor de tela anuncia o status via `role="status"` `aria-live="polite"`.

## Interações
- **Clique na estrela `n`** → `setValue(n)`; label atualiza para a categoria correspondente; botão `Enviar avaliação` habilita.
- **Hover na estrela `n` (desktop)** → `setHoverValue(n)`; preview preenche 1..n; label mostra a categoria do preview.
- **MouseLeave da linha de estrelas** → `setHoverValue(null)`; estado volta a refletir `value`.
- **Teclado nas estrelas**:
  - `Tab` leva para a primeira estrela; `Enter`/`Space` seleciona a nota correspondente ao índice.
  - Alternativa radio-group: usar `role="radiogroup"` com cada estrela `role="radio"` `aria-checked`. Setas `←`/`→` movem seleção, `Enter` confirma.
- **Clique em `Enviar avaliação`** (habilitado):
  - Monta body `{ rating: value, reaction: mapReaction(value) }`.
  - Chama `POST /api/v1/movies/{id}/watched` via `src/api/movies.ts` (a função pode ser nova: `recordWatched(id, body)`).
  - Sucesso → estado `success-redirecting` → `navigate("/catalog", { replace: true })` após ~800ms (feedback visual mínimo antes de sair).
  - Falha → estado `error`, nota preservada.
- **Clique em `Cancelar`** → `navigate("/catalog", { replace: true })` sem enviar nada.
- **Tecla `Esc`** → equivalente a `Cancelar`.
- **Entrada direta via URL sem `location.state.title`** → o subtítulo "The Matrix (1999)" é substituído por "Filme" (ou faz um `GET /api/v1/movies/{id}` opcional — **decisão nesta iteração: NÃO fazer fetch**, para manter o escopo). Documentar como follow-up.

## Responsividade
- `< 640px`: estrelas em 2 linhas de 5, botões empilhados full-width, ordem: Enviar → Cancelar.
- `640–1024px`: estrelas em linha única se couber (10 estrelas × ~36px = ~360px + gap), caso contrário 2 linhas.
- `> 1024px`: estrelas em linha única, botões lado a lado.
- Mobile-first com Tailwind; sem `inline style`.

## Acessibilidade
- Título da tela com `<h1>` ou `<h2>` (dependendo da hierarquia do app).
- Grupo de estrelas com `role="radiogroup"` `aria-label="Avaliação de 1 a 10"`.
- Cada estrela com `role="radio"` `aria-checked={value === n}` `aria-label="{n} estrela{n === 1 ? '' : 's'}"`.
- Label dinâmico em `aria-live="polite"` para anunciar mudanças de categoria.
- Mensagem de erro em `role="alert"` `aria-live="assertive"`.
- Mensagem de sucesso em `role="status"` `aria-live="polite"`.
- Foco visível em todos os elementos interativos: `focus-visible:ring-2 focus-visible:ring-red-500`.
- Contraste WCAG AA: estrelas preenchidas `#e50914` sobre `#17171d` → ~4.8:1 (OK); estrelas vazias `text-neutral-600` sobre `#17171d` → suficiente para elementos decorativos (rótulos numéricos usam `text-neutral-400`, contraste > 4.6:1).
- `prefers-reduced-motion`: o fade de transição entre estrelas/label é removido; a mudança é instantânea.
- Ordem de tab: estrelas (via radio-group ou cada uma Tab-ável — decisão: **radio-group**, um único stop de tab, setas para mover) → `Cancelar` → `Enviar avaliação`.

## Componentes reutilizáveis sugeridos
- `StarRating` (controlled, `value`, `onChange`, `max=10`, `size`) — reusado em futuras telas de rating.
- `PrimaryButton` / `SecondaryButton` (já previstos no login).
- `FormCard` (shell do card centralizado) — pode compartilhar com `AuthCard` ou ser separado.
- `mapReaction(rating)` em `src/lib/rating.ts`:
  ```
  rating < 5           → "disliked"
  5 <= rating <= 7     → "neutral"
  rating > 7           → "liked"
  ```
- `recordWatched(id, { rating, reaction })` em `src/api/movies.ts`.

## Notas
- `rating` é **inteiro de 1 a 10** no cliente (o schema aceita `number` 0..10, mas restringimos para inteiros 1..10 na UI por simplicidade).
- `Cancelar` **não** registra nada — é como se o usuário desistisse da avaliação.
- O usuário **pode** chegar aqui via deep link sem passar pelo player (ex.: refresh na tela). Nessa situação, exibir o título como "Filme" até que haja uma próxima iteração com fetch de detalhes.
- Após o POST com sucesso, não exibir o `WatchedResponse` — o retorno é descartado além do `2xx`.
- Depois do redirect, o catálogo recarrega as recomendações frescas (o `useInfiniteMovies` pode invalidar a primeira página ou simplesmente re-ordenar na próxima entrada — decisão fora do escopo deste protótipo).
