# Combobox CMB-1 browser acceptance

2026-10-08. Closes CMB-1 in the [test matrix](TEST-MATRIX.md). Four scenarios
run against source exports and freshly built exports in Chromium and Firefox,
adding eight integration executions and eight E2E executions. Library source,
public API, dependencies and existing screenshot baselines are unchanged.

## What shipped, and what the build did that the plan didn't say

- A focused playground at `/?combobox-contracts` uses public component exports.
  REASONING: form ownership and object replacement need independent examples;
  preserving the main gallery keeps existing visual comparisons meaningful.
- Controlled and uncontrolled multiple forms submit actual repeated FormData
  values after selection, chip removal, clear and reset. Reset restores the
  declared Apple default and subsequent submission verifies it again.
- Object result replacement creates new instances with stable keys. Tests check
  selected-option semantics, selection of a new object, canonical submission
  while results are empty, replacement again and native reset to the original
  object. REASONING: labels or reference equality alone do not prove form keys.
- Controlled opening, query and dismissal requests are explicitly observed and
  rejected. DOM values, visible options and expanded state stay with the owner;
  owner updates take effect and rejected Banana selection still submits Apple.
- One shared scenario module runs in both integration and E2E. REASONING: identical
  acceptance assertions must exercise both source and built package resolution.
  No synthetic form events, force-clicks, diagnostic exclusions or retry settings
  were introduced.

Kobalte's existing [adoption assessment](../KOBALTE-COMBOBOX.md) was reviewed. This
batch tests the delivered owned composition; it introduces no new primitive or
library adoption and does not promote the experimental Kobalte patches.

## Acceptance checklist

| DELIVERY.md criterion | Evidence / disposition |
| --- | --- |
| State has clear ownership | Selection, query, open state, result objects, requested changes and submitted output have separate owners. Both controlled and uncontrolled multiple forms are exercised. |
| Every state is usable | Initial, edited, cleared, empty-result, rejected and reset states are exercised. The new fixture has no remote loading or pending request, so those states are N/A. |
| Failures have a recovery path | Owner rejection preserves canonical Apple; explicit owner actions change query/open state. Reset restores defaults after edits and clearing. No mutation or retry operation is introduced. |
| Async work stays consistent | Native reset is followed by retrying assertions for restored UI and a new submission, including controlled ownership. Remote stale-response/duplicate-submit behavior is N/A: these examples make no requests. Existing disposal unit tests still pass. |
| Platform boundaries hold | Public package imports and local form data only. AppApi, IPC, backend and Electron work are N/A. |
| Reactivity and cleanup are deliberate | Fixture signals are application-owned. Existing strict browser fixtures reject every console warning/error and page error. No runtime implementation or lifecycle change. |
| Keyboard and assistive access work | Native keyboard search/selection/Escape, label queries, accessible option names, selection and expanded state are asserted. Existing axe checks rerun; these new forms add no manual assistive-technology certification. |
| Appearance remains customizable | Semantic theme classes and public components compose the fixture. Existing 12 screenshots compare unchanged gallery states; the focused forms have no new visual baseline. |
| Structure and performance fit the feature | Four readable shared browser scenarios avoid duplicating source/built assertions. No library payload change or performance claim. |
| Tests prove the behavior | Fresh required gates below pass. CMB-1 tests assert both UI state and actual submission values; matrix links are updated. |
| Delivery evidence is accurate | Exact commands/times and raw reports retained. DELIVERY.md unchanged. No architectural decision changed, so DECISIONS.md update is N/A. Open scope remains in the matrix. |

## Verification

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | TypeScript passes | 1.94 s |
| `bun run lint` | ESLint passes | 0.97 s |
| `bun run test` | 80 unit tests pass | 2.50 s |
| `bun run test:coverage` | 100% statements/branches/functions/lines | 2.11 s |
| `bun run test:server` | 6 SSR tests pass | 0.68 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/combobox-cmb1-integration.json bun run test:integration` | 62 integration runs pass (31 scenarios × 2 engines) | 59.01 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/combobox-cmb1-e2e.json bun run test:e2e` | 35 E2E runs pass (13 journeys × 2 engines + 9 visual tests) | 25.53 s |

Evidence: [command records](evidence/combobox-cmb1-commands.json),
[complete final output](evidence/combobox-cmb1-verification.txt),
[integration JSON](evidence/combobox-cmb1-integration.json),
[E2E JSON](evidence/combobox-cmb1-e2e.json),
[coverage](evidence/combobox-cmb1-coverage.json).
Durations include command startup. E2E builds the library, declarations and gallery
before serving. Coverage remains 100% for the configured component/helper source;
the new browser scenarios improve behavior coverage without changing unit counts.

Development checks first exposed an overly broad generic inference from passing
a signal setter; the fixture now supplies `Combobox<string>`. The first browser
run also caught an assertion comparing decorative checkmark text instead of the
option's accessible name. After correcting that assertion, the trace showed the
intentionally open popup covering the fixture's external close button. Recovery
buttons now live inside that popup and can be clicked normally. The stalled
Firefox run emitted HOT_SCOPE_TIME; the [unfiltered failed report](evidence/combobox-cmb1-controlled-before.json)
is preserved. Final runs use the same strict diagnostics, with no suppression.
These were fixture/test fixes; no component implementation fix was necessary.

## Remaining scope

CMB-2 remains open: long-list active-option visibility, Tab destination, nested
modal usage and a physical IME session. WebKit, hydration, manual screen readers,
real backend/query/router integration, performance certification and Electron /
whole-application suites were not run. The Kobalte probe and import-parity scripts
were not rerun: no library adoption, exported API or consumer import changed.
Self-review covered changed code, test assertions, matrix links and final reports;
all changes remain inside the Solid theme package.
