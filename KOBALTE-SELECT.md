# Kobalte Select evaluation

2026-10-08, unpatched `@kobalte/core@2.0.0-alpha.2` with the package's shared
Solid core/web/signals `2.0.0-rc.13`, Vite `8.3.3`, plugin `3.0.0-next.27` and
Playwright `1.63.0`. [Fixture](validation/solid2-select/main.tsx),
[probe](validation/solid2-select/probe.mjs), [raw report](validation/solid2-select/unpatched.json).

| Browser | Open, End/Enter selection, FormData, reset, Escape, returned focus | Diagnostics |
| --- | --- | ---: |
| Chromium | Pass; selected/form value Cherry, reset Apple | 25 |
| Firefox | Pass; selected/form value Cherry, reset Apple | 25 |

Diagnostics include untracked reads under HiddenSelect's For and effect callbacks,
plus effect feedback and relay tearing. Kobalte is rejected for this Select batch;
these are library-internal lifecycle/read paths, not styling issues. No library
patch or diagnostic filter is added. Kobalte still supplies the accepted Toggle.
Corvu is not needed: Select is present in Kobalte's catalog, and corvu does not
supply a non-overlapping Select primitive in the recorded catalog assessment.

The first probe incorrectly queried a combobox role; Kobalte uses a button with
aria-haspopup=listbox. The corrected probe targets that actual trigger. Escape
assertions wait for the closing lifecycle rather than sampling immediately after
the key event. The final report above is from that corrected probe. No failure of
those two early harness assumptions is attributed to Kobalte.

Registry checks (`bun pm view @kobalte/core dist-tags`, `bun pm view solid-js dist-tags`)
returned Kobalte alpha `2.0.0-alpha.2` / latest `0.13.14`, and Solid next
`2.0.0-rc.14` / latest `1.9.17` / beta `1.10.0-beta.0`. This component batch retains
rc.13; it does not test or upgrade rc.14. The installed alpha declarations were
used for API shape. The official [Solid 2 migration guide](https://raw.githubusercontent.com/solidjs/solid/next/documentation/solid-2.0/MIGRATION.md)
and installed rc.13 cheatsheet informed split effects, ownership and renderer imports.

Reproduce in the fixture directory: install its package/lock in isolation with
`bun install --frozen-lockfile --ignore-scripts`, expose those node_modules there,
start `bun run dev` on 4405, then run `node probe.mjs`. No WebKit or exhaustive
Kobalte API investigation was performed after the diagnostic failure. Exploratory
commands were not separately timed. The delivered owned Select is verified in
three engines; see [delivery report](docs/SELECT-DELIVERY.md).
