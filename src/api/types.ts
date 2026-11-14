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

export type UserRole =
  | "users:read"
  | "users:write"
  | "movies:read"
  | "movies-watch:write"
  | "movies:write";

export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
  roles: string[];
};

export type UserResponse = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: string;
};

export type CreateUserResponse = UserResponse;
export type PatchUserResponse = UserResponse;
export type ListUsersItem = UserResponse;

export type PatchUserRequest = {
  name?: string;
  password?: string;
  /** Replaces the whole list; may include non-assignable roles such as "*" that must be preserved. */
  roles?: string[];
};

/** GET /users/{id} returns capitalized keys and no roles. */
export type User = {
  ID: string;
  Name: string;
  Email: string;
  CreatedAt: string;
};

export type ListUsersResponse = {
  data: ListUsersItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type ListUsersParams = {
  name?: string;
  email?: string;
  page?: number;
  pageSize?: number;
};

export type TriggerImportRequest = {
  searchTerms: string[];
  maxPages: number;
};

export type TriggerImportResponse = {
  status: string;
};
