import { z } from 'zod';

export const listUsersItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  roles: z.array(z.string()).default([]),
  createdAt: z.string()
});

export const listUsersResponseSchema = z.object({
  data: z.array(listUsersItemSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int()
});

export const createUserRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  roles: z.array(z.string()).min(1)
});

export const createUserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  roles: z.array(z.string()).default([]),
  createdAt: z.string()
});

export type ListUsersItem = z.infer<typeof listUsersItemSchema>;
export type ListUsersResponse = z.infer<typeof listUsersResponseSchema>;
export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;