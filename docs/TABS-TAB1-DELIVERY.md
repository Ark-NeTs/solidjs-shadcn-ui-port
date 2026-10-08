# Tabs lifecycle delivery

2026-10-08. Closes TAB-1 with six shared browser scenarios against source and
freshly built exports in Chromium and Firefox. The
[acceptance matrix](TEST-MATRIX.md#tabs) links the actual assertions.

## What shipped, and what the build did that the plan didn't say

- Added a [focused preview](../playground/tabs-lifecycle.tsx) at `/?tabs-lifecycle`,
  with `&manual` for manual activation. It uses public exports and a keyed owner
  collection. Delete and Alt+End are example-owned mutations; the component does
  not implement those commands or manage the consumer's collection.
- Both activation modes verify removal of the focused trigger, another removal,
  then the last enabled trigger. Focus recovers to the remaining roving tab;
  when only disabled triggers remain, the list receives focus and Tab exits.
- Reordering checks both adjacent and nonadjacent moves, actual trigger identity,
  selected panel/ARIA links, Home/End and arrow navigation in the new DOM order.
  Manual navigation preserves selection until explicit activation.
- Force-mounted content keeps the same edited input node while hidden, stays out
  of sequential keyboard navigation, and retains its value on return. Default
  lazy content unmounts its input and restores its default on remount. These
  behaviors already worked; no draft-state change was needed.
- The initial tests exposed focus loss on removal in both browsers. A broader
  reorder test then exposed detach/reinsert focus loss without component cleanup.
  TabsList now observes child-list reconciliation and remembers its last focused
  tab. It recovers only if that node was among the removals and focus fell to body;
  an outside focus destination or unrelated mutation prevents recovery.
  REASONING: node disposal and DOM movement have different lifetimes, so recovery
  must observe the completed DOM update rather than only trigger cleanup.
- Firefox's external-update probe found focus on the scrollable tablist itself,
  instead of its roving trigger. A default tabindex=-1 removes that extra native
  stop while allowing programmatic empty-list fallback and caller overrides.
- Six new unit executions cover automatic/manual recovery, the empty collection,
  a newer focus destination, full-root disposal, actual DOM moves, manual
  selection, unrelated mutations, detached lists and callback-ref forwarding.
  Observer attachment is deferred to the committed DOM effect; an attempted
  render-ref attachment did not survive the lifecycle tests and was removed.

The main gallery layout, dependencies and public selection/panel APIs remain
unchanged. The existing Kobalte assessment is unchanged. [DECISIONS.md](../DECISIONS.md)
records the observer lifetime and native tab-entry decisions.

## Acceptance checklist

| DELIVERY.md criterion | Evidence / disposition |
| --- | --- |
| State has clear ownership | The preview owns its keyed collection; Tabs keeps existing selection/roving derivations. The observer remembers a focus destination, not a duplicate selection or draft. |
| Every state is usable | Selected/focused/manual, removed, moved, disabled-only, hidden/mounted and remounted cases pass. Request loading/pending/error states are N/A to collection focus. |
| Failures have a recovery path | Removed focus returns to the roving target or empty list; native Tab can exit. Preserved drafts return unchanged. No network mutation or retry is introduced. |
| Async work stays consistent | Observer recovery checks the latest focus destination and actual removal records. Newer outside focus, unrelated changes, detached lists and disposed roots cannot reclaim focus. |
| Platform boundaries hold | Public web exports and local examples only; no AppApi, IPC, backend or desktop changes. Electron requirements are N/A. |
| Reactivity and cleanup are deliberate | The observer/listener attach in a DOM effect and dispose together. No timer, application service or mirrored draft state. Strict diagnostics remain enabled. |
| Keyboard and assistive access work | Exact focus, one enabled tab stop, selected/panel ARIA links, disabled skipping, manual activation and native exit/entry pass in both browsers. Existing axe checks rerun; manual assistive technology remains unrun. |
| Appearance remains customizable | No production styling change. Existing light/dark/enlarged/mobile and 12 screenshot comparisons rerun without baseline updates. The focused example uses shared styles; filename handling is N/A. |
| Structure and performance fit the feature | A list-scoped observer and helper handle real reconciliation; no document-wide DOM observer or performance claim. Existing prop/ref contracts remain. |
| Tests prove the behavior | Six shared browser scenarios and six unit executions cover the requested behavior and fixes. Fresh gates are below. |
| Delivery evidence is accurate | Commands, measured durations, initial failures, reorder failure and final reports retained; matrix and guide updated. DELIVERY.md unchanged. |

## Verification

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | TypeScript passes | 1.92 s |
| `bun run lint` | ESLint passes | 1.06 s |
| `bun run test` | 93 unit tests pass | 2.43 s |
| `bun run test:coverage` | 100% statements/branches/functions/lines | 2.41 s |
| `bun run test:server` | 6 SSR tests pass | 0.71 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/tabs-tab1-integration.json bun run test:integration` | 104 integration runs pass (52 scenarios × 2 engines) | 88.38 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/tabs-tab1-e2e.json bun run test:e2e` | 77 E2E runs pass (34 journeys × 2 engines + 9 visual tests) | 47.65 s |

[Commands](evidence/tabs-tab1-commands.json),
[final output](evidence/tabs-tab1-verification.txt),
[integration report](evidence/tabs-tab1-integration.json),
[E2E report](evidence/tabs-tab1-e2e.json),
[coverage summary](evidence/tabs-tab1-coverage.json).
Durations include startup. E2E builds JavaScript/CSS, declarations and the gallery
freshly. Six new scenarios add 24 executions across two engines and two export
modes. Existing visual tests compare 12 unchanged images. Source coverage remains
100% in all four metrics; this is not exhaustive behavior coverage.

The [initial run](evidence/tabs-tab1-before.json) preserves four focused-removal
failures and Firefox's extra tab-stop failure. The
[external-focus probe](evidence/tabs-tab1-probe.json) captures the actual focused
node. The [first focused pass](evidence/tabs-tab1-focused.json) used adjacent
reordering; the [stronger reorder run](evidence/tabs-tab1-reorder.json) demonstrates
why that was insufficient. The [observer-focused run](evidence/tabs-tab1-final-focused.json)
passes the stronger cases. Final full-suite browser diagnostic attachments are
empty; runner color-mode notices remain separate from application diagnostics.

## Remaining scope

WebKit, hydration, physical assistive technology, every controlled-rejection and
collection-mutation combination, nested tablist browser scenarios, arbitrary
external DOM rewrites, application integration and Electron/root-workspace suites
were not run. CMB-2's physical IME check remains open. Next are CHK-1/SWT-1:
canceled native resets and changing explicit form ownership for Checkbox/Switch.
