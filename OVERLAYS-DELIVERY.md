# Tabs, Popover and Alert Dialog delivery

2026-10-08, D19/D90. Implements the owner's requested three-component batch,
bringing the package to thirteen components. The owner subsequently authorized
commit, codex-branch push and local main merge. No application imports, service
adapters or unrelated workspace changes.

## Result and adoption decision

- Tabs: controlled/uncontrolled selection, automatic/manual activation, roving
  focus, disabled entries, horizontal/vertical and RTL navigation, live IDs,
  two list variants, lazy/force-mounted panels and bounded mobile scrolling.
- Popover: trigger/anchor/content and heading/close parts, native nonmodal or
  modal top-layer rendering, controlled rejection, focus restoration,
  collision-aware Floating UI positioning and disposal/stale-response guards.
- Alert Dialog: all twelve sibling parts, native modal containment, background
  inertness, explicit confirmation, Cancel-first focus, nested scroll locks,
  owner-controlled pending/error/retry behavior and custom accessible names.

Kobalte was evaluated first; the unpatched alpha.2 compositions fail acceptance
on rc.13. [KOBALTE-OVERLAYS.md](KOBALTE-OVERLAYS.md) records exact observed failures
without attributing a timeout to an unproven cause. No Kobalte/corvu dependency
or experimental patch enters production. Added framework-neutral
`@floating-ui/dom@1.8.0` and its core/utils lock entries for placement.

The native architecture and intentional API differences are in
[DECISIONS.md](DECISIONS.md) and the [component guide](docs/components.md).
AlertDialogPortal preserves DOM ancestry, Content supplies its default overlay,
and modern dialog/popover support is required. There is no exit-presence delay
or arbitrary React asChild API. Public Popover Content refs correctly allow div
or dialog nodes. Source and built exports include every delivered part.

## Acceptance checklist

| DELIVERY.md criterion | Evidence / disposition |
| --- | --- |
| State has clear ownership | Root owners control value/open; uncontrolled state is local. IDs, ARIA and selection derive from accessors. Preview drafts and operation status are application-owned. No backend state exists here. |
| Every state is usable | Tabs ready/empty/disabled panels; controlled rejection; closed/open overlays; confirmation pending, error, retry and success examples. Loading remains demonstrated by the existing Skeleton example; primitives do not fetch data. |
| Failures have a recovery path | Rejected controlled selection/open requests preserve owner authority. Pending confirmation failure preserves the entered reason, exposes retry and closes only after explicit completion. No uncertain mutation repeats automatically. |
| Async work stays consistent | Pending Action and Cancel are disabled and Escape is cancelled. Floating UI size and coordinate writes reject stale completions after another update or disposal; observers are removed and owned size limits restored. There is no backend request. |
| Platform boundaries hold | No AppApi, IPC, filesystem, network or desktop bridge in components. D19 public exports isolate the implementation. Desktop adapter/main-process criteria are N/A because no Electron code changes. |
| Reactivity and cleanup are deliberate | Strict warning/error checks pass. Effects only synchronize native layers/positioning. Tests cover conditional registrations, disposed observers, queued close after unmount, forced mounting, and nested scroll-lock restoration. |
| Keyboard and assistive access work | Both engines exercise disabled-skipping arrows, Home/End, manual activation, RTL, vertical lists, Escape, modal focus wrapping, Cancel-first focus, outside clicks and nested focus return. Axe passes light/dark open overlays at mobile width and 150% text. Titles/descriptions and explicit names are covered. |
| Appearance remains customizable | Canonical light/dark token blocks remain byte-identical. In-place top-layer content inherits theme ancestry. Nine reviewed Chromium images cover the full gallery plus open Popover/Alert in light/dark/mobile. Enlarged text and long drafts/filenames do not overflow the page. Reduced motion is honored. |
| Structure and performance fit | Shared controlled-state and native-layer helpers avoid repeated lifecycle logic. Floating UI runs only while open. Bundle sizes are measured below; no interaction-speed or per-component bundle-size claim. Domain logic stays in examples/consumers. |
| Tests prove behavior | All six required package commands plus 100% coverage and production build pass. Unit platform adapters do not stand in for native behavior: integration and E2E use actual Chromium/Firefox APIs. Electron fresh-profile testing is N/A; no Electron integration was changed. |
| Delivery evidence is accurate | Exact commands, durations, logs and browser diagnostic attachments retained. COMPONENT-MAP, specs, README, component guide, decisions and admin inventory updated. DELIVERY.md unchanged. Unrun/broader gates listed below. |

## Verification

Measured command table is generated from the retained final JSON logs below.

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | TypeScript passes | 1.655 s |
| `bun run lint` | ESLint passes | 0.852 s |
| `bun run test` | 64 unit tests pass | 1.746 s |
| `bun run test:coverage` | 64 tests; all four coverage thresholds 100% | 1.668 s |
| `bun run test:server` | 5 SSR tests pass | 0.662 s |
| `bun run build` | ESM, declarations and CSS built | 1.258 s |
| `bun run parity:report` | Inventory updated; Combobox alone remains missing from current admin imports | 0.210 s |
| `THEME_PORT=4402 RESULTS_FILE=docs/evidence/overlays-integration.json bun run test:integration` | 44 Chromium/Firefox integration tests pass | 42.425 s |
| `THEME_PORT=4402 RESULTS_FILE=docs/evidence/overlays-e2e.json bun run test:e2e` | 22 production E2E tests pass; 9 screenshot comparisons | 15.964 s |

Coverage: **715/715 statements, 394/394 branches, 298/298 functions and
249/249 lines**. Thresholds remain 100%; no source exclusions or warning filters
were added. Browser tests record every page error and console warning/error and
assert empty diagnostics. Tool-launch NO_COLOR/FORCE_COLOR notices are Node
runner notices, not filtered application diagnostics.

Evidence: [command logs](docs/evidence/overlays-checks.json),
[browser command logs](docs/evidence/overlays-browser-checks.json),
[integration report](docs/evidence/overlays-integration.json),
[E2E report](docs/evidence/overlays-e2e.json),
[coverage](docs/evidence/overlays-coverage.json),
[deliberate visual baseline update](docs/evidence/overlays-visual-update.json).
Earlier failing runs found and drove fixes for native beforetoggle reentrancy,
Chromium modal Tab escape into browser chrome, and enlarged-text tab overflow.
The final E2E run compares screenshots without updating them.

The library ESM is **63,541 bytes raw / 16,844 bytes gzip**. Compiled CSS is
**344,384 bytes raw / 232,063 bytes gzip**, including the existing embedded font
assets. These are whole-library outputs with Floating UI included, not the
incremental cost of an individual import. Gzip uses Python gzip.compress with
mtime=0 and default level 9; Vite's compression estimate may differ.
[Exact sizes](docs/evidence/overlays-bundle-sizes.json). No runtime performance
benchmark or per-component tree-shaken size study is claimed.

## Boundaries and remaining work

No root all-workspace checks, Electron build/profile journey, WebKit, hydration,
physical mobile or screen-reader session was run. SSR string-rendering tests do
not certify hydration. Router/query integration and the broad original Gate 0
remain later work under the owner's bounded implementation direction. Strict
`parity:admin` was not rerun: the updated report shows the seven Combobox imports
still missing. Passing inventory checks do not certify React-to-Solid call-site
compatibility or complete catalog delivery. No app was migrated.

No Kobalte/corvu production acceptance is implied by these native-component
results. The existing corvu-next Dialog fork was inspected for API/runtime pins;
this batch does not certify its runtime behavior. The next catalog candidate
should still be evaluated Kobalte-first.

Natural next step: evaluate and implement Combobox to close the remaining
current-admin import gap.

## Pre-merge verification — 2026-10-08

Reviewed the full component batch and its tests, evidence, dependency changes and
documentation. Removed two redundant consecutive test flushes and refreshed the
commit/merge instructions to match the updated owner agreement. Typecheck, lint
and coverage also passed again after that cleanup. No production source changed
during this merge preparation.

| Command | Outcome | Time |
| --- | --- | ---: |
| `THEME_PORT=4402 RESULTS_FILE=/tmp/solid-merge-check.json bun run check` | Pass | 1.831 s |
| `THEME_PORT=4402 RESULTS_FILE=/tmp/solid-merge-lint.json bun run lint` | Pass | 1.011 s |
| `THEME_PORT=4402 RESULTS_FILE=/tmp/solid-merge-test-coverage.json bun run test:coverage` | Pass | 2.351 s |
| `THEME_PORT=4402 RESULTS_FILE=/tmp/solid-merge-test-server.json bun run test:server` | Pass | 0.651 s |
| `THEME_PORT=4402 RESULTS_FILE=/tmp/solid-merge-test-integration.json bun run test:integration` | Pass | 48.078 s |
| `THEME_PORT=4402 RESULTS_FILE=/tmp/solid-merge-test-e2e.json bun run test:e2e` | Pass | 18.561 s |

[Retained pre-merge output](docs/evidence/overlays-merge-checks.json). The branch
is based on local main, including its nine existing unpublished ancestor commits.
Only this component batch is staged in the new commit. The requested merge uses
a local fast-forward. Commit `20c9183` is now on local main. Publication of
`codex/solid-tabs-overlays` was rejected by automatic approval review because
the GitLab destination
(`git@gitlab.com:arknet-group2/restaurant-management.git`) was not verified as
private/user-owned and the general push instruction was not accepted as specific
authorization for this payload. No remote ref was updated; explicit destination
approval is required before retrying. Direct pushes to main remain prohibited.
