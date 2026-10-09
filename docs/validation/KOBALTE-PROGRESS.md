# Kobalte Progress evaluation

2026-10-08. Tested unpatched `@kobalte/core@2.0.0-alpha.2` on shared Solid
core/web/signals `2.0.0-rc.13`, Vite `8.3.3`, plugin `3.0.0-next.27` and Playwright
`1.63.0`. [Fixture](../../validation/solid2-progress/main.tsx),
[probe](../../validation/solid2-progress/probe.mjs), [raw report](../../validation/solid2-progress/unpatched.json).

| Engine | Value / fill | Unknown / complete / remount | External labelledby | Diagnostics |
| --- | --- | --- | --- | ---: |
| Chromium | 25 → 75; 225px fill in a 300px track | Pass | Dropped | 0 |
| Firefox | 25 → 75; 225px fill in a 300px track | Pass | Dropped | 0 |

The published MeterRoot used by Progress omits `aria-labelledby` from forwarded
props and supplies its internal label registration instead. A wrapper using the
supported `as` rendering boundary restored external naming and passed the six
[source-browser scenarios](../../validation/solid2-progress/adapted-source-passed.json) in all three engines, with no diagnostics.

That wrapper failed hydration: the indicator's expected hydration key differed
from the server key and the indicator was left unclaimed. Replacing Fill's default
dynamic element with a static renderer removed the fatal error but retained the
key mismatch. Replacing Kobalte Fill with an owned indicator under Kobalte Root
also retained the mismatch. These two adapter repair attempts did not establish
hydration acceptance. The precise upstream-versus-adapter cause is unresolved; this is
not a claim that every unpatched Kobalte Progress composition fails hydration.

[Rejected integration shapes](../../validation/solid2-progress/HYDRATION.md) describe the
three comparisons without asserting an upstream root cause.

Preserved reports: [default fill](../../validation/solid2-progress/hydration-default-fill-failed.json),
[static fill renderer](../../validation/solid2-progress/hydration-static-fill-failed.json),
[owned fill under Kobalte Root](../../validation/solid2-progress/hydration-owned-fill-failed.json).
The final owned div/indicator passes the same tests, including actual hydrated
indicator width updates. No library patch, warning filter or hydration-key workaround
enters production. Existing Toggle remains the accepted Kobalte component.

The delivered wrapper derives Radix-style `value`/`max`, accessible text and fill
from owner data with no effect, registration, timer or fetch. Missing/invalid values
are indeterminate; invalid max falls back to 100. Public compound labels, custom min
values and polymorphism remain outside this wrapper's API. No corvu fallback or
new dependency is required: there is no separate missing catalog capability.

Registry checks `bun pm view @kobalte/core dist-tags` and `bun pm view solid-js dist-tags`
returned Kobalte alpha `2.0.0-alpha.2` / latest `0.13.14` and Solid next `2.0.0-rc.14`,
latest `1.9.17`, beta `1.10.0-beta.0`. This batch keeps rc.13; rc.14 is not tested.
The installed alpha source/declarations are authoritative for the evaluated API;
the [stable Progress guide](https://kobalte.dev/docs/core/components/progress) gives
anatomy context, and the [Solid 2 migration guide](https://raw.githubusercontent.com/solidjs/solid/next/documentation/solid-2.0/MIGRATION.md)
informs reactive props and rendering.

To reproduce the raw probe, install the fixture package/lock in isolation with
`bun install --frozen-lockfile --ignore-scripts`, start `bun run dev` on 4405 and
run `node probe.mjs`. The raw probe covers Chromium/Firefox; the delivered wrapper
also runs in WebKit. Commands were exploratory and not separately timed.
See [Progress delivery](../PROGRESS-DELIVERY.md) for final measured acceptance.
