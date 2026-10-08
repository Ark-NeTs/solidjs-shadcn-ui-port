# Native Input, Textarea and Label verification

2026-10-08. INP-1 and TXT-1 are complete for the documented scenarios. LBL-1's
native click targeting passes; **Firefox live accessible-name reassociation
remains open**. Ten shared browser scenarios run through source and freshly built
exports in Chromium and Firefox. See the [matrix](TEST-MATRIX.md#input).

## What shipped, and what the build did that the plan didn't say

- Added the [public-export preview](../playground/native-fields.tsx) at
  `/?native-fields`, with `&textarea` and `&labels` views. It uses real forms,
  native validation, FormData and uncontrolled defaults. Owner signals control
  read-only/disabled state and label association, not browser field values.
- Number Input checks required/min/max/step rejection, focus on invalid submit,
  keyboard increments, recovery, serialization and reset. Date/time/datetime-local
  check native types, maximum-bound rejection, recovery, string serialization and
  reset; no date-picker interaction or locale conversion is claimed.
- Range checks ArrowRight/Home/End/ArrowLeft, endpoint clamping, submission and
  reset. Text/search/tel/url/password/email preserve edits, submit their native
  strings and reset; URL/email additionally reject type mismatches. The password
  is a fixed synthetic test value. Existing file-input checks rerun.
- Read-only Textarea accepts focus but rejects typing, scrolls internally with
  actual wheel input, submits its value and accepts edits after unlocking.
  Desktop and 390px/24px-root-font cases drag the native resize handle, assert a
  height increase with stable width/value, no document overflow and usable editing.
  The fixture explicitly uses `field-sizing-fixed h-28 max-h-72 resize-y overflow-auto`;
  it does not certify every auto-growing default configuration.
- Label moves between the same edited Input/Textarea, tracks a renamed textarea
  ID, cannot focus a disabled target and resumes activation after enabling. Drafts
  and control identities survive. Chromium also asserts live accessible names.
- Initial Chromium failure came from Playwright's action guard refusing to click
  a label associated with a disabled target. The final test uses real pointer
  coordinates for that deliberate nonactivation check; no component fix was needed.
- Initial Firefox failure was an empty accessible name after reassociation despite
  correct click focus. A plain-HTML probe reproduced stale native `labels`
  collections once both controls had been queried before changing `for`.
  Property assignment, setAttribute, and remove/reapply all reproduced it;
  removing/reinserting the label invalidated the collections. Chromium passed
  every method. The earlier probe without priming the second collection reported
  the new target's name correctly but retained the old target's label.
- No component implementation changed. REASONING: the failure reproduces without
  Solid and native label.control/click targeting is correct. Imperative label
  removal/reinsertion solely to invalidate a browser collection would introduce
  a new component lifecycle policy. This batch records the limitation instead.
  Updated-name assertions run only in Chromium; Firefox targeting assertions
  are not represented as accessible-name or screen-reader acceptance.

No dependency, public API, theme, mapping or architecture change. Existing unit
contracts remain, without adding duplicate tests for browser-native validation.
Kobalte adoption and DECISIONS.md remain unchanged.

## Acceptance checklist

| DELIVERY.md criterion | Evidence / disposition |
| --- | --- |
| State has clear ownership | Browser owns uncontrolled values and constraints; the fixture owns submitted previews, availability and association. No duplicate field draft state. |
| Every state is usable | Invalid/valid/reset input, read-only/editable/scrolled/resized textarea and reassociated/disabled label targets pass the named cases. Network states are N/A. |
| Failures have a recovery path | Invalid submission retains edits; corrected values submit; native reset restores defaults. Enabling the textarea restores editing/label activation. No network retries. |
| Async work stays consistent | No async request or mutation is introduced. Native default actions remain browser-owned. Existing package lifecycle regressions rerun. |
| Platform boundaries hold | Public web exports/local previews only. No AppApi, IPC, backend, privileged commands or Electron changes. |
| Reactivity and cleanup are deliberate | Existing reactive native props handle association/state; no new component effects, subscriptions, timers or observers. Diagnostics stay enabled. |
| Keyboard and assistive access work | Numeric/range keys, invalid-submit focus, read-only rejection and label activation pass. **Partially met:** Firefox live accessible-name reassociation is open; physical AT is unrun. Chromium name checks pass. |
| Appearance remains customizable | No production CSS change; caller classes provide bounded resize/scroll. Actual desktop/narrow-enlarged geometry and existing light/dark/mobile visual comparisons pass without baseline updates. |
| Structure and performance fit the feature | Shared scenario registration verifies both export modes; a separate plain-HTML probe isolates engine behavior. No performance claim. |
| Tests prove the behavior | Ten scenarios add 40 executions across engines/export modes. Name assertions are explicitly Chromium-only, not universal acceptance. Fresh package gates below. |
| Delivery evidence is accurate | Initial failures/probes and final reports retained; matrix/guide show the remaining Firefox gap and type boundaries. DELIVERY.md stays unchanged. |

## Verification

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | TypeScript passes | 2.07 s |
| `bun run lint` | ESLint passes | 1.12 s |
| `bun run test` | 97 unit tests pass | 2.54 s |
| `bun run test:coverage` | 100% statements/branches/functions/lines | 2.71 s |
| `bun run test:server` | 6 SSR tests pass | 0.72 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/native-fields-integration.json bun run test:integration` | 150 integration runs pass (75 scenarios × 2 engines) | 118.49 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/native-fields-e2e.json bun run test:e2e` | 123 E2E runs pass (57 journeys × 2 engines + 9 visual tests) | 71.79 s |
| `node docs/evidence/native-fields-label-repro.mjs` | Reproduces Firefox cached-label limitation; diagnostic, not an acceptance pass | 4.25 s |

[Commands](evidence/native-fields-commands.json),
[output](evidence/native-fields-verification.txt),
[source integration](evidence/native-fields-integration.json),
[built E2E](evidence/native-fields-e2e.json),
[coverage](evidence/native-fields-coverage.json),
[initial failures](evidence/native-fields-initial.json), and
[corrected focused suite](evidence/native-fields-focused.json).
Durations include startup. E2E freshly builds JavaScript/CSS, declarations and the
gallery. Nine visual tests compare 12 unchanged images. Final browser diagnostic
attachments are empty; runner color-mode notices are not application diagnostics.
Source coverage remains 100% in all four metrics, not exhaustive behavior coverage.

[Initial plain-HTML probe](evidence/native-fields-label-probe.json),
[cached-collection probe](evidence/native-fields-label-cached-probe.json),
[reproducer](evidence/native-fields-label-repro.mjs), and
[probe command/timing](evidence/native-fields-label-repro-command.json). The saved
probe records Chromium 153.0.8010.12 and Firefox 155.0. It reports observed
failures as data; it is not a passing accessible-name regression test. No warning
or error is suppressed in the component test fixture.

## Remaining scope

LBL-1 remains open for Firefox accessible names after live reassociation. The
probe does not establish the platform accessibility tree or physical screen-reader
behavior. Browser picker UI, month/week/color/hidden, other forwarded input types,
autofill/password managers, physical IME, WebKit, hydration, app/Electron/root
workspace integration and measured performance were not run. Native number/date
formatting and timezone/picker combinations are not exhaustively covered.
Next general component checks are CRD-1/SEP-1: compact/long-content Card layout
and vertical Separator appearance, while preserving the open Firefox limitation.
