# Checkbox and Switch delivery — 2026-10-07

**Implemented Checkbox and Switch**, bringing the package to ten components.
The owner authorized committing and pushing this batch. It includes source/barrel exports and types, native
form behavior, an owned Solid signal helper, public documentation, playground
examples, regression tests and reviewed light/dark/mobile screenshots.

Kobalte was evaluated **first**, using an unpatched `2.0.0-alpha.2` composition
on Solid/web/signals `2.0.0-rc.13` in Chromium and Firefox. Its default-on Switch
reset to off and both probes emitted ten warnings, including untracked reads
and effect feedback/relay diagnostics. [KOBALTE-TOGGLES.md](KOBALTE-TOGGLES.md)
retains the source, pinned standalone lock and full results. The observation
process exits zero after recording results; that is not a passing adoption gate.

Production uses native inputs with Solid signals. No Kobalte/corvu dependency,
experimental patch or production lockfile change was added. Kobalte remains the
first candidate for later primitives; corvu has no replacement for these two
controls in the existing catalog mapping. See [DECISIONS.md](DECISIONS.md).

## Delivered behavior

- Checkbox: controlled/uncontrolled boolean and indeterminate state, mixed ARIA
  and dash indicator, one change request per actual state change, native input
  refs/events (including bound handlers), labels, required validation and form data.
- Switch: controlled/uncontrolled boolean, default/small sizes, native switch
  role and labels, thumb positioning in LTR/RTL, native form data and reset.
- Both: reactive disabled/readonly/checked/class props; controlled parents can
  reject edits without leaving the input and visual state inconsistent. Disabled
  controls do not submit; readonly controls remain focusable but cannot toggle.
- Reset: mount-time default baseline, including mixed state; default-on reset;
  cancelled reset; reset requests rejected by controlled owners; native external
  form association; listener rebinding/cleanup and queued-reset unmount protection.
- Accessibility/theme: native Space and label activation, genuine Tab focus and
  visible rings, required validation, descriptive rejection recovery, reduced
  motion, light/dark axe checks, both switch sizes, RTL, enlarged text and mobile
  layouts. Final browser suites reject every console warning/error and page error.

The React class strings and data slots are retained, with native appearance,
decorative positioning, mixed-state fill, RTL movement and reduced-motion additions.
Refs/events target **HTMLInputElement**, not the reference React button. An inert
span positions the decoration, so disabled Label styling should use a wrapping
group rather than a sibling peer selector crossing that wrapper. The owner
provides labels, errors and any domain-specific selection logic. These boundaries
and examples are in [docs/components.md](docs/components.md).

Visual review caught the dark input background overriding the mixed checkbox's
fill. Added an explicit dark mixed-state fill and a browser assertion that mixed
and checked surfaces match in both themes, then regenerated, reviewed and compared
the screenshots. The final dark mixed dash is legible on its filled surface.

## Fresh verification

Commands ran from this package with the existing pinned toolchain, Bun 1.4.2 and
Node 25.3.0. Times below are measured wall-clock seconds. The Kobalte probe command
ran from `validation/solid2-toggles` and is recorded separately from acceptance.

| Command | Outcome | Time |
| --- | --- | ---: |
| `node probe.mjs` in the isolated Kobalte harness | Observations recorded; adoption fails reset/diagnostic criteria in both browsers | 3.003 s |
| `bun run check` | Passed | 1.454 s |
| `bun run lint` | Passed | 0.745 s |
| `bun run test` | 44 passed | 1.425 s |
| `bun run test:coverage` | 44 passed; all coverage thresholds passed | 1.363 s |
| `bun run test:server` | 3 passed | 0.725 s |
| `bun run build` | ESM, declarations and CSS built | 1.271 s |
| `bun run parity:report` | Updated inventory; 4 of 14 admin subpaths still have missing exports | 0.273 s |
| `RESULTS_FILE=/private/tmp/toggles-integration.json bun run test:integration` | 30 passed in Chromium + Firefox | 26.021 s |
| `THEME_PRODUCTION=1 RESULTS_FILE=/private/tmp/toggles-visuals.json bunx --no-install playwright test tests/e2e/visual.spec.ts --update-snapshots=all` | 3 reviewed screenshot baselines regenerated | 5.256 s |
| `RESULTS_FILE=/private/tmp/toggles-e2e.json bun run test:e2e` | 15 passed: 12 browser journeys and 3 screenshot comparisons | 12.377 s |

E2E freshly builds the package and documentation, using the built ESM library.
Integration compiles source components. The visual baseline generation is not
counted as a comparison: the final E2E command compares without update mode.
Screenshots cover light/dark/mobile with checked, unchecked, mixed, disabled,
readonly and rejected-change states. These are Solid gallery regressions, not
cross-framework pixel comparisons. Firefox runs all behavior/accessibility
journeys; image baselines are Chromium/macOS-specific.

Coverage is **100% statements (216), branches (118), functions (102) and lines
(120)** across the ten component files and shared utilities, including the new
toggle helper. This measures executed source, not full catalog completeness or
every possible browser scenario. No final browser case was skipped, retried or
marked expected-failure. Axe reports zero violations in the tested galleries.
Node tooling still prints its NO_COLOR/FORCE_COLOR environment warning; browser
console diagnostics are empty and enforced by the fixture.

Evidence: [commands](docs/evidence/toggles-commands.json),
[full check/test/build output](docs/evidence/toggles-verification.txt),
[coverage](docs/evidence/toggles-coverage.json),
[browser integration](docs/evidence/toggles-integration.json),
[built E2E](docs/evidence/toggles-e2e.json), and
[initial browser-test failures](docs/evidence/toggles-integration-before.json).

Initial integration failures were test setup issues: Playwright waits for a
label's associated disabled input to become enabled, and programmatic focus
following a mouse click did not establish Firefox keyboard focus visibility.
The tests now use a real pointer click on that disabled label and actual Tab
navigation before asserting keyboard focus rings. A unit test was also corrected
to dispatch an explicitly cancellable synthetic change when testing the
cancellation guard; ordinary browser change events are not cancellable. Coverage
initially exposed generated ref-dispatch branches; direct ref callbacks remove
those unnecessary branches. No diagnostics or failed behavior assertions were
suppressed to obtain the passing result.

## DELIVERY.md acceptance review

| Criterion | Result and boundary |
| --- | --- |
| State ownership | Controlled values stay with the caller; uncontrolled state is local. Mixed state and derived visuals share one value. Domain rules stay in examples. |
| Usable states | Checked/unchecked/mixed, disabled/readonly, both switch sizes, controlled rejection and default reset demonstrated. Prior pending/loading examples still pass. |
| Failure recovery | Rejected controlled requests preserve the canonical value and show a dismissible example error. Required validation preserves other selections. Backend rollback/read retry does not apply. |
| Async consistency | Reset microtasks check cancellation and lifetime; unmount prevents queued work. No backend requests, uploads, mutations or automatic retries are introduced. |
| Platform boundaries | No desktop, IPC, filesystem or AppApi in component source. Electron packaging checks do not apply to this package-only change. |
| Reactivity and cleanup | Reactive props and stable inputs tested. Reset listener rebinds to explicit form ownership and is removed on cleanup; no redundant state-synchronization effect. |
| Keyboard/assistive access | Native label/Space/Tab semantics, visible focus, mixed/switch ARIA, required validation, descriptions, reduced motion and axe pass. Manual screen-reader certification was not performed. |
| Appearance/customization | Canonical tokens remain byte-identical; reference class tables checked. Semantic colors, class overrides, sizes, RTL, narrow/enlarged text and reviewed screenshots covered. No new portals. |
| Structure/performance | Shared toggle state/form logic is separated from each visual component. No runtime dependency or performance claim added. |
| Tests | All six checklist commands, coverage and build pass. Root all-workspace tests, WebKit, hydration, physical mobile/screen-reader testing and application integration were not run. |
| Evidence/decisions | Map, specs, implementation plan, decisions, component guide, screenshots and admin inventory updated. Historical reports/evidence preserved. DELIVERY.md is unchanged. |

## Remaining scope

Alert Dialog, Combobox, Popover and Tabs are the four remaining admin import
subpaths with missing exports. Full catalog and admin parity remain incomplete;
`parity:admin` was not run or claimed passing. There are no component stubs,
application migrations, generic Field context or adopted headless patches in
this batch. Server tests compile source; the emitted ESM remains a browser bundle.
Controlled/uncontrolled mode switching during a component's lifetime is not
part of the supported contract.

Next, implement the next component batch, evaluating Kobalte first.
