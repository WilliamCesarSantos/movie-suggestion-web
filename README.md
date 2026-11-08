# Movie Suggestion Web

Catálogo de filmes e séries em React + TypeScript, consumindo a API Go em `http://localhost:8080`.

## Stack
- Vite + React 18 + TypeScript
- Tailwind CSS
- React Router v6
- TanStack Query
- Axios
- Vitest + React Testing Library + MSW
- Cypress

## Requisitos
- Node 18+
- Backend rodando em `http://localhost:8080` (ver `openapi.yml`)

## Scripts
```bash
npm install
npm run dev          # inicia dev server em http://localhost:5173
npm run test         # testes unitários e de integração
npm run cypress:run  # testes E2E
npm run build        # build de produção
```

## Estrutura de agentes e skills

O projeto define um fluxo com 6 subagentes especializados em `.claude/agents/` e 8 skills em `.claude/skills/`:

**Fluxo recomendado para cada feature:**
1. `ux-designer` → cria protótipo em `docs/prototypes/`
2. `react-developer` → implementa o código
3. `code-reviewer` → revisa qualidade
4. `test-developer` → escreve testes
5. `test-executor` → roda a suíte
6. `app-validator` → valida visualmente no Chrome

## Simulação de reprodução

Este catálogo **não reproduz vídeos reais**. O botão "Reproduzir" abre um modal com barra de progresso animada simulando playback.
