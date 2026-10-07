# Tabs, Popover and Alert Dialog adoption probe

2026-10-08. Tested unpatched `@kobalte/core@2.0.0-alpha.2` with Solid,
`@solidjs/web` and `@solidjs/signals` pinned to `2.0.0-rc.13`.
The exact compositions, lockfile, probe and unfiltered diagnostics are in
[validation/solid2-overlays](validation/solid2-overlays).

| Primitive | Chromium and Firefox result | Adoption decision |
| --- | --- | --- |
| Tabs | Arrow interaction completes, but eight diagnostics per browser include STRICT_READ_UNTRACKED, EFFECT_RELAY_TEAR and EFFECT_WRITES_OWN_SOURCE. | Do not adopt this composition unchanged. |
| Popover | Two diagnostics per browser; the Close button is not available before the interaction timeout. | Required open/close acceptance fails. |
| Alert Dialog | Four diagnostics per browser; Cancel is not available before the interaction timeout. | Required open/cancel acceptance fails. |

The probe records observations; its process exit code is not an acceptance gate.
Timeouts establish that the tested interaction did not complete, not the exact
upstream cause. Earlier Dialog ID/presence fixes remain isolated experiments;
they are not silently promoted into this implementation. These results do not
claim that Kobalte cannot be repaired or that every composition fails.

Reproduce using an isolated install of this directory's package.json/bun.lock:

```sh
bun run dev
# In a second terminal in validation/solid2-overlays:
node probe.mjs
```

The probe uses port 4401, a three-second locator timeout, captures every browser
warning/error and writes `unpatched.json`. Its Tabs action checks only that the
arrow key can be sent; the warning count alone already fails adoption.

Kobalte supplies all three APIs, so this is an acceptance gap, not a missing
catalog capability that requires adding corvu. The existing assessment of
`@corvu-next/dialog@0.1.4` identifies a Solid 2 fork with exact beta.17 peers;
no rc.13 runtime acceptance is claimed for that fork in this batch. Corvu is not
installed in production. Tabs uses owned signal state and native buttons;
Popover uses the browser top layer plus `@floating-ui/dom@1.8.0`; Alert Dialog
uses native modal dialog behavior plus owned focus wrapping. Their independent
acceptance results are in [OVERLAYS-DELIVERY.md](OVERLAYS-DELIVERY.md).
