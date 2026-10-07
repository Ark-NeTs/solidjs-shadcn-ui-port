# Input OTP diagnostics and form wiring — 2026-10-07

**The isolated Input OTP repair passes all 26 OTP cases in development and
production across Chromium and Firefox, with no warnings or page errors.**
This is a harness-only compatibility patch, not production adoption or complete
shadcn Input OTP delivery. Gate 0 and the other primitive findings remain open.

Versions remain Kobalte `2.0.0-alpha.2` and Solid/web/signals `2.0.0-rc.13`;
Kobalte's peers still pin rc.3. This extends the
[Dialog ID repair](KOBALTE-DIALOG-IDS.md). It also patches the already-transitive
`@solid-primitives/a11y@1.0.0-next.3`; both patches must be applied together.
No corvu, production components or application dependencies were added. No Git
commit was made.

## Causes and repairs

| Finding | Repair and evidence |
| --- | --- |
| Input never registered its field ID and did not forward Root's name or native required state. | Use the existing form-control input helper; provide ID, name, required, accessible label and description props. Native Label association and FormData now work without explicit Input overrides. |
| Root snapshotted controlled value outside tracking; Input read its ref in an effect apply callback and initialized value from its ref callback. Shared Label eagerly generated its ID and read a reactive ref prop during setup. | Declare controlled-mode and ref callbacks as intentional setup snapshots; track input ref and value together. Generate shared label/description/error IDs lazily. Actual field values and IDs remain reactive. |
| Live IDs exposed `EFFECT_RELAY_TEAR` in shared registration effects. | Register stable accessors once and derive IDs from their sources in a11y. Public string registration and cleanup still pass. Its declaration now accepts either a string or an accessor. Label, Description and ErrorMessage use the new internal contract. |
| Following all live ARIA sources directly made the input's DOM spread exceed the diagnostic dependency budget in the expanded fixture. | Memoize the two derived ARIA chains, keeping DOM writes subscribed to the resulting strings. No diagnostic suppression was added. |
| Ref-dependent settled callbacks could miss nodes. Reset work could overwrite state from the browser's temporary DOM value, run after disposal, or leave a repeated reset empty. | Track refs for listeners/observer setup. Root applies its default after the reset event, respects cancellation and guards disposal. Input restores the canonical value after native reset, including unchanged defaults; pending animation frames are cancelled during cleanup. |
| The old fixture's `onComplete={setComplete}` mirrored the value into a second signal, producing its own relay warning. | Record real callback invocations in a plain event log and assert their values/counts. This fixture warning is distinguished from library defects. Completion dependencies are also read in the effect's compute phase. |

The [original trace](validation/solid2-browser/evidence/otp-before.json) retains
untracked-read stacks, the fixture completion relay and a timing warning.
The [intermediate ID evidence](validation/solid2-browser/evidence/otp-id-relay-intermediate.json)
records the registration relay exposed by lazy IDs. The
[previous-patch trace](validation/solid2-browser/evidence/otp-control-trace.json)
uses the new event-log fixture and still shows missing IDs/name/ARIA and strict
reads. The [final trace](validation/solid2-browser/evidence/otp-after.json) shows
associated IDs, native FormData, live root renaming and reset with no diagnostics.

The cumulative Kobalte patch changes 16 distribution files, covering both JS
and JSX paths. The additional a11y patch changes its form-control runtime and
matching type declaration. SHA-256 values:

- Kobalte: `58a7a38b690c74544eab899da37b88c2c89721c014a30f31b7223fa88568d860`
- a11y: `0603908f781d1ff943d8723b6987b4a2bdf1e4aae8a32281912441f0881e87f8`

The previous patch, manifest and lockfile are preserved in
[baseline/dialog-ids](validation/solid2-browser/baseline/dialog-ids/).

## Regression evidence

Every OTP test rejects all console warnings/errors throughout the interaction.
Coverage includes typing, completion callbacks, controlled updates, invalid
characters, Backspace and length limiting; default label association and click
focus; dynamic root/input IDs, names and explicit ARIA overrides; conditional
Description/ErrorMessage registration; required/disabled/readOnly native form
rules; synthetic copy handling; controlled/uncontrolled repeated resets;
cancelled reset; and unmount/remount resource and callback lifetimes.
The shared context's existing public string registration API is tested too.

| Run | Passed | Failed | Skipped | Time |
| --- | ---: | ---: | ---: | ---: |
| Previous patch: default Label/FormData cases × two browsers | 0 | 4 | 0 | 16.592 s |
| Fresh final JSX development: full matrix | 82 | 5 | 1 | 67.355 s |
| Fresh final production: full matrix | 85 | 2 | 1 | 53.182 s |
| Firefox Drawer drag: diagnostic follow-up, three repetitions | 3 | 0 | 0 | 9.989 s |
| Compiled JS development: OTP/Drawer/Dialog | 63 | 0 | 1 | 47.189 s |
| Stronger listener cleanup assertion: dev, two browsers | 2 | 0 | 0 | 4.276 s |
| Stronger listener cleanup assertion: js, two browsers | 2 | 0 | 0 | 4.324 s |
| Stronger listener cleanup assertion: production, two browsers | 2 | 0 | 0 | 3.204 s |

Both complete matrices include 26 passing OTP cases. The production failures
are the existing explicit DOM Direction/keyboard mismatch in two browsers.
Development also fails both Direction/Tabs mount-diagnostic cases and one
Firefox Drawer drag case: its DOM-spread compute time reached the 8 ms
`HOT_SCOPE_TIME` budget. Three focused repetitions passed, but the original
failure remains in the evidence and is not declared resolved. No uncaught page
exceptions occurred. The skipped case remains Firefox's unsupported CDP touch
injection. No retries or expected-failure annotations hide failures.

Final runs used `/private/tmp/solid2-otp-final`; the control used
`/private/tmp/solid2-otp-control`. Development served port 4399, production
preview 4400 and control 4411. Tests used one worker. Artifact output was moved
outside the served directory, and Vite ignores test-result folders to prevent
trace HTML from triggering reloads.

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun install --frozen-lockfile --ignore-scripts` in fresh final scratch | Both patches applied; 120 packages | 0.143 s |
| `bun run build` | Passed; 113 modules | 0.504 s |
| `RESULTS_FILE=otp-dev-results.json bun run test --output=/private/tmp/otp-dev-test-results` | Full development results above | 67.355 s |
| `HARNESS_URL=http://127.0.0.1:4400 RESULTS_FILE=otp-production-results.json bun run test --output=/private/tmp/otp-production-test-results` | Full production results above | 53.182 s |
| `HARNESS_URL=http://127.0.0.1:4411 RESULTS_FILE=otp-control-results.json bun run test --grep 'otp: provided Label\|otp: Root name' --output=/private/tmp/otp-control-test-results` | Four prior-patch failures reproduced | 16.592 s |
| `RESULTS_FILE=otp-drawer-timing-results.json bun run test --project=firefox --grep 'drawer: mouse drag' --repeat-each=3 --output=/private/tmp/otp-drawer-timing-test-results` | Three diagnostic follow-ups passed | 9.989 s |

For compiled JS, restart with `KOBALTE_DISTRIBUTION=js bun run dev --force`, then
run `RESULTS_FILE=otp-js-results.json bun run test --grep 'otp:|drawer:|dialog:'
--output=/private/tmp/otp-js-test-results`.

After the full matrices, the cleanup assertion was strengthened to count input
copy listeners directly alongside document selection listeners. That same case
passed again in both browsers in all three modes, using
`RESULTS_FILE=otp-cleanup-dev-results.json bun run test --grep 'otp: completion callbacks'
--output=/private/tmp/otp-cleanup-dev-test-results`; compiled JS used the JS server
and `otp-cleanup-js` report/output names; production additionally used
`HARNESS_URL=http://127.0.0.1:4400` and `otp-cleanup-production` names. Evidence:
[JSX cleanup](validation/solid2-browser/evidence/otp-cleanup-dev.json),
[compiled JS cleanup](validation/solid2-browser/evidence/otp-cleanup-js.json),
and [production cleanup](validation/solid2-browser/evidence/otp-cleanup-production.json).
No library or fixture changes followed the full matrices.

Case-level results and complete messages are retained in
[development](validation/solid2-browser/evidence/otp-dev.json),
[production](validation/solid2-browser/evidence/otp-production.json),
[control](validation/solid2-browser/evidence/otp-control.json),
[Drawer timing follow-up](validation/solid2-browser/evidence/otp-drawer-timing.json)
and [compiled JS](validation/solid2-browser/evidence/otp-js.json).
See the [harness README](validation/solid2-browser/README.md) for reproduction.

## DELIVERY.md review and limits

- State ownership: the library owns uncontrolled input; consumers own controlled
  input. Displayed slots derive from library context. Completion is tested as an
  event, not mirrored UI state.
- Usable states and recovery: empty/partial/complete, invalid, required, disabled,
  readOnly, cancelled reset, removed/restored descriptions and remount are covered.
  Backend loading, pending mutation, rollback and retry do not apply here.
- Async consistency and cleanup: reset microtasks are guarded, animation frames
  cancelled, selection listeners and styles removed, observed roots disconnected,
  and detached input/form callbacks checked. This is not a complete heap audit.
- Platform boundaries: this browser-only fixture uses no AppApi, IPC, desktop
  adapter, network service or Electron path. Those checks do not apply.
- Keyboard/accessibility: typing, deletion, focus, labels, ARIA and native form
  validation are tested. Screen readers, axe, WebKit, physical mobile keyboards,
  OS clipboard paste, autofill and password managers remain untested. Synthetic
  copy events establish handler behavior only. SSR/hydration, externally associated
  forms and async Solid rendering are also outside this run.
- Appearance/customization: only diagnostic fixtures changed, including explicit
  pointer events on the otherwise inert root's label. No production styling,
  shadcn visual parity, light/dark, font scaling or responsive claim is made.
- Structure/performance: the fix stays in pinned experimental patches. ARIA
  derivations avoid a wide effect; no performance claim is made. The observed
  Drawer timing warning remains open, along with other primitive diagnostics.
- Tests: fresh browser integration and production build ran. Package-wide check,
  lint, unit, integration, server and application-E2E scripts remain unavailable;
  none is claimed passing. The patched declaration was not separately typechecked.
- Evidence/decisions: commands, durations, failed cases and historical inputs are
  retained. DELIVERY.md remains reusable and unchanged. No production architecture
  decision was made; DECISIONS.md and production acceptance remain unchanged.

Next, isolate Direction/Tabs' diagnostics and explicit RTL keyboard mismatch.
