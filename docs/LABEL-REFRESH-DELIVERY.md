# Label reassociation cache refresh

2026-10-08. Closes LBL-1's Firefox accessible-name follow-up for reactive `for`
and corresponding target-ID changes. Source and built browser suites now assert
names in both engines. The earlier [native field report](NATIVE-FIELDS-DELIVERY.md)
remains a record of the original failure and scope at that time.

## What shipped, and what the build did that the plan didn't say

- A plain-HTML probe compared no mutation, a temporary comment/text child, a
  parent comment, rewriting the target ID and changing the label title. In the
  tested Firefox 155 build, child-list changes refreshed stale collections;
  attribute rewrites did not. Chromium 153.0.8010.12 stayed correct throughout.
  The successful comment probe preserved nested child identity, editor focus,
  selected text and the draft. No framework was involved in that comparison.
- Label now observes its mounted ref and reactive `for` in a DOM effect. It checks
  whether the previous target still lists the label despite no longer owning it,
  or whether the current target omits it. Only an actual disagreement triggers a
  temporary comment insertion/removal. Healthy collections receive no mutation.
- REASONING: a transient child-list mutation invalidates the stale native cache
  without removing/reinserting the label or caller-owned content. Browser-native
  association and accessible naming remain authoritative; there is no user-agent
  check, generated naming ID or ARIA override.
- The effect remembers the previous target and disposes with the component. There
  is no timer, observer, global registry or document scan. SSR does not run the
  DOM effect. Public callback refs retain the same label node and run once.
- Removed the Chromium-only name branches. Both engines assert names after
  moving the label, renaming the textarea ID, and moving the label back.
- Added a repeated-editing browser scenario: F2 changes the example's association
  while the textarea retains focus. Four moves preserve the selected range,
  draft, label node and nested span, and leave no marker behind. F2 belongs to
  the fixture, not the Label API.
- Added three unit executions for stale old/new collections, healthy/missing
  targets, removed associations, ref/content/focus/selection preservation and
  disposal. jsdom does not have the native cache defect, so these unit cases
  simulate stale collections; actual Firefox behavior is covered in browser.

No public API, dependency, style or component-mapping change. Kobalte adoption is
unchanged. [DECISIONS.md](project/DECISIONS.md) records the narrowly scoped workaround.

## Acceptance checklist

| DELIVERY.md criterion | Evidence / disposition |
| --- | --- |
| State has clear ownership | The parent owns `for` and field drafts. Label remembers only its previous native target to detect stale membership; no mirrored name/draft state. |
| Every state is usable | Existing, reassociated, renamed, removed/missing and disabled/re-enabled targets are checked. Network loading/error states are N/A. |
| Failures have a recovery path | A detected stale collection refreshes immediately in the committed DOM effect. Healthy collections remain untouched; field drafts are preserved. |
| Async work stays consistent | No deferred task or request. Unit disposal prevents later prop changes from causing mutations on the removed component. |
| Platform boundaries hold | Native web DOM only. AppApi, IPC, backend and desktop changes are N/A. |
| Reactivity and cleanup are deliberate | A component-owned DOM effect follows ref/for changes. No observers, event subscriptions or pending timers. Diagnostics stay enabled. |
| Keyboard and assistive access work | Both engines now assert live computed names and label focus. Repeated changes preserve editing focus and selection. Physical assistive technology remains unrun. |
| Appearance remains customizable | No CSS or persistent DOM change. Existing light/dark/mobile/enlarged checks and 12 screenshot comparisons pass without baseline updates. No filename/portal handling change. |
| Structure and performance fit the feature | Feature detection is local to old/new native target collections. No performance claim; no browser version gate or global mutation monitor. |
| Tests prove the behavior | Existing reassociation assertions now run in both engines; one new scenario adds four source/built executions. Three unit executions cover refresh and lifecycle branches. |
| Delivery evidence is accurate | Native probe, focused results, final commands/timings and coverage retained. Matrix closes LBL-1; guide explains limits. Historical failure reports and DELIVERY.md remain unchanged. |

## Verification

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | TypeScript passes | 2.07 s |
| `bun run lint` | ESLint passes | 1.04 s |
| `bun run test` | 100 unit tests pass | 2.73 s |
| `bun run test:coverage` | 100% statements/branches/functions/lines | 2.64 s |
| `bun run test:server` | 6 SSR tests pass | 0.70 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/label-refresh-integration.json bun run test:integration` | 152 integration runs pass (76 scenarios × 2 engines) | 119.66 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/label-refresh-e2e.json bun run test:e2e` | 125 E2E runs pass (58 journeys × 2 engines + 9 visual tests) | 68.61 s |
| `node docs/evidence/label-refresh-probe.mjs` | 12 native mutation comparisons recorded | 3.43 s |

[Commands](evidence/label-refresh-commands.json),
[output](evidence/label-refresh-verification.txt),
[source integration](evidence/label-refresh-integration.json),
[built E2E](evidence/label-refresh-e2e.json),
[coverage](evidence/label-refresh-coverage.json),
[restored name checks](evidence/label-refresh-focused.json), and
[repeated editing checks](evidence/label-refresh-editing.json).
Durations include startup. E2E freshly builds package JavaScript/CSS, declarations
and the gallery. Nine visual tests compare 12 unchanged images. Final browser
diagnostic attachments are empty. Source execution coverage is 100% in all four
metrics; this does not certify every behavior or browser. Runner color-mode
notices remain separate from application diagnostics.

[Native mutation probe](evidence/label-refresh-probe.json) and
[reproducer](evidence/label-refresh-probe.mjs), with
[command/timing](evidence/label-refresh-probe-command.json), preserve the alternatives and their
focus/selection results. The probe records browser behavior as data, including
the still-broken no-mutation baseline; it is not a component acceptance gate.

## Remaining scope and tradeoffs

The refresh covers component-owned reactive `for` updates. Arbitrary external DOM
rewrites, changes only to a target ID without a corresponding `for` update,
shadow-root/custom-element associations, WebKit, hydration, physical AT,
application/Electron/root-workspace integration and measured performance remain
unverified. Consumers observing child-list mutations can see the temporary comment
insertion/removal. No caller node is moved or removed. Next general component
checks are CRD-1/SEP-1: compact/long-content Card layout and vertical Separator
appearance.
