# Combobox navigation delivery

2026-10-08. Completes the automated portion of CMB-2: 40-option scrolling,
inline/popup Tab destinations and composition inside modal Popover. Five shared
browser scenarios run against source and built exports in Chromium and Firefox.
A physical IME session remains open in the [matrix](TEST-MATRIX.md).

## What shipped, and what the build did that the plan didn't say

- Tests revealed a real scrolling bug during the popup scale animation. With the
  configured 0.95 opening scale, the browser reported a 942.1px scroll position when the
  list needed 992px to expose its final option. Rectangle deltas now divide by
  the rendered-to-layout height ratio before changing scrollTop. REASONING:
  getBoundingClientRect includes transforms; scrollTop does not.
- Long-list insertion emitted WIDE_SCOPE_DEPS, followed by an input HOT_SCOPE_TIME
  warning during rapid navigation. Filtered/enabled/active derivations are now
  memoized, and For renders each template inside a layout-neutral presentation
  wrapper. ComboboxCollection uses the same row boundary. REASONING: For alone
  still left the parent's insertion reading every returned row computation;
  independent DOM insertion scopes remove that broad dependency. No warning
  threshold or diagnostic filter was changed.
- Firefox moved focus to the next control and then closure restored it to the
  chooser. Tab now requests dismissal in the next task, after native sequential
  navigation, and that dismissal alone suppresses focus restoration. A new
  request or unmount cancels queued dismissal. REASONING: synchronous popup
  removal and restoration competed with browser default keyboard behavior.
- Popup Shift+Tab returns to its trigger, the preceding native tab stop. The
  initial test expected the control before the trigger; that expectation was
  corrected to preserve DOM order instead of implementing custom traversal.
- New unit tests cover transformed scroll coordinates, row filtering in List and
  Collection, focus restoration on a subsequent opening, deferred dismissal,
  unmount cancellation and newer-interaction cancellation. Browser tests cover
  both scroll directions, wrapping, selected-value commit, draft cancellation,
  modal focus loops, scroll lock release and reopening after disposal.

Kobalte's existing [assessment](validation/KOBALTE-COMBOBOX.md) still governs adoption.
This batch repairs the delivered owned composition; no new primitive, dependency
or library pin is introduced. [DECISIONS.md](project/DECISIONS.md) records the lifecycle
and row markup choices. Public exports and prop types are unchanged.

## Acceptance checklist

| DELIVERY.md criterion | Evidence / disposition |
| --- | --- |
| State has clear ownership | Cached filtering/navigation derives from existing props/signals. The Tab dismissal marker and timer belong to one Combobox; no duplicated canonical selection. |
| Every state is usable | Open/closed, filtered, long-list/wrapped, committed and canceled drafts are tested. No request/loading/error workflow was added; prior form/rejection cases rerun. |
| Failures have a recovery path | Escape and Tab preserve accepted values. Controlled rejections still pass CMB-1; reopening a disposed modal creates its declared default. No mutation retry is involved. |
| Async work stays consistent | Tab waits for native default navigation. Tests prove unmount and newer requests cancel pending dismissal; existing reset/disposal tests remain. |
| Platform boundaries hold | Local browser UI only; no AppApi, IPC, desktop or backend change. Electron criteria are N/A. |
| Reactivity and cleanup are deliberate | Memos share expensive derivations; per-row insertion scopes bound reads. Cleanup cancels the new timer. Strict warning/error/page-error checks remain unchanged. |
| Keyboard and assistive access work | Real-browser forward/reverse Tab targets, ARIA active/expanded/selected state, focus preservation, nested Escape and modal loops pass. Existing axe gates rerun; physical IME/manual screen-reader sessions remain unrun. |
| Appearance remains customizable | Scrolling passes at desktop 1200×900 and narrow 390×844; the narrow case uses 24px root text. Shared tokens and 12 existing screenshot baselines remain. The focused examples add no visual certification beyond geometry checks. |
| Structure and performance fit the feature | Changes stay inside Combobox and its examples/tests; no global layer rewrite. The tested 40-option case is not a large-data throughput or virtualization claim. |
| Tests prove the behavior | All required fresh gates are below. Browser cases reproduce the original failures; five new unit tests cover the fixes and cleanup. |
| Delivery evidence is accurate | Commands, measured durations and raw before/final reports are retained; matrix and guide updated. DELIVERY.md is unchanged. |

## Verification

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | TypeScript passes | 1.95 s |
| `bun run lint` | ESLint passes | 0.94 s |
| `bun run test` | 85 unit tests pass | 2.44 s |
| `bun run test:coverage` | 100% statements/branches/functions/lines | 2.48 s |
| `bun run test:server` | 6 SSR tests pass | 0.68 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/combobox-cmb2-integration.json bun run test:integration` | 72 integration runs pass (36 scenarios × 2 engines) | 67.71 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/combobox-cmb2-e2e.json bun run test:e2e` | 45 E2E runs pass (18 journeys × 2 engines + 9 visual tests) | 30.86 s |

[Commands](evidence/combobox-cmb2-commands.json),
[final output](evidence/combobox-cmb2-verification.txt),
[integration report](evidence/combobox-cmb2-integration.json),
[E2E report](evidence/combobox-cmb2-e2e.json),
[coverage summary](evidence/combobox-cmb2-coverage.json).
Durations include startup. E2E builds package JavaScript/CSS, declarations and the
gallery afresh. Existing screenshot comparisons use unchanged baselines.
Unit source coverage remains 100% in all four metrics; it does not certify every
interaction. Full diff review includes source, tests, docs and evidence.

The [initial failed run](evidence/combobox-cmb2-before.json) preserves geometry,
focus and WIDE_SCOPE_DEPS failures. A [focused probe](evidence/combobox-cmb2-probe.json)
records geometry and native focus transitions. The [intermediate run](evidence/combobox-cmb2-intermediate.json)
retains the remaining Firefox focus failure and HOT_SCOPE_TIME warning. All
final browser diagnostic attachments are empty. Runner color-mode notices are
retained separately from application diagnostics.

## Remaining scope

CMB-2's physical IME composition/commit/cancel session is still unrun. Native
Home/End caret behavior, WebKit, hydration, physical assistive technology,
application/router/query integration, large-list performance certification and
Electron/root-workspace suites were not run. This verifies a chooser nested in
modal Popover, not every dialog implementation. The Kobalte probe was not rerun;
its previously failing adoption status is unchanged. Next automated work is
POP-1: Popover placement under scrolling, resize, movement and clipping.
