# Errored hydration and explicit recovery

2026-10-08. Add pending SSR hydration followed by real client promise rejection,
explicit retry, draft preservation and stale-result isolation. The fixture uses
Solid `Errored`, its actual reset callback, nested `Loading`, and public
Button/Input/Label/Skeleton exports. No production component, dependency, runtime,
API, theme or visual baseline changed.

## Cause of the apparent retry failure

The first fixture put dynamically created settlement buttons in the same reactive
update as the request being retried. Solid 2.0.0-rc.13 retained the previous error
view and committed request count while the new promise was pending. The new
“Resolve request 2” button therefore could not appear until request 2 settled,
but the test needed that button to settle it. Requiring an immediate Loading
fallback stopped the test even earlier. This was a harness deadlock and an
incorrect intermediate-state expectation, not evidence that recovery fails.

A [plain Solid comparison](../tests/hydration/retry-minimal.tsx) uses exactly two
promises and one native input, with fixed settlement buttons. Its
[three variants](../tests/hydration/retry-minimal.spec.ts) verify:

| Variant | Retry operation | Observed result |
| --- | --- | --- |
| `replace-reset` | Replace the reactive request, then invoke Errored reset | Previous error remains while pending; second promise resolves to ready content. |
| `replace-only` | Replace the reactive request without reset | Same result; changing the dependency itself can recover this composition. |
| `source-reset` | Replace an imperative promise source, then invoke Errored reset | Same result without a reactive request change, proving reset recomputes the source. |

All three preserve the input node and its pre-hydration draft. They assert the
retained error and absent Loading status after retry, then assert successful
recovery after actual settlement. The imperative-source variant deliberately
keeps its separate reactive request indicator at 1; the other two commit 2 after
settlement. This comparison isolates the behavior from the package's components;
it makes no claim about every possible Solid boundary composition.

The [public-component fixture](../tests/hydration/errored.tsx) now keeps four
fixed request slots and their settlement buttons available throughout the test.
An imperative active-request reference guards duplicate retries independently of
the committed signal view. The fourth slot ensures that an accidental extra retry
would select a different pending promise and fail recovery assertions. The shown
request count is explicitly the **committed** count. These manually controlled
request slots are test infrastructure, not a data-fetching API or a consumer UI.

## Verified acceptance

[Five component-composition scenarios](../tests/hydration/errored.spec.ts) and
three native comparisons run in Chromium, Firefox and WebKit: **24 new browser
executions**.

- Initial pending SSR markup is claimed without synchronous node replacement.
  The shell and pre-hydration draft retain identity after the Loading handoff.
- Rejection removes Loading/Skeleton, announces an error with a recovery
  instruction, and preserves draft value, node and focus. No automatic retry
  starts. Keyboard Retry returns focus to the draft.
- A retry can fail again and recover on the next explicit request. Two synchronous
  Retry activations create only one active retry; successful settlement clears
  the alert and renders the third request, with the same draft node and value.
- A newer request can succeed before an older retry resolves or rejects. Either
  late result leaves the newer ready node, text and draft unchanged.
- Pending unmount contains a late rejection; a fresh boundary can reject, retry
  and recover. Full-root disposal also contains a late rejection without restoring
  content or an alert.

Tests keep warnings, console errors and page errors fatal. Promise settlement is
followed by two animation frames before negative assertions. There is no caught
promise workaround, suppressed diagnostic, skipped test or runtime patch.

## Historical investigation

The initial counter used an `output` element, whose implicit status role collided
with the Loading status assertion. That fixture mistake was corrected first.
The earlier [cleaned reproduction](evidence/errored-hydration-final.json) then
passed root disposal but stopped four Chromium cases at the incorrect retry
expectation. [Its commands](evidence/errored-hydration-commands.json) and
[output](evidence/errored-hydration-verification.txt) remain historical evidence.

Two attempted fixes—request-keyed Loading and deferred reset—did not satisfy that
expectation and were removed. Work paused under the two-attempt agreement; the
owner authorized the native differential. That comparison established successful
recovery once the pending promise can actually be settled. Earlier speculation
about rollback or a general Solid retry bug was not established.

[Counter-conflict run](evidence/errored-hydration-focused.json),
[corrected initial run](evidence/errored-hydration-corrected.json),
[handler probe](evidence/errored-hydration-retry-probe.json),
[Loading rearm attempt](evidence/errored-hydration-rearmed.json),
[staged-update probe](evidence/errored-hydration-retry-steps.json),
[deferred-reset attempt](evidence/errored-hydration-reset-order.json),
[historical error screenshot](evidence/errored-hydration-retry.png),
[first native comparison](evidence/retry-minimal-initial.json), and
[corrected focused acceptance](evidence/retry-recovery-focused.json) describe their
then-current fixtures. Their Playwright reports contain durations; exploratory
runs were not separately wall-clock timed.

## Unrelated gate finding

The first built E2E gate had **212 passes and one failure** in the existing
force-mounted nested Alert Dialog keyboard test (Chromium). Its second open did
not expose the child Cancel button. The trace shows that first open, dismissal,
parent focus restoration and subsequent Tab navigation had succeeded. This test
uses the existing built gallery, not the new hydration routes.

Five isolated repetitions passed without modifying that test or its component.
The failure is retained in [the initial E2E report](evidence/retry-recovery-e2e.json), [its trace](evidence/retry-recovery-alert-trace.zip),
and [five repetitions](evidence/retry-recovery-alert-repeat.json). The native
layer's queued close-event handling is a possible investigation direction, not
an established cause. No unrelated production fix or test delay was added.
**ALT-2 was left open by this delivery**; passing subsequent gates did not
establish a fix. The later [Alert Dialog reopen delivery](ALERT-REOPEN-DELIVERY.md)
reproduces and fixes the queued native close race, closing ALT-2.

## Verification

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | Passed (exit 0) | 2.33 s |
| `bun run lint` | Passed (exit 0) | 1.11 s |
| `bun run test` | 104 passed (exit 0) | 2.75 s |
| `bun run test:coverage` | 100% statements, branches, functions and lines (exit 0) | 3.13 s |
| `bun run test:server` | 7 passed (exit 0) | 0.68 s |
| `RESULTS_FILE=docs/evidence/retry-recovery-hydration.json bun run test:hydration` | 81 passed (exit 0) | 47.79 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/retry-recovery-integration.json bun run test:integration` | 255 passed (exit 0) | 197.26 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/retry-recovery-e2e.json bun run test:e2e` | 212 passed; 1 unrelated Alert Dialog failure (exit 1) | 137.58 s |
| `bun run check` | Passed after review edits (exit 0) | 2.67 s |
| `bun run lint` | Passed after review edits (exit 0) | 1.26 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/retry-recovery-alert-repeat.json bun run test:e2e tests/e2e/alert-dialog-focus.spec.ts --project=chromium --grep 'force-mounted' --repeat-each=5` | 5 isolated repetitions passed (exit 0) | 11.79 s |
| `RESULTS_FILE=docs/evidence/retry-recovery-hydration-final.json bun run test:hydration` | 81 passed after review edits (exit 0) | 51.40 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/retry-recovery-e2e-final.json bun run test:e2e` | 213 passed, including 12 visual tests (exit 0) | 139.67 s |

The final gates cover **549 browser executions**: 81 hydration, 255 source
integration and 213 built E2E. All attach empty browser warning/error/page-error
diagnostics; no final run has a skip, configured retry or flaky result. The initial
E2E failure above still remains an intermittent finding. All 15 existing image
baselines pass unchanged. Source coverage is unchanged at 1,217 statements,
699 branches, 488 functions and 379 lines, all covered.

[Initial command timings](evidence/retry-recovery-commands.json),
[initial output](evidence/retry-recovery-verification.txt),
[post-review command timings](evidence/retry-recovery-review-commands.json),
[post-review output](evidence/retry-recovery-review-verification.txt),
[coverage](evidence/retry-recovery-coverage.json),
[final hydration](evidence/retry-recovery-hydration-final.json),
[source integration](evidence/retry-recovery-integration.json), and
[final built E2E](evidence/retry-recovery-e2e-final.json).

Self-review read the changed fixtures, route wiring and documentation, checked
machine-readable outcomes/diagnostic attachments, and removed redundant counter
state and the growing route-selection ternary. Typecheck, lint and the full
hydration gate were rerun after those fixture edits. No production code changed.


## Scope and delivery checklist

This covers synchronous pending SSR followed by **client-owned rejection and
completion** through source exports. Streaming, serialized SSR errors, ready-at-SSR
boundaries, multiple roots, refetch/cache policy, physical assistive technology,
router/query integration, application/Electron integration and a published SSR
build remain outside this task. Existing visual gates check the gallery; there
is no new error-state screenshot baseline or hydration-specific visual claim.
No architectural decision changed; the runtime behavior and fixture constraint
are documented in the README and test matrix instead of adding a new decision.

| DELIVERY.md criterion | Disposition |
| --- | --- |
| State has clear ownership | Request promises and settlement controls belong to the fixture; editable draft lives outside Errored; committed count derives from the current request. |
| Every state is usable | Initial pending, error, pending retry, ready and unmounted states are exercised. Fixed controls allow pending promises to settle; the retained error during retry is explicitly asserted. These controls are test infrastructure. |
| Failures have a recovery path | Real reset callback and explicit fresh request recover after repeated rejection; draft survives. No automatic retry or mutation is introduced. |
| Async work stays consistent | Repeated activation is guarded; stale resolve/reject and late rejection after unmount/disposal cannot replace current content. |
| Platform boundaries hold | Test-only web work; no AppApi, IPC, backend, secrets or CI changes apply. |
| Reactivity and cleanup are deliberate | Real Solid boundaries own the async memo. Duplicate guards use the active request, not the retained committed snapshot. Unmount and disposal are tested. |
| Keyboard and assistive access work | Named controls, alert/recovery instruction, keyboard retry and draft focus are asserted. Physical screen-reader navigation is unrun. |
| Appearance remains customizable | Production styles and semantic tokens are unchanged; existing light/dark/mobile/enlarged visual and integration gates apply. No new error-state visual claim. |
| Structure and performance fit the feature | Separate test fixtures and SSR routes; no production abstraction, data layer or performance claim. |
| Tests prove the behavior | Typecheck, lint, unit/coverage, SSR, three-engine hydration, source integration and built E2E are recorded in the verification table above. |
| Delivery evidence is accurate | Historical failures remain labeled; final measured commands, diagnostic attachments and scope limits are recorded. ASYNC-ERR-1 closes only the tested acceptance. |
