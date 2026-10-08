# Real Loading boundary hydration

2026-10-08. Extend the source hydration harness with a real unresolved promise,
Solid `createMemo` and `Loading`, public Skeleton fallbacks and an editable field
outside the boundary. The server renders the pending fallback; browser controls
resolve requests or unmount their owners. No component implementation, dependency,
production API or visual baseline changed.

## The fallback identity distinction

The initial test assumed every fallback element would remain connected after
hydration settled. That assertion failed in all three engines: only the fallback
container, status paragraph and two placeholders were replaced. The rest of the
server tree remained connected.

A native-placeholder comparison and synchronous node capture isolated the cause:

1. Immediately after `hydrate()` returns, **every SSR element is still connected**.
2. Solid then replaces exactly the four pending fallback elements in a queued
   client handoff. The native and Skeleton variants have the same behavior.
3. The field, its pre-hydration draft, and all elements outside that fallback
   retain identity. The total element count remains unchanged.

This follows the installed **Solid 2.0.0-rc.13** implementation:
`ssrLoadingBoundary` in `solid-js/dist/server.js` serializes `$$f` for an unresolved
`renderToString` boundary; `hydratedCreateLoadingBoundary` in `solid.dev.js` claims
its fallback and queues release/recreation for client async work. Unlike the
previous Tabs registration bug, replacement is confined to the runtime's pending
fallback and also occurs with ordinary native placeholders.

The tests explicitly assert both phases. They do not skip identity checking:
all synchronous claims must retain identity, and later replacement must be exactly
those four fallback elements. Existing Tabs and form identity assertions remain
unchanged. Editable drafts live outside the replaceable fallback in this fixture.

[Initial strict identity failures](evidence/loading-hydration-focused.json),
[native/Skeleton differential](evidence/loading-hydration-handoff.json).
These are historical exploratory runs; they retain the original overly strict
identity assertion. Their Playwright reports contain durations; they were not
separately wall-clock timed.

## Verified scenarios and boundaries

[Shared SSR/client fixture](../tests/hydration/loading.tsx) and
[browser assertions](../tests/hydration/loading.spec.ts) cover four scenarios in
Chromium, Firefox and WebKit:

- Native placeholders reproduce the same claim/handoff sequence and resolve to
  ready content, independently of Skeleton's implementation.
- A hydrated Skeleton fallback resolves via a real promise. Fallback/status nodes
  disappear, the surrounding draft keeps its node, value and focus, and keyboard
  unmount removes the ready subtree while keeping focus on the control.
- Unmounting pending content disconnects its fallback. Late completion leaves it
  unmounted; a stale request also cannot replace a newly mounted fallback. The
  newest request resolves normally, and the surrounding draft survives.
- Disposing the entire hydrated root removes all content. A harness-owned control
  then resolves the original promise, and no content or Skeleton returns.

Promise settlement is followed by two animation frames before absence checks.
Every scenario uses the strict browser diagnostic fixture. This is synchronous
SSR of a pending fallback followed by **client-owned completion**, not streamed
server data. Ready-at-SSR boundaries, streamed fragments, rejection/retry, refetch
transitions, multiple roots, async overlays, physical assistive technology and a
published SSR distribution remain outside this increment. Existing CSR Loading
coverage continues to cover light/dark, narrow/enlarged and reduced-motion states;
no new hydration-specific visual claim is made.

## Verification

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | Passed (exit 0) | 2.42 s |
| `bun run lint` | Passed (exit 0) | 1.09 s |
| `bun run test` | 104 passed (exit 0) | 2.96 s |
| `bun run test:coverage` | 100% on all four coverage metrics (exit 0) | 3.21 s |
| `bun run test:server` | 7 passed (exit 0) | 0.69 s |
| `RESULTS_FILE=docs/evidence/loading-hydration-hydration.json bun run test:hydration` | 57 passed: 54 positive cases + 3 prior unsafe-registration characterizations (exit 0) | 33.63 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/loading-hydration-integration.json bun run test:integration` | 255 passed (exit 0) | 209.10 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/loading-hydration-e2e.json bun run test:e2e` | 213 passed, including 12 visual tests (exit 0) | 132.40 s |

All **525 browser executions** attach empty warning/error/page-error diagnostics;
there are no retries, skips or flaky results. The 12 new Loading cases record zero
replacements during the synchronous claim and exactly four fallback replacements
after the handoff. All 15 existing visual baselines pass unchanged. Unit coverage
remains 1,217 statements, 699 branches, 488 functions and 379 lines, all covered.

[Exact timings](evidence/loading-hydration-commands.json),
[verification output](evidence/loading-hydration-verification.txt),
[coverage](evidence/loading-hydration-coverage.json),
[hydration and handoff attachments](evidence/loading-hydration-hydration.json),
[source integration](evidence/loading-hydration-integration.json),
[built journeys](evidence/loading-hydration-e2e.json).
Durations include builds and server setup. Full source/test/config/documentation
review and whitespace checks passed. Root workspace, admin, Electron, physical
IME and manual assistive-technology sessions were not run. The previously observed
WebKit Combobox visibility failure did not recur; this test-only batch makes no
claim to fix that separate issue.

## DELIVERY.md disposition

| Criterion | Disposition |
| --- | --- |
| State has clear ownership | Each request has its own stable promise; selection/completion state and the native draft belong to the fixture. Skeleton has no data logic. |
| Every state is usable | Pending, ready, unmounted and disposed states have explicit assertions and controls. Error/retry is outside this task and remains unverified. |
| Failures have a recovery path | A fresh request can mount after disposal; old completions cannot overwrite it. No backend mutation or retry is introduced. |
| Async work stays consistent | Late resolution is checked after pending unmount, replacement by a new request and full-root disposal. |
| Platform boundaries hold | Public package exports and web test tooling only; AppApi/IPC/desktop adapters are not involved. |
| Reactivity and cleanup are deliberate | Solid owns real async memo/boundary lifetime. Tests require removed subtrees to stay disconnected after settlement. No new production effects or subscriptions. |
| Keyboard and assistive access work | One app-owned status names pending work; placeholders are aria-hidden; ready unmount uses keyboard activation and resolution preserves editing focus. Manual AT is unrun. |
| Appearance remains customizable | Existing semantic styles and baselines are unchanged. Existing visual regression gate is rerun; hydration-specific screenshots are not added. |
| Structure and performance fit the feature | Test-only fixture, server page and narrow harness controls. No production behavior or performance claim. |
| Tests prove the behavior | Real SSR markup and browser hydration, exact claim identity, bounded fallback replacement, resolution and disposal assertions. See measured gates above. |
| Delivery evidence is accurate | Runtime handoff, initial failed assumption, scope limits, timings and updated matrix are explicit. |

Next: verify rejection and retry through Solid's Errored boundary while preserving
user drafts and preventing stale recovery results.
