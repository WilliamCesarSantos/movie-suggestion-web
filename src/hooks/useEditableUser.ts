import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUser, listUsers } from "@/api/users";
import type { ListUsersItem, ListUsersResponse } from "@/api/types";

export class UserNotFoundError extends Error {
  constructor() {
    super("USER_NOT_FOUND");
    this.name = "UserNotFoundError";
  }
}

/**
 * Resolves the user to edit: router state, then TanStack cache, then API
 * (GET /users/{id} followed by GET /users?email=).
 */
export function useEditableUser(id: string, fromState: ListUsersItem | null) {
  const qc = useQueryClient();

  const cached = useMemo<ListUsersItem | null>(() => {
    if (fromState && fromState.id === id) return fromState;
    const entries = qc.getQueriesData<ListUsersResponse>({ queryKey: ["users", "list"] });
    for (const [, data] of entries) {
      const found = data?.data.find((u) => u.id === id);
      if (found) return found;
    }
    return null;
  }, [qc, id, fromState]);

  const query = useQuery({
    queryKey: ["users", "detail", id],
    enabled: cached === null,
    retry: false,
    staleTime: 30_000,
    queryFn: async (): Promise<ListUsersItem> => {
      const detail = await getUser(id);
      const page = await listUsers({ email: detail.Email, pageSize: 1 });
      const found = page.data.find((u) => u.id === id);
      if (!found) throw new UserNotFoundError();
      return found;
    },
  });

  return { user: cached ?? query.data ?? null, isLoading: cached === null && query.isLoading, error: query.error };
}
