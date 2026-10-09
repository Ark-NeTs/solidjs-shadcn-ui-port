# Plain Dialog untracked-read isolation — 2026-10-07

**Historical stage:** [KOBALTE-OTP.md](KOBALTE-OTP.md) records the subsequent
OTP/form-control repair, current patches and browser results. The matrix below
preserves this Dialog ID stage; a later run also observed a Drawer timing warning.

**Plain Dialog and Drawer now emit no diagnostics in the retained scoped browser
tests.** The harness patch fixes the untracked reads and preserves live ID/ARIA
updates. It does not approve production implementation or complete Gate 0.

Versions remain Kobalte `2.0.0-alpha.2` and Solid/web/signals `2.0.0-rc.13`.
Kobalte still declares rc.3 peers. This extends the
[presence repair](KOBALTE-PRESENCE.md) only in the isolated validation harness.
No production component, dependency pin, public type declaration or architecture
decision changed. No Git commit was made.

## Causes verified against behavior

The [before capture](../../validation/solid2-browser/evidence/dialog-reads-before.json)
records warning stacks ending in DialogRoot's `generateId` and shows that changing
the root ID leaves Content, Title and Description IDs unchanged.

| Cause | Repair |
| --- | --- |
| Each part eagerly called `context.generateId(...)` in its component body. This captured the initial root ID outside tracking. | Default IDs are lazy getters, evaluated by tracked consumers; explicit part IDs still take precedence. |
| Once IDs became reactive, their registration effects copied each changed string into context state, producing `EFFECT_RELAY_TEAR`. | Parts register an accessor once. DOM IDs and ARIA references read the same source directly. Registration cleanup still clears the source. Existing public string registration remains supported. |
| The earlier layer-registration patch read `props.onDismiss` in an effect apply callback. Reactive prop spreads exposed this additional untracked read. | Store a callback that reads the current `onDismiss` when invoked, instead of snapshotting the prop during registration. |

The [getter-only intermediate capture](../../validation/solid2-browser/evidence/dialog-reads-getter-only.json)
preserves the additional relay warning and the stack identifying DismissableLayer's
callback read. It is diagnostic evidence, not the accepted patch.
The [final capture](../../validation/solid2-browser/evidence/dialog-reads-after.json)
shows generated IDs changing to `renamed-dialog-*`, with matching
`aria-controls`, `aria-labelledby` and `aria-describedby`, and no warnings/errors.

Both JS and JSX paths are patched. The cumulative patch still changes eight
distribution files. SHA-256:
`b08ccf2f385c51b3fb7ca31f9d76490dd617e1d57b2bf7a0736c65543733f2e7`.
The previous patch and its frozen install inputs are preserved in
[baseline/presence](../../validation/solid2-browser/baseline/presence).

## Regression evidence

All Dialog and Drawer cases now reject every browser warning/error, throughout
the interaction. New tests cover root-ID changes while open and closed, unchanged
DOM identity and focus, explicit part-ID overrides and removal, title/description
unregistration and restoration, and public string registration/cleanup.

The three new ID/ARIA cases fail in both browsers against the previous patch
and pass with this repair. The extra string-registration case also passes in both
browsers. It waits for Solid's update flush; an exploratory synchronous-read
assertion was corrected before the retained final matrix.

| Run | Passed | Failed | Skipped | Time |
| --- | ---: | ---: | ---: | ---: |
| Previous patch, three ID/ARIA cases × two browsers | 0 | 6 | 0 | 25.872 s |
| Final JSX development, complete matrix | 63 | 10 | 1 | 82.471 s |
| Final production, complete matrix | 67 | 6 | 1 | 69.410 s |
| Final compiled JS development, Drawer/Dialog | 37 | 0 | 1 | 34.976 s |

Each full matrix includes 37 passing Drawer/Dialog cases and one skipped Firefox
CDP touch case. No uncaught page exceptions occurred. The remaining failures are
OTP label association, OTP native FormData wiring and explicit DOM Direction,
each in two browsers; development adds OTP/Tabs mount-diagnostic failures.
There are no retries or expected-failure annotations hiding these cases.

Final commands ran in `/private/tmp/solid2-dialog-reads-final`, with the prior
patch control in `/private/tmp/solid2-dialog-reads-control`. Servers used ports
4399 (development), 4400 (production preview) and 4411 (control).

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun install --frozen-lockfile --ignore-scripts` in a fresh final directory | Cumulative patch applied; 120 packages | 0.139 s |
| `bun run build` | Production build passed; 116 modules | 0.316 s |
| `RESULTS_FILE=reads-dev-results.json bun run test --output=reads-dev-test-results` | Full development matrix above | 82.471 s |
| `HARNESS_URL=http://127.0.0.1:4400 RESULTS_FILE=reads-production-results.json bun run test --output=reads-production-test-results` | Full production matrix above | 69.410 s |
| `HARNESS_URL=http://127.0.0.1:4411 RESULTS_FILE=reads-control-results.json bun run test --grep 'dialog: generated IDs\|dialog: explicit part IDs\|dialog: title and description' --output=reads-control-test-results` | Prior-patch regressions above | 25.872 s |

The compiled JS check started with `KOBALTE_DISTRIBUTION=js bun run dev --force`
and ran `RESULTS_FILE=reads-js-results.json bun run test --grep 'dialog:|drawer:'
--output=reads-js-test-results` in 34.976 s.

Retained evidence: [development](../../validation/solid2-browser/evidence/reads-dev.json),
[production](../../validation/solid2-browser/evidence/reads-production.json),
[compiled JS](../../validation/solid2-browser/evidence/reads-js.json), and
[control](../../validation/solid2-browser/evidence/reads-control.json). Full console
messages, assertion errors and page errors are retained. The
[harness README](../../validation/solid2-browser/README.md) describes reproduction.

## DELIVERY.md review and acceptance limits

- State, reactivity and cleanup: IDs are derived from registered sources; removal
  clears ARIA references. Existing Escape, nested layers, forceMount, focus,
  animation interruption and listener-disposal regressions still pass.
- Usable states and keyboard access: open/closed, renamed, overridden, removed
  and restored ID states are covered, with focus and accessible naming checks.
  This is not full accessibility certification; axe and screen readers were not run.
- Failures/recovery, async consistency and platform boundaries: backend drafts,
  network mutations, AppApi, IPC and Electron do not apply to this browser-only
  change. Solid SSR/hydration and async rendering remain untested here.
- Appearance and performance: diagnostic fixture styling only; no theme parity,
  visual-regression or performance claim. Physical touch and WebKit were not tested.
- Tests: scoped browser integration and Vite build ran. Package-wide check/lint,
  unit, server and application-E2E commands remain unavailable in this package.
- Evidence/decision: historical reports and prior patch inputs are preserved.
  OTP, Direction, Resizable and Calendar findings remain open, as do the remaining
  Gate 0 checks. Production acceptance, DECISIONS.md and the reusable DELIVERY.md
  checklist are unchanged.

Next, resolve Input OTP's remaining diagnostics and label/form wiring before
accepting that primitive for implementation.
