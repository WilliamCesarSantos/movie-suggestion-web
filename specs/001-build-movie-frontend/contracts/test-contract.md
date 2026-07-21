# Validation Contract for Plan and Tasks

## Browser QA Agent Source of Truth

- `test_plan.md` is the mandatory scenario source for automated browser validation.
- A QA agent must execute the applicable scenarios in a real browser after each relevant user-facing change.
- A change is not complete until the QA agent reports the status of impacted scenarios.
- If the QA agent reports `FAIL` or `BLOCKED`, the alteration must be reviewed and rerun through QA before completion.

## Prototype Approval Gate

- New screens and substantial UI changes require a prototype review before implementation.
- Implementation proceeds only after explicit user confirmation that the proposed screen direction should continue.

## Mandatory Validation Scenarios

1. Authentication and Roles
- Given valid login response with role list
- When session is initialized
- Then role grants are available before first protected route render

2. Wildcard Authorization
- Given user roles include `*`
- When protected menus/routes/actions are evaluated
- Then all capabilities are granted

3. Unauthorized Home Fallback
- Given user has none of `movies:read`, `movies-watch:write`, `movies:write`, `*`
- When home is accessed
- Then friendly lock/info fallback renders and app remains navigable

4. Infinite Scroll Feed
- Given authorized movie access
- When user scrolls near list end
- Then next page from `/api/v1/movies` is fetched and appended
- And when API indicates no more content, further fetches stop

5. User Menu Gating
- Given user with `users:read` only
- When User > List is opened
- Then list is visible and edit action is not active
- And User > Register is not available

6. Import Flow
- Given user with `movies:write`
- When multiline textarea is submitted in Movie > Import
- Then request is sent to `/api/v1/movies-import` using line-based names

7. Watch to Rating Flow
- Given user with `movies-watch:write` (or broader movie write grant)
- When movie detail is opened and watch action is selected
- Then user is directed to rating flow instead of media playback
- And submission calls `/api/v1/movies/{id}/watched`

8. Rating Classification
- Given submitted rating value
- When classification is computed
- Then rating < 7 is represented as bad

9. Browser QA Case 1 from `test_plan.md`
- Given administrator credentials
- When login, movie import, and movie list lookup are executed in the browser
- Then imported movie keywords are discoverable in the list flow

10. Browser QA Case 2 from `test_plan.md`
- Given administrator credentials
- When a new user is created with `movies:read` and `movies-watch:write`, then re-authenticated in the browser
- Then the new user can reach the movie list successfully

11. Browser QA Case 3 from `test_plan.md`
- Given administrator credentials
- When a new user is created with `movies:read`, `movies-watch:write`, and `users:read`, then re-authenticated in the browser
- Then the user menu lists the logged-in user

12. Browser QA Case 4 from `test_plan.md`
- Given administrator credentials
- When a new user is created with `movies:read`, `movies-watch:write`, `users:read`, and `users:write`, then re-authenticated in the browser
- Then the user can open the user list, edit roles, and preserve the required baseline roles

13. Browser QA Case 5 from `test_plan.md`
- Given administrator credentials
- When a new user is created with `movies:read`, `movies-watch:write`, and `movies:write`, then re-authenticated in the browser
- Then movie import and infinite-scroll list lookup succeed for the chosen keyword

## Quality Gates
- Unit coverage for RBAC evaluator and role normalization
- Integration coverage for guarded routes and guarded actions
- E2E coverage for core flow: login -> home -> detail -> watched rating
- E2E coverage for denied flow with resilient fallback
- Browser QA agent coverage for the impacted scenarios defined in `test_plan.md`
- Prototype approval captured before implementation of any new screen or significant UI redesign