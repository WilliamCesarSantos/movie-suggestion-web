# Tasks: User Registration Screen

**Input**: Design documents from `specs/002-user-registration/`  
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no blocked dependency)
- **[Story]**: User story this task belongs to (US1, US2, US3)
- Exact file paths included in all task descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install missing dependencies and configure the project before any feature code is written.

> **Note**: If `001-login-screen` was implemented first, T001–T005 may already be done. Check before executing.

- [x] T001 Install react-router-dom v7: `npm install react-router-dom@7` in project root
- [x] T002 Install Tailwind CSS v4 and Vite plugin: `npm install tailwindcss @tailwindcss/vite` in project root
- [x] T003 Add `tailwindcss()` plugin to `vite.config.ts` (import from `@tailwindcss/vite`, add to `plugins` array)
- [x] T004 Replace content of `src/index.css` with `@import "tailwindcss";`
- [x] T005 Create `src/pages/` directory (add `.gitkeep` or first page file to track it)

**Checkpoint**: `npm run dev` starts without errors, Tailwind classes render, react-router-dom is resolvable.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Auth context and route guard — MUST be complete before any user story work begins.

> **Note**: `useAuth` and `AuthProvider` are owned by `001-login-screen`. If already implemented, skip T006–T007 and only verify the exports match the expected shape.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T006 Create `src/hooks/AuthContext.tsx` — define `Session` interface (`token`, `email`, `roles`, `expiresAt`), create `AuthContext` with `AuthProvider` that reads/writes `localStorage` key `auth_session`
- [x] T007 Create `src/hooks/useAuth.ts` — export `useAuth()` hook that returns `{ session: Session | null }` from `AuthContext`
- [x] T008 Wrap root app with `<AuthProvider>` and `<BrowserRouter>` in `src/main.tsx`
- [x] T009 Create `src/components/ProtectedRoute.tsx` — reads `session` from `useAuth()`, redirects to `/login` if unauthenticated, redirects to `/` if `requiredRole` not in `session.roles`, otherwise renders `<Outlet />`

**Checkpoint**: Navigating to a route wrapped in `<ProtectedRoute />` without a session redirects to `/login`. With a valid session but wrong role redirects to `/`.

---

## Phase 3: User Story 1 — Authorized User Registers a New User (Priority: P1) 🎯 MVP

**Goal**: A user with `users:write` can fill and submit the registration form, triggering `POST /api/v1/users`. On success the form resets and shows a notification. On error the user sees a message with their data preserved.

**Independent Test**: Log in as a user with `users:write`, navigate to `/users/new`, fill all fields with valid data, submit — verify success notification appears and form resets. Then submit with a duplicate email — verify inline error on the email field.

### Implementation for User Story 1

- [x] T010 [P] [US1] Create `src/services/users.ts` — export `AVAILABLE_ROLES` constant, `CreateUserRequest` interface, `CreateUserResponse` interface, `ApiError` class, and `createUser(data: CreateUserRequest, token: string): Promise<CreateUserResponse>` using native `fetch` to `POST /api/v1/users`; handle 409 as `text/plain`, 401 as `ApiError(401)`, other non-2xx as `ApiError(status, message)`
- [x] T011 [US1] Create `src/components/RegisterUserForm.tsx` — controlled inputs for `name`, `email`, `password`, `confirmPassword`; checkbox group for `roles` using `AVAILABLE_ROLES`; `validate()` function enforcing all FR-005/FR-005a rules; `handleSubmit` calling `createUser`; loading state disables submit; on 201 show success notification and reset form; on 409 set inline error on email field; on 401 redirect to `/login` via `useNavigate`; on other errors show generic banner above form with data preserved
- [x] T012 [US1] Create `src/pages/RegisterUserPage.tsx` — thin wrapper rendering page title and `<RegisterUserForm />`
- [x] T013 [US1] Register route `/users/new` in `src/main.tsx` wrapped inside `<ProtectedRoute requiredRole="users:write" />` rendering `<RegisterUserPage />`

**Checkpoint**: User Story 1 independently functional — authorized user can complete registration end-to-end. Error scenarios (409, 5xx, network) handled with data preserved.

---

## Phase 4: User Story 2 — Unauthorized Access is Blocked (Priority: P2)

**Goal**: Unauthenticated users are redirected to `/login`; authenticated users without `users:write` are redirected to `/` with no access to the form.

**Independent Test**: Navigate directly to `/users/new` without a session — verify redirect to `/login`. Log in as a user without `users:write`, navigate to `/users/new` — verify redirect to `/`. Both tests require no form interaction.

### Implementation for User Story 2

> This story is implemented entirely by the `ProtectedRoute` component built in Phase 2 (T009) and the route registration in T013. No new files are needed.

- [x] T014 [US2] Verify `ProtectedRoute` redirects unauthenticated users to `/login` by clearing `localStorage` and navigating to `/users/new` manually in the browser
- [x] T015 [US2] Verify `ProtectedRoute` redirects users without `users:write` to `/` by setting a session with only `movies:read` in `localStorage` and navigating to `/users/new`

**Checkpoint**: Both access-denial paths confirmed working via manual verification. No regression on the authorized flow from Phase 3.

---

## Phase 5: User Story 3 — Form Validation Feedback (Priority: P3)

**Goal**: Submitting with missing or invalid data shows clear inline errors per field and blocks the API call entirely.

**Independent Test**: With `users:write` session, navigate to `/users/new`, click submit without filling any field — verify all five fields show inline errors. Fill email with `not-an-email`, submit — verify email format error. Fill all fields correctly — verify no errors and form proceeds to API call.

### Implementation for User Story 3

> Validation is implemented inside `RegisterUserForm.tsx` (T011). This phase adds verification tasks only — the `validate()` function must cover all five fields per FR-005/FR-005a.

- [x] T016 [US3] Audit `validate()` in `src/components/RegisterUserForm.tsx` — confirm it covers: `name` required, `email` required + regex format check, `password` required, `confirmPassword` required + matches `password`, `roles` array length ≥ 1
- [x] T017 [US3] Verify all error messages render inline (below each field) using Tailwind classes for visual error state (red border, red helper text)
- [x] T018 [US3] Verify no `fetch` call is made when validation fails (check Network tab in DevTools during manual test)

**Checkpoint**: All validation rules enforced client-side before any API call. Each field shows its own error message. Roles checkbox group shows an error when empty.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Styling consistency, accessibility basics, and constitution compliance review.

- [x] T019 [P] Apply consistent Tailwind CSS classes to form layout in `src/components/RegisterUserForm.tsx` — card container, input spacing, label–input alignment, submit button styles, error text styles
- [x] T020 [P] Add `htmlFor`/`id` pairs to all labels and inputs in `RegisterUserForm.tsx` for accessibility
- [x] T021 Add `VITE_API_BASE_URL` to `.env.local` (if not already present) and document in `README.md` or `quickstart.md`
- [x] T022 Constitution compliance review — confirm: React + TS + Tailwind only, no Redux, no form library, `fetch` in service only, `useState`/`useEffect` for state, folder structure matches plan

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — no dependency on US2 or US3
- **US2 (Phase 4)**: Depends on Phase 2 (T009, T013) — no dependency on US1 or US3
- **US3 (Phase 5)**: Depends on Phase 3 (T011 `validate()`) — must audit after T011 is implemented
- **Polish (Phase 6)**: Depends on all phases complete

### User Story Dependencies

- **US1 (P1)**: Unblocked after Phase 2 ✅
- **US2 (P2)**: Unblocked after Phase 2 (T009 + T013) ✅ — can run in parallel with US1 once T009 and T013 are done
- **US3 (P3)**: Depends on T011 from US1 — sequential after US1

### Parallel Opportunities per Story

**Phase 1**: T001–T005 are sequential (install → configure → configure → edit → create)  
**Phase 2**: T006 and T009 can start in parallel; T007 depends on T006; T008 depends on T007  
**Phase 3**: T010 [P] runs in parallel with T009 (different file); T011 depends on T010; T012 [P] runs in parallel with T011; T013 depends on T011 + T012  
**Phase 4**: T014 and T015 [P] run in parallel (both are manual verification tasks)  
**Phase 5**: T016, T017, T018 [P] run in parallel (all read-only audits/manual checks)  
**Phase 6**: T019 and T020 [P] run in parallel

---

## Implementation Strategy

**MVP Scope (Phase 3 only — US1)**: Implement Phases 1–3 to deliver a fully working registration form for authorized users. US2 (access guard) is built in Phase 2 as a blocker, so it comes for free. US3 (validation feedback) is partially implemented inside T011 and audited in Phase 5.

**Suggested order for solo developer**:  
Phase 1 → Phase 2 → T010 → T011 → T012 → T013 → T014/T015 → T016/T017/T018 → T019/T020/T021 → T022

**Total tasks**: 22  
**Tasks per user story**: US1 → 4, US2 → 2, US3 → 3  
**Setup/Foundation/Polish**: 13  
**Parallel opportunities**: T010, T012 (US1), T014+T015 (US2), T016+T017+T018 (US3), T019+T020 (Polish)
