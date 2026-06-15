# Quickstart: User Registration Screen

**Feature**: 002-user-registration  
**Date**: 2026-06-15

This guide explains how the User Registration Screen is structured and how to add similar protected screens to the application.

---

## Prerequisites

Before implementing this feature, the following must be in place (introduced in 001-login-screen):

- `react-router-dom` v7 installed
- Tailwind CSS v4 configured
- `src/hooks/useAuth.ts` — `AuthProvider` and `useAuth` hook
- `src/hooks/AuthContext.tsx` — React context for session state

---

## File Structure for This Feature

```
src/
├── components/
│   ├── ProtectedRoute.tsx       # Route-level auth + role guard (shared)
│   └── RegisterUserForm.tsx     # Form component for user registration
├── pages/
│   └── RegisterUserPage.tsx     # Page wrapper, consumes RegisterUserForm
├── services/
│   └── users.ts                 # createUser() service + TypeScript types
└── hooks/
    └── useAuth.ts               # (from 001) useAuth hook — session + roles
```

---

## How Role-Based Access Works

The `ProtectedRoute` component wraps any route that requires authentication and/or a specific role:

```tsx
// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Props {
  requiredRole?: string;
}

export function ProtectedRoute({ requiredRole }: Props) {
  const { session } = useAuth();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !session.roles.includes(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
```

### Registering the route in the router

```tsx
// src/main.tsx or src/router.tsx
<Route element={<ProtectedRoute requiredRole="users:write" />}>
  <Route path="/users/new" element={<RegisterUserPage />} />
</Route>
```

---

## Adding a New Protected Screen

To add another screen that requires a role:

1. Create `src/pages/MyNewPage.tsx`
2. Create `src/components/MyNewForm.tsx` (if it has a form)
3. Add the HTTP service call to the appropriate file in `src/services/`
4. Register the route in the router wrapped in `<ProtectedRoute requiredRole="my:role" />`

No changes to `ProtectedRoute.tsx` are needed — just pass the required role as a prop.

---

## Service Pattern

All API calls follow this pattern:

```ts
// src/services/users.ts
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export async function createUser(
  data: CreateUserRequest,
  token: string
): Promise<CreateUserResponse> {
  const response = await fetch(`${API_BASE}/api/v1/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (response.status === 409) {
    const message = await response.text();
    throw new ApiError(409, message);
  }

  if (!response.ok) {
    const message = await response.text().catch(() => 'unexpected error');
    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<CreateUserResponse>;
}
```

Key rules:
- `fetch` native — no Axios or other HTTP library.
- Token injected from `useAuth().session.token`.
- Non-2xx responses throw typed errors.
- 409 parsed as `text/plain` (not JSON).

---

## Environment Variable

Set in `.env.local` (not committed):

```
VITE_API_BASE_URL=http://localhost:8080
```
