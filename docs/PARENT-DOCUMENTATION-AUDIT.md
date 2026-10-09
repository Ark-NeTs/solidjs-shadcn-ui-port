# Parent-documentation boundary audit — 2026-10-09

Audited the standalone Solid repository for unrelated documentation from its
former parent project. No unrelated parent directory trees or exact copies of
parent documentation were found in the checked scope. Stale parent-specific
requirements were present inside this project's own active documentation and
have been removed.

## Findings and cleanup

- Replaced the old specification's missing parent-file prerequisites, workspace
  gates, application framework history, roadmap slots and approval checkpoints
  with the current standalone goal, runtime, package boundary and acceptance
  requirements.
- Replaced the outdated ten-component plan with current 65-family status and
  links to the maintained acceptance records.
- Scoped the UI checklist to public props/signals, consumer-owned services and
  SSR-safe browser APIs, removing desktop adapter and IPC requirements.
- Reduced origin notes to the relevant package encapsulation and implementation
  rationale. Removed the unrelated storefront decision from foundation notes and
  the private decision identifier from the public component-guide introduction.
- Updated deployment guidance to this repository's GitHub default branch. Agent
  guidance now explicitly keeps active documents scoped to this library.
- Tightened public packaging to require the exact approved component/guide page
  inventory. An extra JSON page is rejected even when absent from navigation.

## Audited and retained material

[Repository audit evidence](evidence/parent-documentation-audit.json) records
65 reachable commits, 1,454 unique historical paths and 90 tracked Markdown
documents at the audited base. All historical directory trees stay under the
project's source, docs, playground, validation, tests, scripts and deployment
roots; no parent application, workspace, infrastructure or roadmap paths occur.
There are no tracked symlinks. Current tracked blobs were compared with the
parent's `docs/` and `CLAUDE.md` at the original extraction commit: no exact
matches were found. The cleanup and this report are subsequent worktree changes.

All 64 captured UI-reference checksums match. TypeScript parsing confirmed all
42 admin fixtures contain only design-system import/re-export declarations, not
application behavior. The retained browser trace contains test resources, not
source snapshots. These fixtures and dated Solid-package validation/delivery
records are relevant porting evidence and stay excluded from public packaging.
The restaurant form/Data Table example is a deliberately local simulator already
requested for this library, not copied production application code.

Original paths, decision IDs and dated limits may still appear in historical
reports and raw test output. Existing published history is preserved, so earlier
versions of the cleaned active files remain accessible in Git. This audit does
not claim that every historical mention of the former parent was erased.

## Verification

[Measured commands and outcomes](evidence/parent-documentation-checks.json):

| Command | Result | Time |
| --- | --- | ---: |
| `bun run check` | Pass | 5.27 s |
| `bun run lint` | Pass | 2.34 s |
| `bun run test` | Pass (401) | 8.87 s |
| `bun run test:server` | Pass (26) | 1.36 s |
| `bun run docs:check` | Pass | 2.10 s |
| `bun run docs:generate` | Pass | 0.29 s |
| `THEME_PORT=4403 RESULTS_FILE=test-results/parent-docs-source.json bunx --no-install playwright test tests/integration/docs-site.spec.ts` | Pass (21) | 31.16 s |
| `THEME_PORT=4403 RESULTS_FILE=test-results/parent-docs-public.json bun run test:site` | Pass (15) | 23.86 s |
| `bun scripts/check-site.mjs` (injected page) | Pass: extra page rejected | 0.04 s |
| `bun scripts/check-site.mjs` | Pass: clean artifact accepted | 0.03 s |

All 36 browser checks passed in Chromium, Firefox and WebKit with strict
diagnostics. The unit suite verifies generated links and removal of stale public
pages; the public suite verifies internal-page 404s and live examples. The
packaging negative probe rejected an injected unindexed page, then accepted the
restored artifact. Its 167 files include exactly 65 component pages and three
public guides, with no internal assets. All 84 emitted text files were scanned
for the recorded former-project markers: no matches. The 86 relative links in
affected active guides also resolve.

Full per-component source/built sweeps, hydration, visual baselines, consumer,
coverage collection and manual assistive-technology sessions were not repeated.
No component rendering or behavior changed; the public browser suite uses a
fresh production artifact. The ordinary local docs build includes project
reports by design and remains unsuitable for public deployment.

## Acceptance scope

This change affects documentation and static packaging validation. It introduces
no component state, service calls, async lifecycle, rendering or theme changes.
Those UI checklist criteria are N/A; existing component test coverage remains
unchanged. Applicable checks cover Markdown links, generated page inventories,
public exclusion and existing browser navigation. No remote deployment, registry
publication, CI change, secret change or published-history rewrite is included.
