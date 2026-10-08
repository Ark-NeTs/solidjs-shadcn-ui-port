# Checkbox and Switch form lifecycle delivery

2026-10-08. Closes CHK-1/SWT-1 with seven shared browser scenarios against
source and freshly built exports in Chromium and Firefox. The
[acceptance matrix](TEST-MATRIX.md#checkbox) links each contract to assertions.

## What shipped, and what the build did that the plan didn't say

- Added a [public-export preview](../playground/toggle-forms.tsx) at
  `/?toggle-forms`, with `&switch` and `&mixed` variants. It exposes actual native
  reset buttons, live form ownership, FormData and public callback counts through
  the tests. Fixture signals own cancellation, association and mounting.
- Each binary control independently verifies cancellation by a bubbling ancestor,
  recovery on an allowed reset and no duplicate callback when already at default.
  Checked, indeterminate, ARIA, styling state and actual successful form controls
  are asserted together. Checkbox also verifies mixed-state reset cancellation
  and restoration.
- Each control moves from the first form to the second, ignores the old form's
  reset, detaches via a missing ID, and returns to its ancestor by removing the
  explicit `form` prop. FormData follows the current owner and the input retains
  its node identity.
- Reset-then-reassociate and reset-then-unmount actions commit before queued work.
  Old work cannot notify the owner; remount starts at its default and receives
  exactly one notification per later change. Negative assertions cross a browser
  task boundary before checking that deferred work had no effect.
- The initial run exposed six reset-cancellation failures, including mixed state,
  in both engines. A Chromium event-order probe observed the form listener and
  its microtask before the ancestor's canceled event. The helper had already
  emitted `["false","true"]` for a reset that should leave `["false"]`.
- Fixed the shared helper to schedule reset synchronization with a zero-delay
  task. It checks cancellation after propagation/default action and keeps a set
  of pending timers; reassociation and unmount remove the listener and cancel
  every pending timer. REASONING: a microtask can run between native listeners,
  so it does not guarantee that later reset cancellation has happened.
- Expanded the existing reset/disposal unit cases to run for each control and
  added queued-reassociation cases for each: four additional unit executions.
  Unit reset checks now await the task boundary used by the implementation.

No dependency, public API, theme or component mapping changes. The Kobalte-first
adoption decision is unchanged; this repairs existing owned controls.
[DECISIONS.md](../DECISIONS.md) records the scheduling and cleanup choice.

## Acceptance checklist

| DELIVERY.md criterion | Evidence / disposition |
| --- | --- |
| State has clear ownership | Existing controlled/uncontrolled ownership remains; the fixture owns cancellation and association. Timers do not hold a duplicate checked value. |
| Every state is usable | Checked, unchecked, mixed, canceled/allowed reset, detached, reassociated, unmounted and remounted cases pass. Network loading/error states are N/A. |
| Failures have a recovery path | Canceled resets preserve state and callbacks; subsequent allowed resets recover. No backend mutation or retry is introduced. |
| Async work stays consistent | Both controls prove queued reset disposal on reassociation/unmount and a clean remount. Pending timers are canceled by their effect owner. |
| Platform boundaries hold | Native web controls and local fixtures only. AppApi, IPC, backend and Electron changes are N/A. |
| Reactivity and cleanup are deliberate | Existing form-prop effect scopes listener and timer cleanup. Strict browser/unit diagnostics remain enabled. |
| Keyboard and assistive access work | Space toggles each control; checked/mixed ARIA matches native state. Existing label, focus, disabled/read-only and axe suites rerun. Physical assistive technology remains unrun. |
| Appearance remains customizable | No production CSS changes. Light/dark/enlarged/mobile suites and 12 screenshot comparisons rerun without baseline changes. Filename handling is N/A. |
| Structure and performance fit the feature | One shared helper owns reset scheduling for both controls. No new dependencies or performance claims. |
| Tests prove the behavior | Seven browser scenarios run independently through both export modes and engines; four additional unit executions support lifecycle coverage. Fresh gates below. |
| Delivery evidence is accurate | Exact commands, measured durations, initial failures and final reports retained; matrix/guide updated. DELIVERY.md remains unchanged. |

## Verification

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | TypeScript passes | 2.04 s |
| `bun run lint` | ESLint passes | 1.01 s |
| `bun run test` | 97 unit tests pass | 2.55 s |
| `bun run test:coverage` | 100% statements/branches/functions/lines | 2.88 s |
| `bun run test:server` | 6 SSR tests pass | 0.69 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/toggles-forms-integration.json bun run test:integration` | 118 integration runs pass (59 scenarios × 2 engines) | 95.31 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/toggles-forms-e2e.json bun run test:e2e` | 91 E2E runs pass (41 journeys × 2 engines + 9 visual tests) | 56.88 s |

[Commands](evidence/toggles-forms-commands.json),
[final output](evidence/toggles-forms-verification.txt),
[integration report](evidence/toggles-forms-integration.json),
[E2E report](evidence/toggles-forms-e2e.json),
[coverage summary](evidence/toggles-forms-coverage.json).
Durations include startup. E2E freshly builds JavaScript/CSS, declarations and
the gallery. Seven scenarios add 28 executions across two engines and two export
modes. Nine visual tests compare 12 unchanged images. Source execution coverage
is 100% in all four metrics; this is not exhaustive behavior coverage.

The [initial run](evidence/toggles-forms-initial.json) retains six cancellation
failures and one unrelated Firefox Combobox `HOT_SCOPE_TIME` diagnostic. The
Combobox warning did not recur in the final full run and is recorded without
changing its implementation or suppressing diagnostics. The [focused fix run](evidence/toggles-forms-focused.json) passes all
14 executions. Final full-suite browser diagnostic attachments are empty.
Runner color-mode notices are separate from application diagnostics.

## Remaining scope

These cases exercise reactive `form` props with existing target forms, not
arbitrary DOM reparenting, target-form replacement/ID mutation or all controlled
reset/cancellation combinations. WebKit, browser hydration, physical assistive
technology, application integration, Electron/root-workspace suites and measured
performance were not run. CMB-2's physical IME session remains open. Next are
BTN-1/BDG-1: native keyboard focus/navigation for Button and Badge links, including
disabled Button anchor nonactivation.
