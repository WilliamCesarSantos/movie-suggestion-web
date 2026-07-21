# Feature Specification: Build Movie Frontend

**Feature Branch**: `001-build-movie-frontend`

**Created**: 2026-07-19

**Status**: Draft

**Input**: User description: "Vou construir um front-end para consumir esse contrato aqui https://github.com/WilliamCesarSantos/movie-suggestion-api/blob/main/openapi.yaml"

## Clarifications

### Session 2026-07-19

- Q: Qual deve ser a politica de expiracao de sessao? -> A: Sessao sem refresh: ao expirar token, forcar logout imediato e redirecionar para login.
- Q: Qual faixa de nota deve ser aceita no frontend? -> A: Aceitar notas inteiras de 0 a 10.
- Q: Como tratar nomes de filmes duplicados na importacao? -> A: Remover duplicadas no frontend antes do envio.
- Q: Qual padrao global para controles sem permissao? -> A: Sempre hidden para controles sem permissao.
- Q: Como tratar respostas 401 e 403 da API? -> A: 401 faz logout e redireciona para login; 403 renderiza fallback de acesso negado na tela.

### Session 2026-07-20

- Q: Como a validacao de regressao deve ocorrer a cada alteracao? -> A: Um agente de QA deve executar testes no navegador usando `test_plan.md` como referencia obrigatoria.
- Q: Qual direcao visual deve ser seguida nas telas? -> A: Material Design com foco em UI/UX clean, reduzindo o numero de componentes visiveis ao minimo necessario.
- Q: O que deve acontecer antes de implementar qualquer nova tela ou alteracao visual relevante? -> A: Prototipos devem ser gerados, apresentados ao usuario e a implementacao so pode seguir apos confirmacao explicita.
- Q: Como a tela de login deve ser revisada? -> A: A tela de login deve ser redesenhada como uma experiencia clean, centrada, com hierarquia visual simples, poucos elementos e linguagem Material Design.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Login and Recommended Movies Home (Priority: P1)

As an authenticated user, I can log in, receive my user profile with roles, and access a movie recommendation home screen with infinite scrolling so I can immediately browse suggested movies.

**Why this priority**: This is the core product value and the minimum usable flow.

**Independent Test**: Can be fully tested by logging in with a valid account, loading the home recommendation list from `/api/v1/movies`, paginating through multiple pages via infinite scroll, and validating role-based fallback behavior for users without movie permissions.

**Acceptance Scenarios**:

1. **Given** a user with any of `movies:read`, `movies-watch:write`, `movies:write`, or `*`, **When** the user logs in successfully, **Then** the home screen shows recommended movies loaded from `/api/v1/movies`.
2. **Given** a user without any movie access role, **When** the user opens home, **Then** the UI shows a friendly no-access indicator icon instead of a broken content area.
3. **Given** a user browsing recommendations, **When** the user reaches the end of loaded items, **Then** the next page is requested and appended until no more pages are available.

---

### User Story 2 - User Management Menu and Permissions (Priority: P2)

As an authorized operator, I can access user registration and user listing options according to my roles so I can manage users safely.

**Why this priority**: User administration is a key operational flow and depends on the authenticated role model.

**Independent Test**: Can be fully tested by logging in with role combinations (`users:read` only, `users:write`, `*`) and validating menu visibility, register access, list access, and edit affordance behavior.

**Acceptance Scenarios**:

1. **Given** a user with `users:write` or `*`, **When** the system menu is opened, **Then** the User > Register option is visible and accessible.
2. **Given** a user with `users:read` or `*`, **When** the system menu is opened, **Then** the User > List option is visible and accessible.
3. **Given** a user with `users:read` and without `users:write`, **When** the user list is displayed, **Then** editing is not active.
4. **Given** a user with `users:write` or `*`, **When** the user list is displayed, **Then** an edit icon is shown and opens an editing experience on the same page layout.

---

### User Story 3 - Movie Import, Details, Watch, and Rating (Priority: P3)

As an authorized movie operator/viewer, I can import movies, inspect movie details, and submit watched ratings so I can curate and evaluate recommendations.

**Why this priority**: This expands the value beyond browsing and completes the operational movie lifecycle.

**Independent Test**: Can be fully tested by validating menu authorization for import/watch, importing movies from multiline text, opening movie details from home, following the watch-to-rating flow, and submitting rating data to watched endpoint.

**Acceptance Scenarios**:

1. **Given** a user with `movies:write` or `*`, **When** Movie > Import is opened and movie names are submitted line by line, **Then** the import request is sent to `/api/v1/movies-import` and the result feedback is shown.
2. **Given** a user with `movies:read`, `movies-watch:write`, `movies:write`, or `*`, **When** Movie > Watch is selected, **Then** the user is taken to the recommendation home list.
3. **Given** a user opening a movie item from home, **When** the item is selected, **Then** movie details are loaded from `/api/v1/movies/{id}` and shown with an action path to rating.
4. **Given** a user with `movies-watch:write`, `movies:write`, or `*`, **When** the user chooses to watch and rates a movie, **Then** rating is submitted to `/api/v1/movies/{id}/watched` and ratings below 7 are classified as bad.

---

### Edge Cases

- Login succeeds but returns empty or unknown roles: treat as no permission and apply deny-by-default behavior.
- User has role `*` together with other roles: keep full access and avoid duplicate/conflicting UI states.
- User lacks route-level permission but manually navigates by URL: render friendly lock fallback, never a crash.
- Infinite scroll receives an empty page: stop loading and preserve current list.
- API pagination or detail request fails: show non-blocking error state with retry action.
- User without `movies-watch:write` tries to start watch flow from details: action is hidden and fallback guidance is shown.
- Import textarea contains blank lines or duplicate movie names: ignore blanks and process according to backend contract response.
- Access token expires during protected navigation or action: force immediate logout and redirect to login without refresh attempt.
- API returns `401` during authenticated flow: force logout and redirect to login.
- API returns `403` during authenticated flow: keep current route context and show friendly access-denied fallback.
- A screen prototype is produced but the user does not approve it: implementation must pause for that screen until approval is received.
- A visual change passes unit/integration checks but fails browser validation in the QA agent: the change is not considered ready.
- A browser validation scenario described in `test_plan.md` becomes outdated after a feature change: the QA agent source scenarios must be updated before the next release.

## Constitution Alignment *(mandatory)*

- **CA-001 (Stack)**: Feature is constrained to TypeScript strict mode, React 19 functional components/hooks, and Tailwind CSS behavior for fluid/responsive interaction states.
- **CA-002 (API Contract)**: Endpoints covered are `/api/v1/movies`, `/api/v1/movies/{id}`, `/api/v1/movies/{id}/watched`, `/api/v1/movies-import`, plus login/user APIs defined by the OpenAPI contract at `https://github.com/WilliamCesarSantos/movie-suggestion-api/blob/main/openapi.yaml`.
- **CA-003 (RBAC)**: Role matrix includes `users:read`, `users:write`, `movies:read`, `movies-watch:write`, `movies:write`, and wildcard `*` as Super Admin with full system access.
- **CA-004 (Protected UI/Routes)**: Protected menu options and actions are User/Register, User/List edit affordance, Movie/Import, and watch/rating actions; unauthorized states must hide protected controls.
- **CA-005 (Resilient Fallback)**: Unauthorized home/resource access renders a friendly lock/info indicator and explanatory state, without blank or broken screens.
- **CA-006 (Visual Language)**: All screens follow Material Design principles with clean UI, minimal visible components, and explicit UX rationale for each interactive element.
- **CA-007 (Prototype Approval)**: Each new screen or substantial visual change requires a prototype review checkpoint with explicit user approval before implementation begins.
- **CA-008 (Browser QA Automation)**: A QA agent must validate user-critical flows in the browser after each relevant change using `test_plan.md` as the primary scenario source.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a login screen where users authenticate and receive user profile data including roles.
- **FR-002**: The system MUST normalize and evaluate roles from login response for authorization decisions.
- **FR-003**: The system MUST treat role `*` as full-access admin authorization across all protected routes and UI actions.
- **FR-004**: The system MUST render home as the default post-login screen for movie suggestions.
- **FR-005**: The system MUST load recommended movies on home from `/api/v1/movies` with paginated retrieval.
- **FR-006**: The system MUST support infinite scrolling behavior that requests additional pages as the user advances.
- **FR-007**: The system MUST show a friendly no-access indicator when the user lacks all of `movies:read`, `movies-watch:write`, `movies:write`, and `*`.
- **FR-008**: The system MUST provide a system menu with User and Movie sections, each option gated by roles.
- **FR-009**: The system MUST expose User > Register only for users with `users:write` or `*`.
- **FR-010**: The system MUST expose User > List for users with `users:read` or `*`.
- **FR-011**: The system MUST hide edit capability in User > List for users who do not have `users:write` or `*`.
- **FR-012**: The system MUST show an edit icon in User > List for users with `users:write` or `*` and open editing in an on-page layout.
- **FR-013**: The system MUST expose Movie > Import only for users with `movies:write` or `*`.
- **FR-014**: Movie import MUST submit multiline movie names (one per line) to `/api/v1/movies-import`.
- **FR-015**: The system MUST expose Movie > Watch for users with any of `movies:read`, `movies-watch:write`, `movies:write`, or `*`, redirecting to home recommendations.
- **FR-016**: Selecting a movie in home MUST load detailed content from `/api/v1/movies/{id}`.
- **FR-017**: The watch action MUST be available only for users with `movies-watch:write`, `movies:write`, or `*`.
- **FR-018**: The watch action MUST route users to a movie rating flow instead of playing media.
- **FR-019**: Rating submission MUST call `/api/v1/movies/{id}/watched` with the selected score.
- **FR-020**: Ratings below 7 MUST be classified and presented as bad evaluation.
- **FR-021**: Unauthorized attempts to protected resources MUST result in resilient fallback UI and MUST NOT break navigation.
- **FR-022**: When authentication token expires, the system MUST force immediate logout and redirect the user to login without automatic token refresh.
- **FR-023**: The movie rating input MUST accept only integer values from 0 to 10.
- **FR-024**: The movie import flow MUST remove duplicated movie names on the frontend before sending the request.
- **FR-025**: Protected UI controls without permission MUST be hidden instead of disabled.
- **FR-026**: API response `401` during authenticated usage MUST force logout and redirect to login.
- **FR-027**: API response `403` during authenticated usage MUST render the friendly access-denied fallback in the current screen context.
- **FR-028**: The system design process MUST use Material Design patterns for layout, hierarchy, feedback, and interaction consistency across screens.
- **FR-029**: Each screen MUST favor a clean UI with the minimum number of components required to complete the target task without losing clarity.
- **FR-030**: Before implementing a new screen or significant visual change, the team MUST generate a prototype and present it to the user for approval.
- **FR-031**: Implementation of a new screen or significant visual change MUST NOT proceed until the user explicitly confirms the proposed prototype direction.
- **FR-032**: The project MUST provide a QA agent capable of validating the application in a real browser after each relevant change.
- **FR-033**: The QA agent MUST use `test_plan.md` as the baseline source for browser validation scenarios and keep those scenarios traceable to executed checks.
- **FR-034**: Browser-based QA validation MUST cover login, movie import, movie listing search/scroll behavior, user registration, logout/login transitions, and role-based user menu flows described in `test_plan.md`.
- **FR-035**: A change affecting user-visible behavior MUST be considered incomplete until the QA agent reports browser validation status for the impacted scenarios.
- **FR-036**: If browser QA validation fails or is blocked after an alteration, the alteration MUST be reviewed and MUST NOT be considered complete until QA passes on a subsequent run.
- **FR-037**: The login screen MUST be redesigned using a clean Material Design layout with a single clear primary action, concise supporting copy, and only the essential authentication fields.
- **FR-038**: The login screen MUST prioritize calm visual hierarchy, centered focus, and minimal cognitive load on both desktop and mobile.
- **FR-039**: The login screen redesign MUST be approved as a prototype before implementation changes are applied.

### Key Entities *(include if feature involves data)*

- **Authenticated User**: Logged-in actor with identifier, profile fields, and assigned role set.
- **Role Permission**: Authorization token (for example `users:read`) mapped to route and UI capabilities.
- **Movie Recommendation Item**: Movie summary used in paginated home listing.
- **Movie Detail**: Expanded movie information loaded for a selected movie id.
- **Movie Import Request**: Multiline payload containing one movie name per line.
- **Movie Watched Rating**: User rating submission associated with a movie id and interpreted quality outcome.
- **Screen Prototype**: Low- or mid-fidelity visual proposal for a screen or substantial UI update, used for approval before implementation.
- **QA Browser Validation Agent**: Automated project agent that executes browser scenarios derived from `test_plan.md` and reports pass/fail status after relevant changes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of successful logins show the authorized home or fallback state in up to 3 seconds.
- **SC-002**: 100% of protected menu options obey role gating rules for visibility/disabled behavior across the defined roles.
- **SC-003**: 100% of unauthorized route/resource accesses render a friendly no-access state without application crash.
- **SC-004**: In usability validation, at least 90% of users can discover and complete the core flow (login -> browse -> details -> rating) on first attempt when permission allows.
- **SC-005**: Infinite browsing can load at least 5 consecutive pages of recommendations without duplicated request loop or UI interruption.
- **SC-006**: 100% of ratings submitted with score below 7 are presented as bad evaluation.
- **SC-007**: 100% of new screens and substantial visual changes are prototyped and explicitly approved by the user before implementation starts.
- **SC-008**: 100% of relevant user-facing changes trigger browser-based QA validation mapped to scenarios in `test_plan.md` before being considered complete.
- **SC-009**: At least 90% of reviewed screens are judged visually clean and free of unnecessary components during prototype approval.
- **SC-010**: 100% of browser QA failures or blocked executions result in explicit review of the alteration before the change is closed.
- **SC-011**: In prototype review, the login screen is judged to expose only the essential authentication controls without unnecessary decorative or competing UI elements.

## Assumptions

- Login and user profile endpoints are available in the referenced OpenAPI contract and return role data required by frontend authorization.
- Pagination metadata/behavior for recommendation listing follows the API contract and is sufficient for infinite scroll continuation checks.
- Movie watch flow is business-oriented evaluation only, with no media playback in scope.
- The initial release targets authenticated users and does not include public/guest browsing.
- Localization/i18n is out of scope for this first specification unless added in a future feature.
- `test_plan.md` remains the maintained source for browser QA scenarios until a replacement validation artifact is explicitly adopted.