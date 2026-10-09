# Standalone repository migration — 2026-10-09

The Solid project now lives at `~/GitHub/solidjs-shadcn-ui-port`. Git was
initialized there before importing files or history. The public package import
name remains `shadcn-solidjs-theme`; no component behavior or package exports changed.

## Preserved project

The source was `restaurant-management/packages/shadcn-solidjs-theme` at
`603d56d3a3e2f1e4fd9f96cb0e149d577ad4bda8`. A path-filtered extraction preserved
62 package commits, ending at `7d929c17b394b55c31b63d021bfe6854336cec45`.
The imported tree matches the original package tree
`eeb0270a6756ecbccf9eebb9aec15e9fc0ccfefb`.
All 3,464 copied files were checked byte for byte, and symlink targets were checked
before making standalone adjustments. Ignored local evidence and build artifacts
were retained locally without adding dependency caches or generated files to Git.
[Transfer record](evidence/repository-transfer.json).

## Independent setup

The repository includes its own TypeScript compiler settings and Node version pin.
Install the main, deployment and optional consumer dependencies from their local
frozen lockfiles. Active tools use local dependency directories rather than a
temporary installation or another checkout.

The former React-theme contract is captured in `validation/reference-theme` with
provenance and checksums. The admin import contract is captured in
`validation/admin-imports`; it contains import declarations only. These fixtures
preserve the existing test baseline, not a claim of compatibility with future
changes to the restaurant application. Use `--app-root` for a live external audit.
[Origin decisions](ORIGINS.md) preserve D19/D90 context. Historical delivery
records retain their original paths and dates.

## Verification

Measured commands and outcomes are recorded in
[evidence/repository-migration-checks.json](evidence/repository-migration-checks.json).

| Command | Result | Time |
| --- | --- | ---: |
| `THEME_PORT=4403 bunx --no-install playwright test tests/integration/docs-previews.spec.ts tests/integration/docs-site.spec.ts tests/integration/theme-generator.spec.ts tests/integration/admin-menu.spec.ts` | Pass (315) | 285.58 s |
| `THEME_PORT=4403 THEME_PRODUCTION=1 RESULTS_FILE=test-results/migration-built.json bunx --no-install playwright test tests/e2e/docs-previews.spec.ts tests/e2e/docs-site.spec.ts tests/e2e/theme-generator.spec.ts tests/e2e/admin-menu.spec.ts tests/e2e/docs-site/visual.spec.ts` | 324 passed; 3 expected baseline changes, resolved below | 225.16 s |
| `THEME_PORT=4403 THEME_PRODUCTION=1 RESULTS_FILE=test-results/migration-visual.json bunx --no-install playwright test tests/e2e/docs-site/visual.spec.ts --project=chromium` | Pass (12) | 11.41 s |
| `THEME_PORT=4403 RESULTS_FILE=test-results/migration-hydration.json bun run test:hydration` | Pass (135) | 123.37 s |
| `THEME_PORT=4403 RESULTS_FILE=test-results/migration-consumer.json bun run test:consumer` | Pass (9) | 10.71 s |
| `THEME_PORT=4403 RESULTS_FILE=test-results/migration-site.json bun run test:site` | Pass (15) | 27.17 s |
| `bun run check` | Pass | 4.82 s |
| `bun run lint` | Pass | 2.15 s |
| `bun run test` | Pass (400) | 7.89 s |
| `bun run test:server` | Pass (26) | 1.38 s |
| `bun run docs:check` | Pass | 2.16 s |
| `bun run parity:admin` | Pass | 0.43 s |
| `node scripts/check-consumer.mjs` | Pass | 1.30 s |

The production sweep identified three expected screenshot changes in the getting
started page. Its standalone setup text was reviewed in light, dark and mobile
layouts, and those baselines were refreshed. The subsequent full 12-case
documentation visual suite passed. Component and theme-canvas baselines matched.

The original package was removed after checking all 1,276 tracked files against
the preserved destination. Subsequent hydration, consumer, local deployment and
final static/unit/server checks ran with the former path absent. The existing
preview on port 4399 now runs from the new root. Frozen installs succeeded for
the main package, deployment tools and router/query consumer. Review confirmed
64 reference checksums, 42 import-only fixtures and no staged environment files,
dependency directories or transient logs. Both repository diffs were reviewed.

Full per-primitive integration/e2e sweeps, coverage collection and unrelated
restaurant-application gates were not rerun. The selected browser suites cover
all 65 documentation previews, the admin composition, theme generator, visual
layouts, full existing hydration suite, consumer harness and public-site routes.
Existing primitive acceptance records remain available in the test matrix.

## Acceptance scope

State ownership, async recovery and cleanup implementations are unchanged.
Browser regression checks cover real controls, overlays, forms, the 65-family
documentation catalog and the theme generator. Existing tokens and component visual
baselines remain the appearance contract; three setup-documentation baselines
were updated for the relocated installation instructions. No backend or desktop bridge is added;
IPC and Electron-specific requirements do not apply. Manual screen-reader,
physical-device and exhaustive theme-combination checks are not part of this move.
No performance improvement is claimed.

No registry publication or public deployment is included. The private GitHub
remote is [solidjs-shadcn-ui-port](https://github.com/DmytroYeremieiev/solidjs-shadcn-ui-port).
The previous restaurant repository remains a separate project.

## First-push history audit

The first extraction retained unrelated ancestor commits despite matching the
package tree at its tip. Before the first upload, a path-filtered extraction
replaced that unpublished ancestry. All 62 preserved package commit trees and
the migration commit were checked for unrelated repository roots. The current
project tree was unchanged by the correction. This supersedes the initial
301-commit preservation count. No pushed history was rewritten.
[History audit](evidence/repository-history-audit.json).

| Fresh check | Result | Time |
| --- | --- | ---: |
| `bun run check` | Pass | 7.47 s |
| `bun run lint` | Pass | 2.80 s |
| `bun run test` | Pass | 10.73 s |
| `bun run test:server` | Pass | 1.39 s |

Browser suites were not repeated for the ancestry correction; the runtime files
matched the already verified migration tree exactly.
