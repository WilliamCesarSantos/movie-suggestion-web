import { useQuery } from '@tanstack/react-query';
import { requestJson } from '../../api/client/httpClient';
import { listUsersResponseSchema } from '../../api/schemas/userSchemas';

export function useUsersList(token: string | undefined) {
  return useQuery({
    queryKey: ['users', 'list'],
    queryFn: async () => {
      const response = await requestJson('/api/v1/users', { token });
      return listUsersResponseSchema.parse(response);
    }
  });
}
