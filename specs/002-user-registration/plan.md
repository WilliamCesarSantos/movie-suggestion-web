# Implementation Plan: User Registration Screen

**Branch**: `002-user-registration` | **Date**: 2026-06-15 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/002-user-registration/spec.md`

## Summary

Build a protected user registration screen accessible only to authenticated users with the `users:write` role. The screen renders a form with fields `name`, `email`, `password`, `confirmPassword`, and `roles` (multi-select checkboxes). On submit, it calls `POST /api/v1/users` via a typed service, shows a success notification and resets the form, or displays inline/banner error messages on failure.

## Technical Context

**Language/Version**: TypeScript ~6.0 / React 19.2.6  
**Primary Dependencies**: react-router-dom v7, Tailwind CSS v4 + @tailwindcss/vite  
**Storage**: N/A (auth session from localStorage managed by `useAuth`, owned by 001-login-screen)  
**Testing**: Not yet configured  
**Target Platform**: Web SPA (Vite + React)  
**Project Type**: Web application  
**Performance Goals**: Success notification within 1s of submission (SC-004)  
**Constraints**: No Redux, no form libraries, native `fetch`, modular simple structure  
**Scale/Scope**: Single screen, 1 API endpoint, 5 form fields

## Constitution Check

*GATE: Pre-design — PASS. Post-design — PASS.*

- [x] Stack oficial preservada: React (Vite), TypeScript e Tailwind CSS
- [x] Estrutura modular simples prevista: src/components, src/services, src/hooks
- [x] Gestao de estado definida com hooks nativos (`useState`, `useEffect`)
- [x] Nenhum uso de Redux ou ferramenta complexa sem aprovacao explicita
- [x] Integracao HTTP isolada em servicos usando `fetch` nativo
- [x] Tipagem de API alinhada ao OpenAPI fornecido
- [x] Plano legivel para backend senior em aprendizado de frontend

## Project Structure

### Documentation (this feature)

```text
specs/002-user-registration/
├── plan.md              # This file
├── research.md          # Phase 0 — routing, Tailwind, auth context, form patterns
├── data-model.md        # Phase 1 — types, entities, state transitions
├── quickstart.md        # Phase 1 — how to add protected screens
├── contracts/
│   └── post-users.md    # Phase 1 — POST /api/v1/users full contract
└── tasks.md             # Phase 2 — /speckit.tasks command output
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ProtectedRoute.tsx       # Route-level auth + role guard (shared)
│   └── RegisterUserForm.tsx     # Registration form component
├── pages/
│   └── RegisterUserPage.tsx     # Page wrapper
├── services/
│   └── users.ts                 # createUser() + TypeScript types + AVAILABLE_ROLES
└── hooks/
    └── useAuth.ts               # (from 001-login-screen) session + roles hook
```

**Structure Decision**: Single-project SPA. The `src/pages/` directory is added to hold page-level components (thin wrappers that compose form + layout). All HTTP logic stays in `src/services/`. The route guard lives in `src/components/ProtectedRoute.tsx` and is reusable across all protected screens.

## Implementation Steps

### Step 1 — Install Missing Dependencies (pre-condition)
- Install `react-router-dom` v7
- Install `tailwindcss` v4 + `@tailwindcss/vite`
- Configure `vite.config.ts` with `tailwindcss()` plugin
- Replace `src/index.css` with `@import "tailwindcss";`

> **Note**: Steps 1 and the `useAuth` hook may already be done by 001-login-screen. If so, skip.

### Step 2 — Auth Context (shared, from 001-login-screen)
- `src/hooks/useAuth.ts`: `AuthProvider` + `useAuth()` hook reading `localStorage`
- Exposes `session: Session | null`

### Step 3 — Service Layer
- `src/services/users.ts`:
  - Export `AVAILABLE_ROLES` constant
  - Export `CreateUserRequest` and `CreateUserResponse` interfaces
  - Export `createUser(data, token): Promise<CreateUserResponse>`
  - Handle 409 as `text/plain`, other errors as typed `ApiError`

### Step 4 — ProtectedRoute Component
- `src/components/ProtectedRoute.tsx`:
  - Read `session` from `useAuth()`
  - If no session → `<Navigate to="/login" replace />`
  - If `requiredRole` provided and not in `session.roles` → `<Navigate to="/" replace />`
  - Otherwise → `<Outlet />`

### Step 5 — RegisterUserForm Component
- `src/components/RegisterUserForm.tsx`:
  - Controlled inputs for `name`, `email`, `password`, `confirmPassword`
  - Checkbox group for `roles` using `AVAILABLE_ROLES`
  - `validate()` function returning `FormErrors`
  - `handleSubmit`: validate → call `createUser` → success notification + reset / error display
  - Loading state disables submit button during request
  - 409 → inline error on email field
  - 401 → redirect to `/login`
  - Other errors → generic banner, form preserved

### Step 6 — RegisterUserPage
- `src/pages/RegisterUserPage.tsx`:
  - Thin wrapper composing `RegisterUserForm` with page title/layout

### Step 7 — Router Configuration
- Update `src/main.tsx` (or `src/router.tsx`):
  - Wrap `/users/new` route inside `<ProtectedRoute requiredRole="users:write" />`

## Complexity Tracking

No violations. All implementation follows constitution principles without exception.
