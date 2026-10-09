# Theme canvas expansion — 2026-10-09

Expanded the five-card sample into the 37-card `preview-02` composition observed
at [shadcn/ui create](https://ui.shadcn.com/create). The seven-column placement,
vertical ordering, two-column center, nested navigation pair, small statistics
pair and full-width transaction/holdings cards follow that reference. The canvas
is 3000px wide on desktop and 2400px on narrow screens, inside a keyboard-focusable
scroll region. Cards can grow with text rather than clipping their controls.

## Reference map

| Columns | Top-to-bottom order |
| --- | --- |
| 1 | Contribution History; Distribute Track; mobile connection; Q2 Dividend Income; Dollar-Cost Averaging; syncing |
| 2 | Payout Threshold; Claimable Balance; Preferences; savings progress; Kitchen Island |
| 3–4 | Savings Targets / Buy Investment; Recent Transactions; Overview + Account navigation / Payments; FAQ / Front Door; Holdings |
| 5 | Account Access; Card Balance + Payment Due; Yearly Activity; Transfer Funds; Cover Art; Skeleton |
| 6 | Payout Preferences; Power Usage; Connect Bank; Upcoming Payments; Living Room |
| 7 | Stock Performance; Explore Catalog; milestone; Social Links; Notifications |

## DELIVERY acceptance

| Criterion | Evidence/disposition |
| --- | --- |
| State ownership | Per-composition drafts and interaction state; totals derive from edited amounts; theme changes preserve mounted owners. |
| Usable states | Local saved statuses, syncing/canceled states, selected/empty upload, invalid file recovery, mixed notifications, filtered holdings. Skeleton is an intentional loading-style example. |
| Recovery | Invalid image type/size preserves the prior image; copy denial retains existing manual-copy/retry behavior. |
| Async consistency | No new remote requests. Object URLs are revoked on replacement and disposal. Existing export completion guard remains covered. |
| Platform boundary | Browser preview only; no AppApi, IPC, backend, account, payment or deployment mutation. |
| Reactivity/cleanup | Accepted components own lifecycle; stable keys preserve summary rows during edits. Upload URL cleanup is explicit. |
| Keyboard/accessibility | Labeled forms, scroll-region focus, keyboard sliders/tabs, native dialogs and focus restoration; mobile light/dark axe with enlarged text. |
| Appearance | Reference order and column geometry asserted; full canvas and light/dark/mobile/export screenshots reviewed. Semantic tokens preserved. |
| Structure/performance | Shared presentation helpers and separate column modules; no new dependency. No performance benchmark claim. |
| Tests/evidence | Fresh results below; no primitive changed. Full diff reviewed before commit. |

## Verification

Results are recorded in `docs/evidence/theme-expansion-*`. The isolated browser
server uses port 4403; the owner's playground remains on 4399. One worker, zero
retries, existing strict browser diagnostic policy.

| Command | Result | Time |
| --- | --- | ---: |
| `bun run test` | 400 passed | 9.46 s |
| `bun run test:server` | 26 passed | 1.38 s |
| `bun run check` | Pass | 9.49 s |
| `bun run lint` | Pass | 3.49 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/theme-expansion-source.json bunx playwright test tests/integration/theme-generator.spec.ts tests/integration/docs-site.spec.ts --max-failures=1` | 54 passed | 96.69 s |
| `THEME_PRODUCTION=1 THEME_PORT=4403 RESULTS_FILE=docs/evidence/theme-expansion-built.json bunx playwright test tests/e2e/theme-generator.spec.ts tests/e2e/docs-site.spec.ts tests/e2e/docs-site/visual.spec.ts --update-snapshots=none --max-failures=1` | 66 passed | 90.02 s |
| `WRANGLER_BIN=/tmp/solid-docs-deploy/node_modules/wrangler/bin/wrangler.js THEME_PORT=4403 RESULTS_FILE=docs/evidence/theme-expansion-public.json bun run test:site` | 15 passed | 23.62 s |

[Static/unit/server evidence](evidence/theme-expansion-checks.json),
[browser commands and timings](evidence/theme-expansion-browser-checks.json),
[source](evidence/theme-expansion-source.json),
[built and visual regression](evidence/theme-expansion-built.json),
[provider-local](evidence/theme-expansion-public.json), and
[visual baseline generation](evidence/theme-expansion-visual.json).

All five affected screenshots were inspected: full canvas, light, dark, mobile
and export. The seven existing documentation screenshots also passed unchanged.

## Findings and limits

The first checks caught hidden chart content contributing to document overflow;
a positioned scroll container now contains it. Editing dynamic summaries exposed
fresh-row identity warnings; keyed rows resolve them without suppressing diagnostics.
Visual review also corrected the class merge for outline dialog triggers. Firefox
rejected an invalid PNG test fixture; the fixture now has a valid checksum.

This matches card order and grouping, not every upstream decorative icon, phrase,
font preset, chart data point or exact card height. The connection code is explicitly
illustrative. Money/account actions are local demonstrations. Theme export still
contains only Theme; no project scaffolding tabs were added. No external service
was deployed. Full unrelated browser suites and manual screen-reader testing were
not rerun; the affected source/built/docs/public suites and complete unit/server
suites were used.

The production build retains a large-chunk advisory (over 500 kB); browser checks
contain no runtime warnings or errors. Bundle splitting was not expanded in this
layout task.
