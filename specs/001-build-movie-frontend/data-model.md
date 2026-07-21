# Data Model: Build Movie Frontend

## Entity: AuthSession
- Description: Represents authenticated frontend session state.
- Fields:
  - accessToken: string
  - refreshToken: string | null
  - expiresAt: string (ISO datetime)
  - user: AuthUser
- Validation rules:
  - accessToken must be non-empty.
  - expiresAt must be a valid ISO datetime.
- State transitions:
  - anonymous -> authenticated
  - authenticated -> expired
  - expired -> refreshed | anonymous

## Entity: AuthUser
- Description: Logged user profile returned by login endpoint.
- Fields:
  - id: string
  - name: string
  - email: string
  - roles: RolePermission[]
- Validation rules:
  - roles array can be empty, but empty means no explicit permission.
  - duplicate roles are normalized to unique values.

## Entity: RolePermission
- Description: Authorization capability token for route and UI decisions.
- Fields:
  - code: 'users:read' | 'users:write' | 'movies:read' | 'movies-watch:write' | 'movies:write' | '*'
- Validation rules:
  - unknown role code is ignored for grants and logged for diagnostics.
- Derived rules:
  - `*` grants all capabilities.

## Entity: MenuCapability
- Description: Declarative mapping of menu entries to required role sets.
- Fields:
  - key: 'user.register' | 'user.list' | 'movie.import' | 'movie.watch'
  - requiredAnyRoles: RolePermission[]
  - behaviorWhenDenied: 'hidden'
- Validation rules:
  - each menu key must define at least one required role.

## Entity: MovieRecommendation
- Description: Item displayed in infinite home feed.
- Fields:
  - id: string
  - title: string
  - overviewShort: string
  - posterUrl: string | null
  - score: number | null
- Validation rules:
  - id and title are required.

## Entity: RecommendationPage
- Description: Paginated response unit for recommendations.
- Fields:
  - items: MovieRecommendation[]
  - page: number
  - pageSize: number
  - hasNextPage: boolean
  - nextPage: number | null
- Validation rules:
  - page >= 1
  - pageSize > 0

## Entity: MovieDetail
- Description: Expanded movie data loaded by id.
- Fields:
  - id: string
  - title: string
  - description: string
  - genres: string[]
  - releaseYear: number | null
  - durationMinutes: number | null
- Validation rules:
  - id and title are required.

## Entity: MovieImportRequest
- Description: Input payload from import textarea.
- Fields:
  - rawText: string
  - movieNames: string[]
- Validation rules:
  - movieNames are parsed by line split, trim, and blank removal.
  - duplicates may be preserved or deduplicated according to backend response contract.

## Entity: WatchedRating
- Description: User rating submission for watched flow.
- Fields:
  - movieId: string
  - rating: number
  - classification: 'bad' | 'good'
- Validation rules:
  - rating range: 0..10
  - classification rule: rating < 7 => bad, rating >= 7 => good
- State transitions:
  - draft -> submitted -> confirmed | failed

## Relationships
- AuthSession 1:1 AuthUser
- AuthUser 1:N RolePermission
- RecommendationPage 1:N MovieRecommendation
- MovieRecommendation 1:1 MovieDetail (lookup by id)
- MovieDetail 1:N WatchedRating (historical per user context)

## RBAC-sensitive Views
- Home recommendation feed: requires any of movies:read, movies-watch:write, movies:write, *
- User register: requires users:write or *
- User list: requires users:read or *
- User edit action in list: requires users:write or *
- Movie import: requires movies:write or *
- Watch action/rating submit: requires movies-watch:write or movies:write or *