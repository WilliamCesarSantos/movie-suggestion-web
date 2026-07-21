# Tasks: Build Movie Frontend

**Input**: Design documents from `/specs/001-build-movie-frontend/`

**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories), `research.md`, `data-model.md`, `contracts/`

**Tests**: Required by the constitution and feature requirements for authorization, fallback resilience, and browser QA validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User story label used only in user-story phases (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an explicit file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align project baseline, design constraints, and QA workflow assets.

- [X] T001 Verify and align frontend dependency versions with plan constraints in `package.json`
- [X] T002 Configure global style tokens for clean Material-aligned surfaces and focus states in `src/styles/index.css`
- [X] T003 Register browser QA scenario mapping for this feature in `test_plan.md`
- [X] T004 [P] Configure Playwright runtime defaults for browser QA execution in `tests/e2e/playwright.config.ts`
- [X] T005 [P] Ensure login redesign approval details are recorded and traceable in `specs/001-build-movie-frontend/contracts/login-screen-prototype.md`
- [X] T006 Add implementation notes for login redesign constraints in `specs/001-build-movie-frontend/contracts/login-screen-contract.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Complete shared auth, RBAC, and fallback behavior needed by all stories.

**CRITICAL**: No story implementation begins before this phase is complete.

- [X] T007 Implement and verify global `401/403` policy handling in `src/api/client/errorPolicy.ts`
- [X] T008 [P] Align auth session lifecycle and forced logout behavior in `src/features/auth/sessionStore.ts`
- [X] T009 [P] Align role normalization for unknown roles and wildcard grants in `src/features/rbac/normalizeRoles.ts`
- [X] T010 Implement capability evaluation matrix with deny-by-default behavior in `src/features/rbac/permissionEvaluator.ts`
- [X] T011 [P] Align menu permission mappings for hidden-only denied controls in `src/features/rbac/menuCapabilities.ts`
- [X] T012 Implement protected route fallback orchestration in `src/app/guards/ProtectedRoute.tsx`
- [X] T013 [P] Align friendly access-denied fallback states and copy in `src/components/feedback/AccessDeniedState.tsx`
- [X] T014 Implement auth navigation side effects for redirects and session loss in `src/features/auth/AuthNavigationEffects.tsx`

**Checkpoint**: Foundation complete; user stories may proceed.

---

## Phase 3: User Story 1 - Login and Recommended Movies Home (Priority: P1) MVP

**Goal**: Deliver login, approved clean login redesign, and home recommendations with infinite scroll and fallback behavior.

**Independent Test**: Log in with authorized and unauthorized movie-role users, validate redesigned login behavior, home feed pagination, and denied fallback in browser.

### Tests for User Story 1

- [ ] T015 [P] [US1] Add integration test for successful login redirect to home in `tests/integration/auth/loginToHome.test.tsx`
- [ ] T016 [P] [US1] Add integration test for unauthorized home fallback rendering in `tests/integration/home/homeFallback.test.tsx`
- [ ] T017 [P] [US1] Add role normalization edge-case assertions for login role payloads in `tests/unit/rbac/normalizeRoles.test.ts`
- [ ] T018 [P] [US1] Add permission evaluator assertions for wildcard and deny-by-default behavior in `tests/unit/rbac/permissionEvaluator.test.ts`
- [ ] T019 [P] [US1] Add e2e regression for login and infinite scroll path in `tests/e2e/home/login-infinite-scroll.spec.ts`
- [ ] T020 [P] [US1] Add e2e regression for clean login essentials and approval constraints in `tests/e2e/auth/login-redesign.spec.ts`

### Implementation for User Story 1

- [ ] T021 [US1] Implement approved clean, centered login layout with essential elements only in `src/pages/auth/LoginPage.tsx`
- [ ] T022 [US1] Implement login submit flow, loading, and inline error behavior in `src/features/auth/useLogin.ts`
- [ ] T023 [US1] Apply login-specific spacing and responsive behavior refinements in `src/styles/index.css`
- [ ] T024 [US1] Implement post-auth redirect side effects for login transition in `src/features/auth/AuthNavigationEffects.tsx`
- [ ] T025 [US1] Implement home page feed orchestration for authorized users in `src/pages/home/HomePage.tsx`
- [ ] T026 [P] [US1] Implement home loading, empty, and recoverable error states in `src/pages/home/HomeFeedStates.tsx`
- [ ] T027 [US1] Implement role-gated home boundary and access fallback behavior in `src/pages/home/HomeAccessBoundary.tsx`
- [ ] T028 [US1] Implement infinite recommendations pagination flow in `src/features/movies/useRecommendationsInfinite.ts`
- [ ] T029 [P] [US1] Implement recommendation card rendering for paginated append behavior in `src/components/movie/MovieRecommendationCard.tsx`
- [ ] T030 [US1] Execute browser QA for login and home scenarios and record evidence in `specs/001-build-movie-frontend/checklists/requirements.md`

**Checkpoint**: User Story 1 is independently functional and browser-validated.

---

## Phase 4: User Story 2 - User Management Menu and Permissions (Priority: P2)

**Goal**: Deliver role-gated user menu visibility and user management screens with correct edit affordance behavior.

**Independent Test**: Validate role combinations for User menu visibility, User list access, and edit affordance behavior.

### Tests for User Story 2

- [ ] T031 [P] [US2] Add integration test for user menu capability gating by role in `tests/integration/users/userMenuGating.test.tsx`
- [ ] T032 [P] [US2] Add integration test for user list edit visibility rules in `tests/integration/users/userListEditVisibility.test.tsx`
- [ ] T033 [P] [US2] Add e2e regression for `users:read` and `users:write` navigation behavior in `tests/e2e/users/users-read-navigation.spec.ts`

### Implementation for User Story 2

- [ ] T034 [US2] Implement User menu role-gated entries and route navigation in `src/components/layout/SystemUserMenu.tsx`
- [ ] T035 [US2] Implement user list screen data rendering and fallback states in `src/pages/users/UserListPage.tsx`
- [ ] T036 [P] [US2] Implement users list query and response handling in `src/features/users/useUsersList.ts`
- [ ] T037 [US2] Implement row-level edit affordance gating behavior in `src/pages/users/UserListRowActions.tsx`
- [ ] T038 [US2] Implement user registration screen flow and role selection behavior in `src/pages/users/UserRegisterPage.tsx`
- [ ] T039 [US2] Execute browser QA for user menu, register, and list scenarios and record evidence in `specs/001-build-movie-frontend/checklists/requirements.md`

**Checkpoint**: User Story 2 is independently functional and browser-validated.

---

## Phase 5: User Story 3 - Movie Import, Details, Watch, and Rating (Priority: P3)

**Goal**: Deliver import, details, watch-to-rating flow, and watched rating submission with classification.

**Independent Test**: Validate import permissions and dedupe, details loading, watch action gating, watched submission, and bad-rating classification.

### Tests for User Story 3

- [ ] T040 [P] [US3] Add integration test for import dedupe and blank-line filtering in `tests/integration/movies/movieImportDedupe.test.tsx`
- [ ] T041 [P] [US3] Add integration test for watch-to-rating transition behavior in `tests/integration/movies/watchToRating.test.tsx`
- [ ] T042 [P] [US3] Add e2e regression for movie detail and rating submission flow in `tests/e2e/movies/movie-detail-rating.spec.ts`
- [ ] T043 [P] [US3] Add contract parsing assertions for movie endpoint payloads in `tests/contract/api/openapi-contract-parsing.test.ts`

### Implementation for User Story 3

- [ ] T044 [US3] Implement movie import page interaction states in `src/pages/movies/MovieImportPage.tsx`
- [ ] T045 [US3] Implement multiline parsing and dedupe utility in `src/features/movies/parseImportMovieNames.ts`
- [ ] T046 [US3] Implement movie import mutation and response handling in `src/features/movies/useMovieImport.ts`
- [ ] T047 [US3] Implement movie detail page rendering and error fallback in `src/pages/movies/MovieDetailPage.tsx`
- [ ] T048 [P] [US3] Implement movie detail query and parsing flow in `src/features/movies/useMovieDetail.ts`
- [ ] T049 [US3] Implement watch action permission-gated routing in `src/features/movies/useWatchAction.ts`
- [ ] T050 [US3] Implement integer-only rating input (0..10) and submit interaction in `src/pages/movies/MovieRatingPage.tsx`
- [ ] T051 [US3] Implement watched submission and bad (<7) classification behavior in `src/features/movies/useSubmitWatchedRating.ts`
- [ ] T052 [US3] Execute browser QA for import, detail, watch, and rating scenarios and record evidence in `specs/001-build-movie-frontend/checklists/requirements.md`

**Checkpoint**: User Story 3 is independently functional and browser-validated.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, traceability, and cross-story validation.

- [ ] T053 [P] Consolidate API auth error regression coverage in `tests/unit/api/errorPolicy.test.ts`
- [ ] T054 [P] Refresh frontend contract references for approved login redesign in `specs/001-build-movie-frontend/contracts/frontend-interface-contract.md`
- [ ] T055 Run quickstart end-to-end validation and log outcomes in `specs/001-build-movie-frontend/quickstart.md`
- [ ] T056 [P] Update QA validation contract traceability to `test_plan.md` scenarios in `specs/001-build-movie-frontend/contracts/test-contract.md`
- [ ] T057 [P] Reconcile feature requirements checklist with executed story QA evidence in `specs/001-build-movie-frontend/checklists/requirements.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No prerequisites.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks all user-story work.
- **Phase 3-5 (User Stories)**: Each depends on Phase 2 completion.
- **Phase 6 (Polish)**: Depends on completion of target user stories.

### User Story Dependencies

- **US1 (P1)**: Starts immediately after Foundational phase; delivers MVP.
- **US2 (P2)**: Starts after Foundational phase; independent from US1 business behavior.
- **US3 (P3)**: Starts after Foundational phase; independent from US2, reuses shared auth/RBAC foundation.

### Story Completion Order

1. US1 (MVP): login redesign + home recommendations + browser QA
2. US2: user menu and management permissions + browser QA
3. US3: movie operations flow + browser QA

---

## Parallel Execution Examples

### User Story 1 Parallel Set

- [ ] T015 [P] [US1] Add integration test for successful login redirect to home in `tests/integration/auth/loginToHome.test.tsx`
- [ ] T018 [P] [US1] Add permission evaluator assertions for wildcard and deny-by-default behavior in `tests/unit/rbac/permissionEvaluator.test.ts`
- [ ] T020 [P] [US1] Add e2e regression for clean login essentials and approval constraints in `tests/e2e/auth/login-redesign.spec.ts`

### User Story 2 Parallel Set

- [ ] T031 [P] [US2] Add integration test for user menu capability gating by role in `tests/integration/users/userMenuGating.test.tsx`
- [ ] T032 [P] [US2] Add integration test for user list edit visibility rules in `tests/integration/users/userListEditVisibility.test.tsx`
- [ ] T033 [P] [US2] Add e2e regression for `users:read` and `users:write` navigation behavior in `tests/e2e/users/users-read-navigation.spec.ts`

### User Story 3 Parallel Set

- [ ] T040 [P] [US3] Add integration test for import dedupe and blank-line filtering in `tests/integration/movies/movieImportDedupe.test.tsx`
- [ ] T042 [P] [US3] Add e2e regression for movie detail and rating submission flow in `tests/e2e/movies/movie-detail-rating.spec.ts`
- [ ] T043 [P] [US3] Add contract parsing assertions for movie endpoint payloads in `tests/contract/api/openapi-contract-parsing.test.ts`

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete US1 tests and implementation tasks.
3. Execute and record browser QA evidence for US1 in `specs/001-build-movie-frontend/checklists/requirements.md`.
4. Demo MVP login redesign and home flow.

### Incremental Delivery

1. Deliver US1 and validate in browser.
2. Deliver US2 and validate in browser.
3. Deliver US3 and validate in browser.
4. Run polish phase tasks for final consistency and traceability.

### Quality Rule

- Any user-visible change remains incomplete until browser QA evidence is recorded against `test_plan.md` scenarios.