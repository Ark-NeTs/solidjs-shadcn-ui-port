# Input, Textarea and Label delivery — 2026-10-07

Historical report for commit `a916220`. Current screenshots and inventory include
the next increment; see [TOGGLES-DELIVERY.md](TOGGLES-DELIVERY.md).

Committed the preceding foundation and compatibility evidence as **`b82f86c`**
(`feat(solid-theme): implement tested component foundation`). This next batch
implements Input, Textarea and Label. The owner subsequently requested committing
this batch.
The package now provides eight components, including all seven Card parts.

The new components preserve native DOM props, refs, events and Solid 2 reactive
updates, expose typed source subpaths and barrel exports, and reproduce the
sibling React class strings exactly. Kobalte TextField was evaluated first; its
contextual composition does not need to replace these standalone native fields.
No dependency or lockfile changed. See [DECISIONS.md](../project/DECISIONS.md).

## Behavior and evidence

- Input: native type changes, text/email/password/file attributes, value and
  defaultValue, validation, refs/events, controlled updates and disabled/read-only
  behavior. File selection uses an in-memory fixture; no upload is implemented.
- Textarea: multiline controlled editing, native dimensions/maxlength, refs/events,
  default values, required validation, disabled state and form reset.
- Label: explicit `for` association, accessible names, label click-to-focus,
  reactive association/text, native ref/events and class overrides.
- Composition: failed native validation preserves drafts; successful local submit
  reads FormData. Repeated reset restores both the uncontrolled email field and
  controlled textarea, its character counter and the empty status. Error removal
  preserves the entered reference. The controls introduce no domain state.
- Appearance/accessibility: light and dark galleries, invalid states, keyboard
  focus rings, disabled tab exclusion, long text/file names and enlarged text at
  390px. All 20 browser integration cases and 11 built-library E2E cases pass;
  all browser cases reject console warnings/errors and page errors. Axe reports
  zero violations in light/dark default and invalid-state galleries in both
  Chromium and Firefox.

The first E2E run caught the browser clearing a controlled textarea after its
reset handler ran. The example now supplies a matching native `defaultValue`
reset baseline alongside the controlled `value`, and resets its signal in
`onReset`. The next run exposed an incorrect test expectation (36 characters
instead of 37), corrected without changing the behavior. Both earlier failure
reports are retained; final passing results supersede them.

## Fresh commands

All commands ran from this package on Bun 1.4.2 / Node 25.3.0 with the existing
exact Solid/web/signals 2.0.0-rc.13 toolchain. Times are measured wall-clock seconds.

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | Passed | 1.398 s |
| `bun run lint` | Passed | 0.741 s |
| `bun run test` | 31 passed | 1.373 s |
| `bun run test:coverage` | 31 passed; all thresholds passed | 1.248 s |
| `bun run test:server` | 2 server-rendering tests passed | 0.620 s |
| `bun run build` | ESM, declarations and CSS built | 1.000 s |
| `bun run parity:report` | Report updated; 6 of 14 imported subpaths still have missing exports | 0.208 s |
| `RESULTS_FILE=/private/tmp/form-fields-integration.json bun run test:integration` | 20 passed, Chromium + Firefox | 23.008 s |
| `RESULTS_FILE=/private/tmp/form-fields-e2e.json bun run test:e2e` | 11 passed: 8 journeys + 3 screenshot comparisons | 11.268 s |

E2E builds the library and playground freshly and aliases UI imports to the
built library. Integration exercises source JSX. Screenshot baselines were
regenerated with `RESULTS_FILE=/private/tmp/form-fields-baselines.json bun run
test:e2e --update-snapshots=all`, reviewed in light/dark/mobile, and then compared
without update mode in the final passing run. The baseline-generation run had
two reset failures and is not counted as acceptance. The screenshots include
loading placeholders and invalid-field presentation. They are Solid gallery
regressions, not cross-framework pixel comparisons.

Coverage is **100% statements (114), branches (50), functions (52) and lines
(62)** across the eight delivered component files and `cn`. This is measured
executable-source coverage, not full-catalog or every-browser-behavior coverage.
There are no skipped, retried or expected-failure cases in the final runs.
Node tooling emits its existing NO_COLOR/FORCE_COLOR environment warning; this
is distinct from the zero browser-console diagnostics checked by the fixture.

Evidence: [commands](../evidence/form-fields-commands.json),
[browser commands](../evidence/form-fields-browser-commands.json),
[check/test/build output](../evidence/form-fields-verification.txt),
[browser output](../evidence/form-fields-browser-verification.txt),
[coverage](../evidence/form-fields-coverage.json),
[integration](../evidence/form-fields-integration.json),
[E2E](../evidence/form-fields-e2e.json),
[initial reset failures](../evidence/form-fields-reset-before.json), and
[character-count assertion failures](../evidence/form-fields-count-before.json).
The package ignore rules now retain evidence text files despite the repository's
broad `*.txt` ignore, including the earlier foundation's verification output.

## DELIVERY.md review

| Criterion | Result and boundary |
| --- | --- |
| State ownership | Components only forward reactive props; drafts, errors and preview status belong to the playground. No backend-confirmed data exists. |
| Usable states | Empty/filled, required/invalid, disabled/read-only, file input, default/controlled values and reset demonstrated. Existing loading/pending examples still pass. |
| Recovery | Validation blocks submission without discarding drafts; error clearing and repeated form reset tested. Backend rollback/read retries do not apply. |
| Async consistency | No async request, mutation, upload or subscription was added. Prior pending/ready E2E remains passing; network races do not apply. |
| Platform boundaries | No desktop, IPC, AppApi or privileged access is introduced. This is a browser component package; Electron checks do not apply. |
| Reactivity/cleanup | Signal-driven values, IDs, classes, state and label text update without replacing fields. No effects, timers or observers were added; owner cleanup stays enabled in tests. |
| Keyboard/assistive access | Native focus/navigation, labels/descriptions, visible focus rings, disabled restrictions and light/dark axe checks pass. Physical screen-reader testing was not performed. |
| Appearance/customization | Exact reference class strings and canonical theme blocks tested. Class overrides, semantic tokens, narrow/enlarged text, long file names, light/dark and reviewed screenshots covered. No portals exist in this batch. |
| Structure/performance | Native behavior stays in the platform; domain state stays in examples. No new dependency and no runtime performance claim. |
| Tests | All six checklist commands pass freshly, plus coverage/build. Root all-workspace checks, WebKit, hydration, physical mobile keyboards/autofill and app/Electron integration were not run. |
| Evidence/decisions | This report, component map, implementation plan, specs, decisions, docs, screenshots and admin inventory updated. DELIVERY.md is unchanged. |

## Remaining scope

Full admin parity remains incomplete: Alert Dialog, Checkbox, Combobox, Popover,
Switch and Tabs imports still have missing exports. `parity:admin` is a future
strict gate and was not run or represented as passing. No hook, contextual Field
provider, arbitrary `as`/`asChild`, application migration or new headless
primitive is included. The existing Kobalte findings remain open for later
components. Server rendering tests compile the source; the built ESM is still
the browser bundle, not a separate SSR bundle.

Next, implement the next form-control batch, starting with Checkbox and Switch.
