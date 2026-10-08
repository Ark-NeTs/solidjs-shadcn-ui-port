# Tooltip and Hover Card delivery

2026-10-08. Adds TooltipProvider, Tooltip, TooltipTrigger, TooltipContent and
HoverCard, HoverCardTrigger, HoverCardContent. The package now has 18 component
families with source/build exports, examples, tests and screenshots.
[Public guide](components.md#tooltip-and-hover-card) and
[acceptance matrix](TEST-MATRIX.md#tooltip).

## Built — what shipped, and what the build did that the plan didn't say

- **Kobalte first:** unpatched alpha.2 on rc.13 passes pointer opening, Escape,
  focus opening and explicit outside-focus dismissal in Chromium/Firefox, but
  emits two Tooltip and five Hover Card warnings per engine. REASONING: these
  fail the strict diagnostic gate, so neither is adopted. Both capabilities
  exist; no corvu gap or new dependency is introduced. [Evidence](../KOBALTE-HINTS.md).
- **Owned previews:** a shared controller handles local/controlled state,
  cancellable delay, provider skip window, pointer bridge and focus engagement.
  REASONING: these concerns overlap; trigger semantics remain separate native
  button and anchor implementations. Custom content IDs belong to the root,
  where both SSR and hydration can know them before rendering either part.
- **Native top layer and Floating UI:** theme/DOM ancestry is retained; previews
  do not autofocus or restore focus. Placement follows geometry and rejects
  obsolete async results. REASONING: modal Popover's focus lifecycle is unsuitable
  for nonmodal descriptions, so the preview has its own scoped listener/observer
  lifetime and topmost Escape handling. It reuses the existing Floating UI dependency.
- **Focus correction:** content uses bubbling focusin/focusout; trigger controller
  focus/blur calls have explicit event boundaries. REASONING: initial tests caught
  a card failing to close after focus left a descendant link, and modal-triggered
  programmatic focus exposing untracked reads inside the parent's effect.
- **Styles and limits:** Tailwind scans src/lib as well as components; viewport
  constraints intersect with caller CSS limits. REASONING: screenshot review caught
  missing colors/widths from utility strings in the shared helper. New browser
  assertions check compiled tooltip colors, long-text bounds and Hover Card width.
  Screenshots capture the full page, because top-layer content can extend outside
  main's bounding box without being clipped on the actual page. Self-review also
  caught placement cleanup overwriting live caller size changes; cleanup now restores
  only its own last-applied values, with a reactive width/height regression.

The bounded implementation omits a Tooltip arrow, Radix transform-origin variables,
asChild, portal-container APIs and exit animation. Its rectangular pointer bridge
is deliberately documented; it is not a polygon corridor or drag-selection guarantee.
No production warnings are filtered. No existing runtime or library is patched.

## Test evidence

Fifteen new unit cases cover delay/defaults, skipped delay, hover policy, canceled
handlers, refs, controlled rejection, live IDs, pointer/focus/Escape, disabled
buttons/anchors, pending cancellation, stale geometry, collision sizing, missing
owners and cleanup. Reactive caller size updates are checked in the same size-constraint unit case.
One grouped SSR case checks initial IDs, roles, native links
and retained markup. One hydration scenario in three engines verifies original
shell identity, live IDs, focus/dismissal, native navigation and disposal.

Six shared browser scenarios run against source and freshly built exports in
Chromium, Firefox and WebKit. They check pointer cancellation, descriptions/names,
hoverable text, slow gap travel, keyboard entry/navigation, controlled rejection,
disabling/pending disposal, Escape inside a modal, compiled styling, long text,
clipping escape, movement, scroll/resize, custom colors, reduced motion and
light/dark narrow enlarged layouts with axe. Three Chromium visual scenarios add
light/dark/mobile open previews. Gallery and desktop Combobox images are refreshed
for the 18-family count and new examples link; the catalog route totals are
recomputed from its current 65 rows; prior component behavior is unchanged.

## Verification

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | Passed | 2.59 s |
| `bun run lint` | Passed | 1.26 s |
| `bun run test` | 130 passed | 2.86 s |
| `bun run test:coverage` | 100% statements, branches, functions and lines | 3.11 s |
| `bun run test:server` | 9 grouped SSR tests passed | 0.77 s |
| `RESULTS_FILE=docs/evidence/hints-hydration.json bun run test:hydration` | 87 passed; no retries/skips/diagnostics | 48.16 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/hints-integration.json bun run test:integration` | 291 passed; three browser engines; no retries/skips/diagnostics | 239.92 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/hints-e2e.json bun run test:e2e` | 255 passed; freshly built assets; 21 image baselines; no retries/skips/diagnostics | 147.93 s |
| `python3 /tmp/audit-hints.py` | 633 clean browser results; 21 baselines; 366 local documentation links | 0.012 s |
| `git diff --check` | Passed; full source/test/docs diff and changed images reviewed | 0.058 s |

[Commands](evidence/hints-commands.json), [output](evidence/hints-verification.txt),
[coverage](evidence/hints-coverage.json), [hydration](evidence/hints-hydration.json),
[source integration](evidence/hints-integration.json), [built E2E](evidence/hints-e2e.json), [audit](evidence/hints-audit.json),
[self-review](evidence/hints-review.json).

Exploratory unit/platform-adapter corrections included dispatching native pointerenter/
leave and modelling popover visibility in jsdom. A disabled anchor now retains its
link role after href removal. The browser availability test uses keyboard activation
for a control beneath an open card. CSS min() assertions accept jsdom's normalized
calc() serialization. WebKit serializes the same oklch hue with additional floating-point digits; the
color assertion now checks numeric channels with a tolerance of 0.0001. These were
resolved before final acceptance.

The first full verification was interrupted after screenshot review found missing
helper styles; it is not the acceptance run. Its orphaned port-4403 server was
identified and stopped before resuming. Final browser gates run sequentially on
4403; the user's preview on 4399 is preserved. Kobalte used isolated port 4405.
Exploratory checks were not separately shell-timed; final exact commands and
measured durations are above.

## DELIVERY.md disposition

| Criterion | Disposition |
| --- | --- |
| State has clear ownership | Controlled props stay canonical; callbacks request changes. Local state is used only for uncontrolled owners. Pointer/timer intent is separate from displayed selection. |
| Every state is usable | Open/closed, delayed, disabled and retained/unmounted states are checked. Loading/empty/error content comes from the host; no fake application action is added. |
| Failures have a recovery path | Rejected open/close requests preserve canonical state until explicit owner acceptance. Force-mounted children retain identity. No backend retry is owned. |
| Async work stays consistent | Pending timers cancel on departure/disable/disposal; repeated movement does not restart closing. Geometry writes reject older tickets and disposed owners. |
| Platform boundaries hold | Browser UI only; no AppApi, desktop IPC, database, secrets or CI change. |
| Reactivity and cleanup are deliberate | Effects synchronize native layers and geometry. Timers, document listeners and Floating UI observers have scoped cleanup. Modal-generated focus uses explicit event boundaries. |
| Keyboard and assistive access work | Button names remain stable; descriptions append to existing IDs. Native links, keyboard entry, disabled state, Escape and parent-modal retention pass. Physical AT remains unrun; tooltip children must be noninteractive. |
| Appearance remains customizable | Canonical tokens unchanged; compiled helper styles, inherited colors, classes, CSS limits, long tooltip text, narrow/enlarged layouts and light/dark screenshots are checked. No explicit unbroken-filename test is added. |
| Structure and performance fit the feature | Shared preview controller/content lifetime, native trigger wrappers, no new dependency or data layer. Frame-based geometry observation is scoped to open previews; no performance benchmark claim. |
| Tests prove the behavior | Required package checks plus coverage and source hydration run. Browser E2E is the built gallery, not the admin application or Electron. |
| Delivery evidence is accurate | Measured commands, diagnostic arrays, coverage, screenshots, catalog mapping, guide, matrix and lasting decision note are retained. |

Full React API/animation parity, physical AT/device sessions, touch behavior,
drag-selection persistence, external manual popover calls, arbitrary cross-library
nesting, streaming/published SSR, admin/router/query integration, Electron and
performance benchmarks remain unverified or outside this increment.
