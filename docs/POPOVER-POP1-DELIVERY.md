# Popover placement delivery

2026-10-08. Closes POP-1 with five shared browser scenarios against source and
freshly built exports in Chromium and Firefox. The
[acceptance matrix](TEST-MATRIX.md#popover) links each assertion.

## What shipped, and what the build did that the plan didn't say

- Added a focused [placement preview](../playground/popover-placement.tsx) at
  `/?popover-placement&placement-case=scroll`; the other cases are `resize`,
  `motion`, `edge` and `clip`. It imports public component exports and leaves
  the main gallery's layout unchanged.
- Real layout assertions follow two-axis ancestor scrolling and document
  scrolling, viewport/anchor/content resizing, an animated transform and its
  return, viewport collisions, and an ancestor with overflow hidden, a transform
  and paint containment. Geometry comes from the browser; no Floating UI mock,
  forced click or reduced-motion override is used.
- Motion exposed a production bug: `duration-100` sets transition-duration while
  transition-property defaults to all, so each left/top update restarted a
  transition. Sampling measured roughly 17–21px of trailing error. Content now
  defaults to `transition-none`; the duration still controls opening keyframes.
  REASONING: placement coordinates must follow the anchor immediately rather
  than interpolate toward an already outdated location. The original 12px
  transient-error bound was not relaxed. Settled gap/alignment must be within
  1px. [DECISIONS.md](../DECISIONS.md) records this choice.
- The initial resize fixture allowed its widest state to enter the collision
  margin, where centering is intentionally subordinate to visibility. That test
  now uses a 720px viewport to isolate centered resizing. A separate 320×300
  viewport verifies collision constraints and reachable overflow content.
- A strengthened collision assertion initially expected the popup to touch the
  viewport padding. Floating UI legitimately flips alignment to the anchor's end
  first. The corrected assertion verifies that end alignment, then verifies
  viewport containment and a 296px constrained width after narrowing.
- Clipping acceptance includes `elementFromPoint` outside the ancestor's bounds
  and a normal click that closes the popup, followed by keyboard reopen/Escape.
  A rectangle alone would not establish that content was painted and clickable.

The component change is one default CSS utility. No primitive adoption,
dependency, API, observer lifetime or placement-engine change was needed. Existing
Kobalte adoption findings remain unchanged. Combobox also consumes Popover, so
its full source and built navigation/form suites were rerun.

## Acceptance checklist

| DELIVERY.md criterion | Evidence / disposition |
| --- | --- |
| State has clear ownership | Preview signals own anchor movement and dimensions; production open/anchor state ownership is unchanged. No backend data or draft ownership added. |
| Every state is usable | Open, moved/resized, collision-constrained, clipped-ancestor, closed and reopened cases pass. Loading/pending/error states are N/A to these local geometry controls. |
| Failures have a recovery path | Close and Escape remain reachable and restore trigger focus; reopening works. No network mutation or retry path is introduced. Existing rejection/recovery suites pass. |
| Async work stays consistent | Coordinate interpolation is removed; stale-result rejection and observer disposal remain covered by existing unit tests. No new production async work. |
| Platform boundaries hold | Public web-component exports only; no AppApi, IPC, backend or desktop adapter changes. Electron-specific criteria are N/A. |
| Reactivity and cleanup are deliberate | No new production signal, effect, listener or timer. Existing close/unmount cleanup tests rerun; strict browser warning/error/page-error collection remains enabled. |
| Keyboard and assistive access work | Named dialog/controls, native close activation, Escape focus return and keyboard reopen are asserted. Existing axe and nested/modal focus gates rerun. Manual assistive technology remains unrun. |
| Appearance remains customizable | Existing semantic tokens, consumer classes/styles and opening animation are preserved. Real layout is checked at desktop, 720px width and 320×300. Existing light/dark/enlarged-text and 12 screenshot comparisons rerun without baseline updates. Filenames are N/A to this preview. |
| Structure and performance fit the feature | One component utility plus isolated examples/shared browser tests. Motion sampling verifies attachment, not frame rate, battery use or large-scale overlay throughput. |
| Tests prove the behavior | Five placement scenarios execute in both engines against source and built exports. Fresh package gates are below; browser cases detect the original coordinate-transition defect. |
| Delivery evidence is accurate | Exact commands, measured durations, initial/intermediate failures and final reports retained. Matrix and guide updated; reusable DELIVERY.md unchanged. |

## Verification

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | TypeScript passes | 1.91 s |
| `bun run lint` | ESLint passes | 0.96 s |
| `bun run test` | 85 unit tests pass | 2.66 s |
| `bun run test:coverage` | 100% statements/branches/functions/lines | 2.52 s |
| `bun run test:server` | 6 SSR tests pass | 0.69 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/popover-pop1-integration.json bun run test:integration` | 82 integration runs pass (41 scenarios × 2 engines) | 74.60 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/popover-pop1-e2e.json bun run test:e2e` | 55 E2E runs pass (23 journeys × 2 engines + 9 visual tests) | 39.87 s |

[Commands](evidence/popover-pop1-commands.json),
[final output](evidence/popover-pop1-verification.txt),
[integration report](evidence/popover-pop1-integration.json),
[E2E report](evidence/popover-pop1-e2e.json),
[coverage summary](evidence/popover-pop1-coverage.json).
Durations include startup. E2E builds JavaScript/CSS, declarations and the gallery
freshly. Coverage remains 100% in all four source metrics; this is not exhaustive
behavior coverage. The five new scenarios account for 20 executions across both
engines and both export modes. Existing visual tests compare 12 unchanged images.

The [initial run](evidence/popover-pop1-before.json) retains resize/motion failures;
the [motion probe](evidence/popover-pop1-probe.json) retains sampled coordinates.
The [first fixed run](evidence/popover-pop1-focused.json) passes all ten focused
executions. The subsequent [intermediate integration report](evidence/popover-pop1-intermediate-integration.json)
retains the incorrect edge-alignment assertion, with its
[commands](evidence/popover-pop1-intermediate-commands.json) and
[output](evidence/popover-pop1-intermediate-verification.txt).
The [corrected collision run](evidence/popover-pop1-collision.json) passes in both
engines. Final reports retain motion samples and empty browser diagnostic
attachments; runner color-mode notices are distinct from application diagnostics.

## Remaining scope

WebKit, physical touch/visual-viewport zoom, every scroll animation frame,
arbitrary transforms, offscreen/occluded-anchor policy, browser hydration,
physical assistive technology, application integration and Electron/root-workspace
suites were not run. CMB-2's physical IME check remains open. POP-1 acceptance
covers the named cases, not every possible placement combination. The next
matrix gap is ALT-1: Alert Dialog's own Tab/Shift+Tab boundaries and nested
confirmation focus return.
