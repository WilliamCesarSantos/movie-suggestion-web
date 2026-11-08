import { api } from "./client";
import type {
  GetMoviesParams,
  Movie,
  RecommendationsPageResponse,
  RecordWatchedRequest,
  WatchedResponse,
} from "./types";

export async function getMovies(params: GetMoviesParams = {}): Promise<RecommendationsPageResponse> {
  const { data } = await api.get<RecommendationsPageResponse>("/api/v1/movies", { params });
  return data;
}

export async function getMovieById(id: string): Promise<Movie> {
  const { data } = await api.get<Movie>(`/api/v1/movies/${id}`);
  return data;
}

export async function recordWatched(id: string, payload: RecordWatchedRequest): Promise<WatchedResponse> {
  const { data } = await api.post<WatchedResponse>(`/api/v1/movies/${id}/watched`, payload);
  return data;
}
