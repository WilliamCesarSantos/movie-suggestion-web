# API Contract: POST /api/v1/users

**Source**: [openapi.yaml](https://github.com/WilliamCesarSantos/movie-suggestion-api/blob/main/openapi.yaml)  
**Feature**: 002-user-registration  
**Date**: 2026-06-15

---

## Endpoint

| Property | Value |
|----------|-------|
| Method | `POST` |
| Path | `/api/v1/users` |
| Auth | `Bearer <JWT>` (required) |
| Required role | `users:write` |
| Content-Type (request) | `application/json` |
| Content-Type (response 201) | `application/json` |

---

## Request Body

```ts
interface CreateUserRequest {
  name: string;         // required
  email: string;        // required, email format
  password: string;     // required
  roles: string[];      // required, min 1 item
}
```

**Example**:
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "s3cr3t",
  "roles": ["users:read", "movies:read"]
}
```

---

## Responses

### 201 Created

```ts
interface CreateUserResponse {
  id: string;           // UUID
  name: string;
  email: string;
  roles: string[];
  createdAt: string;    // ISO 8601
}
```

**Example**:
```json
{
  "id": "90b4fd08-ee46-4d54-a7c0-1bab4857cec3",
  "name": "Alice",
  "email": "alice@example.com",
  "roles": ["users:read", "movies:read"],
  "createdAt": "2026-06-15T10:00:00Z"
}
```

---

### 400 Bad Request

**Content-Type**: `text/plain`

```
invalid request body
```

_Client-side validation (FR-005) prevents this in normal flows._

---

### 401 Unauthorized

**Content-Type**: `text/plain`

```
unauthorized
```

_Session expired mid-form — app must redirect to `/login`._

---

### 403 Forbidden

**Content-Type**: `text/plain`

```
forbidden
```

_User lacks `users:write` role — blocked at route level before form renders (FR-001/FR-003)._

---

### 409 Conflict

**Content-Type**: `text/plain`

```
email already exists
```

_Must be displayed inline near the email field (Edge Cases)._

---

### 500 Internal Server Error

**Content-Type**: `text/plain`

```
internal server error
```

_Generic error banner displayed, form data preserved (FR-007)._

---

## Frontend Service Signature

```ts
// src/services/users.ts

export async function createUser(
  data: CreateUserRequest,
  token: string
): Promise<CreateUserResponse>
```

**Throws**:
- `ApiError(409, "email already exists")` — on 409
- `ApiError(401, "unauthorized")` — on 401
- `ApiError(status, message)` — on other non-2xx responses
- `Error` — on network failure
