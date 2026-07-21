import { useQuery } from '@tanstack/react-query';
import { requestJson } from '../../api/client/httpClient';
import { movieDetailSchema } from '../../api/schemas/movieSchemas';

export function useMovieDetail(movieId: string | undefined, token: string | undefined) {
  return useQuery({
    queryKey: ['movies', 'detail', movieId],
    enabled: Boolean(movieId),
    queryFn: async () => {
      const response = await requestJson(`/api/v1/movies/${movieId}`, { token });
      return movieDetailSchema.parse(response);
    }
  });
}
