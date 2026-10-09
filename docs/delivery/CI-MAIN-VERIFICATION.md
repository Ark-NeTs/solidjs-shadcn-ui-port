# Main-branch CI verification — 2026-10-10

The first [main run 37993406209](https://github.com/DmytroYeremieiev/solidjs-shadcn-ui-port/actions/runs/37993406209) passed 16 of 17 jobs. Firefox source shard 2 passed 107 tests and failed the documentation history test because Back canceled imports for its still-loading live preview. The branch run had previously passed all 17 jobs on the same commit; this is a navigation-readiness race in the acceptance test.

## Diagnosis and correction

The saved trace places Back at 6,032.551 ms and the canceled imports and console warnings at approximately 6,062 ms. An isolated Firefox probe delayed `src/lib/layout.ts` by 600 ms: navigating Back during loading reproduced the module warnings and `NS_BINDING_ABORTED`; waiting for the example before Back produced no warnings or canceled requests.

The shared source/built history test now requires the Data Table preview to contain `Customer 01` before navigating Back. All warning/error assertions remain fatal. No retry, timeout, diagnostic threshold, production component or workflow changes are introduced. The original failure uploaded its screenshot, trace and JSON report; creation on October 9 and expiry on October 12 confirm three-day retention.

## Verification

[Measured commands](../evidence/ci-main-navigation-checks.json), local macOS 15 arm64, Bun 1.4.2 and Node 25.3.0:

| Command | Result | Time |
| --- | --- | ---: |
| `bun run check` | Pass | 6.58 s |
| `bun run lint` | Pass | 2.25 s |
| `bun run test:coverage` | 401 units; 100% coverage | 11.34 s |
| `bun run test:server` | 26 SSR tests | 1.32 s |
| `CI=true THEME_PORT=4403 RESULTS_FILE=test-results/reports/docs-navigation-source.json bunx --no-install playwright test tests/integration/docs-site.spec.ts --output=test-results/docs-navigation-source --global-timeout=300000` | 21 tests, three engines | 31.99 s |
| `CI=true THEME_PRODUCTION=1 THEME_PORT=4403 RESULTS_FILE=test-results/reports/docs-navigation-built.json bunx --no-install playwright test tests/e2e/docs-site.spec.ts tests/e2e/docs-previews.spec.ts --output=test-results/docs-navigation-built --global-timeout=600000` | 261 tests, three engines; fresh built library/site | 119.94 s |

## Acceptance and limits

The changed navigation assertion exercises source and built examples in all three engines. State ownership, recovery, async cleanup, keyboard/theming and server/client behavior are unchanged; those checklist items are not applicable to this test-only correction. Existing browser diagnostics remain strict. Full browser, hydration, consumer and documentation jobs are verified by the hosted workflow; exact final run outcomes are reported in the task response. No publication or deployment occurs in this increment.
