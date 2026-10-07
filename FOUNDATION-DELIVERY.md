# Foundation delivery — 2026-10-07

Historical report: this increment was subsequently committed as `b82f86c`.
Current gallery images and admin inventory include the next batch; its results
are in [FORM-FIELDS-DELIVERY.md](FORM-FIELDS-DELIVERY.md).

**Implemented:** the Solid 2 package foundation and Button, Badge, Card,
Separator and Skeleton. This increment includes `cn`, all seven Card exports,
source subpaths, an ESM/declaration/CSS build, interactive documentation,
light/dark/mobile screenshots, unit tests, browser integration and built-library
end-to-end tests. No application migration or Git commit was made.

The owner's explicit instruction to start this batch is recorded in D90 and
[DECISIONS.md](DECISIONS.md). Native HTML supplies these components' behavior.
There are no Kobalte/corvu dependencies or experimental patches in the package.
Earlier diagnostic work remains isolated in `validation/`.

## Verified behavior

- Button: six variants, eight size definitions, native button/anchor rendering,
  default `type="button"`, explicit form submit/reset, refs, native props,
  callbacks including bound handlers, reactive children/classes/disabled state,
  disabled-link navigation and handler prevention, keyboard activation and focus.
- Badge: six variants, native span/anchor, class overrides and reactive variants.
- Card: every part, child composition, native props, size changes and geometry.
- Separator: decorative by default, optional separator role, horizontal/vertical
  semantics and one-pixel geometry, reactive orientation/decorative state.
- Skeleton: decorative accessibility, configurable dimensions, reduced motion,
  pending-to-ready composition and an actual Solid 2 async Loading fallback.
- Theme: byte-identical canonical `:root`/`.dark` blocks, light/dark mode, token
  overrides, narrow viewport and enlarged text, local Inter assets.
- Accessibility: zero axe violations in the settled light/dark gallery in both
  browsers. Every browser case rejects console warnings/errors. Destructive text
  needed a derived emphasis token to correct inherited light-mode contrast;
  default variant helpers preserve other React class strings. The playground's
  footer status uses foreground text on its tinted surface. Theme-transition
  completion is awaited before contrast measurement.

## Commands and evidence

Runs used the package directory. Node 25.3.0, Bun 1.4.2, Solid/web/signals
2.0.0-rc.13, Vite 8.3.3, Vitest 4.1.10 and Playwright 1.63.0 were used.
The frozen standalone install ran in `/private/tmp/solid-foundation-frozen`.

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun install --frozen-lockfile --ignore-scripts` in fresh isolated tools directory | 306 packages installed without lock changes | 0.327 s |
| `bun run check` | Passed | 1.311 s |
| `bun run lint` | Passed | 0.711 s |
| `bun run test` | 22 tests passed | 1.324 s |
| `bun run test:coverage` | 22 tests passed; thresholds passed | 1.229 s |
| `bun run test:server` | Server-rendering test passed | 0.632 s |
| `bun run build` | ESM, declaration and CSS outputs built | 0.957 s |
| `RESULTS_FILE=/private/tmp/foundation-integration.json bun run test:integration` | 12 passed, Chromium + Firefox | 10.664 s |
| `RESULTS_FILE=/private/tmp/foundation-e2e.json bun run test:e2e` | 7 passed: 4 browser journeys + 3 Chromium screenshot comparisons | 7.257 s |

The final check/lint also passed after the last browser-test readiness adjustment.
Screenshot baselines were first generated with `bun run test:e2e
--update-snapshots=all`, visually inspected, then compared in the passing run
above without update mode. Baseline generation is not counted as a comparison.
Light/dark/mobile captures include pending Skeleton content so all five components
are visible. These are Solid gallery regressions, not React pixel comparisons.

[Command measurements](docs/evidence/commands.json),
[verification output](docs/evidence/verification.txt),
[coverage](docs/evidence/coverage-summary.json),
[browser integration](docs/evidence/integration.json), and
[built-library E2E](docs/evidence/e2e.json) are retained. No browser test was skipped,
retried or marked expected-failure. Firefox runs the journeys and axe checks;
visual baselines are Chromium/macOS-specific.

Coverage is **100% statements, branches, functions and lines** for the five
component files and `src/lib/utils.ts` (96 statements, 50 branches, 46 functions,
53 mapped lines). It is executable-source coverage of this batch, not proof of
all possible browser behaviors or full catalog completeness.

## DELIVERY.md acceptance review

| Checklist item | Result and boundary |
| --- | --- |
| State ownership | Component props remain reactive; app-owned pending state is demonstrated. Components introduce no backend or duplicated domain state. |
| Usable states | Default, variants, disabled, pending/ready, compact cards, decorative/semantic separators, light/dark/custom tokens are exercised. |
| Failure recovery | Native required validation blocks the empty form; the draft remains after pending completion. Backend rollback/retry is outside this presentation-only batch. |
| Async consistency | Disabled submit prevents repeat UI submission; Loading resolves to real content. No requests, response races or backend mutations exist here. |
| Platform boundaries | No AppApi, desktop, IPC, filesystem or network code in component source. Electron checks do not apply. |
| Reactivity and cleanup | Signal-driven prop changes are tested without replacing stable nodes. Testing-library cleanup disposes each owner; no component timers, observers or subscriptions were introduced. |
| Keyboard and assistive access | Native activation/focus, names, roles, disabled links, decorative state, reduced motion and axe checks pass. Screen-reader/manual assistive-device certification was not performed. |
| Appearance/customization | Semantic tokens, unchanged canonical theme blocks, custom palette, light/dark, narrow viewport, enlarged text and screenshots checked. File-browser filenames and portals do not apply; these components introduce neither. |
| Structure/performance | Components, utilities and app-owned examples are separated. No performance claim is made; no network or data layer is introduced. |
| Tests | All six requested package commands exist and passed, plus coverage, build and browser comparisons. Root all-workspace checks were not run; other apps need unrelated service/environment setup. |
| Evidence/decisions | D90, repository stack/roadmap notes, package plan/decision notes, inventory, docs and screenshots updated. The reusable DELIVERY.md is unchanged. |

## Explicit remaining work

The [admin import report](docs/evidence/admin-parity.json) finds 14 imported
subpaths, with nine still missing exports. `bun run parity:report` records that
inventory; `bun run parity:admin` is the intentionally strict future gate and
must not be presented as passing. No empty component stubs conceal these gaps.
The package's hooks export pattern is reserved; useIsMobile is not implemented.

The full catalog, complex headless primitives, arbitrary-component `as` support,
router/query interoperability, hydration, WebKit, physical mobile input and
application integration remain outside this increment. The earlier Kobalte
findings are still open for the affected primitives. Source compilation and
server rendering pass; the built ESM is the browser build and is not advertised
as a separate server bundle. SSR consumers compile the source with Solid's
server transform.

Dependencies are exact and a package-local frozen install was verified. The
monorepo lockfile and other package dependencies were not changed. The local
node_modules symlink is ignored; reproduction steps are in README.md.

Next, implement Input, Textarea and Label on this tested foundation.
