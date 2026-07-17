# Maintainability refactor summary

Applied maintainability principles to app-template: extracted shared UI, moved logic to the right places, and reduced duplication.

## New shared components (`lib/components/`)

| Component | Purpose |
|-----------|---------|
| **Logo.svelte** | 5×5 “F” + “lip” logo; optional `href` to render as link (used in home header). |
| **BackLink.svelte** | Consistent “← Back” (or custom label) link with shared styling. |
| **PageHeader.svelte** | Header bar with back link, optional title, optional `trailingLabel` (e.g. “Puzzle 3”). Used on daily, tutorial, play, play/game. |
| **Card.svelte** | Wrapper for card layout (`rounded-2xl border bg-white shadow-sm`). Optional `dashed` for CTA-style cards. |
| **Button.svelte** | Primary/secondary button (and optional link via `href`) with consistent classes. |

## New utilities and constants

| File | Purpose |
|------|---------|
| **lib/utils/date.ts** | `formatLongDate(dateStr)` for “Weekday, Month Day, Year”; `formatShortDate(dateStr)` for short dates. Used on daily page. |
| **lib/constants/tutorialSteps.ts** | `getDefaultTutorial()` and `TutorialStep` / `StepAction` types. Single source of truth for tutorial copy; `TutorialWalkthrough.svelte` imports types from here. |

## Where they’re used

- **Home (`+page.svelte`)**  
  Logo, Card, Button. Removed long inline logo markup and repeated card/button classes.
- **Daily**  
  `BackLink`, `formatLongDate` for the date label.
- **Tutorial**  
  `PageHeader`, `getDefaultTutorial()` from constants (steps no longer defined in the page).
- **Play**  
  `PageHeader` for the back link.
- **Play/game**  
  `PageHeader` with `backLabel` and `trailingLabel` (e.g. “Puzzle 3” or “Random Puzzle”).

## Benefits

- **Single source of truth**: Logo, back link, card and button styles, tutorial steps, and date formatting live in one place.
- **Easier changes**: Update logo, header, or tutorial copy in one file.
- **Clearer routes**: Pages focus on layout and data; shared UI and logic live in `lib/`.
- **Reuse**: Card and Button can be used on other pages (e.g. pricing, auth) for consistency.

## Optional follow-ups

- **PuzzleShell.svelte**: Replace deprecated `<slot>` with `{@render ...}` (Svelte 5) when touching that component.
- **Dashboard dates**: If subscription dates are date-only strings, they could use `formatShortDate` from `lib/utils/date.ts`.
- **Pricing / auth**: Use `Button` and/or `Card` for consistent CTAs and panels.
