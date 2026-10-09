# Inline live documentation — 2026-10-09

All 65 component guides now include a real, interactive Solid example before the
usage reference. The page's theme applies to the example without resetting its
state. Reset preview replaces the example owner. Existing larger galleries remain
available from the same page. Examples use accepted public package exports;
Kobalte evaluation is unchanged and no extra primitive library is introduced.

Examples load only on component pages. Loading is announced, Reset is disabled
until ready, and an unavailable preview keeps the guide readable with an explicit
page-reload action. No arbitrary snippet execution, server API or account is used.

## Verification

All final runs passed. Browser suites use one worker, zero retries and the existing
strict diagnostic fixture. Durations below are measured wall times, except source
and focused reload durations taken from Playwright's reports.

| Command | Result | Time |
| --- | --- | ---: |
| `bun run check` | Pass | 4.60 s |
| `bun run lint` | Pass | 2.10 s |
| `bun run test` | 396 passed | 9.83 s |
| `bun run test:server` | 26 passed | 1.32 s |
| `bun run docs:check` | 7 examples typechecked | 2.12 s |
| `bun run test:coverage --maxWorkers=1` | 396 passed; 100% statements, branches, functions and lines | 40.20 s |
| `THEME_PORT=4403 bun x --no-install playwright test tests/integration/docs-previews.spec.ts tests/integration/docs-site.spec.ts tests/integration/catalog-sidebar.spec.ts --max-failures=1` | 276 passed, three engines | 183.94 s |
| `THEME_PORT=4403 bun x --no-install playwright test tests/integration/docs-previews.spec.ts --grep "shows loading" --max-failures=1` | Final refined recovery fixture: 3 passed | 9.57 s |
| `THEME_PRODUCTION=1 THEME_PORT=4403 bun x --no-install playwright test tests/e2e/docs-previews.spec.ts tests/e2e/docs-site.spec.ts tests/e2e/catalog-sidebar.spec.ts tests/e2e/docs-site/visual.spec.ts --max-failures=1 --update-snapshots=none` | 283 passed, three engines; includes 7 visual checks | 136.11 s |
| `THEME_PORT=4403 bun run test:hydration --grep "hydrates sidebar navigation"` | 3 passed | 8.75 s |
| `WRANGLER_BIN=/tmp/solid-docs-deploy/node_modules/wrangler/bin/wrangler.js THEME_PORT=4403 bun run test:site` | Build and 12 provider-local checks passed | 18.99 s |

Evidence: [static/unit/server/example checks](evidence/live-docs-checks.json),
[final commands and wall times](evidence/live-docs-final-checks.json),
[coverage](evidence/live-docs-coverage.json),
[source](evidence/live-docs-source.json),
[refined source recovery](evidence/live-docs-reload-source.json),
[built](evidence/live-docs-built.json),
[hydration](evidence/live-docs-hydration.json),
[provider-local](evidence/live-docs-public.json).
Browser reports were written using the respective `RESULTS_FILE` paths above.
The public artifact checker reports 65 components, 3 guides, 167 files,
9,554,003 bytes, a largest file of 639,909 bytes and no internal assets.

The custom Button baseline and three new dark preview baselines (Tabs, Data Table,
Dialog) were visually inspected. Existing home light/dark/mobile baselines are
unchanged. The production run verifies all seven without updating snapshots.

## DELIVERY checklist

| Criterion | Evidence or disposition |
| --- | --- |
| State ownership | Every example owns its local state; appearance changes preserve it and explicit Reset replaces its owner. No backend state is introduced. |
| Usable states | Loading/ready/error module states, disabled Reset before loading, empty/restored Data Table, and interactive form/overlay examples are covered. |
| Failure recovery | A held module response with a one-time initialization failure proves explicit reload recovery while the reference remains readable. No mutation retry exists. |
| Async consistency | Import completion checks mounted ownership; Reset cannot run during loading. No application requests or duplicate submissions are introduced. |
| Platform boundaries | Browser-only examples use public component exports. No desktop adapter, IPC, secrets, CI or remote resources change. |
| Reactivity and cleanup | Keyed reset disposes the entire example owner; notification reset is exercised and existing Sidebar listener/overlay regressions remain gates. |
| Keyboard/assistive access | Real forms, arrow-key Tabs, dialog focus return, and mobile axe checks are included. The Sidebar's desktop role override enables an embedded named region; mobile remains a dialog. |
| Customizable appearance | Inherited light/dark and palette state are verified; nine representative families check 390 px width, dark mode and 24 px root text. Visual baselines cover affected previews. |
| Structure/performance | A separate dynamically imported registry mounts only the selected example. It is not per-family code splitting; no network-performance claim is made. |
| Behavior tests | Source, built, provider-local and scoped Sidebar hydration verification is recorded above. |
| Accurate delivery | Test matrix, component contract and architecture decisions are updated; raw reports remain excluded from public builds. |

## Findings and limits

The initial Sidebar preview used its standalone fixed positioning, leaving the
inline wrapper without height. The example now uses relative positioning and a
bounded height. [Initial mounting result](evidence/live-docs-before.json).

The mobile accessibility check then correctly rejected a complementary landmark
nested inside the documentation main content. Sidebar now honors its existing
native `role` prop on desktop, allowing the example to use a named region. Its
mobile role is always `dialog`, and the default desktop role stays complementary.
The new unit case verifies the role through breakpoint transitions.
[Initial landmark result](evidence/live-docs-landmark-before.json).

An intermediate run overlapped unit documentation generation with browser reads;
the trace showed `/docs/index.json` returning Vite's HTML fallback while that file
was being rebuilt. Final browser runs are serialized after generation/unit tests.
[Generation race](evidence/live-docs-generation-race.json).

Two recovery-fixture issues were corrected before final acceptance: Firefox's
held dynamic module delayed page load, so pending-state checks now read DOM state
without forcing layout; WebKit reused an intentionally invalid synthetic module,
so the fixture now serves the real module with a one-time initialization failure.
The final fixture passes in all engines against source and built output without
suppressing diagnostics or increasing timeouts.
[Loading fixture finding](evidence/live-docs-loading-before.json),
[cache fixture finding](evidence/live-docs-cache-before.json).

Parallel coverage instrumentation exceeded the existing five-second limit in the
export inventory case. Serializing coverage with `--maxWorkers=1` passed all 396
tests and retained every coverage threshold; the timeout was unchanged.
[Initial coverage result](evidence/live-docs-coverage-before.json).

All-family mount coverage does not certify every variant or interaction. Manual
screen-reader/physical-device sessions, the full unrelated component browser and
hydration suites, and external publication are outside this increment. No hosted
site was changed. The complete diff and intentional visual changes were reviewed before commit.
All checks listed above passed; no unrelated failures remain open.
