# Login Screen UI Contract

## Objective

Define a clean Material Design direction for the login screen so the next UI revision can be
approved before implementation.

## Design Intent

- The screen should feel calm, direct, and focused on authentication.
- The user should understand the primary action within a few seconds.
- The layout should avoid decorative complexity, heavy contrast blocks, and competing calls to action.

## Proposed Layout

### Desktop

- Full-height page with centered content.
- One restrained authentication card with generous whitespace.
- Card width in the compact range, optimized for one-column reading.
- Subtle background atmosphere is allowed, but it must not compete with the form.

### Mobile

- Same one-column hierarchy.
- Card may collapse into a near-full-width surface with preserved spacing.
- Primary CTA remains visible without excessive scrolling on common viewport heights.

## Visible Elements In Default State

1. Product title or compact brand mark
2. Short heading that explains the action
3. Brief supporting sentence
4. Email field
5. Password field
6. Inline error area reserved for authentication feedback
7. One primary button labeled with the login action

## Elements Explicitly Excluded From First Iteration

- Secondary marketing panels
- Carousel, hero illustration, or feature grid
- More than one primary CTA
- Excessive helper text under each field
- Dense footer links inside the card

## Interaction Contract

- Initial focus should be obvious and calm.
- Form fields should provide clear focus states aligned to Material behavior.
- Error feedback should appear inline, close to the form action, without displacing the full layout.
- Loading state should preserve layout stability while the submit action is in progress.

## Visual Language

- Prefer soft surfaces, restrained elevation, and clean spacing rhythm.
- Typography should clearly separate heading, support text, field labels/placeholders, and CTA.
- Color use should emphasize the primary action and input focus, not decorate the whole screen.
- Contrast must remain accessible while avoiding the current heavy dark-card aesthetic.

## Content Guidance

- Heading suggestion: direct and compact, focused on sign-in.
- Supporting copy suggestion: one short sentence explaining access to recommendations and administration features.
- Error copy should remain concise and actionable.

## Approval Checklist

- The first viewport contains only the essential authentication elements.
- The primary CTA is visually dominant without overpowering the page.
- The screen reads as clean on both desktop and mobile.
- The design is clearly aligned with Material Design interaction patterns.
- The user has explicitly approved this direction before implementation.

## Implementation Mapping

- Primary implementation target: `src/pages/auth/LoginPage.tsx`
- Shared styling context: `src/styles/index.css`
- QA source after implementation: `test_plan.md`
- Prototype reference: `specs/001-build-movie-frontend/contracts/login-screen-prototype.md`

## Implementation Notes (Phase 1)

- Keep the initial viewport focused on authentication only, without support copy blocks.
- Preserve a single visual emphasis point: the Entrar button.
- Ensure inline error feedback remains in-flow, between inputs and CTA.
- Use shared tokens from `src/styles/index.css` for focus ring, border, and surface tones.
- Validate final behavior through browser QA scenarios mapped in `test_plan.md`.