import { useMutation } from '@tanstack/react-query';
import { requestJson } from '../../api/client/httpClient';
import { watchedResponseSchema } from '../../api/schemas/movieSchemas';

interface SubmitPayload {
  movieId: string;
  rating: number;
}

export function classifyRating(rating: number): 'bad' | 'good' {
  return rating < 7 ? 'bad' : 'good';
}

export function toReaction(rating: number): 'liked' | 'disliked' | 'neutral' {
  if (rating < 7) return 'disliked';
  if (rating > 7) return 'liked';
  return 'neutral';
}

export function useSubmitWatchedRating(token: string | undefined) {
  return useMutation({
    mutationFn: async ({ movieId, rating }: SubmitPayload) => {
      if (!Number.isInteger(rating) || rating < 0 || rating > 10) {
        throw new Error('Rating must be an integer between 0 and 10.');
      }
      const response = await requestJson(`/api/v1/movies/${movieId}/watched`, {
        method: 'POST',
        body: { rating, reaction: toReaction(rating) },
        token
      });
      return watchedResponseSchema.parse(response);
    }
  });
}
