# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev                 # dev server at http://localhost:5173 (proxies /api → localhost:8080)
npm run build               # tsc -b && vite build
npm run test                # vitest run (unit + integration)
npm run test:watch          # vitest watch mode
npm run cypress:open        # Cypress interactive runner
npm run cypress:run         # Cypress headless (needs dev server + backend running)

# Run a single test file
npx vitest run src/components/MovieCard/MovieCard.test.tsx

# Run tests matching a pattern
npx vitest run -t "renders poster"

# Type-check without emitting
npx tsc -b --noEmit
```

Cypress E2E requires both the Vite dev server (`localhost:5173`) **and** the Go backend (`localhost:8080`) running. Pass credentials via `Cypress.env("USER_EMAIL")` / `Cypress.env("USER_PASSWORD")`.

## Architecture

### API contract
`openapi.yml` is the source of truth for the backend contract (Go API at `localhost:8080`). All DTOs in `src/api/types.ts` mirror schemas from that file. When the backend changes, update `openapi.yml` first, then regenerate types manually.

Key endpoints used by the frontend:
- `POST /api/v1/login` → JWT + roles
- `GET /api/v1/movies?cursor=&limit=&title=` → cursor-paginated `RecommendationsPageResponse`
- `GET /api/v1/movies/{id}` → full `Movie` details
- `POST /api/v1/movies/{id}/watched` → record watch

### Request flow
`src/api/client.ts` is the single Axios instance. Request interceptor pulls token from `storage.getToken()` and sets `Authorization: Bearer <token>`. Response interceptor catches 401 → clears token → redirects to `/login` via `window.location`. This means **never** call `axios` directly — always go through `api` from `client.ts`.

### Server state
TanStack Query owns all server state. The catalog uses `useInfiniteMovies` (in `src/hooks/`), built on `useInfiniteQuery` with cursor-based pagination (`nextCursor` returned by the API becomes the next `pageParam`). Infinite scroll is driven by an `IntersectionObserver` on a sentinel element at the end of the grid — see the pattern in `.claude/skills/write-react-code/SKILL.md`.

### Simulation of playback — important
The product does **not** reproduce videos. A "play" button opens a modal with an animated progress bar. **Never** add `<video>` elements or real media playback — this is a hard product constraint, not a TODO.

### Styling
Tailwind only. Dark-first (`<html class="dark">`). Custom colors in `tailwind.config.js` (`background`, `surface`, `accent`). Grid breakpoints: 2 cols < 640px, 4 cols up to 1024px, 6 cols above.

### Testing layers
- **Unit** (`src/**/*.test.tsx`): component + hook isolation. Vitest + RTL. Selectors prioritize `getByRole`/`getByAltText`/`getByLabelText`. Mocks only at boundaries.
- **Integration** (`src/**/__tests__/*.integration.test.tsx`): component ↔ API via MSW. Handlers live in `src/test/handlers.ts` and are loaded globally via `src/test/setup.ts`. Each test should use an isolated `QueryClient` with `retry: false` to keep failures deterministic.
- **E2E** (`cypress/e2e/*.cy.ts`): real browser against real backend. Use `cy.login(email, password)` custom command (defined in `cypress/support/commands.ts`) to seed `localStorage` before visiting protected routes.

MSW handlers treat `http://localhost:8080` as the base — the Axios client uses the same base URL in both dev and test, so no URL swapping is needed between environments.

## Development workflow

This repo defines an `orchestrator` agent plus 6 specialized subagents in `.claude/agents/` and 8 skills in `.claude/skills/`.

**Entry point**: for any non-trivial command from the user, delegate to `orchestrator`. It interprets the command, builds a step-by-step plan, delegates to the right subagents via JSON messages in `.claude/messages/` (schema in `.claude/messages/README.md`), consolidates results, and validates the objective via `app-validator`. It loops corrective cycles (up to 3) when validation fails.

The orchestrator typically invokes this pipeline for a feature:

1. `ux-designer` creates/updates a wireframe in `docs/prototypes/<screen>.md` using the `prototype-screens` skill. The prototype lists every API field consumed, every state (loading/empty/error/success), and responsive behavior — this becomes the contract.
2. `react-developer` implements against the prototype using the `write-react-code` skill. Never adds new dependencies without explicit justification.
3. `code-reviewer` runs the `analyze-code-quality` checklist. Reports 🟢/🟡/🔴 — does not modify code.
4. `test-developer` writes unit, integration, and E2E tests via `write-unit-tests` / `write-integration-tests` / `write-e2e-cypress`.
5. `test-executor` runs the suite and reports failures — never modifies tests or code.
6. `app-validator` opens Chrome (via `chrome-browser` skill) and compares the running app against the prototype using the `validate-prototype` skill. This is the mandatory final gate.

Read the relevant agent and skill files before acting as that role — they contain project-specific constraints that override generic best practices.

## Conventions worth knowing

- Token key in `localStorage`: `movie_token` (used by Axios client, Cypress command, and auth hook — keep in sync if changed).
- Path alias `@/*` → `src/*` is wired in both `tsconfig.app.json` and `vite.config.ts`.
- Vitest config lives inside `vite.config.ts` (imported via `vitest/config` to avoid a Vite v5/v6 type conflict — do not revert to `defineConfig` from `vite`).
- `.claude/settings.local.json` is per-developer and gitignored. Shared agent/skill definitions go under `.claude/agents/` and `.claude/skills/`.
