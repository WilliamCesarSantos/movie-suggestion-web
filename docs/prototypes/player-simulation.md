# Player Simulation

## Objetivo
Simular a reprodução de um filme sem usar elemento `<video>`. O usuário clica em um card do catálogo, um modal abre com o título do filme e uma barra de progresso animada; ao final (3s) ou ao clicar em "Pular para avaliar", o modal fecha e o usuário é redirecionado para a tela de avaliação (`/movies/:id/rate`).

## Rota
Não tem rota própria. É um **modal** sobreposto a `/catalog`. Ao abrir, pode opcionalmente empurrar um estado na URL (`?playing=<id>`) para permitir voltar com o botão do navegador — opcional nesta iteração.

## Pré-condições
- Usuário autenticado.
- Usuário tem role `movies-watch:write` **ou** `*`. Caso contrário, o modal nem é aberto (ver `catalog.md`, seção "Interações").
- O catálogo passa ao modal: `{ id: string (uuid), title: string }` do `MovieSummary`.

## Dados da API
Nenhuma chamada nesta tela. A simulação é 100% client-side. O POST do `watched` acontece **na tela de avaliação** (`movie-rating.md`), não aqui.

## Wireframe (desktop)
```
+---------------------------------------------------------------------------------+
| (backdrop semi-transparente escuro cobrindo toda a viewport — opacity 70%)      |
|                                                                                 |
|            +---------------------------------------------------------+          |
|            |                                              [x]        |          |
|            |                                                         |          |
|            |                                                         |          |
|            |                     ▶  Reproduzindo                     |          |
|            |                                                         |          |
|            |                     The Matrix (1999)                   |          |
|            |                                                         |          |
|            |     +-----------------------------------------------+   |          |
|            |     |■■■■■■■■■■■■■■■■■■░░░░░░░░░░░░░░░░░░░░░░░░░░░░ |   |          |
|            |     +-----------------------------------------------+   |          |
|            |                    00:01 / 00:03                        |          |
|            |                                                         |          |
|            |                                                         |          |
|            |          [ Fechar ]      [ Pular para avaliar ]         |          |
|            |                                                         |          |
|            +---------------------------------------------------------+          |
|                                                                                 |
+---------------------------------------------------------------------------------+
```
- Modal `max-w-xl` centralizado (`fixed inset-0 flex items-center justify-center p-4`).
- Backdrop `bg-black/70 backdrop-blur-sm`.
- Caixa `bg-[#17171d] rounded-2xl shadow-2xl p-8`.
- Título do filme em `text-xl font-semibold text-white`.
- Linha "Reproduzindo" em `text-sm text-neutral-400` com ícone `▶`.
- Barra de progresso: `h-2 w-full bg-neutral-800 rounded-full` com interno `bg-[#e50914] rounded-full` animando largura de `0%` a `100%` durante 3000ms.
- Contador `text-xs text-neutral-500` (`mm:ss / mm:ss`) atualizado a cada 100ms.
- Botões em linha na base: `[Fechar]` (secundário, outline) e `[Pular para avaliar]` (primário accent).
- Botão `[x]` no canto superior direito — equivalente a `[Fechar]`.

## Wireframe (mobile < 640px)
```
+-------------------------------+
| (backdrop)                    |
|                               |
| +---------------------------+ |
| |                     [x]   | |
| |                           | |
| |  ▶ Reproduzindo           | |
| |                           | |
| |  The Matrix (1999)        | |
| |                           | |
| | +-----------------------+ | |
| | |■■■■■■■░░░░░░░░░░░░░░░░| | |
| | +-----------------------+ | |
| |      00:01 / 00:03        | |
| |                           | |
| | +-----------------------+ | |
| | |    Pular para avaliar | | |
| | +-----------------------+ | |
| | +-----------------------+ | |
| | |       Fechar          | | |
| | +-----------------------+ | |
| +---------------------------+ |
+-------------------------------+
```
- Em mobile, botões **empilhados** (full width), ordem: `Pular para avaliar` (primário) → `Fechar` (secundário).
- Modal ocupa `w-full max-w-sm` com margens laterais `px-4`.

## Estados

### 1. playing (default ao abrir)
- Barra preenche de 0% a 100% em 3000ms (`setInterval(100ms)` ou `requestAnimationFrame` + `performance.now()`).
- Contador exibe `00:0X / 00:03`.
- Ambos os botões (`Fechar` e `Pular para avaliar`) **sempre visíveis** e habilitados.
- `aria-busy="true"` no container do modal.

### 2. completed (barra atinge 100%)
- A simulação chega ao fim naturalmente.
- Dispara a **mesma** ação do botão "Pular para avaliar": fecha o modal + `navigate("/movies/:id/rate")`.
- Não há tela intermediária de "terminou" — a transição é direta para avaliação.

### 3. closed (Fechar / x / Esc / backdrop)
- Modal desmonta.
- `navigate` **não** é chamado — o usuário continua em `/catalog`.
- O timer é limpo (`clearInterval` / `cancelAnimationFrame`) para evitar leak.

### 4. skipped (clique em "Pular para avaliar")
- Idêntico ao `completed`: fecha e redireciona para `/movies/:id/rate`.

## Interações
- **Abertura**: disparada pelo catálogo quando `movies-watch:write` (ou `*`) está presente. Foco inicial no botão `[x]` (ou em `[Pular para avaliar]` — decidir na implementação; o importante é que o foco **entre** no modal).
- **Clique em `[Pular para avaliar]`**: limpa timer → fecha modal → `navigate("/movies/" + id + "/rate", { state: { title } })` (passar `title` via `state` evita um fetch extra na tela de avaliação).
- **Clique em `[Fechar]` ou `[x]` ou fundo (backdrop)**: limpa timer → fecha modal, permanece no catálogo.
- **Tecla `Esc`**: equivalente a Fechar.
- **Barra alcança 100%**: igual a `[Pular para avaliar]` (completed → redireciona).
- **Clique no conteúdo do modal (não backdrop)**: não fecha (usa `stopPropagation`).

### Duração da simulação
- Constante `SIMULATION_DURATION_MS = 3000`.
- Documentar como ajustável em um único lugar, mas fixa em 3s nesta iteração.

## Responsividade
- `< 640px`: modal quase full-width (`max-w-sm`), botões empilhados, padding reduzido (`p-6`).
- `≥ 640px`: modal `max-w-xl`, botões lado a lado, padding generoso (`p-8`).

## Acessibilidade
- Container do modal: `role="dialog"` `aria-modal="true"` `aria-labelledby="player-title"`.
- Título do filme com `id="player-title"`.
- **Focus trap**: Tab e Shift+Tab ciclam apenas entre elementos dentro do modal (`[x]`, barra — não focável, `Fechar`, `Pular para avaliar`).
- `Esc` fecha o modal.
- Ao fechar, o foco retorna ao card original no catálogo (guardar `lastFocusedElement` ao abrir).
- Barra de progresso com `role="progressbar"` `aria-valuemin="0"` `aria-valuemax="100"` `aria-valuenow={percent}` `aria-label="Progresso da reprodução simulada"`.
- Contador em `aria-live="off"` para não spammar leitores de tela (a barra já traduz o progresso).
- Botão `[x]` com `aria-label="Fechar modal"`.
- Respeita `prefers-reduced-motion`: se ativo, não anima a barra — apenas pula direto para a tela de avaliação após `SIMULATION_DURATION_MS` (ou reduz para 500ms). Decisão: em `reduced-motion`, exibir imediatamente só título + os dois botões, sem barra animada; o usuário escolhe se "Pular" ou "Fechar".
- Contraste WCAG AA: texto branco sobre `#17171d` > 15:1; accent `#e50914` como preenchimento da barra tem contraste suficiente contra `neutral-800`.

## Componentes reutilizáveis sugeridos
- `Modal` genérico (dialog + backdrop + focus trap + `Esc`) — reusado em futuras confirmações.
- `ProgressBar` (barra animada controlada por `value: number [0..100]`).
- `PlayerSimulation` (compõe `Modal` + `ProgressBar` + botões). Recebe `{ movieId, title, onClose }`.

## Notas
- **Nada de `<video>`**: nenhum `<video>`, `<audio>`, nenhuma URL de stream. Tudo client-side.
- A role `movies-watch:write` é verificada **antes** da abertura. A tela de avaliação também re-verifica (defesa em profundidade).
- Se o usuário usar `Fechar` em vez de `Pular`, ele **não** registra `watched` — o POST só acontece em `/movies/:id/rate` após o submit do rating.
