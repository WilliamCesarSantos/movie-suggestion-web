import { z } from 'zod';

export const roleSchema = z.enum([
  'users:read',
  'users:write',
  'movies:read',
  'movies-watch:write',
  'movies:write',
  '*'
]);

export const authUserSchema = z.object({
  id: z.string().default(''),
  name: z.string().default(''),
  email: z.string().email(),
  roles: z.array(z.string()).default([])
});

export const loginResponseSchema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
  roles: z.array(z.string()).default([]),
  expiresAt: z.string(),
  refreshToken: z.string().nullable().optional()
});

export const authSessionSchema = loginResponseSchema.transform((value) => ({
  accessToken: value.token,
  refreshToken: value.refreshToken ?? null,
  expiresAt: value.expiresAt,
  user: authUserSchema.parse({
    email: value.email,
    name: value.email,
    roles: value.roles
  })
}));

export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthSession = z.infer<typeof authSessionSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
