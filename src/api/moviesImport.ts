import { api } from "./client";
import type { TriggerImportRequest, TriggerImportResponse } from "./types";

export async function triggerImport(body: TriggerImportRequest): Promise<TriggerImportResponse> {
  const { data } = await api.post<TriggerImportResponse>("/api/v1/movies-import", body);
  return data;
}
