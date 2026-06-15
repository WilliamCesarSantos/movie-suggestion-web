# Research: User Registration Screen

**Feature**: 002-user-registration  
**Date**: 2026-06-15  
**Status**: Complete — all NEEDS CLARIFICATION resolved

---

## Topic 1: react-router-dom v7 — Protected Routes (role-based)

**Decision**: Use `react-router-dom` v7 with a `ProtectedRoute` wrapper component.

**Rationale**: The spec requires route-level access control (FR-001 to FR-003). React Router v7 supports nested routes, making it natural to wrap protected screens behind a guard component that reads the auth context and redirects if the user is unauthenticated or lacks a required role. This is the standard SPA pattern and requires no additional libraries.

**Pattern**:
```tsx
// src/components/ProtectedRoute.tsx
function ProtectedRoute({ requiredRole }: { requiredRole?: string }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (requiredRole && !session.roles.includes(requiredRole)) return <Navigate to="/" replace />;
  return <Outlet />;
}
```

**Alternatives considered**:
- Inline guard inside the component — rejected because spec explicitly requires route-level enforcement (FR-001).
- Third-party RBAC library — rejected; overkill for a fixed role list.

---

## Topic 2: Tailwind CSS v4 + Vite Setup

**Decision**: Install `tailwindcss` v4 with `@tailwindcss/vite` plugin (v4 native Vite integration).

**Rationale**: Tailwind v4 ships a dedicated Vite plugin that replaces PostCSS configuration. Since the project uses Vite 8, the v4 integration is preferred — it is faster and requires less config.

**Setup steps** (to be executed during implementation):
```bash
npm install tailwindcss @tailwindcss/vite
```
`vite.config.ts`: add `tailwindcss()` to plugins.  
`src/index.css`: replace content with `@import "tailwindcss";`.

**Alternatives considered**:
- Tailwind v3 + PostCSS — rejected; v4 is current and Vite-native.
- CSS Modules — rejected; constitution mandates Tailwind CSS.

---

## Topic 3: Auth Context — Reading JWT from localStorage

**Decision**: Create `src/hooks/useAuth.ts` that exposes a React context with the session object read from `localStorage`.

**Rationale**: The `002-user-registration` screen must read `session.roles` to enforce the `users:write` guard. Since the login feature (001) will persist `{ token, email, roles, expiresAt }` to `localStorage`, the auth context simply reads and parses it. This avoids prop-drilling and provides a shared interface for all protected routes.

**Shape**:
```ts
interface Session {
  token: string;
  email: string;
  roles: string[];
  expiresAt: string;
}
interface AuthContextValue {
  session: Session | null;
}
```

**Alternatives considered**:
- Passing session as props — rejected; would require threading through router.
- Redux store — rejected; constitution explicitly prohibits it without approval.

**Note**: `AuthProvider` and `useAuth` are foundational for both 001 and 002 features. They will be introduced in 001-login-screen and consumed here.

---

## Topic 4: Multi-Select Checkboxes for Roles (no library)

**Decision**: Render the fixed roles list as individual `<input type="checkbox">` elements controlled via a `string[]` state.

**Rationale**: The roles list is small (5 items) and static. A custom checkbox group using `useState<string[]>` is simple, readable, and requires zero dependencies. Each checkbox toggles its role string in/out of the array.

**Pattern**:
```ts
const AVAILABLE_ROLES = [
  'users:read', 'users:write', 'suggestions:read',
  'movies:read', 'movie-watch:write'
] as const;

const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

function toggleRole(role: string) {
  setSelectedRoles(prev =>
    prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
  );
}
```

**Alternatives considered**:
- `<select multiple>` — rejected; poor UX, harder to style.
- External select library (react-select) — rejected; overkill for 5 static options.

---

## Topic 5: Form State and Validation (no library)

**Decision**: Manage all form state with a single `useState` object and validate on submit with inline error state.

**Rationale**: The form has 5 fields (`name`, `email`, `password`, `confirmPassword`, `roles`). A single `errors` state object keyed by field name is sufficient. Validation runs synchronously before the API call. No form library (React Hook Form, Formik) is needed — constitution prioritizes simplicity and native hooks.

**Pattern**:
```ts
interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  roles: string[];
}
interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  roles?: string;
}
```

**Validation rules** (from FR-005 / FR-005a):
- `name`: required
- `email`: required + `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` format check
- `password`: required
- `confirmPassword`: required + must equal `password`
- `roles`: at least one item

**Alternatives considered**:
- React Hook Form — rejected; adds a dependency for a simple 5-field form.
- HTML5 `required` + `type="email"` native validation — partially useful but insufficient for cross-field validation (`confirmPassword`) and custom role check.

---

## Topic 6: API Error Handling — 409 Conflict

**Decision**: Parse response as text (not JSON) when status is 409 per the OpenAPI spec, and display the message inline near the email field.

**Rationale**: The `POST /users` spec documents `409` as `text/plain: "email already exists"`. The service must branch on status code and parse accordingly.

**Pattern**:
```ts
if (response.status === 409) {
  const message = await response.text();
  throw new ApiError(409, message); // e.g., "email already exists"
}
```

The `RegisterUserForm` component catches this and maps the 409 message to the `email` error field.

**Alternatives considered**:
- Always parse as JSON — incorrect per contract; 409 is `text/plain`.
- Generic error banner for 409 — rejected; inline error near email field provides better UX (spec requirement).

---

## Summary of Resolved Unknowns

| Item | Resolution |
|------|-----------|
| `POST /users` request body | `name`, `email`, `password`, `roles[]` |
| `POST /users` response (201) | `id`, `name`, `email`, `roles`, `createdAt` |
| `POST /users` error (409) | `text/plain`: `"email already exists"` |
| Post-submit behavior | Reset form + success notification, stay on screen |
| Roles source | TypeScript constant `AVAILABLE_ROLES`, 5 known values |
| Roles validation | At least 1 required |
| Password UX | `password` + `confirmPassword`, must match |
| Routing library | `react-router-dom` v7 |
| Tailwind setup | Tailwind v4 + `@tailwindcss/vite` |
| Auth context | `useAuth` hook reading `localStorage`, exposes `session.roles` |
