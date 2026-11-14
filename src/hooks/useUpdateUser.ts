import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { patchUser } from "@/api/users";
import type { PatchUserRequest, PatchUserResponse } from "@/api/types";

export type UpdateUserVariables = { id: string; payload: PatchUserRequest };

export function useUpdateUser(): UseMutationResult<PatchUserResponse, unknown, UpdateUserVariables> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateUserVariables) => patchUser(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
