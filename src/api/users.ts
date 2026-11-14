import { api } from "./client";
import type {
  CreateUserRequest,
  CreateUserResponse,
  ListUsersParams,
  ListUsersResponse,
  PatchUserRequest,
  PatchUserResponse,
  User,
} from "./types";

export async function listUsers(params: ListUsersParams = {}): Promise<ListUsersResponse> {
  const clean: ListUsersParams = {};
  if (params.name) clean.name = params.name;
  if (params.email) clean.email = params.email;
  if (params.page) clean.page = params.page;
  if (params.pageSize) clean.pageSize = params.pageSize;
  const { data } = await api.get<ListUsersResponse>("/api/v1/users", { params: clean });
  return data;
}

export async function createUser(payload: CreateUserRequest): Promise<CreateUserResponse> {
  const { data } = await api.post<CreateUserResponse>("/api/v1/users", payload);
  return data;
}

export async function getUser(id: string): Promise<User> {
  const { data } = await api.get<User>(`/api/v1/users/${encodeURIComponent(id)}`);
  return data;
}

export async function patchUser(id: string, payload: PatchUserRequest): Promise<PatchUserResponse> {
  const { data } = await api.patch<PatchUserResponse>(`/api/v1/users/${encodeURIComponent(id)}`, payload);
  return data;
}
