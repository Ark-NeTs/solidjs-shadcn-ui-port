# Full catalog acceptance — 2026-10-09

All **65 catalog families** have implemented source and documented contracts.
The final 13 additions complete the catalog task after the prior 52-family
checkpoint. Tests certify the linked behaviors, not every upstream React API or
all possible consumer compositions. See [test matrix](TEST-MATRIX.md).

| Added families | Implementation, acceptance and limits |
| --- | --- |
| Calendar, Date Picker, Input OTP | [Dates](DATE-CATALOG-DELIVERY.md) |
| Resizable, Scroll Area, Carousel, Message Scroller | [Layout](LAYOUT-CATALOG-DELIVERY.md) |
| Toast, Sonner | [Notifications](NOTIFICATION-CATALOG-DELIVERY.md) |
| Sidebar | [Sidebar](SIDEBAR-CATALOG-DELIVERY.md) |
| Chart, Questionnaire | [Chart and Questionnaire](CHART-QUESTIONNAIRE-DELIVERY.md) |
| Data Table | [Data Table](DATA-TABLE-DELIVERY.md) |

## Repairs and review

Data Table now isolates core models and row rendering behind Solid ownership
boundaries; the former broad-subscription and unstable-memo warnings are gone.
Hydration retains the exact server elements before live table interaction.
Controlled filter/page-size/month selection restores the canonical native value.
Questionnaire restores an edit rejected by a pending-state change. Resizable
restoration rechecks its adjacent constraints after external layout changes and
preserves caller CSS text. Example appends use unique record/category identities.

Drawer's intermittent Firefox failure was reproduced in a plain native scroll
container, both with and without a dialog: pending text-field focus scrolling
overwrote the test's explicit bottom scroll. Settling the editor's focus paint
before that independent scroll passed 24 measured repetitions. The shared test
retains its geometry and dismissal assertions. Production Drawer is unchanged;
no retries, timeout sleep, relaxed assertion or diagnostic suppression was added.
[Native comparison and captured measurements](../validation/drawer-scroll/README.md).

The full built run also exposed a pre-existing Popover test baseline captured
while its opening zoom still ran (240 authored pixels rendered as 237.25).
The test now awaits the actual animation completion before measuring, and asserts
the exact initial width. Production positioning and tolerances are unchanged.
The [captured baseline](evidence/catalog-popover-animation-baseline.json) and
[failed run](evidence/catalog-popover-animation-failure.json) preserve the cause.

## Final verification

Package cwd: `packages/shadcn-solidjs-theme`. Measured whole-command wall times:

| Exact command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | Passed | 4.381 s |
| `bun run lint` | Passed | 1.777 s |
| `bun run test` | 369 passed | 5.254 s |
| `bun run test:server` | 24 passed | 1.174 s |
| `bun run test:coverage --coverage.reporter=json --coverage.reporter=json-summary --coverage.reporter=text` | 100% statements, branches, functions and lines | 5.868 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/catalog-final-hydration.json bun run test:hydration --max-failures=1` | 132 passed in three engines | 107.761 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/catalog-final-integration.json bun run test:integration --max-failures=1` | 609 passed in three engines | 573.678 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/catalog-final-e2e.json bun run test:e2e --max-failures=1` | 618 passed in three engines | 433.606 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/catalog-popover-final-source.json bunx playwright test tests/integration/popover-placement.spec.ts --max-failures=1` | 15 passed in three engines | 20.519 s |
| `THEME_PORT=4403 THEME_PRODUCTION=1 RESULTS_FILE=docs/evidence/catalog-popover-final-repeat.json bunx playwright test tests/e2e/popover-placement.spec.ts --grep "reanchors after viewport" --repeat-each=5 --max-failures=1` | 15 passed in three engines | 30.529 s |

The complete source run preceded this test-only Popover correction; all 15
affected source cases then passed with the corrected baseline. The built resize
case passed five repetitions per engine before the final complete built run.
[Additional measured commands](evidence/catalog-popover-final-commands.json).

The hydration total includes three unsafe-registration negative controls.
Built tests use freshly built library/gallery assets; visual checks run in
Chromium. All interaction suites fail console warnings/errors and page errors.
The full working tree also passed strict diff review; shared theme blocks remain
byte-identical. No thresholds or diagnostics were relaxed.

Raw [fast commands](evidence/catalog-final-commands.json),
[browser commands](evidence/catalog-final-browser-commands.json),
[source results](evidence/catalog-final-integration.json),
[built results](evidence/catalog-final-e2e.json),
[hydration results](evidence/catalog-final-hydration.json) and
[coverage](evidence/catalog-final-coverage.json) preserve the outcomes.
Historical failed/checkpoint reports remain dated evidence and are superseded
by these final gates. The earlier pause was revoked by the owner's continuation.

Root admin application/Electron migration, manual screen-reader operation,
physical touch/SMS/password-manager autofill and large-dataset benchmarking were
not run. They are outside these standalone catalog contracts. APIs differ from
React counterparts where documented; no universal drop-in compatibility claim.

## Dependencies and delivery

Added pinned framework-independent engines: Embla 8.6.0, TanStack Table core
8.21.3 and Chart.js 4.5.1 with @kurkle/color. Kobalte was evaluated first;
no gap justified corvu. The lock keeps existing Solid/compiler rc.13 pins and
passed an isolated frozen install. No private distribution patch enters production.

Whole built JS: **710,051 bytes / 183,307 gzip bytes**,
excluding CSS and external Solid. This is aggregate library size, not an
application tree-shaking or per-component measurement. The all-components
playground build reports Vite's chunk-size advisory; that gallery intentionally
imports the entire catalog. Consumer bundle splitting has not been measured. [Size record](evidence/catalog-final-size.json).

Changes are delivered as logical commits on `codex/solid-combobox`; no direct
main push, force push, CI change or external publication is part of this task.
Per-group reports cover all eleven DELIVERY criteria and retain explicit limits.
