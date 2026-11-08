import { useInfiniteQuery } from "@tanstack/react-query";
import { getMovies } from "@/api/movies";

export function useInfiniteMovies(title?: string) {
  return useInfiniteQuery({
    queryKey: ["movies", title ?? ""],
    queryFn: ({ pageParam }) => getMovies({ cursor: pageParam, title, limit: 20 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNext && lastPage.nextCursor ? lastPage.nextCursor : undefined),
    staleTime: 60_000,
  });
}
