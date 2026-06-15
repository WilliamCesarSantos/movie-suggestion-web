# Data Model: User Registration Screen

**Feature**: 002-user-registration  
**Date**: 2026-06-15  
**Source**: OpenAPI `CreateUserRequest` / `CreateUserResponse` + clarifications

---

## Entities

### 1. `CreateUserRequest`

Data sent to `POST /api/v1/users`.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | `string` | Yes | Non-empty |
| `email` | `string` | Yes | Non-empty, valid email format |
| `password` | `string` | Yes | Non-empty |
| `roles` | `string[]` | Yes | Minimum 1 item; values from `AVAILABLE_ROLES` |

> `confirmPassword` is a **form-only** field — it is validated client-side and **not** included in the API request body.

---

### 2. `CreateUserResponse`

Data returned by `POST /api/v1/users` on success (HTTP 201).

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` (UUID) | Unique identifier of the created user |
| `name` | `string` | Confirmed name |
| `email` | `string` | Confirmed email |
| `roles` | `string[]` | Roles assigned to the new user |
| `createdAt` | `string` (ISO 8601) | Creation timestamp |

---

### 3. `AVAILABLE_ROLES` (constant)

Fixed TypeScript constant — no API call required.

```ts
export const AVAILABLE_ROLES = [
  'users:read',
  'users:write',
  'suggestions:read',
  'movies:read',
  'movie-watch:write',
] as const;

export type Role = typeof AVAILABLE_ROLES[number];
```

---

### 4. `RegisterFormState` (UI-only)

Internal React state shape for the registration form.

| Field | Type | Notes |
|-------|------|-------|
| `name` | `string` | Controlled input |
| `email` | `string` | Controlled input |
| `password` | `string` | Controlled input |
| `confirmPassword` | `string` | UI-only, not sent to API |
| `roles` | `string[]` | Controlled checkbox group |

---

### 5. `RegisterFormErrors` (UI-only)

Per-field error state for inline validation feedback.

| Field | Type | Populated when |
|-------|------|----------------|
| `name` | `string \| undefined` | Field empty |
| `email` | `string \| undefined` | Empty or invalid format |
| `password` | `string \| undefined` | Field empty |
| `confirmPassword` | `string \| undefined` | Empty or doesn't match `password` |
| `roles` | `string \| undefined` | No roles selected |

---

### 6. `Session` (Auth Context — consumed, not owned by this feature)

Provided by `useAuth()` hook (defined in 001-login-screen feature).

| Field | Type | Notes |
|-------|------|-------|
| `token` | `string` | JWT Bearer token |
| `email` | `string` | Authenticated user email |
| `roles` | `string[]` | Used for route-level `users:write` guard |
| `expiresAt` | `string` (ISO 8601) | Token expiry |

---

## State Transitions

```
Initial (empty form)
  → user fills fields
  → submit attempt
    ├── validation errors → show inline errors, no API call
    └── validation pass
          → loading state (submit disabled)
          → POST /users
              ├── 201 Created → success notification + form reset → Initial
              ├── 409 Conflict → inline error on email field, form preserved
              └── 4xx/5xx/network → generic error banner, form preserved
```

---

## File Location Map

| Artifact | Path |
|----------|------|
| TypeScript types | `src/services/users.ts` (request/response interfaces) |
| `AVAILABLE_ROLES` constant | `src/services/users.ts` |
| Form state types | `src/components/RegisterUserForm.tsx` (local types) |
| `Session` type | `src/hooks/useAuth.ts` (owned by 001-login-screen) |
