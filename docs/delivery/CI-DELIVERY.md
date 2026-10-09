# GitHub Actions CI delivery — 2026-10-09

Added a read-only workflow for static/unit/server, three-engine browser and
documentation acceptance using frozen installs and pinned action releases.
Failed-job screenshots, traces, JSON reports and coverage diagnostics expire
after three days; successful jobs upload no artifacts. See [CI guide](../CI.md).

## Verification

Local macOS 15 arm64 verification with Bun 1.4.2 and Node 25.3.0. All commands exited successfully. [Measured results](../evidence/ci-local-checks.json).

| Command | Result | Time |
| --- | --- | ---: |
| `/tmp/solid-ci-actionlint/actionlint .github/workflows/ci.yml` | Valid workflow (actionlint 1.7.12) | 0.02 s |
| `bun run check` | Pass | 5.10 s |
| `bun run lint` | Pass | 2.18 s |
| `bun run test:coverage` | 401 tests; 100% statements, branches, functions and lines | 10.43 s |
| `bun run test:server` | 26 tests | 1.29 s |
| `bun run docs:check` | 7 compositions | 1.99 s |
| `THEME_PORT=4403 RESULTS_FILE=test-results/reports/ci-docs-source.json bunx --no-install playwright test tests/integration/docs-site.spec.ts --output=test-results/ci-docs-source --global-timeout=300000` | 21 tests, three engines | 30.13 s |
| `THEME_PORT=4403 RESULTS_FILE=test-results/reports/ci-public-site.json bun run test:site --output=test-results/ci-public-site --global-timeout=300000` | 15 tests, three engines; fresh public build | 21.15 s |
| `bun run parity:admin` | Captured import contract complete | 0.41 s |

The initial local checkpoint did not repeat the full source, built, hydration or consumer suites. Later targeted source/built and full consumer verification are recorded below; the full source, built and hydration runs execute on GitHub. Hosted results for the current revision are published in [CI branch runs](https://github.com/DmytroYeremieiev/solidjs-shadcn-ui-port/actions?query=branch%3Acodex%2Fci-checks); the final task report records the completed run.


## Acceptance scope

The workflow runs existing acceptance assertions without changing component
behavior, retries or screenshot baselines. The CI development profiler timing threshold is calibrated below; all emitted diagnostics remain fatal. Local ports and
provider tests are isolated. Publication, deployment, repository secrets and
branch protection are outside this increment. Manual assistive-technology and
physical-device acceptance remain unchanged.

## Checklist review

Tests and delivery evidence apply and pass locally; hosted acceptance is recorded in the linked branch runs. State ownership, loading/error UI, mutations, client/server component boundaries, reactive cleanup, keyboard behavior and component theming are unchanged. Those criteria are not applicable to the workflow itself; the blocking documentation layout correction is covered by the existing light/dark enlarged-text, overflow and accessibility assertions. Job timeouts, cancellation and separate result folders bound work and preserve failure diagnostics. No new performance claim is made. Existing manual accessibility and physical-device limits remain documented.

## Hosted runner findings

The first Ubuntu documentation run exposed a real enlarged-text header overflow: Chromium rendered the 390px mobile page at a 397px scroll width. Its failure screenshot showed the final navigation link clipped. Allow the mobile website navigation to wrap onto another row; preserve the existing strict no-overflow assertion. The failure job successfully uploaded screenshots, traces and its JSON report with three-day retention. The corrected revision passed the hosted documentation job in [run 37983076371](https://github.com/DmytroYeremieiev/solidjs-shadcn-ui-port/actions/runs/37983076371).

Local checks after the header correction ([measured results](../evidence/ci-wrap-checks.json)):

| Command | Result | Time |
| --- | --- | ---: |
| `bun run check` | Pass | 5.10 s |
| `bun run lint` | Pass | 2.09 s |
| `bun run test:coverage` | Pass | 10.27 s |
| `bun run test:server` | Pass | 1.26 s |
| `THEME_PORT=4403 RESULTS_FILE=test-results/reports/ci-docs-wrap.json bunx --no-install playwright test tests/integration/docs-site.spec.ts --output=test-results/ci-docs-wrap --global-timeout=300000` | Pass | 29.40 s |
| `THEME_PORT=4403 RESULTS_FILE=test-results/reports/ci-site-wrap.json bun run test:site --output=test-results/ci-site-wrap --global-timeout=300000` | Pass | 21.15 s |

## CI timing and contrast checks

Two hosted source runs reported 8–15ms development profiler costs in different documentation, chart, calendar, table and form scopes. The plugin enables this wall-clock profiler automatically on development servers. Set its CI-only accumulated compute budget to 32ms per one-second window, while retaining the local 8ms default and fatal handling of every emitted warning/error. Other diagnostic thresholds are unchanged; this is a hosted acceptance budget rather than a production performance claim. An exploratory documentation mount refactor was reverted after the second hosted run showed the timing findings moving across unrelated scopes.

An overlay contrast check observed an intermediate theme-transition color. Await finite animations/transitions before measuring the settled layout and final-state contrast; keep every accessibility assertion. A mistakenly broad local built-test filter was interrupted after 791 passes (one interrupted, 162 unrun); it is not counted as a completed suite. The focused built documentation command is verified separately.

## Final local verification

[Measured commands and browser counts](../evidence/ci-stability-checks.json):

| Command | Result | Time |
| --- | --- | ---: |
| `bun run check` | Pass | 5.00 s |
| `bun run lint` | Pass | 2.05 s |
| `bun run test:coverage` | Pass | 9.29 s |
| `bun run test:server` | Pass | 1.24 s |
| `CI=true THEME_PORT=4403 RESULTS_FILE=test-results/reports/ci-stability-source.json bunx --no-install playwright test tests/integration/admin-menu.spec.ts tests/integration/catalog-chart.spec.ts tests/integration/catalog-dates.spec.ts tests/integration/catalog-modal.spec.ts tests/integration/combobox-contracts.spec.ts tests/integration/overlays.spec.ts tests/integration/docs-site.spec.ts --output=test-results/ci-stability-source --global-timeout=600000` | 129 browser tests | 186.12 s |
| `THEME_PRODUCTION=1 THEME_PORT=4403 RESULTS_FILE=test-results/reports/ci-docs-built-final.json bunx --no-install playwright test tests/e2e/docs-site.spec.ts tests/e2e/docs-previews.spec.ts --output=test-results/ci-docs-built-final --global-timeout=600000` | 261 browser tests | 118.08 s |
| `THEME_PORT=4403 RESULTS_FILE=test-results/reports/ci-site-final.json bun run test:site --output=test-results/ci-site-final --global-timeout=300000` | 15 browser tests | 21.41 s |
| `CI=true THEME_PORT=4403 RESULTS_FILE=test-results/reports/ci-consumer-final.json bun run test:consumer --output=test-results/ci-consumer-final --global-timeout=120000` | 9 browser tests | 10.30 s |

The final matrix runs source, built, hydration and consumer acceptance independently in isolated jobs, with suite-specific failure artifact names. All local completed checks passed. The final hosted outcome is reported with its exact run link in the task response. Manual accessibility/device acceptance and publication remain outside this CI increment.

## Source-suite runtime adjustment

[Run 37985785370](https://github.com/DmytroYeremieiev/solidjs-shadcn-ui-port/actions/runs/37985785370) passed 13 jobs, including every built/visual, hydration, consumer, static/unit/server and documentation job. WebKit source reached the 900-second suite limit after 258 passing tests; 52 tests did not run and no assertion failed. Split source integration into two isolated shards per engine, allow each source shard 1,200 seconds within a 25-minute job, and retain the previous limits for other suites. Both shards cover the entire suite; no tests or diagnostics are skipped. Final hosted outcomes remain linked from the task report.

[Shard verification](../evidence/ci-shard-checks.json):

| Command | Result | Time |
| --- | --- | ---: |
| `bun run check` | Pass | 6.13 s |
| `bun run lint` | Pass | 2.88 s |
| `bun run test:coverage` | Pass | 13.31 s |
| `bun run test:server` | Pass | 1.28 s |
| `bun run test:integration --project=webkit --shard=1/2 --list` | Pass | 0.56 s |
| `bun run test:integration --project=webkit --shard=2/2 --list` | Pass | 0.50 s |
| `Compare complete WebKit test listing with the disjoint union of --shard=1/2 and --shard=2/2 listings` | Pass | 2.27 s |

WebKit inventory: 310 tests = 202 in shard 1 + 108 in shard 2; zero overlap and zero missing tests. The final workflow also passes actionlint 1.7.12.
