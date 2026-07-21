# Frontend Interface Contract

## Contract Source
- Authoritative API contract: `https://github.com/WilliamCesarSantos/movie-suggestion-api/blob/main/openapi.yaml`

## Authentication and Session
- Login Screen
  - Input: credentials required by API login endpoint from OpenAPI.
  - Output: authenticated user data with roles must be available in frontend session.
  - Contract requirement: role list MUST be extracted and normalized before route rendering.
  - Visual requirement: login UI MUST follow the dedicated clean Material Design proposal documented in `specs/001-build-movie-frontend/contracts/login-screen-contract.md`.

## Authorization Contract (RBAC)
- Recognized role tokens:
  - `users:read`
  - `users:write`
  - `movies:read`
  - `movies-watch:write`
  - `movies:write`
  - `*`
- Wildcard behavior:
  - `*` grants all protected route/menu/action capabilities.
- Deny-by-default behavior:
  - Missing/invalid/unrecognized roles provide no grants.

## Endpoint Consumption Contract

### GET /api/v1/movies
- Purpose: recommendation feed for home/watch listing.
- UI usage: infinite scroll paginated fetch.
- Minimum expected client behavior:
  - handle loading, append, empty-page stop, and retry-on-failure.

### GET /api/v1/movies/{id}
- Purpose: movie detail for selected recommendation.
- UI usage: expanded description view before watch/rating transition.

### POST /api/v1/movies/{id}/watched
- Purpose: submit watched rating.
- UI usage: rating form after watch intent.
- Business rule in client:
  - rating < 7 classified as bad.

### POST /api/v1/movies-import
- Purpose: import movies from multiline text input.
- UI usage: Movie > Import screen with textarea (one movie name per line).

## Route and Menu Protection Contract
- Home recommendation content:
  - Requires one of `movies:read`, `movies-watch:write`, `movies:write`, `*`.
  - If denied: show friendly lock/info fallback.
- User > Register:
  - Requires `users:write` or `*`.
- User > List:
  - Requires `users:read` or `*`.
  - Edit affordance in list requires `users:write` or `*`.
- Movie > Import:
  - Requires `movies:write` or `*`.
- Movie > Watch:
  - Requires one of `movies:read`, `movies-watch:write`, `movies:write`, `*`.

## RBAC Visibility Matrix
- Home feed:
  - Visible for `movies:read`, `movies-watch:write`, `movies:write`, `*`
  - Fallback for all other role sets
- User > Register:
  - Visible only for `users:write`, `*`
- User > List:
  - Visible only for `users:read`, `*`
- User list edit action:
  - Visible only for `users:write`, `*`
- Movie > Import:
  - Visible only for `movies:write`, `*`
- Movie > Watch:
  - Visible for `movies:read`, `movies-watch:write`, `movies:write`, `*`

## Non-Breaking UX Contract
- Unauthorized access never yields broken/blank screen.
- Protected controls are hidden when denied.
- Route guard and component-level guard must be consistent for the same capability.
- Login keeps only the essential authentication fields and one primary CTA in the default viewport.