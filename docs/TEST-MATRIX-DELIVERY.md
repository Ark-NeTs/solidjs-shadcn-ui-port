# Component test matrix delivery

2026-10-08. Documentation audit of the 14 delivered component families against
source/test commit `314f27a`. The [matrix](TEST-MATRIX.md) maps acceptance
requirements to actual assertions, separates test layers, and registers missing
checks. No runtime behavior, test implementation, dependency, or screenshot
baseline changed; this task adds no behavioral coverage.

README, the component guide and catalog link to the matrix. Package AGENTS.md
requires agents to maintain it with component changes. The matrix describes
current acceptance evidence more narrowly than earlier delivery summaries where
those summaries used broad labels such as “IME” or “SSR coverage.” Historical
reports remain records of their original runs.

## Acceptance checklist

| DELIVERY.md criterion | Disposition for this documentation change |
| --- | --- |
| State has clear ownership | No state changed. Matrix distinguishes owner-controlled values, interaction state and example-owned async state. New UI acceptance N/A. |
| Every state is usable | No UI state added. Missing state/layer checks are explicit gaps, not accepted behaviors. |
| Failures have a recovery path | No recovery logic changed. Existing rejection/reset/retry assertions are linked with their limits. Backend fault injection is not claimed. |
| Async work stays consistent | No async work changed. Matrix separates mocked cleanup/stale-result assertions from unverified browser and network scenarios. |
| Platform boundaries hold | No runtime or platform changes. AppApi, IPC and Electron requirements are N/A to this package documentation task. |
| Reactivity and cleanup are deliberate | No reactive code changed. Diagnostic fixtures and unit/browser cleanup evidence are linked; SSR diagnostic fixture absence is disclosed. |
| Keyboard and assistive access work | No interaction changed. Specific keyboard/focus and axe checks are linked; manual assistive technology and untested focus boundaries remain open. |
| Appearance remains customizable | No styles or baselines changed. Existing visual comparisons rerun; per-component visual limits, narrow/enlarged tests and missing variant states are recorded. |
| Structure and performance fit the feature | One maintained matrix links existing tests without duplicating them. No runtime/performance claim or architecture decision; DECISIONS.md update N/A. |
| Tests prove the behavior | Required package gates rerun below. Link audit checks paths and test declaration anchors; source assertions were read to establish the claims. No new regression test is needed for unchanged runtime code. |
| Delivery evidence is accurate | Exact measured commands and results retained below. DELIVERY.md unchanged; matrix gap register is the acceptance backlog. Unrun gates are explicit. |

## Verification

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | TypeScript passes | 2.35 s |
| `bun run lint` | ESLint passes | 1.06 s |
| `bun run test` | 80 unit tests pass | 2.76 s |
| `bun run test:coverage` | 100% in all four coverage metrics | 4.96 s |
| `bun run test:server` | 6 SSR tests pass | 0.71 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/test-matrix-integration.json bun run test:integration` | 54 integration runs pass (27 scenarios × 2 engines) | 53.57 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/test-matrix-e2e.json bun run test:e2e` | 27 E2E runs pass, including 12 image comparisons | 21.25 s |

Durations are wall-clock command durations measured by the verification runner,
including startup. Unit coverage is **100% statements, branches, functions and
lines**: 1,096 statements, 640 branches, 452 functions and 317 lines. Coverage
measures execution of the configured component/helper source, not every behavior.

Evidence: [command records](evidence/test-matrix-commands.json),
[combined output](evidence/test-matrix-verification.txt),
[integration report](evidence/test-matrix-integration.json),
[E2E report](evidence/test-matrix-e2e.json),
[coverage summary](evidence/test-matrix-coverage.json).
The E2E command builds package assets, declarations and the gallery afresh before
running; the nine Chromium visual tests compare twelve existing images. Browser
fixtures require empty warning/error/page-error collections. Runner color-mode
notices are retained in the log and are not application diagnostics.

The matrix has 14 component sections and 14 SSR/visual rows. Its relative links
and test-line anchors were checked (118 references across both documents); linked assertions were inspected, including
cases where shared markup has no component-specific assertion. The final diff
was reviewed for unrelated changes, unsupported claims and broken references.

## Open scope

The task closes documentation traceability, not the acceptance gaps it identifies.
Start with CMB-1 (browser multiple-value form/reset, object results and rejected
controlled open/query changes), then the other prioritized browser checks.
WebKit, hydration, physical IME, manual screen-reader sessions, real admin/router/
query integration, performance certification and Electron/application-wide tests
remain unrun. The Kobalte adoption probes were not rerun and remain separate from
delivered-component evidence. Admin parity scripts were not rerun because this
change touches no exports, API or consumer imports.
