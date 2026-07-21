# Implementation Plan: Build Movie Frontend

**Branch**: `001-build-movie-frontend` | **Date**: 2026-07-19 | **Spec**: `/specs/001-build-movie-frontend/spec.md`

**Input**: Feature specification from `/specs/001-build-movie-frontend/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Construir um frontend React para consumir o contrato OpenAPI do projeto movie-suggestion-api,
com login, autorizacao por roles (incluindo `*` como super admin), home de recomendacoes com
scroll infinito, menu de sistema condicionado por permissao, fluxo de importacao de filmes e
fluxo assistir->avaliar via endpoint de watched. A implementacao sera orientada a entregas
incrementais e tarefas pequenas para reduzir risco de regressao, com validacao continua por um
agente de QA em navegador baseado em `test_plan.md` e checkpoint obrigatorio de prototipo/aprovacao
antes de qualquer mudanca visual relevante. Como ajuste imediato de UX, a tela de login deve ser
redesenhada para uma experiencia mais clean, centrada e alinhada a Material Design.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode habilitado)

**Primary Dependencies**:
- React 19.x
- React Router 7.x
- Vite 7.x
- Tailwind CSS 4.x
- TanStack Query 5.x (cache/paginacao assinc)
- Zod 4.x (validacao e parsing de respostas)
- React Hook Form 7.x (formularios login/import/avaliacao)
- Material Design principles/tokens applied through the existing frontend styling layer

**Storage**: N/A (estado de frontend em memoria + cache de consulta)

**Testing**:
- Vitest 3.x + Testing Library (componentes e regras de autorizacao)
- Playwright latest stable (fluxos E2E criticos)
- Browser QA agent driven by `test_plan.md` for post-change validation of user-facing behavior

**Target Platform**: Navegadores modernos desktop e mobile (SPA responsiva)

**Project Type**: web-application (frontend SPA)

**Performance Goals**:
- Primeira renderizacao util da home em ate 2.5s (rede padrao)
- Carregamento incremental de pagina de filmes em ate 1s p95 por requisicao
- Interacao de scroll sem travamento perceptivel durante append de paginas

**Constraints**:
- Aderencia obrigatoria ao contrato OpenAPI remoto
- RBAC deny-by-default com role `*` global
- UIs/rotas protegidas devem ocultar controles sem permissao
- Qualquer negacao de acesso deve renderizar fallback amigavel (sem tela quebrada)
- Preferir bibliotecas nas versoes estaveis mais atuais no momento da implementacao
- Decompor implementacao em tarefas pequenas e independentes em `/speckit.tasks`
- Toda tela nova ou alteracao visual relevante deve nascer de um prototipo apresentado ao usuario
- Implementacao visual so pode prosseguir apos aprovacao explicita do usuario
- Validacao funcional final de mudancas relevantes deve acontecer no navegador, nao apenas em testes unitarios/integracao
- A revisao da tela de login deve reduzir ruido visual e manter apenas os elementos essenciais para autenticacao

**Scale/Scope**:
- 1 SPA frontend
- 3 jornadas prioritarias (home recomendacoes, administracao de usuario, operacoes de filme)
- 6 perfis de permissao de role explicitamente suportados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- TypeScript strict mode is active and all API request/response types are explicit.
- React 19 functional components and native hooks are used for new frontend code.
- Tailwind CSS is used for layout/state styling (hover, focus, transitions) in affected UI.
- API integration aligns with the OpenAPI contract at
  `https://github.com/WilliamCesarSantos/movie-suggestion-api/blob/main/openapi.yaml`.
- RBAC mapping is defined, including wildcard role `*` as Super Admin.
- Protected routes and protected UI controls are enforced by role checks.
- Unauthorized access renders friendly lock fallback UI and never a broken screen.
- Test plan covers authorized path, unauthorized path, and fallback rendering.
- Material Design and clean UI principles are applied consistently before implementation sign-off.
- Every substantial visual change has a prototype approval checkpoint before code changes proceed.
- Browser QA scenarios sourced from `test_plan.md` validate each relevant change before completion.

**Pre-Design Gate Review**: PASS
- O escopo da feature respeita stack obrigatoria (TypeScript strict + React 19 + Tailwind).
- O plano usa contrato OpenAPI como fonte unica para tipos e consumo de API.
- O desenho contempla matriz RBAC completa com wildcard admin.
- O fluxo de testes inclui cenarios autorizado, negado e fallback resiliente.
- O fluxo passa a exigir prototipacao e aprovacao antes de mudancas visuais relevantes.
- O plano de validacao inclui agente de QA em navegador orientado por `test_plan.md`.

## Project Structure

### Documentation (this feature)

```text
specs/001-build-movie-frontend/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
specs/
└── 001-build-movie-frontend/

src/
├── app/
│   ├── router/
│   ├── providers/
│   └── guards/
├── pages/
│   ├── auth/
│   ├── home/
│   ├── users/
│   └── movies/
├── components/
│   ├── layout/
│   ├── feedback/
│   └── movie/
├── features/
│   ├── auth/
│   ├── rbac/
│   ├── users/
│   └── movies/
├── api/
│   ├── client/
│   ├── endpoints/
│   └── schemas/
├── hooks/
├── lib/
└── types/

tests/
├── unit/
├── integration/
└── e2e/

contracts/
├── contract/
└── rbac/

test_plan.md
```

**Structure Decision**: Estrutura de SPA frontend unica com separacao por feature
(auth/rbac/users/movies), camada de API tipada por contrato e suites de teste unit/integration/e2e.
Essa estrutura facilita quebrar o trabalho em pequenas tarefas paralelizaveis na fase de tasks,
enquanto `test_plan.md` atua como fonte de cenarios do agente de QA em navegador e a camada de
design incorpora checkpoints de prototipo antes da implementacao visual.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Phase 0 Output: Research Plan

- Confirmar estrategia para consumo de OpenAPI com tipagem estrita em frontend.
- Definir abordagem de scroll infinito paginado com tolerancia a erro de pagina.
- Definir matriz RBAC para menu, rotas e acoes sensiveis.
- Definir fallback resiliente padrao para negacao de acesso.
- Definir estrategia de decomposicao em tarefas pequenas (baixo acoplamento).
- Definir o contrato operacional do agente de QA com base em `test_plan.md` e execucao em navegador.
- Definir o workflow de prototipo, revisao visual e aprovacao do usuario antes de implementar telas.
- Definir a proposta de redesign da tela de login para uma composicao clean baseada em Material Design.

## Phase 1 Output: Design Focus

- Data model de entidades de sessao, role, recomendacao, detalhe, importacao e avaliacao.
- Contratos de interface para autenticacao, filmes, importacao, watched e guardas de permissao.
- Quickstart com cenarios validando jornadas e regras de RBAC.
- Diretrizes visuais de Material Design com foco em UI clean e minimo de componentes.
- Ponto de controle para apresentacao de prototipos antes da implementacao.
- Contrato visual dedicado para a tela de login com layout, estados e hierarquia de informacao.

## Post-Design Constitution Check

**Post-Design Gate Review**: PASS
- Artefatos de design mantem stack obrigatoria e consumo orientado ao OpenAPI.
- Matriz RBAC cobre menu, tela e acao de forma consistente com super admin `*`.
- Fluxos sem permissao preveem fallback amigavel em vez de erro fatal.
- Plano de validacao contempla cobertura para autorizacao e resiliencia de UX.
- O design passa a exigir aprovacao explicita de prototipos para telas novas ou alteradas.
- A validacao de mudancas relevantes inclui execucao automatizada em navegador via agente de QA.
