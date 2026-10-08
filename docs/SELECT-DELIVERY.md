# Select delivery

2026-10-08. Adds Select and its compound parts through source and build exports.
The package now contains 22 component families. [Guide](components.md#select),
[acceptance matrix](TEST-MATRIX.md#select), [Kobalte evaluation](../KOBALTE-SELECT.md).

## Implementation and decisions

- Evaluated unpatched Kobalte alpha.2 first against shared Solid rc.13. Its basic
  selection/form/reset/Escape checks pass, but each tested engine emits 25 internal
  diagnostics. This batch uses owned Solid state and native HTML with the existing
  Floating UI dependency. No corvu, dependency upgrade, library patch or diagnostic
  filter is added; the accepted Kobalte Toggle remains unchanged.
- Explicit root item data supplies the closed server label and native options.
  Value and popup callbacks request independent owner acceptance. Native select
  submission/required validation, readOnly/disabled handling and delayed cancelable
  reset stay consistent with that canonical value. The reset listener follows
  reactive form ownership and pending work is canceled on reassociation/disposal.
- The named combobox trigger keeps focus while aria-activedescendant identifies
  the active option. Arrows, Home/End, typeahead, selection, Escape and native Tab
  navigation work with disabled skipping. A manual browser popover escapes clipping
  while retaining theme ancestry. Floating placement ignores obsolete results;
  bounded scrolling reveals the active item after the available height changes.
- Review corrections: a scrolling viewport needed tabindex=-1 to avoid an extra
  browser Tab stop; delayed dismissal preserves native focus navigation. Long lists
  use Content's per-item render function to give rows isolated insertion scopes.
  Empty data has a disabled placeholder option; separators remain decorative to
  preserve valid listbox children. Unit tests distinguish old/new position results
  and assert that stale or post-unmount results cannot overwrite the latest style.
- Test corrections: WebKit on macOS needs native Option-Shift-Tab to navigate links;
  an outside-pointer test now targets an unobstructed button. Adding Select exposed
  a substring name collision in an existing hydration locator; exact matching
  preserves that original test's intent. No browser warning/error was filtered.

[DECISIONS.md](../DECISIONS.md) records lasting architecture. The guide documents
explicit data order, supported compound parts, API differences and limits.

## Size and verification

No new dependency is added. The complete library JS artifact grows from 116,807
to 132,248 bytes, or from 29,433 to 33,084 gzip bytes: **+3,651 gzip bytes**.
This is a whole-library artifact comparison, not an isolated tree-shaken import
or application transfer estimate; CSS/fonts and the external Solid runtime are
excluded. [Raw size evidence](evidence/select-size.json). No interaction-performance
benchmark is claimed.

Twenty new unit cases cover controlled/local ownership, keyboard/typeahead,
caller cancellation, native validation/form/reset, ownership changes, missing data,
large-list scopes, refs/props, pointer behavior, timers, observers and stale results.
One grouped SSR case verifies canonical labels/native values and retained closed
markup. One hydration scenario runs in three engines with original node/ID reuse,
selection, FormData, reset, dismissal and disposal.

Nine shared browser scenarios run through both source and built exports in Chromium,
Firefox and WebKit. They cover keyboard/pointer selection, native forms and canceled
resets, independent controlled decisions, disabled/readOnly/required behavior,
Tab destinations, a 40-option list, resize/reordering/empty data/RTL, nested modal
interaction, semantic custom colors, reduced motion, enlarged narrow layouts and
light/dark axe checks. Three new Chromium visual tests cover Select in light/dark/mobile;
main-gallery and desktop Combobox images update the component count/navigation.
Every changed baseline was visually reviewed. Coverage is owned-source execution,
not exhaustive state coverage or a measurement of Kobalte internals.

| Exact command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | Pass | 2.79 s |
| `bun run lint` | Pass | 1.31 s |
| `bun run test --maxWorkers=2` | 167 passed | 6.56 s |
| `bun run test:coverage --maxWorkers=2` | 167 passed; 100% statements/branches/functions/lines | 7.01 s |
| `bun run test:server` | 11 passed | 0.93 s |
| `RESULTS_FILE=docs/evidence/select-hydration.json bun run test:hydration` | 93 passed | 51.88 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/select-integration.json bun run test:integration` | 339 passed | 292.59 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/select-e2e.json bun run test:e2e` | 309 passed; 27 images | 191.84 s |

The full gates above precede one final styling review correction: logical inline
padding reserves checkmark space on the correct side in RTL. The shared long-list
scenario now asserts that the selected RTL label and checkmark do not overlap.
The following checks rerun the affected paths and every visual baseline after that change.

| Exact command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | Pass | 3.51 s |
| `bun run lint` | Pass | 1.40 s |
| `bun run test --maxWorkers=2` | 167 passed | 6.81 s |
| `bun run test:coverage --maxWorkers=2` | 167 passed; 100% statements/branches/functions/lines | 8.33 s |
| `bun run test:server` | 11 passed | 0.98 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/select-review-integration.json bunx --no-install playwright test tests/integration/select.spec.ts` | 27 passed; includes RTL non-overlap | 32.10 s |
| `THEME_PORT=4403 THEME_PRODUCTION=1 RESULTS_FILE=docs/evidence/select-review-e2e.json bunx --no-install playwright test tests/e2e/select.spec.ts tests/e2e/visual.spec.ts` | 51 passed; all 27 images unchanged | 36.65 s |
| `RESULTS_FILE=docs/evidence/select-review-hydration.json bun run test:hydration --grep 'hydrates Select'` | 6 passed (Select and selected Tabs) | 9.36 s |
| `python3 /tmp/audit-select.py` | Pass; 825 quiet results, no retries/skips; 27 baselines; 406 local links | 0.023 s |
| `git diff --check` | Pass | 0.081 s |

[Review commands](evidence/select-review-commands.json),
[review output](evidence/select-review-verification.txt),
[review source](evidence/select-review-integration.json),
[review build and visuals](evidence/select-review-e2e.json),
[review hydration](evidence/select-review-hydration.json).


[Commands](evidence/select-commands.json), [output](evidence/select-verification.txt),
[coverage](evidence/select-coverage.json), [hydration](evidence/select-hydration.json),
[source integration](evidence/select-integration.json), [built E2E](evidence/select-e2e.json),
[shared runtime resolution](evidence/select-runtime.json),
[evidence audit](evidence/select-audit.json), [self-review](evidence/select-review.json).

Exploratory checks found the corrected issues above. One early all-worker unit run
hit worker startup timeouts; final unit/coverage checks use two workers. One early
browser run had prolonged host stalls and timed out in an axe check; final evidence
uses fresh sequential suites with no increased assertion timeouts or retries.
The [initial full hydration report](evidence/select-initial-hydration.json) records
the locator ambiguity described above; [its command log](evidence/select-initial-verification.txt)
and [timings](evidence/select-initial-commands.json) are retained separately.
Final commands are measured above; exploratory probes and screenshot generation
were not separately timed. Test servers use 4403 and the Kobalte probe uses 4405;
the user's 4399 preview is preserved.

## DELIVERY.md disposition

| Criterion | Disposition |
| --- | --- |
| State has clear ownership | Controlled values/open state remain canonical; callbacks request acceptance. Highlight and validation attempt are local, labels/enabled items are derived. |
| Every state is usable | Placeholder, selected, disabled, readOnly, empty/missing data and rejected-owner states have explicit behavior. Host owns loading/errors; no fake network action. |
| Failures have a recovery path | Owner rejection preserves the canonical label/native value; explicit acceptance works. Invalid required submission focuses the trigger. Reset cancellation is honored. |
| Async work stays consistent | Position tickets reject obsolete/late measurements; reset/typeahead/Tab work cleans up. No network mutation or submission retry is owned. |
| Platform boundaries hold | Browser UI only; no AppApi, desktop IPC, database, secrets or CI change. |
| Reactivity and cleanup are deliberate | Split effects synchronize form listeners, native layers and geometry. Timers/listeners/observers are disposed; long rows have isolated insertion scopes. |
| Keyboard and assistive access work | Names/roles, active descendant, selected/disabled state, arrows/typeahead, Space/Enter/Escape/Tab and nested focus are verified. Axe covers the documented open states; physical AT remains unverified. |
| Appearance remains customizable | Canonical theme blocks unchanged; semantic tokens, classes/styles, sizes, reduced motion, custom light/dark colors, RTL and enlarged narrow/long-label layouts are checked. |
| Structure and performance fit the feature | Native form semantics and owned interaction share root data. Whole-library size delta measured; no large-list performance benchmark or virtualization claim. |
| Tests prove the behavior | Type/lint/unit/coverage/SSR/source hydration and source/built browser gates run. Browser E2E is the documentation gallery, not an admin or Electron application. |
| Delivery evidence is accurate | Exact commands/times, unpatched probe, raw reports, reviewed screenshots, guide, matrix, catalog and architectural decision are retained. |

Remaining scope limits: flat single selection; render all enabled options once in
root data order; no item-aligned Radix placement, asChild/portal API, editable search,
virtualization or hover/hold auto-scroll. Scroll arrows remain visible at boundaries.
Physical AT/touch, native validation-message UI, external DOM form relocation/node
replacement, arbitrary cross-library composition, published/streaming SSR, application
router/query integration and Electron remain unverified. The registry reports Solid
rc.14, but this batch deliberately keeps and verifies the established rc.13 runtime.
