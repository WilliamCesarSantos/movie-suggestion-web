import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { listUsers } from "@/api/users";
import type { ListUsersResponse } from "@/api/types";

export const USERS_PAGE_SIZE = 20;

export type UsersFilters = { name: string; email: string };

export function useUsers(page: number, filters: UsersFilters): UseQueryResult<ListUsersResponse> {
  return useQuery({
    queryKey: ["users", "list", page, filters.name, filters.email],
    queryFn: () => listUsers({ page, pageSize: USERS_PAGE_SIZE, name: filters.name, email: filters.email }),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
