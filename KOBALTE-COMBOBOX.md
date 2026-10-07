# Combobox adoption probe

2026-10-08. Kobalte was evaluated first with unpatched
`@kobalte/core@2.0.0-alpha.2` and Solid/core/web `2.0.0-rc.13`.
The composition, isolated manifest/lockfile, probe and full diagnostic output
are in [validation/solid2-combobox](validation/solid2-combobox).

Both Chromium and Firefox display the initial Apple value, filter to Banana,
select it and serialize `fruit=Banana`. After reset the observed input is empty,
instead of the original Apple default. Each browser emits 21 warnings, including
`STRICT_READ_UNTRACKED`, `EFFECT_RELAY_TEAR` and `EFFECT_WRITES_OWN_SOURCE`.
This composition fails the package's diagnostic/reset acceptance. These results
do not claim that Kobalte cannot be repaired, or that every configuration fails.

The probe is observational: a zero process exit code does not mean acceptance.
It records the input value following the reset click; it does not certify other
reset timing, multiple selection, accessibility, or production performance.
Earlier experimental patches remain isolated and are not promoted into production.

Reproduce after installing this directory's exact manifest/lockfile separately
from the monorepo:

```sh
# In validation/solid2-combobox, terminal one:
bun run dev
# Same directory, terminal two:
node probe.mjs
```

The server uses port 4401. The probe retains every console warning/error and page
error in `unpatched.json`. Corvu's mapped catalog has no Combobox primitive;
there is no demonstrated missing Kobalte API that corvu fills here. No dependency
is added. The delivered component composes the already accepted native Popover
and Input with owned Solid 2 selection/search/form state. Its independent
acceptance is in [COMBOBOX-DELIVERY.md](COMBOBOX-DELIVERY.md).
