# Radio Group, Toggle and Toggle Group delivery

2026-10-08. Adds RadioGroup/RadioGroupItem, Toggle/toggleVariants and
ToggleGroup/ToggleGroupItem through source and build exports. The package now
contains 21 component families. [Guide](components.md#radio-group-toggle-and-toggle-group),
[acceptance matrix](TEST-MATRIX.md#radio-group), [Kobalte evaluation](../KOBALTE-CHOICES.md).

## Built — what shipped, and what the build did that the plan didn't say

- **Kobalte first, per primitive.** Radio Group fails reset and emits 14 diagnostics;
  Toggle Group emits five per tested engine. Standalone Toggle emits none and
  renders on the server. REASONING: adopt the usable Toggle through its public
  entry instead of applying the other primitives' rejection to the entire library.
  Its canceled-click behavior is adapted through controlled state and caller-first
  events. Package/lock pin alpha.2, retain the shared Solid rc.13 overrides, and add
  no corvu, library patch or diagnostic filter.
- **Native radio group.** One canonical value, real input labels/validity/FormData,
  readonly/disabled states, root-owned form association and one reset subscription.
  REASONING: browser activation can uncheck the previous radio before the owner
  accepts; synchronize the entire group after the change callback. Delay reset
  synchronization until bubbling cancellation settles; cancel queued work when
  ownership changes or the root is disposed.
- **Form-owner correction.** Resolve the requested form ID or enclosing form for
  the reset subscription. REASONING: Firefox's input.form was stale during removal
  of the explicit form attribute in the first browser run. The resulting listener
  stayed detached. Binding from requested ownership fixes returning to the ancestor.
  The example uses an unmatched nonempty ID for detachment because Firefox warns
  natively when an empty form attribute is assigned. That warning is not suppressed.
- **Pressed group and focus.** Owned single/multiple selection with shared Toggle
  styling. REASONING: selection and focused item have different lifetimes; owner
  rejection must not undo keyboard focus. Shared navigation uses current DOM order,
  skips disabled controls and isolates nested groups. Radios activate on arrows;
  Toggle Group arrows only move focus. Joined borders use logical edges for RTL.
- **Custom themes and docs.** Light/dark/mobile screenshots, public examples, API
  limits, matrix and catalog updated together. REASONING: the initial custom-color
  example paired light backgrounds with dark-mode text; axe caught the contrast
  failure. Its colors now account for both modes. Reduced motion removes pressed
  button transitions; long groups can scroll within their available width.
- **Review corrections.** Group focus events explicitly leave the parent reactive
  scope before reading item props; a new unit regression catches programmatic
  focus from an owning effect. The required full suite also exposed two existing
  intermittent WebKit failures. Alert Dialog now avoids tracking open state when
  forceMount already keeps content mounted; Combobox re-reveals its active option
  after its list shrinks during floating placement. Its observer is cleaned up,
  with a new resize/disposal unit case. Both existing browser regressions passed
  three consecutive focused runs after these targeted fixes.

## Dependency and build cost

Kobalte is imported only through `@kobalte/core/toggle-button`; its other primitives
are not used by this batch. Solid stays a peer runtime. The complete library JS
artifact grows from 99,109 to 116,807 bytes, or from 25,557 to 29,433 gzip bytes:
**+3,876 gzip bytes for the whole batch**. This includes all three components,
the adapter and the two verification-blocking fixes; it is not an isolated Kobalte measurement or an application transfer
estimate. CSS/fonts and external runtime are excluded. [Raw size evidence](evidence/choices-size.json).
No interaction-performance benchmark or general tree-shaking claim is made.

## Test evidence

Sixteen new choice unit cases cover Kobalte adaptation, controlled/local state, data-bound
handlers, canceled clicks and synthetic cancelable focus/change events, native refs,
variants/defaults, readonly,
required attributes, reset cancellation, external association, pending disposal,
radio synchronization, single/multiple groups, immutable arrays, arrow directions,
owning-effect focus, loop bounds, nested isolation, roving opt-out, item removal and missing-owner errors.
One grouped SSR test checks native names/checked/required/disabled and pressed
markup. One hydration scenario in three engines reuses the original server nodes,
then exercises keyboard selection, pressed state and disposal.

Seven shared browser scenarios cover source and built exports across Chromium,
Firefox and WebKit: radio labels/arrow selection/FormData/default reset, canceled
reset, external form association/detach/return, disabled serialization, remount,
controlled owner acceptance, Kobalte click/Space/Enter/cancellation, single clear,
multiple selection, DOM reorder, RTL/orientation, actual spacing/sizes, custom
colors and enlarged narrow light/dark accessibility with axe. Three visual scenarios
add choice screenshots; gallery and desktop Combobox baselines update the component
count and example navigation. Coverage measures owned source and adapters, not
Kobalte's internals or every supported combination.

## Verification

| Exact command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | Pass | 2.94 s |
| `bun run lint` | Pass | 1.30 s |
| `bun run test` | 147 passed | 3.13 s |
| `bun run test:coverage` | 147 passed; 100% statements/branches/functions/lines | 3.55 s |
| `bun run test:server` | 10 passed | 0.73 s |
| `RESULTS_FILE=docs/evidence/choices-hydration.json bun run test:hydration` | 90 passed | 48.92 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/choices-integration.json bun run test:integration` | 312 passed | 235.80 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/choices-e2e.json bun run test:e2e` | 279 passed; 24 images | 163.12 s |
| `python3 /tmp/audit-choices.py` | Pass; 681 quiet browser results, zero retries/skips, 24 baselines, 384 local links | 0.015 s |
| `git diff --check` | Pass | 0.075 s |

[Commands](evidence/choices-commands.json), [output](evidence/choices-verification.txt),
[coverage](evidence/choices-coverage.json), [hydration](evidence/choices-hydration.json),
[source integration](evidence/choices-integration.json), [built E2E](evidence/choices-e2e.json),
[review regression outcomes](evidence/choices-review-regressions.json),
[shared runtime resolution](evidence/choices-runtime.json), [evidence audit](evidence/choices-audit.json), [self-review](evidence/choices-review.json).

Exploratory runs found and corrected the form-owner binding and custom dark-color
issues above, and full-suite verification exposed the two existing blockers
described above. Focused source and hydration checks passed before the final gates.
Exploratory probes and screenshot generation were not separately timed; the table
records final measured checks. Browser phases run sequentially to avoid sharing
Playwright artifacts between simultaneous suites. Tests use 4403, the isolated
Kobalte fixture uses 4405, and the user's 4399 preview is preserved.

## DELIVERY.md disposition

| Criterion | Disposition |
| --- | --- |
| State has clear ownership | Controlled values remain canonical; callbacks request acceptance. Uncontrolled defaults are captured once; focus is separate from selection. |
| Every state is usable | Selected/unselected, single/multiple, disabled, readonly and rejected-owner states are exercised. Host children provide loading/empty/error content; no fake backend action is introduced. |
| Failures have a recovery path | Rejected changes preserve canonical radio and pressed state; explicit owner acceptance works. Radio resets honor cancellation. No network retry is owned. |
| Async work stays consistent | Reset timers settle after cancellation and are canceled on reassociation/disposal. No network request or duplicate-submission mechanism applies. |
| Platform boundaries hold | Browser UI only; no AppApi, desktop IPC, database, secrets or CI change. |
| Reactivity and cleanup are deliberate | Registration cleans up with item scopes; one reset listener follows requested form ownership; timers are disposed. No effect mirrors selected props. |
| Keyboard and assistive access work | Native radio labels, checked/pressed semantics, names, arrows, Space/Enter, disabled skipping and nested isolation are checked. Axe passes documented states. Physical AT and focused-node-removal recovery remain unverified/not implemented. |
| Appearance remains customizable | Canonical theme blocks unchanged; shared variants/sizes, logical RTL borders, custom colors, zero spacing and light/dark/narrow/enlarged layouts are checked. No separate unbroken-filename case applies to these examples. |
| Structure and performance fit the feature | Shared navigation, separate native/form and pressed-button contracts, per-component library import. Whole-batch gzip delta measured; no performance benchmark claimed. |
| Tests prove the behavior | Required package checks, strict unit coverage, SSR, real hydration, source integration and freshly built gallery E2E run. This is not admin or Electron E2E. |
| Delivery evidence is accurate | Exact measured commands, raw diagnostic reports, reviewed screenshots, dependency/size evidence, guide, matrix, catalog and lasting decision note are retained. |

Remaining limits: manual AT/touch and native validation-message UI; automatic focus
restoration after removing the focused item; external DOM relocation/form-node
replacement; empty form attributes warning in Firefox; toolbar-specific behavior;
polymorphism/asChild; runtime ToggleGroup type changes; arbitrary cross-library
composition; published/streaming SSR, admin/router/query integration and Electron.
