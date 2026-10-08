# Alert Dialog close/reopen race

2026-10-08. **ALT-2:** a force-mounted nested Alert Dialog could reopen and then
immediately disappear. Its old native `close` event reached the listener installed
for the new open cycle. The modal handler now ignores that event when the native
dialog is already open. Public APIs, styles, dependencies and library routing are
unchanged; this is a lifecycle correction under D19/D90, not an architecture change.

## Deterministic isolation

The prior [intermittent Chromium failure](evidence/retry-recovery-e2e.json) and
[trace](evidence/retry-recovery-alert-trace.zip) showed the second keyboard open
failing after successful nested dismissal and parent focus restoration.
Repeating that keyboard journey alone did not reliably expose the cause.

The new [shared browser regression](../tests/alert-dialog-focus.ts#L107) controls
only the close/reopen ordering:

1. Open the parent and its force-mounted child using keyboard controls.
2. Observe the child's native `open` attribute. Activate Cancel, which runs the
   component's normal cleanup and calls the browser's real `dialog.close()`.
3. As soon as the attribute is removed, activate the child's trigger in a mutation
   observer. This reopens the same dialog before the queued close event arrives.
4. Capture that event and inspect the dialog after two animation frames.

The test does not replace `close()`, `showModal()` or native event dispatch. It
requires `event.isTrusted === true`, requires the dialog to be open when the event
arrives, and then requires it to stay open. It disconnects its observer after
reopening and uses a one-shot listener for the event.

| Observation | Before fix, Chromium | After fix, all three engines |
| --- | --- | --- |
| Native close event is trusted | true | true |
| Same dialog has reopened | true | true |
| Dialog is open when the old event arrives | true | true |
| Dialog is still open after event delivery | **false** | **true** |

The [pre-fix regression](evidence/alert-reopen-before.json) failed on the last
assertion, with empty browser diagnostics. This establishes a real event-order
failure, rather than an assertion timeout or missing keyboard activation.
The browser's asynchronous delivery explains why keeping the node mounted matters:
the next effect installs its listener on the same element before the old event
arrives. Removing the old listener during cleanup cannot remove that queued event.

## Fix and regression coverage

In [the shared modal handler](../src/lib/layer.ts), the native `open` property is
checked before a close notification is sent to the owner. An event delivered to an
already-open dialog is stale. A genuine external close removes `open`, so its
existing owner notification and controlled-rejection recovery still run. The
existing active-scope guard continues to prevent reopening after disposal.

The browser regression runs against source and freshly built exports in Chromium,
Firefox and WebKit. In addition to native event ordering, it verifies:

- The parent draft retains both its value and DOM node.
- The child keeps its least-destructive focus target and expanded trigger state.
- Nested modal scroll locking remains active throughout reopening.
- An actual external `dialog.close()` still updates the owner and restores the
  child trigger; another keyboard open and Cancel remain usable.
- Closing the parent restores its trigger and original document scroll style.

A [unit regression](../tests/unit/overlays.test.tsx#L109) sends repeated stale close
events and requires no extra owner notifications or autofocus calls. It then
performs a genuine external close and checks normal cleanup. Existing controlled
rejection and disposal tests remain. Two old unit cases dispatched `close` while
the mock dialog was still open; they now call the mock `close()` first to model
actual external closure. Their acceptance expectations are preserved.

The shared helper also serves modal Popover. The full existing Popover, nested
modal, focus, hydration and cleanup suites run as regression gates. This task does
not extend the nonmodal popover toggle contract or claim exhaustive native-event
ordering coverage for every layer composition.

## Verification

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | Passed (exit 0) | 2.17 s |
| `bun run lint` | Passed (exit 0) | 1.16 s |
| `bun run test` | 105 passed (exit 0) | 3.03 s |
| `bun run test:coverage` | 100% statements, branches, functions and lines (exit 0) | 2.74 s |
| `bun run test:server` | 7 passed (exit 0) | 0.67 s |
| `RESULTS_FILE=docs/evidence/alert-reopen-hydration.json bun run test:hydration` | 81 passed (exit 0) | 46.91 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/alert-reopen-integration.json bun run test:integration` | 258 passed (exit 0) | 193.64 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/alert-reopen-e2e.json bun run test:e2e` | 216 passed, including 12 visual tests (exit 0) | 122.56 s |

All **555 final browser executions** attach empty browser warnings, console errors
and page errors. There are no retries, skips or flaky results. The six new
source/built executions record trusted native close events arriving after reopen,
with the dialog remaining open. All 15 existing visual baselines pass unchanged.
Included source coverage is 1,220 statements, 701 branches, 488 functions and
381 lines, all covered; execution coverage is not exhaustive behavior coverage.

[Measured commands](evidence/alert-reopen-commands.json),
[verification output](evidence/alert-reopen-verification.txt),
[coverage](evidence/alert-reopen-coverage.json),
[native event observations](evidence/alert-reopen-native-events.json),
[hydration](evidence/alert-reopen-hydration.json),
[source integration](evidence/alert-reopen-integration.json), and
[built E2E](evidence/alert-reopen-e2e.json).

Self-review checked the complete handwritten diff, genuine-versus-stale close
semantics, controlled rejection and disposal coverage, observer/listener cleanup,
all generated outcomes/diagnostics and documentation links. The final gates ran
against the reviewed code and final external-close regression assertions.


Exploratory timings below are Playwright report durations, not separately timed
shell commands. The final full gates above are the acceptance runs.

| Exploratory command | Outcome | Time |
| --- | --- | ---: |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/alert-reopen-before.json bun run test:e2e tests/e2e/alert-dialog-focus.spec.ts --project=chromium --grep 'queued native close'` | One expected pre-fix failure | 4.44 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/alert-reopen-after.json bun run test:e2e tests/e2e/alert-dialog-focus.spec.ts` | 216 passed; exploratory, before final external-close assertions | 126.52 s |
| `bun run check` | Passed; superseded by final full gate | Not separately timed |
| `bun run test -- tests/unit/overlays.test.tsx` | 19 focused unit cases passed; superseded by final full gate | Not separately timed |

The package's E2E script already selects `tests/e2e`, so adding a filename to
the second command did not restrict its run.

[Exploratory post-fix report](evidence/alert-reopen-after.json).
No tests, warnings or errors are suppressed. No arbitrary delay or retry was added
to the previously intermittent keyboard test.

## DELIVERY.md disposition

| Criterion | Disposition |
| --- | --- |
| State has clear ownership | Solid owner controls requested state; native `open` distinguishes a stale notification from an actual close. No mirrored state or generation counter was added. |
| Every state is usable | Existing closed/open states and rapid reopening are checked; loading/empty/error states are not introduced by this lifecycle change. |
| Failures have a recovery path | Reopening survives the old event. Genuine external close, controlled rejection and subsequent keyboard use retain their existing contracts. No backend operation or retry is involved. |
| Async work stays consistent | A queued event from the old open cycle cannot close the new one; disposal still cancels pending restoration. |
| Platform boundaries hold | Browser UI only; no AppApi, IPC, backend, secrets, CI or database change. |
| Reactivity and cleanup are deliberate | Existing effect owns listeners, modal focus and scroll lock; no new production listener, observer or timer. Test observer disconnects and event listener runs once. |
| Keyboard and assistive access work | Real keyboard journeys, least-destructive child focus, trigger restoration, draft preservation and accessibility gates pass. Physical assistive-technology sessions remain unrun. |
| Appearance remains customizable | No CSS or API change; existing light/dark/mobile/enlarged and visual gates run. No new screenshot baseline is necessary for the event-order fix. |
| Structure and performance fit the feature | One native-state guard in the shared lifecycle; no new dependency, abstraction or performance claim. |
| Tests prove the behavior | Deterministic failure before the fix, one unit regression and one shared source/built browser scenario, plus all required gates. |
| Delivery evidence is accurate | Exact commands, measured durations, native event attachments and scope limits are recorded; ALT-2 closes this reproduced race. |

Electron, application/backend integration, physical AT and performance measurement
are outside this web-component lifecycle task. No new architectural decision was
required. Full catalog/API parity and other open matrix items remain unchanged.
