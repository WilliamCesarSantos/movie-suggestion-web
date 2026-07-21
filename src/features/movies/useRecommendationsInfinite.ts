import { useInfiniteQuery } from '@tanstack/react-query';
import { requestJson } from '../../api/client/httpClient';
import { recommendationPageSchema } from '../../api/schemas/movieSchemas';

export function useRecommendationsInfinite(token: string | undefined, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ['movies', 'recommendations'],
    enabled,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const query = new URLSearchParams();
      query.set('limit', '10');
      if (pageParam) {
        query.set('cursor', pageParam);
      }
      const response = await requestJson(`/api/v1/movies?${query.toString()}`, { token });
      return recommendationPageSchema.parse(response);
    },
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined)
  });
}
