import { useMutation } from '@tanstack/react-query';
import { requestJson } from '../../api/client/httpClient';
import { createUserRequestSchema, createUserResponseSchema, type CreateUserRequest } from '../../api/schemas/userSchemas';

export function useCreateUser(token: string | undefined) {
  return useMutation({
    mutationFn: async (payload: CreateUserRequest) => {
      const request = createUserRequestSchema.parse(payload);
      const response = await requestJson('/api/v1/users', {
        method: 'POST',
        body: request,
        token
      });
      return createUserResponseSchema.parse(response);
    }
  });
}