# Hydration and reduced Tabs reproduction

2026-10-08. The remaining Tabs failure was caused by the local SSR registration
adapter reading a hydration snapshot before writing the registry. Functional
updates fix it without changing Solid, dependency versions, or Tabs' public API.
The reduced fixture has exactly two tabs and one native input. In Chromium,
Firefox and WebKit, corrected package Tabs retains every server node and the draft
typed before hydration, then switches tabs and preserves subsequent edits.

## Differential evidence

[Fixture](../tests/hydration/tabs-minimal.tsx),
[assertions](../tests/hydration/tabs-minimal.spec.ts).
The external Hydrate/Dispose buttons control the harness, not component state.

| Variant | Before the fix | After the fix |
| --- | --- | --- |
| Native Solid signals | All server nodes and draft retained | Retained; switching and disposal pass |
| Solid context | All server nodes and draft retained | Retained; switching and disposal pass |
| Context + functional registration | All server nodes and draft retained | Retained; switching and disposal pass |
| Functional registration + prop spreading | All server nodes and draft retained | Retained; switching and disposal pass |
| Context + explicit `untrack` read/write | Six descendants replaced; pre-hydration draft lost | Deliberate negative control still reproduces the failure |
| Package root + native children | All server nodes and draft retained | Retained; switching and disposal pass |
| Package triggers + native panels | Two trigger nodes replaced; input retained | Every node and draft retained |
| Package panels + native controls | Six descendants replaced; draft lost | Every node and draft retained |
| Complete package, controlled/uncontrolled | Six descendants replaced; draft lost | Every node and draft retained |

The before-fix comparisons ran in Chromium. The final suite runs every variant
in all three engines. Nine positive variants assert exact identity for every
server element, the pre-hydration input draft, subsequent selection/editing, and
disposal. The tenth variant is explicitly named **unsafe-pattern characterization**:
it asserts the six replacements and lost draft. Its passing result certifies the
reproduction, not acceptable hydration. No package acceptance assertion is skipped
or weakened. The main hydration scenarios now check Tabs descendants too.

[Before-fix comparison](evidence/tabs-minimal-comparison.json),
[part isolation](evidence/tabs-minimal-parts.json),
[bare Solid read/write failure](evidence/tabs-minimal-registration-read.json),
[final three-engine results](evidence/tabs-registration-hydration.json).
Exploratory reports record their then-current source and are historical evidence,
not rerunnable snapshots. The first exploration also contained an incorrect
boolean ARIA assertion; the comparison used corrected string ARIA values.

## Why the registration pattern matters

The local adaptation used:

```ts
setEntries([...untrack(entries), entry]);
```

In the installed `@solidjs/signals` **2.0.0-rc.13** runtime, `untrack` disables
tracking but keeps the current computation/snapshot scope. Signal reads in that
scope may serve the captured hydration value. A functional setter instead receives
the current pending value directly. The reduced comparison changes only this
registration operation and reproduces node replacement and draft loss.

The adapter now exposes an atomic update operation:

```ts
updateEntries(current => [...current, entry]);
```

Its browser implementation uses a functional signal setter; the server updates
render-local metadata without reactive writes. Removal uses the same atomic path.
Direct setters still accept accessor functions as values for overlay IDs.
The unnecessary experimental change to Tabs' children rendering was removed.

This identifies an interaction between our registry algorithm and Solid's snapshot
semantics. It does not establish a general Solid hydration defect: native state,
context and functional registration work. The failing algorithm was introduced
in the earlier uncommitted SSR adaptation, replacing Tabs' original functional
updates. No Kobalte or corvu component participates in this reproduction.

## Harness and other hydration fixes

`bun run test:hydration` compiles public `ui/*` source exports into matched server
and hydratable client builds. `renderToString` and `hydrate` share the render ID;
Solid's generated bootstrap is included. Tests capture actual server nodes before
client component execution. The build rejects server warnings/errors, and browser
tests use the strict warning/error/page-error fixture. Generated files are ignored
under `hydration-dist/`; preview runs on 4403, separate from the user's 4399 gallery.

The carried-forward hydration fixes are also covered:

- Input maps server `defaultValue` to the native `value` attribute; explicit values,
  including empty strings, take precedence. Client-only semantics are retained.
- Compound metadata uses plain request-local storage on the server and owned boxed
  signals in the browser. Both sides allocate signals in the same order. Boxing
  prevents accessor values from becoming Solid 2 derived initializers.
- Label, TabsList and Combobox DOM effects wait for refs. Hydration can commit an
  initial effect before refs arrive; real browser tests and a targeted lifecycle
  simulation cover that ordering. Effects remain in their component owners.

[Main scenarios](../tests/hydration/hydration.spec.ts) prove:

1. Stable component nodes and unique IDs; native initial values, live labels,
   editable fields, mixed Checkbox and Switch, Combobox selection, exact FormData,
   invalid-submission blocking, reset and exactly-once submission callbacks.
2. Selected Tabs with stable descendants, live trigger/panel ID relationships,
   keyboard navigation skipping a disabled tab, and retained mounted drafts.
3. Closed force-mounted Popover/Alert Dialog: updated naming, focus, dismissal,
   retained popup drafts, modal Tab boundaries, confirmation counts and scroll release.
4. Initially-open Popover and Alert Dialog, separately: hydration opens the native
   top layer, focus/escape/reopening work, and disposal releases ownership.

## Limits and previous regression finding

This covers source exports compiled for SSR/hydration. The existing distribution
is still CSR-only; no published server export is added. Streaming, Loading-boundary
hydration, multiple roots, every variant, general pre-hydration event replay,
application integration, Safari devices and manual assistive-technology sessions
remain unverified. The reduced native input specifically proves pre-hydration draft
preservation; this is not a universal form-state preservation claim. No dependency,
CI, backend, Electron or privileged API changes were made.

The previous broader run passed 212/213 built E2E tests and exposed an intermittent
WebKit narrow/enlarged Combobox active-option visibility failure. The active final
option was below the viewport ([screenshot](evidence/hydration-webkit-combobox.png)).
Its cause was not established, and this registration fix does not claim to fix it.
The fresh regression outcome is recorded below; historical failure evidence remains
in [the prior run](evidence/hydration-e2e.json).

## Verification

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | Passed (exit 0) | 2.31 s |
| `bun run lint` | Passed (exit 0) | 1.14 s |
| `bun run test` | 104 passed (exit 0) | 2.92 s |
| `bun run test:coverage` | 100% statements, branches, functions and lines (exit 0) | 2.78 s |
| `bun run test:server` | 7 passed (exit 0) | 0.69 s |
| `RESULTS_FILE=docs/evidence/tabs-registration-hydration.json bun run test:hydration` | 45 passed: 42 positive cases + 3 unsafe-pattern characterizations (exit 0) | 29.93 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/tabs-registration-integration.json bun run test:integration` | 255 passed (exit 0) | 192.33 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/tabs-registration-e2e.json bun run test:e2e` | 213 passed, including 12 visual tests (exit 0) | 120.72 s |

Durations include builds and server setup. All **513 browser executions** attached
empty warning/error/page-error diagnostics, with no retries, skips or flaky results.
The built suite passed all 15 existing screenshot comparisons; baselines are
unchanged. Unit coverage is 1,217 statements, 699 branches, 488 functions and 379
lines, all covered. The earlier WebKit visibility failure did not recur in this
fresh full run; it remains a follow-up if reproduced, not a claimed fix.

[Command timings](evidence/tabs-registration-commands.json),
[verification output](evidence/tabs-registration-verification.txt),
[coverage](evidence/tabs-registration-coverage.json),
[integration](evidence/tabs-registration-integration.json),
[built journeys](evidence/tabs-registration-e2e.json).
Exploratory runs were not separately wall-clock timed; their retained Playwright
reports include test/run durations. Full source/config/test/documentation diff
review and whitespace checks passed. Root workspace, admin, Electron, physical
IME and manual assistive-technology sessions were not run.


## DELIVERY.md disposition

| Criterion | Disposition |
| --- | --- |
| State has clear ownership | Registry metadata is separate from selected/open state; drafts belong to native fields or their explicit fixture owner. |
| Every state is usable | Initial/open/closed/invalid/reset/disposed states and selected/disabled Tabs have assertions. Streaming/Loading hydration remains outside this scope. |
| Failures have a recovery path | Invalid submission retains drafts; reset/resubmission works. No backend retry or mutation introduced. |
| Async work stays consistent | Disposal releases ownership; existing deferred-reset/positioning regression tests remain required. No stale/streaming SSR claim. |
| Platform boundaries hold | Web DOM and isolated build tooling only; AppApi, IPC and desktop adapters are not applicable. |
| Reactivity and cleanup are deliberate | Atomic registry updates avoid snapshot reads; server metadata avoids signal writes; DOM effects wait for refs; disposal is tested. |
| Keyboard and assistive access work | Post-hydration form, Tabs and overlay assertions cover keyboard and accessible relationships. Manual AT remains unrun. |
| Appearance remains customizable | Semantic tokens unchanged; existing visual baselines retained. Minimal probes isolate DOM behavior, not visual acceptance. |
| Structure and performance fit the feature | One internal registration helper and an isolated harness; no performance claim or benchmark. |
| Tests prove the behavior | Positive hydration cases retain all inspected server nodes; explicitly labeled negative controls preserve the rejected algorithm as a reproduction. See regression outcomes above. |
| Delivery evidence is accurate | Historical failures, exact measured commands, scope limits, architectural decision and matrix are recorded. |

Next: extend source hydration coverage to a real Solid Loading boundary resolving
and unmounting; maintain the separate WebKit Combobox follow-up if it recurs.
