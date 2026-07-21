# Login Screen Prototype

## Status

Approved by user on 2026-07-20, with correction to remove the heading text
"Entrar na sua conta".

## Intent

Propose a cleaner login screen with a calm Material-inspired layout, reduced visual noise,
and a single obvious action.

## Low-Fidelity Wireframe

```text
+------------------------------------------------------------------+
|                                                                  |
|                                                                  |
|                    [ subtle background atmosphere ]              |
|                                                                  |
|                   +--------------------------------+             |
|                   | Watch your movies              |             |
|                   |                                |             |
|                   | E-mail                         |             |
|                   | [__________________________]   |             |
|                   |                                |             |
|                   | Senha                          |             |
|                   | [__________________________]   |             |
|                   |                                |             |
|                   | mensagem de erro inline        |             |
|                   |                                |             |
|                   | [         Entrar         ]     |             |
|                   +--------------------------------+             |
|                                                                  |
|                                                                  |
+------------------------------------------------------------------+
```

## Hierarchy

1. Compact brand or product title
2. Email field
3. Password field
4. Inline error feedback
5. One primary CTA

## Visual Direction

- Centered single-column composition
- Soft surface container with restrained elevation
- Light or neutral surface preferred over the current heavy dark card
- Strong spacing rhythm with generous padding
- Primary color reserved for focus state and CTA emphasis
- No secondary CTA in the first iteration

## Mobile Behavior

- Preserve the same element order
- Expand card width close to screen edges with comfortable margins
- Keep heading, fields, and CTA visible with minimal scrolling on common devices

## Interaction Notes

- The CTA remains disabled only if the team later adopts validation gating; otherwise keep the action available and return inline error feedback.
- Error feedback appears between fields and CTA without shifting the full page layout aggressively.
- Focus state should be visually clear and Material-aligned.

## Approval Record

- Composicao centralizada com card unico: aprovado.
- Um unico CTA principal sem acoes secundarias: aprovado.
- Superficie clara/neutra em vez do card escuro atual: aprovado.
- Correcao aplicada: remover a mensagem "Entrar na sua conta".
- Correcao aplicada: remover a mensagem "Acesse recomendacoes e recursos do sistema".

## Traceability

- Approved by user in-session on 2026-07-20.
- Contract anchor: `specs/001-build-movie-frontend/contracts/login-screen-contract.md`.
- Planned implementation task: T021 in `specs/001-build-movie-frontend/tasks.md`.

## Next Step

If approved, implement the redesign in `src/pages/auth/LoginPage.tsx` and run browser QA for the impacted login scenarios.