# Kobalte Image evaluation

Pinned unpatched `@kobalte/core@2.0.0-alpha.2`, Solid/web/signals rc.13.
Use the same installed runtime as the parent package, start `bun run dev` on
4405, then run `bun run probe`. `unpatched.json` records Chromium and Firefox.
Real data-image decoding, failed image fallback, recovery and root unmount pass;
both engines report one `EFFECT_RELAY_TEAR` from Image.Img relaying its status to
Image.Root. This probe is library-selection evidence, not production acceptance.
No node_modules patch or diagnostic filter is applied. The delivered Avatar uses
an owned preload lifecycle, direct shared status updates, stale-event guards and
cleanup. Browser acceptance lives in `tests/catalog-display.ts`.
