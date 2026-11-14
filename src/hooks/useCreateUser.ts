import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { createUser } from "@/api/users";
import type { CreateUserRequest, CreateUserResponse } from "@/api/types";

export function useCreateUser(): UseMutationResult<CreateUserResponse, unknown, CreateUserRequest> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
