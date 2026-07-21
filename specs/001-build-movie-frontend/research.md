# Research: Build Movie Frontend

## Decision 1: Frontend stack with latest stable libraries
- Decision: Use React 19 + TypeScript strict + Tailwind CSS with latest stable versions, bundling with Vite 7.
- Rationale: Matches constitutional constraints and improves developer velocity with modern tooling and fast iteration.
- Alternatives considered: Next.js App Router (rejected to avoid SSR complexity for this scope), plain CSS modules (rejected by mandatory Tailwind usage).

## Decision 2: Typed API consumption from OpenAPI contract
- Decision: Implement a typed API layer in frontend aligned to `openapi.yaml`, validating responses with Zod at boundary points.
- Rationale: Prevents silent contract drift and enforces strict typing for responses required by constitution.
- Alternatives considered: Untyped fetch wrappers (rejected by strict typing requirement), manual runtime casting only (rejected due to low safety).

## Decision 3: RBAC strategy with wildcard super admin
- Decision: Centralize permission evaluation in a dedicated RBAC module with deny-by-default and wildcard `*` short-circuit grant.
- Rationale: Keeps authorization logic consistent across routes, menu entries, and action controls.
- Alternatives considered: Scattered inline role checks (rejected due to inconsistency risk), backend-only gating without UI gating (rejected by constitutional UI rules).

## Decision 4: Infinite scroll pagination approach
- Decision: Use TanStack Query infinite query pattern with cursor/page-based continuation and explicit no-more-pages handling.
- Rationale: Supports resilient async states (loading, error, retry, empty) while keeping list append logic predictable.
- Alternatives considered: Manual state machine for pagination (rejected due to higher maintenance), classic numbered pagination UI (rejected by Netflix-like infinite browse requirement).

## Decision 5: Unauthorized fallback UX standard
- Decision: Provide a reusable fallback component with lock/info icon, clear message, and non-breaking navigation continuity.
- Rationale: Satisfies constitution requirement for resilient no-access behavior and improves user guidance.
- Alternatives considered: Redirect-only strategy (rejected because context gets lost), hard error pages (rejected for poor UX resilience).

## Decision 6: Small-task implementation slicing
- Decision: Break implementation into narrowly scoped tasks by vertical slices: auth session, RBAC core, menu gating, home list, movie detail, watched rating, user list/register, import flow.
- Rationale: Reduces merge conflicts, enables parallel work, and simplifies validation per user story.
- Alternatives considered: Layer-first monolithic tasks (rejected due to high coordination overhead), big-bang feature delivery (rejected due to high regression risk).

## Decision 7: Clean Material Design login redesign
- Decision: Redesign the login screen as a centered, low-noise authentication surface with a restrained Material-inspired card, concise headline, two input fields, one dominant CTA, and minimal secondary text.
- Rationale: The current login implementation is visually dense in contrast and too generic; a calmer hierarchy improves first-use clarity and aligns the UI direction with the clean Material Design constraint already adopted for the product.
- Alternatives considered: Keep the current dark utilitarian card (rejected for weak visual hierarchy), add promotional/illustrative side panels (rejected for adding noise to a simple auth task), split login into multiple steps (rejected for unnecessary friction).