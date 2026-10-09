# MIT license delivery — 2026-10-09

The owner selected MIT and ArkNeT. The package now includes the standard
[MIT license](../LICENSE) with `Copyright (c) 2026 ArkNeT`, declares `license: "MIT"`
in its manifest, and links the license from its README and documentation website.
The package remains private and unpublished; no other workspace package is relicensed.

## Verification

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | Passed | 4.939 s |
| `bun run lint` | Passed | 2.072 s |
| `bun run test` | 394 passed | 8.342 s |
| `bun run test:server` | 26 passed | 1.296 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/license-integration.json bunx playwright test tests/integration/docs-site.spec.ts --max-failures=1` | 18 passed across three browsers | 22.112 s |
| `THEME_PORT=4403 THEME_PRODUCTION=1 RESULTS_FILE=docs/evidence/license-e2e.json bunx playwright test tests/e2e/docs-site.spec.ts tests/e2e/docs-site/visual.spec.ts --max-failures=1` | Builds and 22 checks passed, including four visual comparisons | 25.140 s |
| `bun pm pack --dry-run --ignore-scripts` | 171 files including LICENSE; no archive published | 0.032 s |

[Exact command output](evidence/license-commands.json),
[source browser results](evidence/license-integration.json), and
[built browser results](evidence/license-e2e.json) are retained.
All browser checks use one worker, no retries and unchanged diagnostics.

## DELIVERY checklist disposition

State ownership, usable states, recovery, async work, platform boundaries and
reactivity/cleanup are unchanged: this update changes license metadata and
documentation only. Keyboard access and customizable appearance retain the existing
website contracts and visual baselines. Structure gains one package-local license
file; there is no runtime or dependency change. Documentation inventory/link checks,
source and built website checks verify the changed pages. Full component browser,
hydration and coverage suites are not repeated for this metadata-only change; their
[verified runtime evidence](PROJECT-COMPLETION.md#verification) remains applicable.
The owner decision is recorded in DECISIONS.md; exact commands, results and timings
above provide delivery evidence. Manual checks and release limits remain documented
in the [project report](PROJECT-COMPLETION.md#remaining-release-decisions-and-manual-checks).
