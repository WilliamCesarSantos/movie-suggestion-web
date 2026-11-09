# Login

## Objetivo
Permitir que o usuário se autentique com email e senha para acessar o catálogo. É a porta de entrada da aplicação — enquanto não houver token válido no `storage`, qualquer rota protegida deve redirecionar para cá.

## Rota
`/login`

## Dados da API
- `POST /api/v1/login` → `LoginResponse`
- **Request body (`LoginRequest`)**: `email` (string, obrigatório, format `email`), `password` (string, obrigatório, format `password`).
- **Response (`LoginResponse`)** — campos utilizados:
  - `token` (string) → persistido via `storage.setToken(token)` em `src/lib/storage.ts` (chave `movie_token` no `localStorage`).
  - `email`, `roles`, `expiresAt` → **não consumidos** nesta tela nesta iteração (podem ser ignorados pelo componente; ficam disponíveis para futuras telas de perfil).
- **Erros**:
  - `400` — "invalid request body" (campos ausentes/formato inválido no servidor).
  - `401` — "unauthorized" (credenciais erradas).
  - `500` — erro interno.

## Wireframe (desktop ≥ 1024px)
```
+------------------------------------------------------------------+
|                                                                  |
|                                                                  |
|                         +----------------------+                 |
|                         |                      |                 |
|                         |     MOVIE SUGGEST    |                 |
|                         |   (logo / wordmark)  |                 |
|                         |                      |                 |
|                         |   Entrar na sua      |                 |
|                         |   conta              |                 |
|                         |                      |                 |
|                         |  Email               |                 |
|                         |  +----------------+  |                 |
|                         |  | you@email.com  |  |                 |
|                         |  +----------------+  |                 |
|                         |                      |                 |
|                         |  Senha               |                 |
|                         |  +----------------+  |                 |
|                         |  | ************** |  |                 |
|                         |  +----------------+  |                 |
|                         |                      |                 |
|                         |  [ ! erro geral  ]   |  (quando houver)|
|                         |                      |                 |
|                         |  +----------------+  |                 |
|                         |  |    Entrar      |  |  (botão submit) |
|                         |  +----------------+  |                 |
|                         |                      |                 |
|                         +----------------------+                 |
|                                                                  |
|                       fundo #0b0b0f                              |
|                       card  #17171d                              |
|                       accent #e50914 (botão)                     |
+------------------------------------------------------------------+
```
- Card centralizado horizontal e verticalmente (`min-h-screen flex items-center justify-center`).
- Card: largura máxima ~`max-w-sm` (≈ 384px), `rounded-2xl`, `shadow-xl`, padding generoso (`p-8`).
- Logo/wordmark em cima, título "Entrar na sua conta" (`text-xl font-semibold`).
- Inputs ocupam 100% da largura do card.
- Botão "Entrar" em accent `#e50914`, texto branco, 100% largura.

## Wireframe (mobile < 640px)
```
+--------------------------+
|                          |
|       MOVIE SUGGEST      |
|                          |
|   Entrar na sua conta    |
|                          |
|  Email                   |
|  +--------------------+  |
|  | you@email.com      |  |
|  +--------------------+  |
|                          |
|  Senha                   |
|  +--------------------+  |
|  | **************     |  |
|  +--------------------+  |
|                          |
|  [ ! mensagem de erro ]  |
|                          |
|  +--------------------+  |
|  |      Entrar        |  |
|  +--------------------+  |
|                          |
+--------------------------+
```
- Em mobile o card perde a borda visível e ocupa quase toda a largura (`w-full max-w-sm` com `px-6`).
- Mesma ordem vertical; nenhuma coluna lateral.
- Teclado virtual numérico/email sugerido via `type="email"` e `inputMode="email"`.

## Estados
Os 4 estados são obrigatórios e correspondem ao ciclo completo de autenticação:

- **idle** (inicial)
  - Campos vazios (ou com valor rascunhado pelo usuário).
  - Botão "Entrar" **desabilitado** enquanto `email` ou `password` estiverem vazios/apenas espaços.
  - Nenhuma mensagem de erro visível.
  - Foco inicial no campo **Email**.

- **submitting** (loading)
  - Disparado ao submeter o formulário com ambos os campos preenchidos.
  - Botão "Entrar" **desabilitado** + rótulo muda para "Entrando..." com spinner à esquerda (`aria-busy="true"`).
  - Inputs ficam `readOnly` (não `disabled`, para preservar os valores digitados e permitir foco com teclado).
  - Mensagem de erro anterior (se houver) é limpa.
  - Enter no campo de senha também dispara submit.

- **error**
  - Resposta HTTP de erro recebida ou falha de rede.
  - Mapeamento de mensagens (**nunca expor detalhes técnicos**):
    - `400` → "Preencha email e senha corretamente."
    - `401` → "Email ou senha inválidos."
    - `500` ou falha de rede/timeout → "Não foi possível entrar agora. Tente novamente em instantes."
  - Mensagem renderizada em um `role="alert"` acima do botão, cor `text-red-400`, ícone de alerta opcional.
  - Botão volta ao estado **idle** (habilitado se campos continuam preenchidos).
  - Foco é movido para a mensagem de erro (ou mantido no campo de senha com `aria-describedby` apontando para o alerta).

- **success-redirecting**
  - Resposta `200` recebida.
  - `token` é persistido (`storage.setToken`), `useAuth` marca `isAuthenticated = true`.
  - Botão permanece desabilitado com rótulo "Entrando..." até o `navigate("/catalog", { replace: true })` acontecer — evita duplo clique.
  - Nenhum toast adicional: o redirecionamento imediato já é o feedback.

### Resumo do botão "Entrar"
| Condição | Habilitado? | Rótulo |
|---|---|---|
| `email` ou `password` vazio | não | "Entrar" |
| ambos preenchidos, idle | **sim** | "Entrar" |
| submitting / success-redirecting | não | "Entrando..." (com spinner) |
| error, campos ainda preenchidos | sim | "Entrar" |

## Interações
- **Digitar** em qualquer campo → atualiza estado controlado; se havia mensagem de erro, ela é limpa imediatamente para não confundir o usuário.
- **Enter** em qualquer campo → submete o formulário (via `<form onSubmit>`), respeitando a regra de habilitação.
- **Clique em "Entrar"** → chama `useAuth().login(email, password)`:
  - Sucesso → `navigate("/catalog", { replace: true })`.
  - Falha → entra em estado **error** (mensagem conforme status HTTP).
- **Tab/Shift+Tab** → navegação em ordem: Email → Senha → Entrar.
- **Já autenticado ao chegar em `/login`** → o componente deve redirecionar para `/catalog` no `useEffect` inicial (checar `useAuth().isAuthenticated`). Evita formulário aparecer para quem já tem token.

## Responsividade
- `< 640px` (mobile): card ocupa `w-full` com `px-6`, sem sombra visível, fundo igual à página.
- `640px – 1024px` (tablet): card `max-w-sm` centralizado, com `rounded-2xl` e `shadow-xl`.
- `> 1024px` (desktop): mesmo card `max-w-sm` centralizado — **não** expandir em telas largas (manter leitura confortável).
- Mobile-first: escrever classes Tailwind sem prefixo para mobile e adicionar `sm:` / `md:` para refinar — nunca usar `inline style`.

## Acessibilidade
- Cada `<input>` tem `<label htmlFor>` associada e visível (não usar placeholder como label).
- `input[type="email"]` com `autoComplete="email"`, `inputMode="email"`, `required`.
- `input[type="password"]` com `autoComplete="current-password"`, `required`, `minLength={1}` no cliente (o backend valida o resto).
- Foco visível em todos os elementos interativos: `focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none`.
- Contraste mínimo WCAG AA:
  - Texto principal branco (`text-white`) sobre `#17171d` → ratio > 15:1.
  - Texto secundário `text-neutral-400` sobre `#17171d` → ratio ≥ 4.6:1.
  - Botão `#e50914` com texto branco → ratio ≈ 4.8:1.
- Botão submit com `aria-label="Entrar"` e `aria-busy` durante submit.
- Mensagem de erro em container com `role="alert"` e `aria-live="assertive"` para leitores de tela.
- Ordem de tab lógica (DOM = visual). Nenhum `tabIndex` positivo.
- Não desabilitar o paste no campo senha.

## Componentes reutilizáveis sugeridos
- `TextField` (label + input + mensagem de erro inline por campo) — reusar em cadastro/perfil.
- `PrimaryButton` (bg accent, estados idle/loading/disabled) — reusar em todas as telas.
- `AuthCard` (shell centralizado com logo) — reusar em futura tela de cadastro/esqueci minha senha.
- `useAuth` (já existe em `src/hooks/useAuth.ts`) — a página consome `login` daí; **não** chamar `src/api/auth.ts` diretamente.
