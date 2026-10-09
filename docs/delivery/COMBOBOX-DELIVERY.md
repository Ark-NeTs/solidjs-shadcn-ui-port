# Combobox delivery

2026-10-08, D19/D90. The fourteenth component is implemented behind the package's
source and built exports. No application migration or additional dependency.

## What shipped, and what the build did that the plan didn't say

- Single and multiple selection, owned or controlled values/open/search, filtering,
  disabled options, chips, clear, groups, empty results, keyboard/IME behavior,
  form association, required validation, reset and controlled rejection.
  REASONING: the current admin uses a trigger with search inside Content; both
  that composition and an external editable input are implemented and tested.
- Kobalte was evaluated first. Search and selection work in the pinned probe,
  but reset leaves an empty input and both engines emit 21 diagnostics. Retain
  [unfiltered evidence](../../validation/solid2-combobox/unpatched.json) and
  [adoption assessment](../validation/KOBALTE-COMBOBOX.md). REASONING: reuse accepted native
  Input/Popover instead of promoting unaccepted experimental patches. Corvu's
  mapped catalog has no Combobox, so no fallback dependency is justified.
- Reset restoration runs in a cancelable next task. REASONING: real browsers
  exposed a reset default-action ordering that synthetic jsdom events missed.
  Current browser tests verify the original default and subsequent form values.
- Popover tracks geometry while open without ancestor scroll listeners.
  REASONING: Firefox reported scroll-linked positioning during Combobox use.
  Frame-based anchor tracking resolves that observed warning while retaining
  observer cleanup and stale-coordinate guards. No diagnostic filter was added.
- Compound-part names match the current admin imports. REASONING: the inventory
  now passes, but name presence cannot establish a React-to-Solid application
  port. Unsupported Base UI APIs and styling differences are documented in the
  [component guide](../components.md#combobox), including the absent React
  ref-object anchor hook, virtualization and automatic highlighting.

## Acceptance checklist

| DELIVERY.md criterion | Evidence / disposition |
| --- | --- |
| State has clear ownership | Canonical selection, query draft, open state and active option are distinct. Null is a controlled value. Typed drafts never change FormData until selection. |
| Every state is usable | Gallery demonstrates ready, empty, disabled options, single/multiple selection, clear and rejected controlled changes. Loading/pending/error/retry rendering belongs to the caller through supplied items/filteredItems and status content; the API starts no async data operation. |
| Failures have a recovery path | Rejected selections retain canonical values; input/open owner rejection is covered. Invalid submission announces a linked error and opens the chooser. Empty searches can be edited or canceled. No mutation is retried automatically. |
| Async work stays consistent | Deferred input/reset work checks connected/alive state; reset tasks and form listeners are disposed. Existing Popover tests cover stale positioning after new requests/unmount. Remote request ordering is caller-owned and not implemented here. |
| Platform boundaries hold | Native UI and injected props only; no AppApi, IPC, desktop access, network or backend state. Electron adapter/main-process requirements are N/A. |
| Reactivity and cleanup are deliberate | Derived filtering/selection/IDs; effects synchronize DOM form state, active-option scroll and native popup geometry. Tests reject all application warnings/errors. Canceled/reset-after-unmount paths and observer disposal pass. |
| Keyboard and assistive access work | Named combobox, listbox/options, expanded/active/selected/required/invalid state; Up/Down, Enter, Escape, Tab, disabled skipping, IME, focus return and named chip removal. Axe passes, including dark 390px viewport with 150% font size. Manual screen-reader certification remains unrun. |
| Appearance remains customizable | Shared token blocks unchanged. Native top-layer content retains theme ancestry. Twelve Chromium screenshots reviewed: gallery and open Popover/Alert/Combobox in light/dark/mobile. Long option labels wrap; enlarged content stays in the viewport. |
| Structure and performance fit | Composes existing Input/Popover; no data layer or new dependency. Anchor geometry is checked per animation frame only while open. Lists are not virtualized; no throughput/battery or per-component size claim. Full build measurements are retained below. |
| Tests prove behavior | All required package commands, full 100% unit coverage, SSR, browser integration and freshly built E2E pass. Native browser tests supplement DOM adapters. No retries or warning exclusions. Electron testing is N/A to this package increment. |
| Delivery evidence is accurate | Exact final commands/times/logs retained; catalog, specs, README, component guide, decisions and import inventory updated. DELIVERY.md unchanged. Broader unrun gates listed below. |

## Verification

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | TypeScript passes | 2.456 s |
| `bun run lint` | ESLint passes | 1.040 s |
| `bun run test` | 80 unit tests pass | 2.551 s |
| `bun run test:coverage` | All four coverage thresholds 100% | 2.692 s |
| `bun run test:server` | 6 SSR tests pass | 0.689 s |
| `bun run build` | ESM, declarations and CSS built | 1.463 s |
| `bun run parity:report` | Current admin import-name inventory complete | 0.235 s |
| `bun run parity:admin` | Strict import-name inventory passes | 0.206 s |
| `THEME_PRODUCTION=1 THEME_PORT=4403 RESULTS_FILE=docs/evidence/combobox-visual-update.json bunx --no-install playwright test tests/e2e/visual.spec.ts --update-snapshots` | 9 visual tests generate 12 reviewed images | 14.956 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/combobox-integration.json bun run test:integration` | 54 Chromium/Firefox integration tests pass | 64.921 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/combobox-e2e.json bun run test:e2e` | 27 built-library E2E tests pass; 12 screenshot comparisons | 20.656 s |

Coverage: **1,096 statements, 640 branches, 452 functions and 317 lines**, all
100%. No source exclusion or lower threshold. Command logs and browser JSON
(with empty diagnostic attachments) are in [docs/evidence](../evidence).
Node's NO_COLOR/FORCE_COLOR notices are runner output, not application warnings.
The isolated Kobalte adoption probe remains failing evidence and is not counted
as an implementation acceptance test.

The full package build is 78.18 kB JavaScript (Vite gzip 20.79 kB) and 347.22 kB CSS
(Vite gzip 231.07 kB, including the existing bundled font). These are whole-package
outputs, not the marginal cost of Combobox or a tree-shaken consumer. Exact bytes
and Python gzip measurements are in [combobox-bundle.json](../evidence/combobox-bundle.json).

## Remaining scope and unrun checks

Full catalog completion, complete React/Base UI behavior/style parity, admin
migration, router/query integration and the broader historical Gate 0 remain
open. WebKit, hydration, physical assistive-technology sessions, large-list
performance and Electron/application-wide tests were not run. No app currently
consumes this package. The public subset is described explicitly rather than
claiming unsupported APIs.

Self-review covered source, tests, docs, generated evidence and all changed
screenshots. It corrected the gallery footer/order and an Enter-key conflict
with buttons inside popup content; the final verification above includes both.
Commit/push uses `codex/solid-combobox` under the latest working agreement.
