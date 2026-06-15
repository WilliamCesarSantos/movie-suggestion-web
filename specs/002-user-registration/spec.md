# Feature Specification: User Registration Screen

**Feature Branch**: `002-user-registration`  
**Created**: 2026-06-15  
**Status**: Draft  
**Input**: User description: "crie a tela para cadastro de usuário. Apenas usuários logados com a role users:write tem permissão para acessar essa tela. Utilize o endpoint POST /users"

## Clarifications

### Session 2026-06-15

- Q: What fields does `POST /users` accept in the request body? → A: `name` (string), `email` (string, email format), `password` (string), `roles` (array of strings). Response 201 returns `id`, `name`, `email`, `roles`, `createdAt`. 409 returns plain-text `"email already exists"`.
- Q: After successful registration, what should happen with the form/navigation? → A: Reset the form and display a success notification — stay on the same screen.
- Q: How does the frontend populate the available roles for the `roles` field? → A: Fixed list hardcoded as a TypeScript constant. Known roles: `users:read`, `users:write`, `suggestions:read`, `movies:read`, `movie-watch:write`.
- Q: Is at least one role required to create a user? → A: Yes — the client MUST validate that at least one role is selected and block submission if the array is empty.
- Q: How should the `password` field be handled in the form? → A: Two fields — `password` + `confirmPassword`. Submission blocked if they don't match.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authorized User Registers a New User (Priority: P1)

A logged-in user with the `users:write` role accesses the registration screen, fills in the required fields, and submits the form. The system calls `POST /users` and confirms the creation.

**Why this priority**: This is the core functionality of the screen — without it, the feature has no value.

**Independent Test**: Can be fully tested by logging in as a user with `users:write`, navigating to the registration screen, filling and submitting the form, and verifying the new user appears in the system.

**Acceptance Scenarios**:

1. **Given** a logged-in user with `users:write`, **When** they navigate to the registration screen, **Then** the form is displayed with all required fields.
2. **Given** the form is fully and validly filled, **When** the user submits it, **Then** the system calls `POST /users`, displays a success notification, resets the form to its initial empty state, and the user remains on the registration screen.
3. **Given** `POST /users` returns an error (e.g., duplicate email or server error), **When** the submission occurs, **Then** the user sees a descriptive error message without losing their filled data.

---

### User Story 2 - Unauthorized Access is Blocked (Priority: P2)

A user without the `users:write` role (or unauthenticated) attempts to access the registration screen and is denied.

**Why this priority**: Access control is a security requirement that must be enforced at the UI layer as well as the API layer.

**Independent Test**: Can be fully tested by navigating to the registration route while unauthenticated or authenticated with an account lacking `users:write`, and verifying that access is denied.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user, **When** they try to navigate to the registration screen, **Then** they are redirected to the login page.
2. **Given** a logged-in user **without** `users:write`, **When** they try to navigate to the registration screen, **Then** they are redirected to an appropriate page (e.g., home or 403 screen) with an informative message.

---

### User Story 3 - Form Validation Feedback (Priority: P3)

A user with `users:write` submits the form with missing or invalid data and receives clear inline validation feedback.

**Why this priority**: Improves usability and prevents unnecessary API calls with invalid data.

**Independent Test**: Can be fully tested by submitting the form with empty or invalid fields and verifying that submission is blocked and errors are displayed per field.

**Acceptance Scenarios**:

1. **Given** a required field is left empty, **When** the user attempts to submit, **Then** the field is highlighted and an error message is shown next to it.
2. **Given** an email field contains an invalid format, **When** the user attempts to submit, **Then** the email field shows a format validation error.
3. **Given** all fields are valid, **When** the user submits, **Then** no inline validation errors are shown and the request proceeds.

---

### Edge Cases

- **409 Conflict**: `POST /users` returns `409` with plain-text `"email already exists"` — the system MUST display this error inline near the email field.
- **5xx / Network error**: API unavailable — MUST display a generic error banner and preserve form data.
- **Session expiry**: If the JWT expires mid-form, the next API call will return 401 — MUST redirect to login.
- **No roles selected**: Submitting with an empty `roles` array is blocked client-side — MUST show an error message near the roles field before any API call is made.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The registration screen MUST only be accessible to authenticated users who have the `users:write` role.
- **FR-002**: Unauthenticated users attempting to access the screen MUST be redirected to the login page.
- **FR-003**: Authenticated users without the `users:write` role MUST be redirected away from the screen with an informative message.
- **FR-004**: The registration form MUST include the four fields required by `POST /users`: `name` (text), `email` (email), `password` (password), and `roles` (multi-select checkboxes from a fixed list of known roles: `users:read`, `users:write`, `suggestions:read`, `movies:read`, `movie-watch:write`).
- **FR-004a**: The available roles MUST be defined as a TypeScript constant in the frontend codebase — no API call is required to populate the roles list.
- **FR-005**: Each form field MUST have client-side validation that runs before submission: `name` required, `email` required and valid format, `password` required, `confirmPassword` required and must match `password`, `roles` required with at least one item selected.
- **FR-005a**: The form MUST include a `confirmPassword` field. Submission MUST be blocked if `confirmPassword` does not match `password`, with an inline error message. The `confirmPassword` value is NOT sent to the API.
- **FR-006**: On successful submission, the system MUST call `POST /users` with the form data, display a success notification, reset the form to its initial empty state, and keep the user on the registration screen.
- **FR-007**: On API error, the system MUST display a descriptive error message and preserve the user's entered data.
- **FR-008**: Frontend implementation MUST use React (Vite), TypeScript, and Tailwind CSS.
- **FR-009**: Folder structure MUST prioritize `src/components`, `src/services`, and `src/hooks`.
- **FR-010**: State management MUST use native React hooks (`useState`, `useEffect`).
- **FR-011**: The HTTP call to `POST /users` MUST be isolated in a service under `src/services` and use native `fetch`.
- **FR-012**: Request and response types for `POST /users` MUST be strictly typed in TypeScript.

### Key Entities

- **User (new)**: Entity created via `POST /users`. Request fields: `name` (string), `email` (string), `password` (string), `roles` (string[]). Response fields: `id` (UUID), `name`, `email`, `roles`, `createdAt` (ISO datetime).
- **Session / Auth Context**: Represents the current logged-in user, including their roles array. Used to enforce the `users:write` access guard at the route level.
- **Roles**: String identifiers that control API permissions. Fixed set defined as a TypeScript constant: `users:read`, `users:write`, `suggestions:read`, `movies:read`, `movie-watch:write`. Rendered as multi-select checkboxes in the form. No API endpoint is needed to fetch them.

## Technical Constraints *(mandatory)*

- Do not introduce Redux or complex state managers without explicit approval.
- Keep architecture simple and modular with minimal folder expansion.
- Keep API logic out of UI components — all `POST /users` logic lives in `src/services`.
- Keep implementation readable for backend senior developers learning frontend.
- Role-based access guard must be applied at the route level, not only inside the component.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user with `users:write` can complete the registration form and successfully create a new user in under 2 minutes.
- **SC-002**: A user without `users:write` is blocked from accessing the screen 100% of the time, regardless of how they navigate (direct URL, menu, etc.).
- **SC-003**: All required field validation errors are visible before any network request is made.
- **SC-004**: On API success, the user receives visual confirmation within 1 second of submission.
- **SC-005**: On API failure, the user's entered data is preserved so they can retry without re-filling the form.

## Assumptions

- The application already has an authentication system that provides the current user's roles at runtime (e.g., via a context, hook, or token payload).
- "Logged-in users" means the application already handles session/token management — this feature only consumes the existing auth context.
- After a successful registration, a success notification is displayed and the form is reset to empty; the user remains on the registration screen. Navigation to a user list is explicitly out of scope.
- The `POST /users` endpoint is already deployed and accessible from the frontend environment.
- Mobile responsiveness follows existing project standards and is not a primary concern for this screen's v1.
