# Skeleton through a real Solid Loading boundary

2026-10-08. Closes SKL-1's browser resolution/unmount gap. Skeleton's production
source, styling, public API and dependencies are unchanged.

## What shipped, and what the build did that the plan didn't say

- Added `/?skeleton-loading` (append `&dark`) through public package exports.
  A child reads `createMemo(() => props.request.promise)` beneath Solid 2's
  `Loading`. Three Skeletons and an application-owned status form the fallback.
  Resolving the actual promise causes Solid to replace that fallback; no pending
  boolean selects the fallback. This follows the installed rc.13 API and the
  existing unit fixture.
- A keyed `Show` mounts/removes the entire boundary. The parent retains explicit
  promise completion controls, including detached requests, so tests can settle
  them after disposal. The fixture contains no fetch, cache, timer or observer.
  REASONING: manually resolved promises provide deterministic async lifecycle
  evidence without relying on network speed or fixed waits. The history is a
  bounded-test fixture facility, not a production request manager.
- Two scenarios cover light desktop and dark narrow/enlarged (390 px, 24 px root
  font): visible loading status, three hidden decorative placeholders, reduced
  motion, no page overflow, promise resolution, fallback DOM disconnection,
  removal of status, preservation of editor node/draft/focus, ready-subtree
  disposal, keyboard unmount and a fresh pending-to-ready cycle.
- For the editor-focus assertion, the test invokes the real completion button's
  click handler without moving focus; other completions use actual pointer
  clicks and unmount uses Enter. The fixed shell is outside Loading.
- A third scenario unmounts while pending, resolves after disposal and verifies
  no content reappears. It then disposes another pending boundary, mounts a fresh
  one and resolves the older request: the fresh fallback retains node identity
  and status until its own promise resolves. Two animation frames after late
  completion allow promise reactions/rendering before negative assertions.
- All three scenarios are shared between source integration and built-export
  E2E in Chromium and Firefox. Strict warning/error/page-error checks remain on.
  No component correction or new unit test was necessary; the existing unit
  async-boundary test remains relevant, and browser tests add disposal coverage.

## Acceptance checklist

| DELIVERY.md criterion | Evidence / disposition |
| --- | --- |
| State has clear ownership | Parent fixture owns requests, completion controls and selected boundary. Profile reads its promise beneath Loading. Skeleton owns no request/readiness state. Native editor owns its draft. |
| Every state is usable | Pending, ready, unmounted and remounted states are tested. Loading has application status text; completed request controls disable. Empty/error states are outside this resolution/disposal scope. |
| Failures have a recovery path | Rejection/retry is application-owned and untested here. Fresh mounts and late successful resolution after disposal are verified. No remote mutation occurs. |
| Async work stays consistent | Old promises settling while absent or after a new mount cannot display stale content or replace the current fallback. Completion controls prevent repeat activation; underlying Promise resolution is one-shot. |
| Platform boundaries hold | Public web component exports only. No backend, AppApi, IPC, desktop adapter or data-layer change. |
| Reactivity and cleanup are deliberate | Async memo belongs to the Loading subtree; keyed removal disposes that owner. Tests retain old DOM handles and verify disconnection, late settlement and fresh fallback identity. No new runtime listeners/timers/observers. This is not a heap-leak measurement. |
| Keyboard and assistive access work | Status text is app-owned; all placeholders are aria-hidden. Editor name, draft and focus survive resolution; keyboard unmount preserves focus on the shell control. Physical assistive technology remains unrun. |
| Appearance remains customizable | Existing utilities and semantic tokens remain. Light desktop/dark narrow-enlarged layouts and reduced motion checked; original fifteen screenshot baselines compared unchanged. No new focused visual baseline or portal behavior. Long filenames are unrelated to decorative Skeletons. |
| Structure and performance fit the feature | Shared browser scenarios and an isolated documentation fixture. Production component remains a decorative div. No performance/heap claim; unbounded interactive request history is not intended for application use. |
| Tests prove the behavior | Fresh commands below cover unit, SSR, source browser, built exports and existing screenshot regressions. Electron and root-workspace integration are outside this package task. |
| Delivery evidence is accurate | Exact commands, measured durations, browser results and coverage retained. Matrix closes the scoped gap. No architectural or primitive-adoption change requires a DECISIONS.md or catalog-map update. |

## Verification

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | TypeScript passes | 2.15 s |
| `bun run lint` | ESLint passes | 1.02 s |
| `bun run test` | 100 unit tests pass | 2.61 s |
| `bun run test:coverage` | 100% statements/branches/functions/lines | 2.65 s |
| `bun run test:server` | 6 SSR tests pass | 0.68 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/skeleton-loading-integration.json bun run test:integration` | 170 runs pass (85 scenarios × 2 engines) | 127.80 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/skeleton-loading-e2e.json bun run test:e2e` | 146 runs pass (67 journeys × 2 engines + 12 visual tests) | 80.05 s |

Durations include startup. E2E freshly builds package JavaScript/CSS,
declarations and the gallery. All 316 final browser diagnostic attachments are
empty; no failures, retries or skipped cases. Twelve visual tests compare fifteen
unchanged baselines. Source coverage remains 100% in all four measured metrics,
which does not certify exhaustive behavior. Runner color-mode notices are
separate from application diagnostics.

[Command timings](evidence/skeleton-loading-commands.json),
[console output](evidence/skeleton-loading-verification.txt),
[source integration](evidence/skeleton-loading-integration.json),
[built E2E](evidence/skeleton-loading-e2e.json),
[coverage](evidence/skeleton-loading-coverage.json).

The initial [focused run](evidence/skeleton-loading-focused.json) used
`THEME_PORT=4403 RESULTS_FILE=docs/evidence/skeleton-loading-focused.json bunx --no-install playwright test tests/integration/skeleton-loading.spec.ts`.
It passed all six browser executions before the full gates. Its JSON records
Playwright's measured duration. No failing attempt or production fix preceded it.

## Remaining scope

This verifies first resolution and complete boundary disposal/remount, not
refetch/transition behavior on an already revealed boundary, rejection/retry,
nested Loading or portals, hydration, browser navigation, WebKit, real devices,
physical assistive technology or memory/performance measurements. Existing
whole-gallery axe checks run, but no new axe scan targets this fixture. Root
workspace/application/Electron checks were not run. No new screenshot baselines
were generated for this lifecycle-only change.

Next general acceptance work is ALL-1: add WebKit browser runs and inspect engine
differences. Manual IME/assistive-technology and hydration gaps stay explicit in
the matrix.
