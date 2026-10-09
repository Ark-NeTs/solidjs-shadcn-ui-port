# Alert Dialog focus delivery

2026-10-08. Closes ALT-1 with five shared browser scenarios against source and
freshly built exports in Chromium and Firefox. The
[acceptance matrix](TEST-MATRIX.md#alert-dialog) links the concrete assertions.

## What shipped, and what the build did that the plan didn't say

- Added a [focused preview](../playground/alert-dialog-focus.tsx) at
  `/?alert-dialog-focus`, with `&force-mounted` for a child kept in the DOM while
  closed. Public exports are used throughout; the main gallery layout is unchanged.
- Tests require exact forward/reverse Tab destinations at both boundaries. They
  also verify disabled/hidden/negative-tabindex skipping, background inertness,
  native page tab order after closing, and least-destructive initial focus.
- Nested Alert Dialog tests cover Escape, Cancel and Confirm independently,
  preservation of the parent's draft and scroll lock, focus return to the child
  trigger, renewed parent boundary wrapping, reopening after cleanup, and final
  restoration to the page trigger with the original scroll style.
- Both browsers exposed an initial-focus bug with a force-mounted child: the
  parent's unrestricted Cancel query selected the child's hidden Cancel button.
  The parent's own Cancel consequently did not receive initial focus.
  Initial and fallback queries now accept only nodes whose nearest dialog owner
  is the opening layer. REASONING: mounted descendant controls belong to their
  own modal lifecycle and must not become another layer's focus target.
- Two new unit cases cover parents with and without their own Cancel, child
  opening/closing, focus restoration and retained closed DOM. An initial unit
  assertion tried to query the closed native dialog by accessible name; closed
  dialogs have no accessible name in that query. The test now retains the node
  while open and asserts it remains mounted without the open attribute.

The fix is in the shared native-layer helper used by Alert Dialog and Popover;
existing Popover/Combobox tests were rerun. No dependency or public API changes,
custom traversal, diagnostic suppression, or new timing work was introduced.
The existing Kobalte assessment is unchanged. [DECISIONS.md](project/DECISIONS.md)
records the focus ownership rule.

## Acceptance checklist

| DELIVERY.md criterion | Evidence / disposition |
| --- | --- |
| State has clear ownership | Parent and child retain independent open state; the input owns its local draft. Focus queries now respect the same layer boundary. |
| Every state is usable | Parent open/closed, child mounted/hidden/open/closed/reopened and skipped controls are exercised. Existing pending/error examples rerun; no new request state is introduced. |
| Failures have a recovery path | Escape, Cancel and Confirm return to the correct owner without losing the parent draft; final dismissal returns to page navigation. No mutation/retry workflow added. |
| Async work stays consistent | No new async work or timers. Existing controlled rejection and cleanup tests pass unchanged; closing one modal does not release its parent's scroll lock. |
| Platform boundaries hold | Web primitives and public package exports only. No AppApi, IPC, backend, secrets or desktop integration changes; Electron requirements are N/A. |
| Reactivity and cleanup are deliberate | Shared DOM ownership lookup; no new signals, effects or listeners. Reopening and final scroll restoration exercise cleanup; strict diagnostics remain enabled. |
| Keyboard and assistive access work | Exact Tab/Shift+Tab targets, initial focus, naming, descriptions, child dismissal and inert parent/background focus attempts pass. Existing axe checks rerun; physical assistive technology remains unrun. |
| Appearance remains customizable | No production styling changes. Existing light/dark/enlarged/mobile checks and 12 screenshot comparisons rerun without baseline updates. The new preview uses semantic component styles; filename handling is N/A. |
| Structure and performance fit the feature | Scoped helper change and isolated public-export preview/shared tests; no performance or arbitrary-depth nesting claim. |
| Tests prove the behavior | Two unit regressions and five browser scenarios cover the defect and requested boundaries. All required fresh package gates are below. |
| Delivery evidence is accurate | Commands, measured durations, original failure and final reports retained; matrix/guide updated; reusable DELIVERY.md unchanged. |

## Verification

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | TypeScript passes | 1.96 s |
| `bun run lint` | ESLint passes | 1.18 s |
| `bun run test` | 87 unit tests pass | 2.68 s |
| `bun run test:coverage` | 100% statements/branches/functions/lines | 2.98 s |
| `bun run test:server` | 6 SSR tests pass | 0.82 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/alert-alt1-integration.json bun run test:integration` | 92 integration runs pass (46 scenarios × 2 engines) | 82.14 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/alert-alt1-e2e.json bun run test:e2e` | 65 E2E runs pass (28 journeys × 2 engines + 9 visual tests) | 43.64 s |

[Commands](evidence/alert-alt1-commands.json),
[final output](evidence/alert-alt1-verification.txt),
[integration report](evidence/alert-alt1-integration.json),
[E2E report](evidence/alert-alt1-e2e.json),
[coverage summary](evidence/alert-alt1-coverage.json).
Durations include startup. E2E builds package JavaScript/CSS, declarations and
the gallery afresh. The five new scenarios add 20 executions across two engines
and two export modes. Existing visual tests compare 12 unchanged images.
Source coverage is 100% in all four metrics; this does not certify every behavior.

The [initial focused run](evidence/alert-alt1-before.json) preserves the two
force-mounted initial-focus failures and eight passing cases. Final browser
reports contain empty warning/error/page-error attachments. Runner color-mode
notices are retained separately from application diagnostics.

## Remaining scope

WebKit, hydration, physical assistive technology, arbitrary nesting depth, every
focusable element type, custom focus hooks in these browser compositions,
application integration and Electron/root-workspace suites were not run. CMB-2's
physical IME check remains open. Next is TAB-1: focused trigger removal/reordering
and draft preservation in force-mounted panels.
