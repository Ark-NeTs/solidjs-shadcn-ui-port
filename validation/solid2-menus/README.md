# Kobalte menu evaluation

Unpatched `@kobalte/core@2.0.0-alpha.2` against Solid/web/signals
`2.0.0-rc.13` with vite-plugin-solid `3.0.0-next.27`.
Run `bun run dev`, then `bun run probe` in a separate terminal.
The harness uses port 4405 and independent pages for each primitive.

[Raw results](unpatched.json): Dropdown Menu, Context Menu and Menubar each
open, escape-close and unmount in Chromium and Firefox, with three diagnostics
per case. Navigation Menu performs those same checks but emits seven diagnostics.
These are `EFFECT_WRITES_OWN_SOURCE` and `EFFECT_RELAY_TEAR` reports in Menu state;
NavigationMenu adds root-state relays. No warning was suppressed and no package
source patched. Keyboard submenus, hydration, accessibility and positioning are
not certified by this small probe.

The production wrappers therefore need owned behavior at these unchanged pins.
This is not evidence that the menu APIs are missing. Command has no matching
cmdk primitive; its closest Kobalte Combobox/Search candidates are covered by the
existing Combobox evaluation and must not be treated as an accepted command engine.
