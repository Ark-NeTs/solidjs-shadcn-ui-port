# WebKit browser acceptance

2026-10-08. Adds WebKit to the normal source-integration and built-E2E projects,
and closes ALL-1 for Playwright WebKit 26.6 on macOS. Packaged Safari and physical
Apple devices remain outside this acceptance claim. Screenshots stay Chromium-only.

## What shipped, and what the build did that the plan didn't say

- Installed Playwright's matching WebKit build 2359 (`bunx --no-install playwright
  install webkit`) and added it to the existing configuration. No dependency pin,
  CI configuration, main branch or global browser preference was changed.
- Initial default-preference tests skipped native buttons during Tab navigation.
  A plain-HTML probe reproduced this with no components. A launch-only
  `-AppleKeyboardUIMode 2` restored button navigation. The macOS wrapper passes
  through all Playwright arguments, including transport and headed/headless
  choices; it delegates to the same installed browser executable. Other operating
  systems use the normal launcher. The first broad run was interrupted before
  its JSON report completed; its orphan port-4403 server was identified and stopped.
- Links remain subject to WebKit's distinct keyboard preference. Link scenarios
  use native Option-Tab / Option-Shift-Tab on macOS WebKit, as documented by
  [Apple](https://support.apple.com/en-lamr/guide/safari/cpsh003/mac).
  The [native keyboard probe](evidence/webkit-keyboard-probe.json) confirms this
  gesture and shows that pointer clicks do not focus native buttons. A trial
  `WebKit2TabsToLinks` argument did not change that behavior and is not used.
  The button navigation issue is also reported in
  [Playwright issue 41808](https://github.com/microsoft/playwright/issues/41808).
- The first complete configured run passed 71/85 source scenarios. Four nested
  Alert Dialog cases failed when WebKit accepted programmatic focus into the
  underlying parent dialog. [Comparative diagnostics](evidence/webkit-differences-probe.json)
  recorded Chromium retaining child focus and WebKit allowing the parent input.
- Fixed modal containment in the shared layer helper. A document-scoped owner
  stack lets only the newest modal remember/reclaim focus. A connected, enabled
  previous target is restored; otherwise the modal receives focus. A reentrancy
  guard prevents feedback. Cleanup removes the listener and stack entry before
  native close and focus restoration. REASONING: retain native modality while
  enforcing the exact focus contract already tested in the other engines. There
  is no browser-name branch in component code. The new unit regression covers
  nested ownership, removal of the remembered target, close and unmount cleanup.
- Two Combobox failures came from filling inputs outside the viewport: Chromium
  scrolled them into view as a side effect of focus, while WebKit left them off
  screen. The tests now explicitly scroll those inputs into view before filling;
  option selection still uses real pointer clicks. Placement source is unchanged.
- Native pointer focus differs too. The Popover outside-button check requires
  body focus on macOS WebKit and focus on the clicked button in the other tested
  engines; it also clicks an outside input and requires that input to keep focus
  in every engine. External Tabs mutations use focused controls and Enter so the
  scenario tests focus preservation independently of native mouse focus policy.
- Six link failures used the wrong native gesture; the shared gesture helper
  fixes those without skipping any disabled-link, focus-ring or navigation
  assertions. No component gets extra tabindex or pointer-focus behavior.
- The corrected WebKit source run passed all 85 scenarios before the final
  three-engine gates. Review then consolidated the link gesture helper and
  strengthened the outside-dismissal assertions. Final gates cover these edits.

## Acceptance checklist

| DELIVERY.md criterion | Evidence / disposition |
| --- | --- |
| State has clear ownership | Existing owners retain open/draft/selection state. The guard stores only modal order and last focus target; no duplicated application state. |
| Every state is usable | Existing pending/error/empty/disabled/controlled and remount scenarios now execute in WebKit. No new product action or state was added. |
| Failures have a recovery path | Existing rejected-action, validation and retry journeys run in the new engine. Escaped modal focus returns to the current modal. No remote write is introduced. |
| Async work stays consistent | Existing stale-position, canceled-reset, detached-owner and Loading late-resolution checks run in three engines. Focus correction is synchronous and adds no deferred work. |
| Platform boundaries hold | Web DOM only in production. The test-only macOS wrapper affects its child process; no global/Safari defaults, AppApi, IPC or backend changes. |
| Reactivity and cleanup are deliberate | One focusin listener per open modal and a per-document stack; effect cleanup removes both before close. Reentrancy is guarded. Unit/browser diagnostics remain strict. |
| Keyboard and assistive access work | Native keyboard gestures exercise exact focus, form, link and overlay contracts. Nested background-focus leakage is fixed. Automated axe runs in WebKit; physical AT remains unrun. |
| Appearance remains customizable | All existing theme, geometry, narrow/enlarged, reduced-motion and clipping scenarios run in WebKit. Fifteen Chromium baselines remain unchanged. No WebKit pixel baseline or Safari/device visual claim. |
| Structure and performance fit the feature | Shared test scenarios and a bounded modal-owner stack; no data layer or new dependency. No performance/heap benchmark claim. |
| Tests prove the behavior | Fresh gates below include all three browser engines against source and built exports, plus unit/coverage/SSR. Unit regression adds one test for containment/disposal. |
| Delivery evidence is accurate | Initial configured failures, native/comparative probes, corrected WebKit run and final results retained. README, guide, matrix and DECISIONS.md updated; historical reports remain unchanged. |

## Verification

| Command | Result | Time |
| --- | --- | ---: |
| `bun run check` | Pass | 2.63 s |
| `bun run lint` | Pass | 1.29 s |
| `bun run test` | 101 passed | 2.62 s |
| `bun run test:coverage` | 100% statements / branches / functions / lines | 2.68 s |
| `bun run test:server` | 6 passed | 0.68 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/webkit-integration.json bun run test:integration` | 255 passed; no skips, failures or retries | 214.05 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/webkit-e2e.json bun run test:e2e` | 213 passed; includes 12 Chromium visual tests | 121.25 s |

All 468 browser runs attached empty warning/error/page-error diagnostics. The 12
visual tests compare 15 unchanged Chromium baselines. Coverage includes 1,201
statements, 687 branches, 481 functions and 371 lines. Times are measured wall
clock for each full command, including build/server setup where applicable.

[Command timings](evidence/webkit-commands.json), [output](evidence/webkit-verification.txt),
[source integration](evidence/webkit-integration.json),
[built E2E](evidence/webkit-e2e.json), [coverage](evidence/webkit-coverage.json).

The initial and corrected WebKit-only commands were
`THEME_PORT=4403 RESULTS_FILE=docs/evidence/webkit-configured.json bunx --no-install playwright test tests/integration --project=webkit`
and the same command with `RESULTS_FILE=docs/evidence/webkit-corrected.json`.
Their [initial](evidence/webkit-configured.json) and
[corrected](evidence/webkit-corrected.json) reports contain Playwright durations.
The launch attempts rejected by argument validation and the port conflict after
interruption did not execute tests; no browser failure was suppressed or retried
blindly. Installation/probe wall-clock durations were not separately measured.

Probe commands: `node docs/evidence/webkit-keyboard-probe.mjs` and
`node docs/evidence/webkit-differences-probe.mjs`. The
[keyboard source](evidence/webkit-keyboard-probe.mjs) uses native HTML only;
[component probe](evidence/webkit-differences-probe.mjs) expects the isolated
source server on 4403. Its retained JSON is the pre-fix comparison; fixed behavior
is asserted by the final browser tests. Short delays in that diagnostic probe
are sampling windows, not acceptance-test waits.

## Limits and next step

ALL-1 is closed for the existing scenario inventory on this macOS host. This does
not certify every component state, Linux/Windows WebKit, packaged Safari, iOS,
touch input, WebKit pixel parity, manual assistive technology, physical IME,
hydration, application/Electron integration or memory/performance behavior.
The modal guard covers layers managed by this package; interaction with unrelated
third-party modal managers is not separately verified. No root-workspace or
Electron gate was run. Browser installation and preference probing are local
setup, not changes to CI.

Next is ALL-2: hydrate server-rendered components, then verify live IDs, form
values, selected panels and overlay interactions.
