import { z } from 'zod';

export const movieRecommendationSchema = z.object({
  id: z.string(),
  title: z.string(),
  year: z.string().optional().default(''),
  poster: z.string().nullable().optional(),
  imdbRating: z.number().nullable().optional()
});

export const recommendationPageSchema = z
  .object({
    data: z.array(movieRecommendationSchema),
    nextCursor: z.string().nullable().optional(),
    prevCursor: z.string().nullable().optional(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
    limit: z.number().int().optional(),
    count: z.number().int().optional(),
    total: z.number().int().optional()
  })
  .transform((value) => ({
    items: value.data.map((movie) => ({
      id: movie.id,
      title: movie.title,
      overviewShort: movie.year,
      posterUrl: movie.poster ?? null,
      score: movie.imdbRating ?? null
    })),
    nextCursor: value.nextCursor ?? null,
    prevCursor: value.prevCursor ?? null,
    hasNextPage: value.hasNext,
    hasPrevPage: value.hasPrev
  }));

export const movieDetailSchema = z
  .object({
    ID: z.string(),
    Title: z.string(),
    Plot: z.string(),
    Genres: z.array(z.object({ Name: z.string() })).default([]),
    Year: z.string().optional().default(''),
    Runtime: z.string().optional().default(''),
    Poster: z.string().optional().default(''),
    ImdbRating: z.number().nullable().optional()
  })
  .transform((value) => ({
    id: value.ID,
    title: value.Title,
    description: value.Plot,
    genres: value.Genres.map((genre) => genre.Name),
    releaseYear: value.Year,
    duration: value.Runtime,
    posterUrl: value.Poster,
    score: value.ImdbRating ?? null
  }));

export const triggerImportRequestSchema = z.object({
  searchTerms: z.array(z.string()).min(1),
  maxPages: z.number().int().min(1).default(1)
});

export const watchedResponseSchema = z.object({
  userId: z.string(),
  movieId: z.string(),
  rating: z.number(),
  reaction: z.enum(['liked', 'disliked', 'neutral']),
  watchedAt: z.string()
});

export type RecommendationPage = z.output<typeof recommendationPageSchema>;
export type MovieRecommendation = RecommendationPage['items'][number];
export type MovieDetail = z.output<typeof movieDetailSchema>;
