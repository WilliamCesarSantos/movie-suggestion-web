# Quickstart Validation Guide

## Objective
Validate end-to-end behavior for login, RBAC, recommendation browsing, movie operations,
and resilient unauthorized UX, with browser-based QA automation and prototype approval gates.

## Mandatory Workflow Gate
1. Produce a prototype for each new screen or substantial visual change.
2. Present the prototype to the user.
3. Only proceed with implementation after explicit confirmation that the screen direction should continue.
4. After implementation, run the browser QA agent against the impacted scenarios from `test_plan.md`.
5. If the QA verdict is `FAIL` or `BLOCKED`, review the alteration, correct it, and rerun QA before considering the change complete.

## Prerequisites
- Node.js latest LTS installed.
- Package manager available (`npm` or `pnpm`).
- Backend API available and compatible with the referenced OpenAPI contract.
- Environment variables configured for API base URL and auth settings.

## Setup
1. Install dependencies (latest stable versions pinned in lockfile during implementation).
2. Start frontend development server.
3. Ensure backend API is reachable from frontend runtime.

## Validation Scenarios

### Scenario 0: Prototype Approval
1. Prepare a prototype for the target screen or visual change.
2. Share the prototype with the user.
3. Expected result:
- The user explicitly approves or rejects the direction.
- No implementation proceeds without approval.

### Scenario 0.1: Login Redesign Review
1. Prepare the clean Material Design login proposal.
2. Validate that the screen keeps only logo/title, short supporting copy, email field, password field, inline error area, and one primary CTA in the initial viewport.
3. Expected result:
- The login direction is perceived as clean and focused.
- No unnecessary secondary panels or competing actions are required for initial implementation.

### Scenario A: Authorized Login and Home Feed
1. Log in with a user that has `movies:read`.
2. Confirm redirect to home recommendation screen.
3. Scroll until at least two additional pages are loaded.
4. Expected result:
- No crashes.
- New recommendation cards append correctly.
- No duplicate fetch loop after last page.

### Scenario B: Unauthorized Home Fallback
1. Log in with a user missing all movie roles.
2. Access home route.
3. Expected result:
- Friendly lock/info fallback is shown.
- App layout and menu remain functional.

### Scenario C: User Menu Permissions
1. Log in with `users:read` only.
2. Open User > List.
3. Expected result:
- List route is accessible.
- Edit action is hidden/disabled.
- User > Register is not available.

4. Log in with `users:write`.
5. Open User > List.
6. Expected result:
- Edit icon is visible and opens same-page editing experience.

### Scenario D: Movie Import
1. Log in with `movies:write`.
2. Open Movie > Import.
3. Enter multiline movie names (one per line).
4. Submit.
5. Expected result:
- Request goes to `/api/v1/movies-import`.
- Success/failure feedback is rendered.

### Scenario E: Watch and Rating
1. Log in with `movies-watch:write`.
2. Go to Movie > Watch (home list).
3. Open one movie card detail.
4. Trigger watch action.
5. Submit rating below 7.
6. Expected result:
- Flow redirects to rating (no playback).
- Request goes to `/api/v1/movies/{id}/watched`.
- Classification is shown as bad.

### Scenario F: Browser QA Agent Regression Pack
1. Run the QA agent in a real browser after a relevant user-facing change.
2. Use `test_plan.md` as the mandatory source of scenarios.
3. Execute all impacted cases from the plan.
4. Expected result:
- Each impacted scenario reports pass/fail status.
- Failing browser scenarios block completion of the change.
- The executed scenarios remain traceable back to `test_plan.md`.

## References
- Data model: `specs/001-build-movie-frontend/data-model.md`
- Interface contracts: `specs/001-build-movie-frontend/contracts/frontend-interface-contract.md`
- Test contract: `specs/001-build-movie-frontend/contracts/test-contract.md`
- Implementation plan: `specs/001-build-movie-frontend/plan.md`

## Notes for Next Step
- During `/speckit.tasks`, break work into small, independent tasks by user story slices.
- Prefer one concern per task (auth, RBAC, menu, feed, detail, watched, import) to simplify implementation and review.
- Include explicit prototype-review tasks before any new screen implementation task.
- Include QA-agent execution tasks after each relevant user-facing change.
- Treat the login redesign as a focused UI revision slice with prototype review before any code change.

## Execution Notes
- Validation run completed with `npm run test` and `npm run build`.
- Unit, integration, and contract suites passed for the implemented workspace tests.
- Production build completed successfully through Vite.