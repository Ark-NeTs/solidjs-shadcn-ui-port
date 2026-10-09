# Live theme generator — 2026-10-09

Subsequent canvas expansion: [37-card reference layout and fresh acceptance](THEME-CANVAS-EXPANSION.md).
The results below describe the initial generator delivery.

The docs Themes link opens `/docs.html?create` locally and `/?create` in the public
static website. The customization sidebar and live card canvas follow the owner's
[shadcn/ui create reference](https://ui.shadcn.com/create) and attached Theme popup.
The implementation uses this package's Solid components. It offers five base
palettes, seven accent/chart palettes, four local font stacks for headings/body,
five radii, two densities, light/dark mode, locked shuffle and reset. The settings
are shareable through the URL. The export popup contains only Theme Tokens, a
scrollable `globals.css` block and copy actions. No project setup tabs are present.

Both `:root` and `.dark` are exported, including all semantic, sidebar and chart
variables, radius, fonts and spacing. The preview and export use the same pure
mapping. Presets are owned by this package; this is not a claim of identical
upstream presets, icon libraries, framework scaffolding or font catalogs.

## Acceptance

| DELIVERY criterion | Evidence/disposition |
| --- | --- |
| State ownership | Theme configuration, locks, clipboard status and mounted example drafts have separate owners. Styles/export derive from configuration. No server state. |
| Usable states | Ready canvas, clipboard pending/success/denied states, local form submission, filtered/empty table and pagination. No remote loading phase is introduced. |
| Recovery | Denied copy leaves selectable code and an explicit retry. Invalid URL options fall back to safe defaults. |
| Async consistency | Copy is disabled while pending; a generation guard rejects completion after close/reopen/disposal. |
| Platform boundaries | Browser-only, no AppApi/IPC/desktop adapter, credentials, backend, CI or account changes. |
| Cleanup | Existing accepted components own listeners/observers; appearance changes preserve mounted examples. |
| Keyboard/accessibility | Labeled controls, native selects, semantic modal, Escape, opener focus, pending status, mobile axe and existing component keyboard behavior. |
| Appearance | Light/dark mode, semantic tokens, mobile/enlarged text, inherited modal theme and reviewed screenshots. Fonts use bundled Inter or system fallbacks. |
| Structure/performance | Pure allowlisted model, separate shell/canvas, no arbitrary CSS input or code evaluation. No performance benchmark claim. |
| Tests | Unit, server, source/built browser, visual and provider-local results below. No library primitive changed. |
| Evidence | Architecture and test matrix updated. Full diff and affected screenshots reviewed. |

## Verification

All final checks passed with one browser worker, zero retries and the existing
strict warning/error fixture. The tests use isolated port 4403 and leave the
owner's local 4399 server intact.

| Command | Result | Time |
| --- | --- | ---: |
| `bun run check` | Pass | 5.47 s |
| `bun run lint` | Pass | 2.64 s |
| `bun run test` | 400 passed | 11.40 s |
| `bun run test:server` | 26 passed | 1.75 s |
| `THEME_PORT=4403 bun x --no-install playwright test tests/integration/theme-generator.spec.ts tests/integration/docs-site.spec.ts --max-failures=1` | 42 passed, three engines | 56.22 s |
| `THEME_PRODUCTION=1 THEME_PORT=4403 bun x --no-install playwright test tests/e2e/docs-site/visual.spec.ts --project=chromium --update-snapshots=changed --max-failures=1` | 11 passed; eight affected screenshots visually reviewed | 12.61 s |
| `THEME_PRODUCTION=1 THEME_PORT=4403 bun x --no-install playwright test tests/e2e/theme-generator.spec.ts tests/e2e/docs-site.spec.ts tests/e2e/docs-site/visual.spec.ts --max-failures=1 --update-snapshots=none` | 53 passed, three engines | 54.55 s |
| `WRANGLER_BIN=/tmp/solid-docs-deploy/node_modules/wrangler/bin/wrangler.js THEME_PORT=4403 bun run test:site` | Public build and 15 provider-local checks passed | 22.47 s |

Measured evidence: [static/unit/server](evidence/theme-generator-checks.json),
[browser commands/timing](evidence/theme-generator-browser-checks.json),
[source](evidence/theme-generator-source.json),
[visual review](evidence/theme-generator-visual.json),
[built](evidence/theme-generator-built.json),
[public](evidence/theme-generator-public.json).
Each browser run also sets `RESULTS_FILE` to its corresponding evidence path.
The public artifact check reports 65 families, 167 files, 9,581,270 bytes and zero
internal assets. The real in-app browser clipboard action returned “Theme copied.”
Manual inspection confirmed the dark export layout against the supplied reference.

No new dependency or component-library primitive is introduced. Existing package
coverage percentages were not remeasured; the whole unit and server suites and
the affected browser/public-site suites were run.

## Findings and limits

Browser checks caught a label that included select-option text and two low-contrast
canvas captions. Labels are now explicitly associated siblings and supporting
text mixes in foreground color. Manual inspection caught an immediately preceding
configuration being serialized before Solid's scheduled write; URL serialization
now receives the exact next configuration. Tests cover reload parity.

Vitest's CSS stub does not return raw stylesheet content. The model test supplies
the actual canonical file through a test-only raw-import mock. The browser tests
exercise Vite's real raw import in both source and production modes.

The existing documentation navigation now includes Themes; affected page-level
baselines are intentionally updated. Component-only preview baselines are unchanged.
No external deployment, full unrelated browser/hydration run, physical-device or
manual screen-reader session is included. Per-setting locks are session-local;
selected appearance settings are retained in the URL. Export assumes the existing
Solid UI/Tailwind semantic-token setup and is pasted after its theme imports.
