# Restaurant admin composition — 2026-10-09

The Solid playground now includes `/?admin-menu`: a twelve-item restaurant menu
with sorting, filtering, selection, pagination and a row editor. The editor
composes Dialog, Select, Input, Textarea, Field/Label, Checkbox, Switch, Button,
Badge and Card through public package exports. The task stays within this package;
it does not migrate the real admin application.

## Ownership, behavior and fixes

An injected `MenuApi` keeps confirmed records separate from drafts and request
state. The local demo service can accept, reject once or delay a save. Name,
decimal-price and notes validation happens before submitting; prices become
integer cents. Failed saves preserve drafts and leave confirmed rows unchanged.
Reset and Cancel discard draft changes. Retry is explicit, never automatic.

A synchronous request guard prevents duplicate saves even before Solid commits
its pending signal. Pending fields, reset/cancel actions and Escape are disabled.
Read generations prevent stale responses from replacing newer records or an
active editor; disposal aborts outstanding requests and ignores late responses
even when an injected service ignores cancellation. Tests use deferred promises
to establish these outcomes without relying on a timeout race.

The composition and full browser verification exposed and fixed three issues:

- Replacing table data can replace the cell's Edit button. Returning focus to the
  old button lost focus after save. The example now finds the current action by
  stable row ID after reconciliation, or the filter when that row is filtered out.
- Native dialog opening/closing dispatches `focusin` synchronously inside a Solid
  effect. Select's outside-focus handler then read uncontrolled state from that
  effect callback. The handler now explicitly snapshots its event-time state with
  `untrack`, matching its imperative dismissal purpose. Strict diagnostic checks
  remain enabled; no warning is filtered or threshold relaxed.

- The full table suite exposed `WASTED_RECOMPUTE`: one shared uncontrolled-state
  signal woke every state-slice memo on selection and pagination changes. Each
  slice now has an independent signal and equality boundary. A unit regression
  counts reads of controlled column visibility while unrelated slices change;
  selection/pagination updates no longer recompute it. Partial reset defaults and
  existing controlled ownership are retained.

[Captured initial browser failure and warning call stacks](evidence/admin-menu-initial-failure.json)
preserve the focus issue. Select's outside-event snapshot and Data Table's
state-source boundaries change library runtime;
all application validation, persistence simulation and focus lookup live in the
playground. Kobalte was evaluated first for these existing primitives; the prior
library routing decisions and dependency versions are unchanged.

## Verification

Commands ran from `packages/shadcn-solidjs-theme`. Main-gate durations are
measured whole-command wall times; browser servers used port 4403, preserving
the interactive preview on 4399.

| Exact command | Result | Time |
| --- | --- | ---: |
| `bun run check` | Passed | 4.399 s |
| `bun run lint` | Passed | 2.005 s |
| `bun run test` | 389 passed | 7.218 s |
| `bun run test:server` | 25 passed | 1.261 s |
| `bun run test:coverage --coverage.reporter=json-summary --coverage.reporter=text --maxWorkers=2` | 100% statements, branches, functions and lines | 19.676 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/admin-menu-hydration.json bun run test:hydration --max-failures=1` | 135 passed across three engines (three negative controls) | 118.082 s |
| `THEME_PORT=4403 THEME_PRODUCTION=1 RESULTS_FILE=docs/evidence/admin-menu-visual.json bunx playwright test tests/e2e/admin-menu/visual.spec.ts --max-failures=1` | 3 passed; six existing images matched | 7.652 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/admin-menu-integration.json bun run test:integration --max-failures=1` | 630 passed across three engines | 628.006 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/admin-menu-e2e.json bun run test:e2e --max-failures=1` | 642 passed across three engines; Chromium visual comparisons | 498.514 s |

[Raw command results](evidence/admin-menu-commands.json),
[coverage](evidence/admin-menu-coverage.json),
[hydration](evidence/admin-menu-hydration.json),
[source browser results](evidence/admin-menu-integration.json),
[built E2E results](evidence/admin-menu-e2e.json) and
[focused visual comparisons](evidence/admin-menu-visual.json).
All final browser reports have zero skipped, unexpected or flaky cases.
The built runs include a fresh library build and playground build. Their existing
all-components chunk-size advisory remains; no bundle-size limit was changed.
All six new images were visually inspected; existing baselines were compared,
not regenerated, after the table repair. Full diff review, whitespace and local
Markdown-link checks passed.

Two diagnostic probes are also retained. Times below are Playwright-reported
suite durations, including its server startup, rather than separately timed CLI
wall time:

| Exact command | Result | Time |
| --- | --- | ---: |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/admin-menu-choice-repeat.json bunx playwright test tests/integration/choices.spec.ts --project=firefox --grep 'radio form reassociation' --repeat-each=10 --max-failures=1` | 10 passed | 28.666 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/admin-menu-table-repeat.json bunx playwright test tests/integration/catalog-data-table.spec.ts tests/integration/admin-menu.spec.ts --project=firefox --repeat-each=3 --max-failures=1` | 36 passed | 70.756 s |


The first all-worker coverage run exceeded the existing five-second timeout in
an unrelated TypeScript export audit. Running coverage with two workers passed
all 388 then-existing tests and unchanged 100% thresholds. The [initial command report](evidence/admin-menu-initial-commands.json)
retains that failure. No timeout, test or coverage threshold was changed.

The first full source-browser run reached 306 passing cases before Firefox emitted
`HOT_SCOPE_TIME` for unchanged Toggle Group code (12.0 ms against its 8 ms budget).
[Original full-run results](evidence/admin-menu-first-full-integration.json) preserve
the finding. The same unchanged case passed [ten isolated Firefox repetitions](evidence/admin-menu-choice-repeat.json)
with the diagnostic budget intact; no Toggle Group change was made. The final
full-suite rerun is recorded separately. This remains an intermittent performance
finding, not a diagnosed or repaired Toggle Group defect.

A second full source run exposed the table recomputation finding described above;
[its original results](evidence/admin-menu-second-full-integration.json) are retained.
The table repair addresses the shared-state dependency that triggered the finding.

## DELIVERY checklist

| Criterion | Evidence and scope |
| --- | --- |
| State ownership | `createAdminMenu` owns confirmed rows, separate draft, validation and request state; Data Table owns its local view models. No query/cache transport enters the component package. |
| Usable states | Ready rows, filtering with no results, pending refresh/save, rejected save/refresh and explicit recovery are exercised in the browser. |
| Recovery | Rejection retains the edited draft and confirmed table row; explicit retry applies the accepted record. Reset/Cancel and opening a different row restore its own confirmed values. |
| Async consistency | Same-turn duplicate guard, disabled pending actions, out-of-order reads and settlement after disposal are asserted. Outstanding operations receive AbortSignal. |
| Platform boundaries | Injected playground `MenuApi` with an in-memory simulator; no IPC, desktop globals, credentials or real backend mutation. Actual AppApi/Electron integration is outside this task. |
| Reactivity and cleanup | Strict browser diagnostics; Select event snapshot and Data Table state-source fixes; abortable delay removes timers/listeners; disposed owners ignore late success/failure. |
| Keyboard and access | Enter opens the editor; first invalid field receives focus; nested Select preserves the Dialog; pending Escape is rejected; save/cancel return focus to the current row action or filter. Axe covers both themes at enlarged mobile text. |
| Customizable appearance | Shared semantic tokens; light/dark/mobile table and editor baselines; 390px layouts with 24px root text remain within document bounds, with intentional internal table scrolling. |
| Structure/performance | Draft validation and service boundary are outside JSX; immutable records and stable IDs. Twelve representative records are a composition test, not a large-dataset performance claim. |
| Tests | Unit state/race assertions, SSR with no service calls, actual hydration followed by interaction, three-engine source/built journeys and Chromium visual baselines. |
| Delivery evidence | Exact command outcomes/durations, initial failure evidence, screenshots and acceptance matrix recorded; lasting focus-event decision documented in DECISIONS.md. |

## Limits and next adoption step

The demo API is deliberately local and deterministic. It does not verify real
network uncertainty, concurrent editors/version conflicts, authentication,
router/query caches, desktop IPC or Electron. A real backend must define whether
a failed response means a rejected or uncertain write; blindly retrying an
uncertain mutation is not the behavior demonstrated here. Physical devices and
manual assistive-technology navigation were not tested. Component/helper code
coverage does not certify all application-state or accessibility combinations.

This advances the package composition portion of ALL-5; it does not close actual
admin application adoption. The next step is to connect this recipe to the chosen
admin AppApi contract with explicit conflict and uncertain-save recovery.
