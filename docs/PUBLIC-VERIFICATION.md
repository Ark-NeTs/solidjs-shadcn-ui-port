# Verification and supported scope

The dated 65-family catalog is implemented for Solid 2 rc.13. Each component page
includes Solid usage, screenshots and a live example. The package uses semantic
CSS variables for light/dark modes and custom themes.

## Automated acceptance

The 2026-10-09 package delivery passed typecheck, lint, 394 unit tests, 26 server
rendering tests, 651 source-browser tests, 667 production-browser tests and 135
hydration tests. A separate router/query consumer passed nine browser tests.
Browser coverage uses Chromium, Firefox and WebKit; screenshot comparisons use
Chromium. Diagnostics stay enabled, with one browser worker and no retries.

Measured source coverage is 100% for statements, branches, functions and lines.
This measures executed package code, not every possible input or UI combination.
Three hydration cases intentionally characterize unsafe patterns and must not be
read as support for those patterns. The maintained repository test matrix maps
individual contracts to their assertions and keeps original failure evidence.

## Boundaries

This is an owned Solid implementation, not complete React/Radix API compatibility.
Use the [component contracts](components.md) for supported props and behavior.
Manual screen-reader, physical touch, IME/SMS and password-manager sessions remain
unverified. Streaming SSR, every visual variant and large-data performance are
not certified. Application services, authentication, caching and persistence belong
to consumers. The live admin example uses a local simulation, not a real service.

## License and availability

The package is [MIT licensed](../LICENSE), copyright © 2026 ArkNeT.
Bundled dependency and font notices are available in [third-party notices](/legal/THIRD-PARTY-NOTICES.txt).
Registry publication is separate; [getting started](GETTING-STARTED.md) describes
workspace usage with the tested Solid pins. The public site contains selected
user-facing guides and screenshots. Raw diagnostics, internal delivery records
and repository instructions are not part of the deployment artifact.
