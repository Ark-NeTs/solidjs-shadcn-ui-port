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

The full source, built, hydration and consumer suites are configured for the first hosted run; they were not repeated locally in this increment. Hosted verification is pending the branch push.


## Acceptance scope

The workflow runs existing acceptance assertions without changing component
behavior, diagnostic rules, retries or screenshot baselines. Local ports and
provider tests are isolated. Publication, deployment, repository secrets and
branch protection are outside this increment. Manual assistive-technology and
physical-device acceptance remain unchanged.

## Checklist review

Tests and delivery evidence apply and pass locally; hosted acceptance remains pending. State ownership, loading/error UI, mutations, client/server component boundaries, reactive cleanup, keyboard behavior and theming are unchanged, so those UI checklist items are not applicable to this workflow-only increment. Job timeouts, cancellation and separate result folders bound work and preserve failure diagnostics. No new performance claim is made. Existing manual accessibility and physical-device limits remain documented.
