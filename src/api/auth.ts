import { api } from "./client";
import type { LoginRequest, LoginResponse } from "./types";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/api/v1/login", payload);
  return data;
}
