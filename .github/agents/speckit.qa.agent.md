---
description: Validate the current feature set in a real browser using test_plan.md as the source of truth for regression scenarios.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Goal

Execute browser-based QA validation for the movie frontend after relevant user-facing changes.
`test_plan.md` is the mandatory source of truth for scenario selection and expected behavior.
This agent validates behavior in the browser, not only through unit or integration tests.

## Operating Rules

- Treat `test_plan.md` as the primary regression contract.
- Run validations in a real browser using the available browser automation capabilities.
- Prefer targeted scenario execution when the impacted surface is clear.
- Escalate to broader regression when auth, routing, RBAC, shared layout, or API client behavior changes.
- Fail the validation if any impacted browser scenario fails, becomes blocked, or cannot be executed reliably.
- Do not approve a user-facing change based only on static review or non-browser tests.
- If validation fails, require the underlying alteration to be reviewed before the change can be considered complete.

## Inputs To Load

1. Read `test_plan.md` completely.
2. Read `specs/001-build-movie-frontend/spec.md` for feature intent and rules.
3. Read `specs/001-build-movie-frontend/plan.md` for constraints and QA expectations.
4. Read `specs/001-build-movie-frontend/tasks.md` when task context helps identify the affected feature.
5. Inspect the current change surface:
   - Prefer changed files from git diff when available.
   - If the user names a feature or file explicitly, use that as the primary routing signal.

## Scenario Selection Strategy

Map changed areas to the minimum browser scenarios required from `test_plan.md`.

### Always include these scenarios when relevant

- Authentication and session scenarios when changes touch login, logout, session storage, token expiry, guards, router, or API auth handling.
- Home and infinite scroll scenarios when changes touch recommendation listing, home page, loading states, pagination, or movie browse navigation.
- User menu and user management scenarios when changes touch RBAC, menu visibility, user register, user list, or user editing.
- Movie import scenarios when changes touch import UI, import parsing, import API integration, or movie listing verification.
- Movie detail and rating scenarios when changes touch movie detail, watch flow, watched endpoint submission, or rating classification.
- Access denied scenarios when changes touch permissions, protected routes, protected controls, or fallback states.

### Escalate to full browser regression when any of these change

- `src/app/router/**`
- `src/app/guards/**`
- `src/features/auth/**`
- `src/features/rbac/**`
- `src/api/client/**`
- shared layout or navigation components

### Minimum regression floor

If impact is uncertain, run at least:

1. Successful login and home load
2. Unauthorized/fallback behavior for a restricted user
3. One privileged user-management flow
4. One movie import flow
5. One movie detail/watch/rating flow

## Browser Execution Workflow

1. Verify prerequisites:
   - Frontend can be started or is already running.
   - Backend/API dependencies required by the chosen scenarios are reachable.
   - Test credentials and generated user data are available.
2. Start or reuse the frontend runtime if needed.
3. Execute the selected Gherkin scenarios from `test_plan.md` in the browser.
4. Use stable, user-visible assertions:
   - route transitions
   - visible menu options
   - form success/error feedback
   - fallback states
   - list/detail content appearing after actions
5. When a scenario creates data, record the concrete values used during execution.
6. If a scenario fails, capture enough evidence to make the failure actionable:
   - failing step
   - observed UI state
   - likely impacted file or feature slice if inferable

## Expected Validation Depth

### For narrow feature changes

- Run only the impacted scenario group plus one adjacent guardrail scenario.

### For medium feature changes

- Run all impacted scenario groups.
- Add auth or fallback coverage when the changed flow depends on permissions.

### For broad or risky changes

- Run the full regression represented in `test_plan.md`.

## Output Format

Report results in this structure:

### QA Scope

- Changed surface analyzed
- Scenarios selected from `test_plan.md`
- Why those scenarios were selected

### Results

| Scenario | Status | Evidence | Notes |
|----------|--------|----------|-------|
| <scenario name> | PASS/FAIL/BLOCKED | brief evidence | optional notes |

### Defects

- List each failure with the exact failing step and observed behavior.
- Separate confirmed failures from blocked execution issues.

### Verdict

- `PASS` only if all required browser scenarios passed.
- `FAIL` if any required scenario failed.
- `BLOCKED` if validation could not be completed reliably.
- `FAIL` or `BLOCKED` means the alteration must be reviewed and revalidated before completion.

## Completion Rules

- Do not claim success unless browser validation actually ran.
- Do not substitute unit/integration test success for browser QA success.
- If `test_plan.md` lacks a needed scenario for a changed feature, call that out explicitly and recommend updating the plan.
- If the UI changed materially, mention whether the exercised screens still align with the approved clean Material Design direction.
- When the verdict is `FAIL` or `BLOCKED`, explicitly instruct that the alteration must be reviewed and QA rerun after correction.

## Done When

- [ ] `test_plan.md` reviewed and scenario selection explained
- [ ] Required browser scenarios executed for the impacted change surface
- [ ] Pass/fail/blocked verdict reported with evidence
- [ ] Missing coverage in `test_plan.md` called out when discovered