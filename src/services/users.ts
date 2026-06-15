const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const AVAILABLE_ROLES = [
  'users:read',
  'users:write',
  'suggestions:read',
  'movies:read',
  'movie-watch:write',
] as const

export type Role = (typeof AVAILABLE_ROLES)[number]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  roles: string[]
}

export interface CreateUserResponse {
  id: string
  name: string
  email: string
  roles: string[]
  createdAt: string
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export async function createUser(
  data: CreateUserRequest,
  token: string,
): Promise<CreateUserResponse> {
  const response = await fetch(`${API_BASE}/api/v1/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (response.status === 409) {
    const message = await response.text()
    throw new ApiError(409, message)
  }

  if (!response.ok) {
    const message = await response.text().catch(() => 'unexpected error')
    throw new ApiError(response.status, message)
  }

  return response.json() as Promise<CreateUserResponse>
}
