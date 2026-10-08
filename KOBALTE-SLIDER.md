# Kobalte Slider evaluation

2026-10-08. Evaluated unpatched `@kobalte/core@2.0.0-alpha.2` with shared Solid
core/web/signals `2.0.0-rc.13`, Vite `8.3.3`, plugin `3.0.0-next.27` and Playwright
`1.63.0`. [Fixture](validation/solid2-slider/main.tsx),
[probe](validation/solid2-slider/probe.mjs), [raw report](validation/solid2-slider/unpatched.json).

| Engine | ArrowRight / End with minimum gap | Drag | FormData / reset | Diagnostics |
| --- | --- | --- | --- | ---: |
| Chromium | Lower thumb remains 20; expected 21 / 70 | Upper thumb remains 80 | Initial 20/80 serialize; reset stays 20 | 7 |
| Firefox | Lower thumb remains 20; expected 21 / 70 | Upper thumb remains 80 | Initial 20/80 serialize; reset stays 20 | 7 |

The probe waits for expected value changes before recording a failure, allowing
Solid's batched updates to settle. Reset from a changed state is not verified here
because the interaction never changes the values. The three untracked root reads,
two thumb collection feedback warnings and two input relay warnings are preserved.
These results reject adoption for this batch; no library patch or diagnostic
filter enters production. The accepted Kobalte Toggle stays unchanged. Corvu is
not needed: this is a compatibility failure of an existing Kobalte primitive, and
the catalog assessment records no separate corvu Slider capability.

Registry commands `bun pm view <package> dist-tags` returned:

| Package | Tags observed |
| --- | --- |
| @kobalte/core | alpha 2.0.0-alpha.2; latest 0.13.14 |
| solid-js | next 2.0.0-rc.14; latest 1.9.17; beta 1.10.0-beta.0 |
| vite-plugin-solid | next 3.0.0-next.27; latest 2.11.14; beta 2.11.0-beta.0 |
| @solidjs/testing-library | next 1.0.0-beta.3; latest 0.8.10 |

This batch retains the established rc.13 runtime; rc.14 is not tested. The installed
alpha declarations and the official [Solid 2 migration guide](https://raw.githubusercontent.com/solidjs/solid/next/documentation/solid-2.0/MIGRATION.md)
informed the evaluation and implementation.

Reproduce by installing the fixture package/lock in isolation with
`bun install --frozen-lockfile --ignore-scripts`, starting `bun run dev` on 4405,
then running `node probe.mjs`. Probe/registry commands were exploratory and not
separately timed. WebKit and exhaustive Kobalte APIs were not investigated after
the rejection. The delivered owned component has three-engine acceptance evidence
in [the delivery report](docs/SLIDER-DELIVERY.md).
