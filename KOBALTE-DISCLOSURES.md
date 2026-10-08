# Kobalte Accordion / Collapsible evaluation

2026-10-08. Evaluated unpatched `@kobalte/core@2.0.0-alpha.2` first with
`solid-js`, `@solidjs/web` and `@solidjs/signals` pinned to `2.0.0-rc.13`;
Vite `8.3.3`, vite-plugin-solid `3.0.0-next.27`, Playwright `1.63.0`.
No registry upgrade or alternative prerelease search was part of this batch.

The [isolated fixture](validation/solid2-disclosures/main.tsx) renders each primitive
separately. It clicks a named trigger, waits for the input to become visible,
clicks again and waits for it to disappear. It captures every browser warning,
console error and page error. [Raw output](validation/solid2-disclosures/unpatched.json).

| Primitive | Chromium open/close | Firefox open/close | Warnings per engine |
| --- | --- | --- | ---: |
| Accordion | Pass | Pass | 6 |
| Collapsible | Pass | Pass | 4 |

Both emit `STRICT_READ_UNTRACKED`, `EFFECT_WRITES_OWN_SOURCE`, and
`EFFECT_RELAY_TEAR`. These results reject adoption under the package's strict
diagnostic gate; they do not establish broken open/close behavior. WebKit,
hydration, every API and library patching were not evaluated for these candidates.

The owned implementation uses native buttons, hidden content and Solid signals.
This is the existing D19/D90 delivery approach; no production dependency or runtime
patch is added. Corvu remains reserved for missing capabilities: Kobalte has both
primitives, so this probe establishes no catalog gap requiring corvu.

To reproduce, install the fixture's exact package/lock in an isolated directory
using `bun install --frozen-lockfile --ignore-scripts`, expose that node_modules
to this fixture, then from `validation/solid2-disclosures` run `bun run dev` in
one terminal and `bun run probe` in another. The probe uses port 4405; keep the
user's gallery on 4399. Its diagnostic arrays are evidence, not passing acceptance.

| Exploratory command | Outcome | Time |
| --- | --- | ---: |
| `bun run dev` (fixture) | Isolated development server available on 4405 | Long-running; not timed |
| `node probe.mjs` (fixture) | Four open/close journeys pass; 20 warnings captured | Not separately timed |

[Implementation and final acceptance](docs/DISCLOSURES-DELIVERY.md).
