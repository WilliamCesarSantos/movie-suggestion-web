import { useMutation } from '@tanstack/react-query';
import { requestJson } from '../../api/client/httpClient';
import { triggerImportRequestSchema } from '../../api/schemas/movieSchemas';

interface MovieImportPayload {
  searchTerms: string[];
  maxPages: number;
}

export function useMovieImport(token: string | undefined) {
  return useMutation({
    mutationFn: async (payload: MovieImportPayload) =>
      requestJson('/api/v1/movies-import', {
        method: 'POST',
        body: triggerImportRequestSchema.parse(payload),
        token
      })
  });
}
