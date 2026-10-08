# Button and Badge link navigation delivery

2026-10-08. Closes BTN-1/BDG-1 with six shared browser scenarios through source
and freshly built exports in Chromium and Firefox. The
[acceptance matrix](TEST-MATRIX.md#button) links the specific assertions.

## What shipped, and what the build did that the plan didn't say

- Added a [public-export preview](../playground/link-navigation.tsx) at
  `/?link-navigation`, with `&dark` and `&disabled` options. The example owns link
  availability and callback counters; pressing D disables the focused Button
  link without moving focus through another control. D is an example command,
  not a component keyboard shortcut.
- Independent Button/Badge scenarios in both themes assert exact Tab/Shift+Tab
  destinations, native anchor semantics, focus-visible state and a rendered
  focus shadow. The default informational Badge span adds no keyboard stop.
- Space causes no navigation or callback. Enter performs native fragment
  navigation and calls the matching owner and ancestor once; the other link's
  callback remains untouched. Tests use actual keyboard events and native hrefs,
  without a router or a synthetic navigation handler.
- An initially disabled Button anchor lacks href, exposes aria-disabled and
  tabindex=-1, and is skipped in both tab directions. A real mouse click at its
  center cannot navigate, invoke the owner or bubble to the surrounding example.
  Raw pointer input is intentional: Playwright's locator click would refuse an
  aria-disabled element without exercising the component's event guard.
- Disabling a focused Button anchor preserves focus and blocks Enter, Space and
  pointer activation. Re-enabling restores href and native Tab entry on the same
  node; Enter then navigates with exactly one callback.
- All focused cases passed on the first run. No production source, API, styling,
  dependency or architecture change was needed. Existing unit/SSR assertions
  remain; no duplicate unit assertions were added for native browser behavior.

Kobalte adoption/mapping and DECISIONS.md remain unchanged: this verifies the
already delivered native components. The main gallery is unchanged.

## Acceptance checklist

| DELIVERY.md criterion | Evidence / disposition |
| --- | --- |
| State has clear ownership | The example owns availability/counters; components use their existing native href and disabled contracts. No backend or draft state. |
| Every state is usable | Enabled, initially disabled, disabled while focused and re-enabled paths are checked. The example explains unavailability. Loading/pending/error request states are N/A. |
| Failures have a recovery path | Re-enabling restores keyboard entry and navigation without replacing the node. No network failure or retry is introduced. |
| Async work stays consistent | No asynchronous state or mutation is added. Navigation is native; existing package async regressions rerun. |
| Platform boundaries hold | Public web exports and local fragment destinations only; AppApi, IPC, desktop and backend requirements are N/A. |
| Reactivity and cleanup are deliberate | Owner signals update existing props; no new effect, listener subscription, timer or observer. Strict diagnostics stay enabled. |
| Keyboard and assistive access work | Exact tab order, light/dark keyboard focus, Enter/Space behavior, aria-disabled, disabled nonactivation and default Badge noninteractivity pass. Existing axe runs repeat; physical assistive technology remains unrun. |
| Appearance remains customizable | No production CSS change. Shared light/dark/mobile/enlarged checks and 12 screenshot comparisons pass without baseline updates. Filename/portal cases are N/A. |
| Structure and performance fit the feature | One shared test registration runs source/built contracts; no production implementation or performance claim. |
| Tests prove the behavior | Six browser scenarios add 24 executions across both engines/export modes. Fresh package gates are recorded below. |
| Delivery evidence is accurate | Exact commands/durations, diagnostics and JSON reports retained; matrix/guide updated. DELIVERY.md remains reusable and unchanged. |

## Verification

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | TypeScript passes | 1.99 s |
| `bun run lint` | ESLint passes | 0.97 s |
| `bun run test` | 97 unit tests pass | 2.44 s |
| `bun run test:coverage` | 100% statements/branches/functions/lines | 2.63 s |
| `bun run test:server` | 6 SSR tests pass | 0.73 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/links-navigation-integration.json bun run test:integration` | 130 integration runs pass (65 scenarios × 2 engines) | 111.41 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/links-navigation-e2e.json bun run test:e2e` | 103 E2E runs pass (47 journeys × 2 engines + 9 visual tests) | 64.71 s |

[Commands](evidence/links-navigation-commands.json),
[output](evidence/links-navigation-verification.txt),
[source integration](evidence/links-navigation-integration.json),
[built E2E](evidence/links-navigation-e2e.json),
[coverage summary](evidence/links-navigation-coverage.json), and
[initial focused run](evidence/links-navigation-focused.json).
Durations include startup. E2E freshly builds package JavaScript/CSS, declarations
and the gallery. Nine visual tests compare 12 unchanged images. All final browser
diagnostic attachments are empty; runner color-mode notices are separate from
application diagnostics. Source execution coverage remains 100% in all four
metrics; that does not establish exhaustive behavioral coverage.

## Remaining scope

Navigation checks use native same-document fragments. External navigation,
routers, new-tab/modifier gestures, downloads, arbitrary caller focus overrides,
WebKit, hydration, physical assistive technology, application/Electron/root
workspace integration and measured performance were not run. Badge has no
component-owned disabled API. Next are INP-1/TXT-1/LBL-1: supported native input
types, Textarea read-only/resize/scroll behavior and live label reassociation.
