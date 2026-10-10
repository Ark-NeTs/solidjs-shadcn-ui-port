# Public deployment preparation — 2026-10-09

The public static build is prepared for Cloudflare Workers Static Assets. It
serves all 65 component guides at the documentation root, preserves interactive
examples under `/playground`, includes the ArkNeT MIT and upstream notices, and excludes internal
diagnostics/instructions. No account, deployment, custom domain or CI was changed.

## Verification

All commands ran from the Solid package with Bun 1.4.2 and the pinned dependencies.
Browser commands used `THEME_PORT=4403` and their linked `RESULTS_FILE`; the public
suite set `WRANGLER_BIN` to the isolated Wrangler 4.149.0 installation. One worker,
zero retries, and the unchanged strict browser diagnostic fixture applied.

| Command | Result | Time |
| --- | --- | ---: |
| `bun run check` | Typecheck passed | 7.96 s |
| `bun run lint` | Passed | 2.07 s |
| `bun run test` | 395 unit tests passed | 8.00 s |
| `bun run test:server` | 26 server tests passed | 1.31 s |
| `bun run docs:check` | Seven guide compositions typechecked | 2.14 s |
| `bun x --no-install playwright test tests/integration/docs-site.spec.ts` | 18 source documentation checks passed | 22.58 s |
| `THEME_PRODUCTION=1 bun x --no-install playwright test tests/e2e/docs-site.spec.ts tests/e2e/docs-site/visual.spec.ts` | 22 built documentation checks passed, including four unchanged Chromium visual baselines | 26.82 s |
| `bun run test:site` | 12 local Cloudflare browser checks passed | 17.78 s |
| `bun run build:site` in a fresh isolated package copy after `bun install --frozen-lockfile --ignore-scripts` | Library, declarations, public site, notices and artifact validation passed | 4.37 s |
| `node "$WRANGLER_BIN" deploy --dry-run --outdir /tmp/solid-docs-upload-check` | Packaging passed; no upload or account binding | 0.89 s |

Evidence: [static checks](evidence/site-checks.json),
[source browsers](evidence/site-source-docs.json),
[built browsers](evidence/site-built-docs.json),
[public browsers](evidence/site-browser.json),
[isolated build](evidence/site-clean-build.json), and
[deployment dry run](evidence/site-dry-run.json).

The public artifact contains 166 files totaling 9,525,447 bytes; the largest file
is 639,701 bytes. There are 65 component pages, three public guides and notices for
48 installed production package versions. All emitted files and local guide asset
links passed the allowlist and portability checks. Vite still reports its existing
500 kB chunk advisory for the combined example bundle; this increment does not
claim route-level code splitting or network performance optimization.

Typecheck and lint also passed after the portable Wrangler path change. The full
component integration/E2E, coverage, hydration and consumer suites were not rerun;
this increment changes website packaging/navigation, not component runtime code.
The focused source and production documentation suites passed. No Electron changes
or checks apply to this standalone static website.

## DELIVERY checklist

State ownership, recovery, async consistency and cleanup retain the verified
Solid documentation/example implementations. Ready/loading/error/search states
and keyboard/theme behavior remain covered by the documentation suites. Platform
boundaries are static only: there is no server handler, application API or account
binding. Public files are explicitly selected, every file/link is checked, and
source maps/raw diagnostics are excluded. Immutable caching applies only to hashed
assets; HTML, JSON and unversioned screenshots revalidate. Local provider tests
cover native routes, 404 status, headers, examples and enlarged mobile accessibility.
Diff review, exact command outcomes and build measurements are recorded below.
Remote account permissions, DNS, TLS and an actual publication remain unrun;
manual assistive-technology and physical-device limits remain in the test matrix.

## Initial finding

The first local provider test navigated a browser to an intentional missing path.
Chromium emitted the expected HTTP 404 console error, correctly rejected by the
strict diagnostic fixture. The test now checks the actual 404 through HTTP and
renders the same custom page separately; unexpected console warnings/errors still
fail every browser journey. [Initial result](evidence/site-browser-before.json).


The initial public dark-theme accessibility check measured button colors during
an active palette transition in Firefox. The test now waits for the button's
actual CSS animations to finish before measuring contrast; the final theme passes
without disabling transitions or relaxing axe rules.
[Original transition result](evidence/site-theme-transition-before.json).

A fresh source copy also exposed that the repository-wide `*.txt` ignore omitted
`deployment/robots.txt`. A package-specific exception now includes it, and the
isolated locked install/build passes. A sandboxed Wrangler attempt could not bind
its local inspector port; the final provider tests ran with loopback access.

## Review and release boundary

Reviewed the complete change, including generated evidence, dependency lock and
upstream notices. No component runtime, secrets, CI configuration or remote
resources changed. The public host is prepared but has not been published; the
remaining operational step is choosing the Cloudflare account and hostname, then
following the explicit publish and remote acceptance instructions.

## Publication — 2026-10-10

The owner selected `solidjs-shadcn-ui.westark.net`, a subdomain of the active
`westark.net` zone in the owner's Cloudflare account. `wrangler.jsonc` declares
it as a custom domain, keeps `workers.dev` enabled and disables per-version
preview URLs. The owner connected `main` to Cloudflare Workers Builds with the
documented build/deploy commands, pinned Node 25.3.0/Bun 1.4.2 and an
automatically created build token; preview builds are disabled.

| Item | Result |
| --- | --- |
| Custom domain | <https://solidjs-shadcn-ui.westark.net> |
| `workers.dev` | <https://arknet-solid-ui-docs.dmytro-yeremieiev.workers.dev> |
| First hosted deploy | Commit `eed74b0`, version `82b2bbbf-d537-45cd-aed0-bc14563b9f9e`, 11:19 UTC; 167 artifact files, 9,609,802 bytes |
| Push-triggered redeploy | Commit `b1f79e9`, version `9738a3ec-516f-42fd-b88b-a25c5303ec24`, 11:34 UTC; Cloudflare reports preview URLs disabled |

Before the first push, `bun run check`, `bun run lint`, `bun run test`,
`bun run test:server`, `bun run build:site`, a Wrangler dry run, and
`THEME_PORT=4403 bun run test:site` passed; the last ran 15 Chromium, Firefox and
WebKit checks against local Wrangler with the custom-domain configuration.

Live acceptance on both hostnames: root, component deep link
(`/?component=tabs`), `/playground?catalog-data-table`, `/legal/LICENSE.txt` and
`/deployment.json` returned 200 over valid HTTPS; an unknown path returned the
custom 404. On the custom domain in a desktop-app browser pane: search narrowed to
Data Table; the Tabs preview selected Password and showed its panel; the Data Table
preview sorted Amount descending; dark mode kept table text legible; the 375px
layout had no horizontal overflow; Get Code showed the full theme CSS; no console
errors appeared. That pane denied clipboard access and showed the manual-copy
fallback; the owner then confirmed **Copy Theme** in their own browser.

Not run remotely: the Playwright site suite, Firefox/WebKit, physical devices,
assistive technology and performance measurement. Workers Builds deploys `main`
without waiting for GitHub CI; the same day, the repository ruleset
“Protect main: require CI” began requiring pull requests with all 17 CI jobs
passing before changes reach `main`, with an administrator bypass.
