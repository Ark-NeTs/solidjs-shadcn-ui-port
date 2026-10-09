# Accordion and Collapsible delivery

2026-10-08. Adds two owned Solid 2 component families, bringing the package to
16. Source/build exports, interactive examples, API documentation, screenshots
and the per-component test matrix are included. No application or data layer is
introduced. The public guide is [components.md](components.md#accordion-and-collapsible).

## Built — what shipped, and what the build did that the plan didn't say

- **Accordion:** single/multiple selection, controlled/uncontrolled state,
  required or collapsible single selection, disabled controls, heading/region
  semantics, optional horizontal/RTL keyboard navigation and draft retention.
  REASONING: native buttons supply activation; DOM order supplies focus movement
  without a registration effect. Selection stays with the root owner.
- **Collapsible:** controlled/uncontrolled expansion, native button activation,
  disabled/canceled requests, hidden shells and optional retained children.
  REASONING: hidden closed shells give stable accessibility targets; forceMount
  explicitly preserves drafts while ordinary children remount on reopening.
- **Kobalte first:** unpatched alpha.2 opened and closed both primitives in
  Chromium/Firefox, but emitted six Accordion and four Collapsible warnings per
  engine. REASONING: the strict diagnostic gate blocks adoption, so the existing
  owned-native approach is used. [Probe/evidence](validation/KOBALTE-DISCLOSURES.md).
  No missing capability requires corvu and no dependency was added.
- **SSR-safe custom IDs:** configure triggerId/contentId on AccordionItem or the
  Collapsible root. REASONING: an early server test caught the trigger referencing
  a generated ID before a later sibling registered its custom content ID. Declaring
  both IDs on the owner removes this render-order dependency. SSR and hydration
  now assert custom links, retained node identity and reactive ID changes.
- **Natural-height content:** sibling semantic classes and token styling are
  preserved; one native chevron rotates instead of two React icons. No animated
  height variables or exit presence is promised. REASONING: this bounded
  implementation uses native hiding/unmounting without geometry effects or timers.

## Acceptance coverage

Ten new unit scenarios exercise ownership, immutable multiple selection, defaults,
disabled guards, refs, canceled/bound handlers, required selection, headings,
custom IDs, draft retention/remount, navigation, nesting and missing-owner errors.
One grouped SSR test checks initial disclosure markup. A hydration scenario in
all three engines asserts reuse of server nodes, live IDs, keyboard selection,
retained drafts, ordinary remount and disposal.

Five shared browser scenarios run through source and freshly built exports in
Chromium, Firefox and WebKit. They verify real Enter/Space and arrow navigation,
RTL, disabled skipping, single/multiple expansion, retained draft identity,
nesting, controlled rejection in both directions, light/dark focus and token
overrides, reduced motion, enlarged 390px layout and axe. Three new Chromium
visual tests add light/dark/mobile images; the three gallery images also change
for the new family count and examples link. Two desktop Combobox images include
the footer and are refreshed solely for its new count. The screenshots are mirrored in docs.

## Verification

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | Passed (exit 0) | 2.33 s |
| `bun run lint` | Passed (exit 0) | 1.22 s |
| `bun run test` | 115 passed (exit 0) | 2.68 s |
| `bun run test:coverage` | 100% statements, branches, functions and lines (exit 0) | 2.88 s |
| `bun run test:server` | 8 passed (exit 0) | 0.69 s |
| `RESULTS_FILE=docs/evidence/disclosures-hydration.json bun run test:hydration` | 84 passed (exit 0) | 48.04 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/disclosures-integration.json bun run test:integration` | 273 passed (exit 0) | 208.63 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/disclosures-e2e.json bun run test:e2e` | 234 passed, including 15 visual tests (exit 0) | 135.03 s |

All 591 final browser executions pass with empty browser warning/error/page-error
attachments, no retries, no skips and no flaky results. The 15 visual tests compare
18 images. Included source coverage is 1,377 statements, 815 branches, 573 functions
and 432 lines, all covered; execution coverage does not certify exhaustive behavior.

Self-review covered the complete handwritten diff, generated evidence, ID ownership,
mount/disabled/controlled semantics, sibling style differences and every changed
screenshot. After correcting the gallery footer, typecheck and lint passed again
(2.68 s and 1.30 s); `git diff --check` passed (0.04 s).
[Post-review commands](evidence/disclosures-review-checks.json) and
[evidence/link/image audit](evidence/disclosures-audit.json).


[Measured commands](evidence/disclosures-commands.json),
[output](evidence/disclosures-verification.txt),
[coverage](evidence/disclosures-coverage.json),
[hydration](evidence/disclosures-hydration.json),
[source integration](evidence/disclosures-integration.json),
[built E2E](evidence/disclosures-e2e.json).

The final gates use an isolated server on 4403, preserving the user preview on
4399. The Kobalte evaluation used 4405. A first screenshot command refused to
start because the focused hydration run already owned 4403; it was rerun after
that server exited. No tests or diagnostics were suppressed.

The first full built run had 231 passes and three failures: two desktop Combobox
images still showed the old footer, and one passing field journey could not close
its trace file. The latter came from running screenshot generation concurrently
with the same default test-results directory. All image diffs were inspected:
only footer pixels changed. The two exact received images became the reviewed
baselines, and the full built suite was rerun sequentially. No component workaround,
retry policy or relaxed image threshold was added.
[First-run results](evidence/disclosures-first-e2e.json),
[timings](evidence/disclosures-first-commands.json) and
[output](evidence/disclosures-first-verification.txt) are preserved.

Exploratory checks before the final suite: focused unit/SSR/type checks and
coverage were not separately timed. They exposed the sibling-ID ordering issue,
a TypeScript nullable native ID case and a synthetic unit test that needed a
flush between separate user activations. These were resolved before final gates.
Focused browser runs passed 15 source journeys (17.0 s) and three hydration
journeys (7.5 s); six initial screenshot-generation cases passed (10.4 s).
These are Playwright report durations, not timed shell commands. A footer count
correction found during review required refreshing the gallery images once more;
its first refresh passed within tolerance without writing images, so the final
refresh explicitly used `--update-snapshots=all` to save exact current output.

## DELIVERY.md disposition

| Criterion | Disposition |
| --- | --- |
| State has clear ownership | Controlled props remain canonical; callbacks request changes. Uncontrolled selection is local; expansion and attributes are derived. |
| Every state is usable | Closed/open, disabled, empty initial selection, single/multiple and nested states are covered. Loading/empty/error content is supplied by the host; no unimplemented action is presented as functional. |
| Failures have a recovery path | Rejected controlled open/close retains canonical state until an explicit owner update. forceMount preserves drafts. No network operation or retry is owned here. |
| Async work stays consistent | No async production work, mutation, timer or delayed exit is introduced. Existing package async suites still run; arbitrary async child compositions are not newly certified. |
| Platform boundaries hold | Web UI only; no AppApi, desktop bridge, IPC, secrets, CI or database changes. |
| Reactivity and cleanup are deliberate | No production effects, external listeners, observers or timers. Owner IDs avoid sibling registration; native delegated handlers are scoped to the DOM. Unmount/remount and root disposal are tested. |
| Keyboard and assistive access work | Named controls/regions, heading levels, expanded/disabled state, visible focus and real keyboard journeys pass. Axe is automated evidence; physical assistive-technology sessions remain unrun. |
| Appearance remains customizable | Shared token blocks stay identical; caller classes, semantic focus override, light/dark, long prose, narrow/enlarged layouts and screenshots pass. No portals are introduced. Arbitrary unbroken filenames are not specifically tested. |
| Structure and performance fit the feature | One shared disclosure helper, separate selection owner, no new runtime dependency or data layer. No performance benchmark or claim is made. |
| Tests prove the behavior | Required package gates plus coverage/hydration run. Source and built galleries are tested, not an admin application or Electron package. |
| Delivery evidence is accurate | Commands, measured durations, coverage, diagnostics and test links are retained. README, guide, catalog, matrix and lasting decision note are updated. |

Physical AT/device sessions, streaming SSR, a published SSR distribution, full
React API/animation parity, admin/router/query integration, Electron and performance
benchmarks remain outside this increment. Existing matrix gaps remain explicit.
