# Card and Separator layout verification

2026-10-08. Closes CRD-1 and SEP-1 for the documented composition. No production
component, dependency, public API or theme-token change was needed.

## What shipped, and what the build did that the plan didn't say

- Added `/?card-layout` (append `&dark`) using public component exports. Default
  and compact Cards contain long titles, descriptions, unbroken filenames,
  header actions and long footer copy. The parent owns the demonstration action
  count and live Separator orientation.
- Six shared browser scenarios run against source and freshly built exports in
  Chromium and Firefox: four light/dark × desktop/narrow-enlarged Card cases and
  two Separator cases. Narrow cases use a 390 px viewport and 24 px root font.
- Card assertions check actual slot padding/title size, descendant containment
  and internal horizontal overflow, title/action separation, multiline filenames,
  footer placement, document overflow and pointer/keyboard actions.
- Separator assertions check 1 px stretched vertical lines, explicit 2 × 32 px
  custom sizing and centering, visible theme colors, semantic/decorative ARIA,
  Tab skipping and repeated orientation changes.
- The initial customization example used plain `w-0.5`, which lost to the
  component's more-specific `data-vertical:w-px`. Four focused checks failed with
  an actual width of 1 px. The fixture now uses matching orientation variants:
  `h-8 data-vertical:w-0.5 data-vertical:self-center bg-primary`. The guide records
  this CSS contract; the component retains its reference styles.
- Screenshot review found extra space beneath the compact footer when the grid
  stretched cards to equal height. The fixture now uses `items-start`, documented
  in the guide, and a geometry assertion checks the footer meets the bottom
  edge. The first footer assertion incorrectly allowed for a 1 px border; Card
  uses a CSS ring, so the correct layout gap is zero. Eight checks exposed that
  test error while the other 156 integration cases passed. The expectation was
  corrected after inspecting the component classes. REASONING: parent alignment
  and text wrapping belong to composition;
  no new layout policy is imposed on every Card consumer.
- Full verification also exposed an existing Combobox test requiring an exact
  zero scroll offset. Firefox reported 0.033333 px after wrapping from the last
  option to the first while the active-option visibility assertion passed. The
  component derives scrolling from transformed opening geometry; fractional
  layout rounding is expected. The assertion now accepts an absolute offset
  below 1 px, matching the existing visibility helper's tolerance. This narrowly
  fixes a blocking test; Combobox runtime behavior is unchanged.
- Added and visually inspected three Chromium baselines: light, dark and narrow
  with enlarged text. The final images show wrapped content, separated actions,
  footers at the card edge and visible vertical boundaries. The original twelve
  package baselines were unchanged. Reviewed images:
  [light](../tests/e2e/visual.spec.ts-snapshots/card-layout-light-chromium-darwin.png),
  [dark](../tests/e2e/visual.spec.ts-snapshots/card-layout-dark-chromium-darwin.png),
  [narrow/enlarged](../tests/e2e/visual.spec.ts-snapshots/card-layout-mobile-chromium-darwin.png).

## Acceptance checklist

| DELIVERY.md criterion | Evidence / disposition |
| --- | --- |
| State has clear ownership | Fixture owns action count and orientation. Components receive props/children; no backend or duplicated draft state. |
| Every state is usable | Both sizes, both themes, long text, narrow/enlarged layouts, decorative/semantic/custom separators and both orientations are covered. Network loading/error states are N/A. |
| Failures have a recovery path | No mutation or request exists. Fixture actions remain operable after layout changes; async retry/error recovery is N/A. |
| Async work stays consistent | No async operation, submission or stale response in these components or this fixture. |
| Platform boundaries hold | Public web exports only. Backend, AppApi, desktop and IPC changes are N/A. |
| Reactivity and cleanup are deliberate | Fixture signals own interactions; orientation changes are asserted twice. No new effects, listeners, timers or observers. Existing diagnostic checks remain enabled. |
| Keyboard and assistive access work | Review activates with Enter; Tab skips decorative separators. Semantic role/orientation and hidden decorative state are asserted. Manual assistive technology remains unrun. |
| Appearance remains customizable | Semantic colors, both themes, 24 px root font, long filenames, both Card sizes and custom Separator dimensions/alignment pass geometry checks. Three new screenshots reviewed. Portals are N/A. |
| Structure and performance fit the feature | Focused fixture and shared source/built scenarios; production styles unchanged. No performance claim or benchmark. |
| Tests prove the behavior | Fresh package gates below exercise geometry, actions, semantics and screenshots. No new unit tests were needed for a fixture-only change; existing component unit and SSR coverage remains green. Electron is outside this package task. |
| Delivery evidence is accurate | Exact commands, results and measured durations retained below. Matrix closes only the tested scope. No architecture or adoption change requires a DECISIONS.md or component-map update. |

## Verification

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | TypeScript passes | 2.11 s |
| `bun run lint` | ESLint passes | 1.04 s |
| `bun run test` | 100 unit tests pass | 2.37 s |
| `bun run test:coverage` | 100% statements/branches/functions/lines | 2.41 s |
| `bun run test:server` | 6 SSR tests pass | 0.69 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/card-layout-integration.json bun run test:integration` | 164 runs pass (82 scenarios × 2 engines) | 116.84 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/card-layout-e2e.json bun run test:e2e` | 140 runs pass (64 journeys × 2 engines + 12 visual tests) | 73.93 s |

Durations include startup. Built E2E freshly builds package JavaScript/CSS,
declarations and the gallery. Twelve visual tests compare fifteen images; all
304 final browser diagnostic attachments are empty. Runner color-mode notices
are separate from application diagnostics. Coverage is 100% of included source
execution metrics, not a claim of exhaustive behavior coverage.

[Commands](evidence/card-layout-commands.json),
[output](evidence/card-layout-verification.txt),
[source integration](evidence/card-layout-integration.json),
[built E2E](evidence/card-layout-e2e.json), and
[coverage](evidence/card-layout-coverage.json).

The [initial focused failures](evidence/card-layout-initial.json) and
[corrected focused checks](evidence/card-layout-focused.json) preserve the
Separator width finding. Focused command:
`THEME_PORT=4403 RESULTS_FILE=docs/evidence/card-layout-focused.json bunx --no-install playwright test tests/integration/card-layout.spec.ts`.
The corrected run passed 12 tests in 10.49 s (Playwright duration), before the
subsequent grid-alignment/footer assertion; the full gates cover that final change.

The [first full run](evidence/card-layout-before-footer-correction-integration.json)
and its [commands/timings](evidence/card-layout-before-footer-correction-commands.json)
and [output](evidence/card-layout-before-footer-correction-verification.txt)
preserve the incorrect border expectation described above.

The [second integration run](evidence/card-layout-before-scroll-tolerance-integration.json)
passed all new layout scenarios and 163/164 total tests; the sole failure was the
Combobox fractional-scroll expectation. Its
[commands/timings](evidence/card-layout-before-scroll-tolerance-commands.json) and
[output](evidence/card-layout-before-scroll-tolerance-verification.txt) are retained.

The [initial baseline command](evidence/card-layout-baselines-command.json),
[output](evidence/card-layout-baselines-output.txt) and
[result](evidence/card-layout-baselines.json) record missing-baseline creation:
exit 1, 6.39 s. After image review and grid adjustment, the three new baselines
were regenerated with
`THEME_PRODUCTION=1 THEME_PORT=4403 RESULTS_FILE=docs/evidence/card-layout-baselines-reviewed.json bunx --no-install playwright test tests/e2e/visual.spec.ts --project=chromium --grep 'compact cards and vertical separators' --update-snapshots=all`:
[3 passed, 4.95 s](evidence/card-layout-baselines-reviewed.json) (Playwright duration).
Only these new tests were selected. Final E2E uses ordinary image comparison
without snapshot updates.

## Limits and next step

This certifies the documented wrapping and parent-alignment composition, not
arbitrary action widths, unstyled unbroken content or every viewport. Screenshots
use Chromium on macOS; Firefox receives geometry/interaction assertions. No new
axe scan of the focused route, WebKit/device run, manual assistive-technology
session, hydration, Electron/root-workspace test or performance benchmark was
performed. Existing whole-gallery axe checks remain part of integration.
Next is SKL-1: exercise Skeleton through a real Solid Loading boundary resolving
and unmounting in a browser, beyond the manually toggled preview.
