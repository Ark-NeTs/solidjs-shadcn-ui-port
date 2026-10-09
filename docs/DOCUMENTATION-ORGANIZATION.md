# Documentation organization — 2026-10-09

Moved 25 root Markdown documents into their respective folders. README.md and
AGENTS.md remain at the root as the repository entry point and agent instructions.

| Folder | Documents |
| --- | --- |
| `docs/project` | Specifications, implementation plan, component map and decisions |
| `docs/checklists` | Reusable delivery checklist |
| `docs/validation` | Browser and compatibility investigations and Kobalte evaluations |
| `docs/delivery` | Former root component delivery reports |

Relative links were rebased in moved documents and updated wherever maintained
Markdown links referenced those files. Catalog readers use the relocated map.
Local documentation discovery now includes nested Markdown pages, while public
website generation keeps its explicit three-page allowlist. Original filenames
and historical command/evidence text are retained.

## Verification

Measured commands and outcomes are recorded in
[evidence/documentation-organization.json](evidence/documentation-organization.json).

| Command | Result | Time |
| --- | --- | ---: |
| `bun run check` | Pass | 5.19 s |
| `bun run lint` | Pass | 2.41 s |
| `bun run test` | Pass (401) | 8.58 s |
| `bun run test:server` | Pass (26) | 1.31 s |
| `bun run docs:check` | Pass | 2.28 s |
| `THEME_PORT=4403 RESULTS_FILE=test-results/docs-organization-source.json bunx --no-install playwright test tests/integration/docs-site.spec.ts` | Pass (21) | 31.30 s |
| `THEME_PORT=4403 THEME_PRODUCTION=1 RESULTS_FILE=test-results/docs-organization-built.json bunx --no-install playwright test tests/e2e/docs-site.spec.ts tests/e2e/docs-site/visual.spec.ts` | Pass (33) | 34.15 s |
| `THEME_PORT=4403 RESULTS_FILE=test-results/docs-organization-public.json bun run test:site` | Pass (15) | 21.58 s |

All 1,290 previously valid maintained relative Markdown links were checked
against their expected destinations after relocation; see the
[layout and link audit](evidence/documentation-layout.json). The generator retains all
65 families and discovers 78 local pages, including every relocated document.
All existing documentation visual baselines matched. The public website keeps
its three-page content allowlist. The former workspace's three links to the
foundation report and implementation plan now follow the new paths.

The initial built Firefox run exposed premature layout inspection in the new
navigation test. Both link clicks now explicitly wait for full navigation;
source and built suites passed afterward with diagnostics enforced. No warning
filter, retry or production behavior change was introduced.

Moved documents have new repository paths and local documentation IDs. Older
internal bookmarks using root document IDs must use the new paths.

## Acceptance scope

This is a documentation and build-discovery change; component state, async work,
cleanup, semantics, tokens and public exports are unchanged. New unit and browser
assertions cover nested page discovery, navigation and reload. Existing website
checks cover keyboard navigation, copy feedback, page-error retry, mobile themes
and accessibility. Desktop IPC, mutations and backend failure transitions do not
apply. No performance claim is made.

Full per-component integration/e2e sweeps, hydration, consumer and manual
screen-reader checks are not repeated for this change. Existing component
acceptance records remain in the test matrix.

## Documentation index — 2026-10-09

Added [the documentation index](README.md), linked near the top of the repository
README. It groups all 25 organized documents under project, checklists, validation
and delivery, alongside user guides and current acceptance entry points. All 37
index links resolve. The local generator discovers it as a normal documentation
page; the public website retains its existing explicit allowlist.

[Measured verification](evidence/documentation-index.json):

| Command | Result | Time |
| --- | --- | ---: |
| `bun run check` | Pass | 5.64 s |
| `bun run lint` | Pass | 2.27 s |
| `bun run test` | Pass (401) | 8.71 s |
| `bun run test:server` | Pass (26) | 1.28 s |
| `bun run docs:check` | Pass (7 compositions) | 2.14 s |
| `bun run docs:generate` | Pass (65 families, 79 pages) | 0.26 s |
| `THEME_PORT=4403 RESULTS_FILE=test-results/documentation-index-browser.json bunx --no-install playwright test tests/integration/docs-site.spec.ts` | Pass (21) | 29.13 s |

The existing unit suite checks every generated documentation link, including
the new index. Existing documentation navigation scenarios pass in Chromium,
Firefox and WebKit with strict diagnostics. No runtime code or tests changed.
Full component integration/E2E, built-site, hydration, consumer, visual and manual
screen-reader suites were not repeated for this Markdown-only change. The UI
checklist's state, async work, IPC and cleanup requirements do not apply; this
change adds navigable documentation without new interaction behavior or styling.
