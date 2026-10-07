# Drawer/DialogRoot feedback isolation — 2026-10-07

**Historical stage:** [KOBALTE-DIALOG-IDS.md](KOBALTE-DIALOG-IDS.md) resolves the
subsequent plain Dialog untracked-read findings and records the current patch
and browser results. This report preserves the preceding presence repair.

**The retained harness patch removes Drawer/DialogRoot's observed
`EFFECT_WRITES_OWN_SOURCE` and `EFFECT_RELAY_TEAR` diagnostics. Drawer is now
diagnostic-free throughout the tested interactions. Production implementation
and Kobalte acceptance remain pending.**

This extends the [lifecycle patch](KOBALTE-LIFECYCLE.md) on the same Kobalte
`2.0.0-alpha.2` and Solid/web/signals `2.0.0-rc.13` pins. Kobalte's upstream peer
pins remain rc.3. Only validation dependencies, fixtures, tests and evidence
changed; no production exports or architecture decision were added.

## Cause established by independent fixtures

DialogRoot called `createPresence` twice with `transitionDuration: 0`, once for
overlay mounting and once for content mounting. It consumed only `isMounted`.
The installed helper is `@solid-primitives/presence@1.0.0-next.2`.

Inside that helper, an effect reads `item`, `mountedItem` and `isMounted` and
writes `mountedItem` and `shouldBeMounted`. A second effect copies
`shouldBeMounted` into `isMounted`, feeding the first effect. This creates both
the feedback path and the delayed copy reported by Solid's diagnostics. Opening
from an initially closed state reproduces them without Drawer gestures.

Three independent fixtures were captured through two open/close cycles and
unmount. [Before](validation/solid2-browser/evidence/presence-before.json) and
[after](validation/solid2-browser/evidence/presence-after.json) preserve full
messages, owner paths, interaction phases and page errors:

| Fixture | Before | After |
| --- | --- | --- |
| Standalone original presence helper, no Kobalte | Both feedback/relay codes | Both codes remain: unchanged positive control |
| Plain Dialog, no Drawer | Both codes, plus untracked reads | Only `STRICT_READ_UNTRACKED` remains |
| Drawer | Both feedback/relay codes | No warnings or errors |

The isolated traces use Chromium development mode. The browser assertions below
also verify the fix in Firefox. The helper is explicitly pinned as a harness dev
dependency for the control fixture; it was already in the resolved graph.

## Scoped repair

DialogRoot now derives one shared boolean:

```js
const present = createMemo(() => Boolean(mergedProps.forceMount || disclosureState.isOpen()));
const overlayPresent = present;
const contentPresent = present;
```

This removes redundant zero-duration transition state from DialogRoot. It does
not rewrite the general-purpose presence helper or suppress diagnostics. Drawer
continues to supply its own `transitionAwareOpen` value, retaining content during
its closing animation. Plain Dialog's zero-delay scheduling is replaced by direct
mount-state derivation; that timing change is covered by focus and reopen tests.

Both JS and JSX DialogRoot distributions are patched. The cumulative patch now
contains eight files; its earlier six lifecycle changes are unchanged. SHA-256:
`c238413e0b5e23fdf7134563949dc92fb8be09019f3f09ff656853aa70449e33`.
The independently installable previous patch is preserved in
[baseline/lifecycle](validation/solid2-browser/baseline/lifecycle/).

## Browser verification

The suite now fails every Drawer case on **any** warning or console error.
Plain Dialog cases reject feedback/relay and ownership diagnostics and preserve
the separate untracked-read finding. Existing failures remain real failing
assertions. No retries, expected-failure annotations or console filters hide them.

Six new cases run in each browser: controlled, initially open and uncontrolled
Dialog lifetimes; dynamic forceMount; rapid controlled reopen; and Drawer exit
animation with interrupted closing. Existing Escape, nested layers, focus,
pointer/touch gestures, listener disposal and remount regressions remain covered.

| Run | Passed | Failed | Skipped | Time |
| --- | ---: | ---: | ---: | ---: |
| Previous lifecycle patch, six new cases × two browsers | 4 | 8 | 0 | 20.293 s |
| Final JSX development, complete matrix | 55 | 10 | 1 | 76.756 s |
| Final production, complete matrix | 59 | 6 | 1 | 62.911 s |
| Final compiled JS development, Drawer/Dialog | 29 | 0 | 1 | 33.885 s |

The eight control failures detect the old diagnostics; initially open and
force-mounted cases pass even before this repair. All twelve new cases pass
after it. Each complete matrix contains 29 passing Drawer/Dialog cases plus
one skipped Firefox CDP touch case. No uncaught page exceptions occurred in
the final runs. Physical touch, WebKit and SSR/hydration were not tested.

Commands ran in `/private/tmp/solid2-dialog-feedback-final`, with the control in
`/private/tmp/solid2-dialog-feedback-control`. Dev used port 4399, preview 4400,
and the control 4411. Reproduction details are in the
[harness README](validation/solid2-browser/README.md).

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun install --frozen-lockfile --ignore-scripts` in a fresh directory | Final patch applied; 120 packages | 0.158 s |
| `bun run build` | 116 modules; production build passed | 0.302 s |
| `RESULTS_FILE=feedback-dev-results.json bun run test --output=feedback-dev-test-results` | Full development result above | 76.756 s |
| `HARNESS_URL=http://127.0.0.1:4400 RESULTS_FILE=feedback-production-results.json bun run test --output=feedback-production-test-results` | Full production result above | 62.911 s |
| `HARNESS_URL=http://127.0.0.1:4411 RESULTS_FILE=feedback-control-results.json bun run test --grep 'dialog:\|derived Dialog presence' --output=feedback-control-test-results` | Prior-patch diagnostic control | 20.293 s |

The compiled JS run used `KOBALTE_DISTRIBUTION=js bun run dev --force`, then
`RESULTS_FILE=feedback-js-results.json bun run test --grep 'drawer|dialog'
--output=feedback-js-test-results`; its duration is included above.

Retained evidence: [development](validation/solid2-browser/evidence/feedback-dev.json),
[production](validation/solid2-browser/evidence/feedback-production.json), [compiled JS](validation/solid2-browser/evidence/feedback-js.json), and
[control](validation/solid2-browser/evidence/feedback-control.json).

## Acceptance limits and DELIVERY.md review

- State/cleanup: Dialog mount state is derived. Drawer retains its intentional
  transition state. New tests verify focus-event counts, forceMount release,
  reopen stability and exit-animation preservation; previous disposal tests pass.
- Usable states and access: open, closed, initially open, forced, closing and
  reopening states are covered. Full accessibility, screen readers, axe and
  the rest of Gate 0 remain unverified.
- Outstanding diagnostics: plain Dialog exposes `STRICT_READ_UNTRACKED` in
  Content, Title and Description. Generated-ID reads are the next source path
  to investigate; their cause has not been isolated by this experiment. This
  finding is distinct from the repaired feedback/relay path. Resizable,
  Calendar, OTP and Tabs findings from the previous report also remain open.
- Outstanding behavior: OTP label/FormData wiring and explicit DOM Direction
  still fail in both browsers and modes. These are the six production failures;
  development adds four OTP/Tabs diagnostic failures.
- Failure recovery, async/data consistency and platform boundaries: backend,
  network mutations, drafts, AppApi, IPC and Electron are outside this isolated
  browser task. No production boundary changes were made.
- Appearance/performance: fixture CSS only. No semantic theme, responsive layout,
  visual-regression, heap-wide leak or performance acceptance is claimed.
- Tests/evidence: the browser matrices and Vite build ran. Package-wide check,
  lint, unit, integration, server and application-E2E scripts remain unavailable
  in this design-system package. No Git commit or production decision was made;
  DECISIONS.md and the reusable DELIVERY.md checklist are unchanged.

Next, isolate plain Dialog's untracked reads before treating Dialog
as a diagnostic-free foundation for implementation.
