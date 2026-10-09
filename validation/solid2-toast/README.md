# Unpatched Solid 2 Toast evaluation

Pinned `@kobalte/core@2.0.0-alpha.2`, Solid/web/signals `2.0.0-rc.13`.
Run `bun run dev` on 4405, then `node probe.mjs`. The probe retains warnings
and page errors in `unpatched.json`; it does not patch or suppress anything.

Both Chromium and Firefox showed, updated, dismissed and expired a notification
and unmounted the region. Both reported `IMMUTABLE_UPDATE_IN_STORE`; Chromium
also reported `STRICT_READ_UNTRACKED`. See `command.json` for measured duration.
Behavioral success does not accept a primitive that fails the strict diagnostics
gate. The owned production implementation and final evidence are in [notification delivery](../../docs/NOTIFICATION-CATALOG-DELIVERY.md).
