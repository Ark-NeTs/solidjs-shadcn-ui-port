# Kobalte Tooltip / Hover Card evaluation

2026-10-08. Evaluated unpatched `@kobalte/core@2.0.0-alpha.2` with Solid core,
web and signals `2.0.0-rc.13`, Vite `8.3.3`, vite-plugin-solid `3.0.0-next.27`,
and Playwright `1.63.0`. This batch tests the selected pins; it does not claim a
new registry/prerelease survey.

[Fixture](validation/solid2-hints/main.tsx),
[probe](validation/solid2-hints/probe.mjs),
[raw diagnostic arrays](validation/solid2-hints/unpatched.json).

| Primitive | Chromium pointer / Escape / focus / blur | Firefox pointer / Escape / focus / blur | Diagnostics per engine |
| --- | --- | --- | ---: |
| Tooltip | All pass | All pass | 2 |
| Hover Card | All pass | All pass | 5 |

Tooltip reports `EFFECT_WRITES_OWN_SOURCE` and `EFFECT_RELAY_TEAR`. Hover Card
reports those plus `STRICT_READ_UNTRACKED` and two `NO_OWNER_EFFECT` warnings.
Opening/closing works; strict development diagnostics block adoption. Every warning,
console error and page error is retained, rather than filtered. No library patch
or warning suppression was applied. The initial blur probe used Tab after the last
page control, which entered browser chrome in Firefox; the final probe focuses an
explicit outside button and passes. That initial timeout was not a library finding.

The package uses an owned native implementation for this increment, consistent
with the earlier bounded batches. Kobalte provides both primitives, so there is no
missing capability requiring corvu. No new production dependency is installed.
Kobalte WebKit, hydration, cross-library nesting and exhaustive API behavior were
not investigated after the diagnostic failure.

To reproduce, install the fixture package/lock in isolation with
`bun install --frozen-lockfile --ignore-scripts` and expose its node_modules to
`validation/solid2-hints`. From that fixture directory run `bun run dev` (4405),
then `node probe.mjs` in a second terminal. Probe commands were exploratory and
not separately timed. [Implementation acceptance](docs/HINTS-DELIVERY.md) records
measured production verification.
