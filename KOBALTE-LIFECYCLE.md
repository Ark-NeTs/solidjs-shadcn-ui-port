# Kobalte lifecycle isolation — 2026-10-07

**Historical stage:** [KOBALTE-PRESENCE.md](KOBALTE-PRESENCE.md) records the
subsequent fix for Drawer/DialogRoot feedback and relay diagnostics, current
results and remaining acceptance limits. This report preserves the earlier
six-file patch and its evidence; that patch is archived in the harness baseline.

**Drawer Escape and the observed ownerless effects are fixed in a retained
experimental dependency patch. Kobalte is still not accepted for production.**
The patch applies only in the isolated browser harness, using Kobalte
`2.0.0-alpha.2` and Solid/web/signals `2.0.0-rc.13`. The upstream package still
declares rc.3 peers. No corvu dependency or production component was added.

The earlier [unpatched browser report](BROWSER-VALIDATION.md) remains historical
evidence. Current results and reproduction instructions are in the
[harness README](validation/solid2-browser/README.md).

## Isolated causes and fixes

| Finding | Evidence | Change |
| --- | --- | --- |
| Drawer ignores Escape | Instrumenting DismissableLayer showed `onSettled` running with no DOM ref. Later, Escape reached the shortcut with a valid ref but an empty layer stack, so the topmost-layer check rejected dismissal. | Register in an effect that tracks the actual ref; capture that node for registration and cleanup. Preserve topmost-layer and `preventDefault` checks. |
| Drawer creates ownerless effects when opened | DrawerContent calls five reactive `createEventListener` helpers inside an effect's apply callback, which has no owner. The original mount-only diagnostic assertion missed this. | Use `makeEventListener` and return all five disposers from the effect. Keep the non-passive touch listener. |
| Resizable creates ownerless panel effects | Panel registration, invoked from an effect apply callback, creates a memo and an `onResize` effect without an owner. | Create just those computations inside an explicit disposable root. Dispose it before unregistering a panel; keep registration signal writes outside the root body. |
| Resizable reads handle state outside tracking | The hover effect issues a command that reads the current state of other handles. | Mark that command's reads as intentional snapshots with `untrack`; keep the hovered input tracked. |

The patch changes six distribution files: JS and JSX versions of
DismissableLayer, DrawerContent and Resizable. It does not suppress diagnostics,
change Solid versions, or modify OTP/Tabs to make their tests pass. Its SHA-256 is
`a14de171f1e63c31d5e98e0b658123c31bddc7c59cc0ffc433702bdded101838`.

The [original instrumented trace](validation/solid2-browser/evidence/escape-isolation.txt)
records the missing-ref/empty-stack sequence. Temporary instrumentation is absent
from the retained patch.

## Regression evidence

Four new cases run in each browser:

- Escape closes only the nested topmost Drawer and restores focus through both layers.
- A consumer can prevent Escape, then close normally.
- Three open/close/unmount/remount cycles restore watched document-listener
  counts and body styles; one cycle unmounts an open Drawer.
- A retained sizes setter cannot call a disposed panel's `onResize`; a fresh
  mount still responds to keyboard resizing.

All eight new cases fail with the unpatched library and pass with the patch in
development and production. Some unpatched failures are the new ownership
assertion, not the primary interaction assertion. The full suite now rejects
ownership/lifecycle diagnostics throughout each interaction, not only at mount.
No uncaught browser exceptions occurred in the retained patched runs.

| Run | Passed | Failed | Skipped | Time |
| --- | ---: | ---: | ---: | ---: |
| Unpatched control, four new cases × two browsers | 0 | 8 | 0 | 26.931 s |
| Patched JSX development, all five primitives | 43 | 10 | 1 | 66.870 s |
| Patched production, all five primitives | 47 | 6 | 1 | 54.093 s |
| Patched compiled JS development, Drawer/Resizable | 27 | 0 | 1 | 25.182 s |

Drawer/Resizable together pass 27 applicable cases in each patched run; Firefox's
CDP touch case is skipped. This is browser-injected touch, not a physical device.
There are no retries, expected-failure annotations, or suppressed console messages.

Commands ran in `/private/tmp/solid2-browser-patched-clean` unless specified:

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun install --frozen-lockfile --ignore-scripts` in a fresh final replay directory | 120 packages installed; final retained patch applies | 0.150 s |
| `bun run build` | 114 modules; production bundle built | 0.366 s |
| `RESULTS_FILE=patched-dev-results.json bun run test --output=patched-dev-test-results` | Development matrix above; intentionally nonzero exit for unresolved cases | 66.870 s |
| `HARNESS_URL=http://127.0.0.1:4400 RESULTS_FILE=patched-production-results.json bun run test --output=patched-production-test-results` | Production matrix above | 54.093 s |
| `KOBALTE_DISTRIBUTION=js RESULTS_FILE=patched-js-results.json bun run test --grep 'drawer\|resizable' --output=patched-js-test-results` with matching JS dev server | Compiled JS matrix above | 25.182 s |
| `HARNESS_URL=http://127.0.0.1:4411 RESULTS_FILE=unpatched-control-results.json bun run test --grep 'nested layer\|prevented Escape\|dispose document\|disposed panels' --output=unpatched-control-test-results` in the control directory | Original defects detected | 26.931 s |

Retained JSON contains case outcomes, assertion errors, full console messages,
diagnostic codes and page errors:
[development](validation/solid2-browser/evidence/patched-dev.json),
[production](validation/solid2-browser/evidence/patched-production.json),
[compiled JS](validation/solid2-browser/evidence/patched-js.json), and
[unpatched control](validation/solid2-browser/evidence/unpatched-control.json).

## Remaining acceptance blockers

The six production failures are OTP label association, OTP Root `name` forwarding
to native FormData, and DOM-only RTL disagreeing with Kobalte's locale-derived
keyboard direction, each in two browsers. Development adds OTP and Tabs mount
diagnostic failures. The previously tested explicit OTP input id/name workaround
still passes, but is not a complete form-control contract.

**A passed interaction case does not mean it is diagnostic-free.** All warnings
are retained. The suite enforces ownership diagnostics across interactions and
all diagnostics at mount; it does not yet fail every interaction for every
reactivity/performance diagnostic. Current development observations include:

| Area | Remaining codes during interaction |
| --- | --- |
| Drawer/DialogRoot | `EFFECT_WRITES_OWN_SOURCE`, `EFFECT_RELAY_TEAR` |
| Resizable | `UNSTABLE_MEMO_OUTPUT` |
| Calendar | `STRICT_READ_UNTRACKED`, `EFFECT_RELAY_TEAR` |
| OTP | `STRICT_READ_UNTRACKED`, `EFFECT_RELAY_TEAR` |
| Direction/Tabs | `STRICT_READ_UNTRACKED`, `EFFECT_RELAY_TEAR`, `EFFECT_WRITES_OWN_SOURCE` |

These need separate isolation; they are not ownerless-effect warnings and are
not resolved by this patch. The earlier Calendar result covered behavior and
mount diagnostics only. It must not be read as diagnostic-free interaction.

## DELIVERY.md review and limits

- State ownership and cleanup: local controlled fixtures; explicit per-panel
  effect disposal and document-listener cleanup now have regressions. Remaining
  derived-state diagnostics above prevent full acceptance. Listener instrumentation
  covers five document event types, not every listener, timer or heap allocation.
- Usable states and keyboard access: opening, closing, cancellation, nested
  focus restoration, resizing, collapse and remount are exercised. OTP/Direction
  gaps remain. Screen-reader and axe checks were not run.
- Failure recovery, async consistency and platform boundaries: no backend,
  network mutations, drafts, AppApi, IPC or Electron are involved; those checklist
  requirements do not apply to this browser-only isolation.
- Appearance and performance: diagnostic fixture CSS only; no theme parity,
  light/dark, responsive, visual-regression or performance acceptance is claimed.
- Structure: patch is limited to the pinned validation dependency. Shared
  DismissableLayer consumers beyond these Drawer fixtures, force-mounted content,
  dynamic panel insertion/removal and SSR/hydration remain untested.
- Tests: Vite build, Chromium and Firefox runs above completed. Package-wide
  check/lint/unit/integration/server/application-E2E commands remain unavailable
  in this design-system package. No WebKit or physical mobile testing ran.
- Evidence: baseline preserved; current map/spec/compatibility references updated.
  Gate 0 is incomplete. No lasting production architecture decision or Git commit
  was made, so DECISIONS.md is unchanged.

Next, isolate the remaining reactive feedback/relay diagnostics, then settle OTP
and explicit-direction wrapper contracts before accepting the pinned library.
