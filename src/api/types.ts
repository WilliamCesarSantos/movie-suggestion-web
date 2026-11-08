export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  email: string;
  roles: string[];
  expiresAt: string;
};

export type MovieSummary = {
  id: string;
  title: string;
  year: string;
  poster: string;
  imdbRating: number;
};

export type Genre = { ID: string; Name: string };
export type Actor = { ID: string; Name: string };
export type Director = { ID: string; Name: string };

export type Movie = {
  ID: string;
  Title: string;
  Year: string;
  Plot: string;
  Runtime: string;
  Poster: string;
  ImdbRating: number;
  ImdbID: string;
  Genres: Genre[];
  Actors: Actor[];
  Directors: Director[];
};

export type RecommendationAlgorithm =
  | "POPULAR"
  | "CONTENT_BASED"
  | "COLLABORATIVE"
  | "HYBRID"
  | "SERENDIPITY";

export type RecommendationsPageResponse = {
  data: MovieSummary[];
  nextCursor: string | null;
  prevCursor: string | null;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
  count: number;
  total: number;
};

export type GetMoviesParams = {
  cursor?: string;
  limit?: number;
  algorithm?: RecommendationAlgorithm;
  title?: string;
};

export type RecordWatchedRequest = {
  rating: number;
  reaction: "liked" | "disliked" | "neutral";
};

export type WatchedResponse = {
  status: string;
};
