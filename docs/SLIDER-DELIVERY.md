# Slider delivery

2026-10-08. Adds Slider through public source and build exports, bringing the
package to 23 component families. [Guide](components.md#slider),
[acceptance matrix](TEST-MATRIX.md#slider), [Kobalte evaluation](../KOBALTE-SLIDER.md).

## Implementation and decisions

- Evaluated unpatched Kobalte alpha.2 first against shared Solid rc.13. Both tested
  engines retain unchanged values after settled keyboard/drag checks and emit seven
  internal diagnostics. The owned implementation adds no dependency or corvu fallback;
  the previously accepted Kobalte Toggle remains unchanged.
- Derive sorted, step-snapped, bounded values and neighbor gaps from a numeric array.
  Keep thumb DOM identity by index, and use the same normalized values for fill,
  accessible bounds and repeated native form inputs. Invalid configuration and
  unrepresentable step grids fail explicitly; caller arrays are never mutated.
- Pointer capture owns one drag; nearest-thumb track selection, inherited RTL,
  inversion and vertical geometry share the value model. Keyboard steps and ordinary
  Tab order complement pointer interaction. Commit callbacks report accepted values
  after the Solid batch, once per finished gesture. Canceled gestures retain accepted
  live values without reporting completion.
- Reset waits for bubbling cancellation, follows reactive form ownership and cancels
  pending work on reassociation/disposal. Hidden values are serialized as strings
  through the DOM binding. Disabled controls are omitted from FormData; readOnly
  prevents interaction while preserving submitted values.
- Review corrections: memoize thumb count so value changes cannot cancel their own
  drag; teardown snapshots its current DOM ref explicitly; observe native focusout
  because blur does not bubble. Individual thumb labels override the root labelledby
  reference. Numeric rounding preserves large integer steps, and grids beyond safe
  precision fail instead of producing invalid geometry.
- Preserve the sibling's thin track, small thumb and enlarged pointer target while
  using semantic background for dark/custom themes. Keep every remaining API and
  manual acceptance limit explicit in the component guide and matrix.

[DECISIONS.md](../DECISIONS.md) retains the architectural reasoning. There are no
application service, CI, secret or sibling-package changes.

## Size

The whole-library JavaScript artifact grows from 132,248 to 141,902 bytes
(+9,654); gzip grows from 33,084 to 35,866 bytes (+2,782). No dependency was added.
This compares baseline `0344743` with the final build, excludes CSS/fonts/external
Solid runtime, and is not a consuming application transfer measurement.
[Raw size evidence](evidence/slider-size.json).

## Verification

Eighteen new unit cases cover normalization, invalid configurations, decimals,
controlled/local values, labels/ref/class overrides, keyboard and commit semantics,
three-thumb identity, changing bounds, pointer capture/cancellation, empty/fixed
states, native forms and cleanup. One grouped server test verifies serialized values,
ARIA bounds, names and vertical/disabled markup. One new hydration scenario in each
engine verifies original node identity before keyboard changes, native form reset
and disposal.

Eight shared browser scenarios run through source and freshly built exports in
Chromium, Firefox and WebKit. They exercise keyboard steps/Tab/commits, nearest-thumb
track selection and dragging past bounds, canceled resets and form ownership,
disabled/readOnly/remount, controlled rejection/acceptance, decimals/RTL/inversion/
vertical geometry, capture cancellation/disposal, custom themes, reduced motion,
enlarged narrow layouts and axe in light/dark modes. Three new Chromium visual tests
cover Slider light/dark/mobile; gallery and desktop Combobox baselines update the
component count/navigation. All changed screenshots were visually reviewed.

| Command | Result | Time |
| --- | --- | ---: |
| `bun run check` | Pass | 4.05s |
| `bun run lint` | Pass | 1.58s |
| `bun run test --maxWorkers=2` | 185 tests passed | 7.80s |
| `bun run test:coverage --maxWorkers=2` | 185 tests; 100% statements/branches/functions/lines | 8.63s |
| `bun run test:server` | 12 tests passed | 1.44s |
| `RESULTS_FILE=docs/evidence/slider-hydration.json bun run test:hydration` | 96 passed (93 positive + 3 unsafe-characterization checks) | 63.19s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/slider-integration.json bun run test:integration` | 363 passed across Chromium/Firefox/WebKit | 292.43s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/slider-e2e.json bun run test:e2e` | 336 passed: 309 journey runs + 27 Chromium visual tests; builds library and gallery | 212.71s |
| `bun run lint` (test-title/whitespace review cleanup) | Pass | 1.56s |
| `git diff --check` | Pass | 0.077s |
| `python3 /tmp/audit-slider.py` | 795 browser results, no unexpected diagnostics/retries/skips; 30 baselines, 411 local documentation links and 100% coverage audited | 0.012s |

[Commands](evidence/slider-commands.json), [output](evidence/slider-verification.txt),
[coverage](evidence/slider-coverage.json), [hydration](evidence/slider-hydration.json),
[source browser integration](evidence/slider-integration.json), [built E2E](evidence/slider-e2e.json),
[evidence audit](evidence/slider-audit.json), [self-review](evidence/slider-review.json).

The evidence audit walks the three final Playwright reports, checks each result and
its browser-diagnostics attachment, verifies coverage totals, compares documentation
images to their baselines and resolves local documentation links.

Exploratory probes, focused checks and screenshot generation preceded the final
measured gates and were not separately timed. Browser suites run sequentially on
4403, the isolated Kobalte probe uses 4405, and the user's 4399 preview is preserved.
The registry reports Solid rc.14, but this batch deliberately retains rc.13.
Unit coverage is owned-source execution, not exhaustive behavior or Kobalte coverage.

## DELIVERY.md disposition

| Criterion | Disposition |
| --- | --- |
| State has clear ownership | Canonical controlled/local arrays, derived normalized values and separate temporary gesture state; callbacks request acceptance. |
| Every state is usable | Single/range, empty, fixed, disabled, readOnly and rejected-owner states are explicit. Invalid configuration throws for host recovery; the component owns no backend loading state. |
| Failures have a recovery path | Controlled rejection preserves display/form values; later acceptance works. Reset cancellation is honored. Host can correct invalid configuration or use Errored. No network retry is owned. |
| Async work stays consistent | Pending reset work is canceled on reassociation/disposal; queued commits check disposal and report canonical values after batching. No backend mutations or duplicate requests. |
| Platform boundaries hold | Browser UI only; no AppApi, desktop IPC, database, secrets or CI changes. |
| Reactivity and cleanup are deliberate | Normalization is a memo; effects only synchronize form/gesture lifetime. Capture, timers and listeners clean up; stable thumb count avoids value-induced cancellation. |
| Keyboard and assistive access work | Names, per-thumb labels/value text, bounds, orientation, arrows/Home/End/Page/Shift, Tab and focus are verified. Axe passes the documented states; physical AT/touch remains unverified. |
| Appearance remains customizable | Canonical tokens unchanged; semantic track/fill/thumb colors, custom themes, light/dark, RTL/inversion, vertical, reduced motion and enlarged narrow examples are checked. Long filenames are not component content. |
| Structure and performance fit the feature | Pure numeric helpers and one public wrapper; no domain rules or dependency added. Whole-library size measured; no large-thumb-count performance claim. |
| Tests prove the behavior | Type/lint/unit/coverage/server/source hydration/source integration/fresh built gallery E2E are verified. This is not admin or Electron E2E. |
| Delivery evidence is accurate | Commands/times, raw unpatched probe, browser reports, screenshots, guide/matrix/map, review and architectural decisions are retained. |

Remaining limits: physical AT/touch, forced colors, focused-thumb removal recovery,
external DOM form relocation/node replacement, published/streaming SSR and real app/
Electron composition. No crossing/swap mode, draggable fill, per-thumb disabled,
marks/ticks, tooltip, wheel or persistence API. Browser scenarios use up to two thumbs;
three thumbs are unit-tested. Extreme numeric magnitudes still have ordinary
JavaScript floating-point resolution limits.
