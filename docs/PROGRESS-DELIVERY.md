# Progress delivery

2026-10-08. Adds Progress through public source and build exports, bringing the
package to 24 component families. [Guide](components.md#progress),
[acceptance matrix](TEST-MATRIX.md#progress), [Kobalte evaluation](../KOBALTE-PROGRESS.md).

## Implementation and decisions

- Evaluated unpatched Kobalte alpha.2 first on shared Solid rc.13. Its two-engine
  browser probe passes value/fill/state/remount checks quietly but drops external
  labelledby. A rendering adapter fixes naming and passes source-browser scenarios;
  hydration still leaves its indicator unclaimed. Two attempted fill adapters retain
  the mismatch. The upstream-versus-adapter cause is unresolved, and the reports are
  preserved. This batch adopts the small owned implementation without patching
  dependencies or filtering diagnostics. Existing Toggle stays on Kobalte.
- Derive valid numeric values, normalized max, accessible text and fill from the
  same owner props. Missing/null/nonfinite/out-of-range values mean unknown work;
  invalid max falls back to 100. Zero and fractional values remain valid. The
  component never changes caller data or invents completed work.
- Preserve external names, descriptions, refs, class/style and ordinary div events.
  Managed role/bounds/current value remain consistent. Custom text takes precedence
  over deterministic percentage formatting. Unknown work omits numeric value/text.
- Keep the sibling's semantic thin track, with width based on max and logical flow
  for inherited RTL. Unknown work uses a centered pulsing segment; reduced motion
  leaves it static and removes transitions. Canonical tokens are unchanged.
- No component effect, registration, timer, request, form value or live region.
  The application owns status messages, busy regions, operation failure and retry.
  Actual Solid Loading resolution, focused draft preservation, pending disposal
  and late completion are verified in the public examples.

[DECISIONS.md](../DECISIONS.md) records the lasting choices. No app, sibling package,
CI, secret or production dependency change is included.

## Size

Whole-library JavaScript grows from 141,902 to 143,396 bytes (+1,494);
gzip grows from 35,866 to 36,228 bytes (+362). This compares
baseline `6ac4eed` with the final library build, excludes CSS/fonts/external Solid
runtime and is not a consuming application transfer measurement. No dependency was
added. [Raw size evidence](evidence/progress-size.json).

## Verification

Six new unit cases cover numeric states/bounds, owner updates, stable root/indicator
identity, custom text and reactive external labels, ref/class/style forwarding,
form omission and disposal. One new grouped SSR test checks known/complete/unknown
markup and external names. One hydration scenario per engine checks original
server nodes/IDs, actual indicator width updates, external label ID changes and
root disposal.

Six shared browser scenarios run through source and freshly built exports in
Chromium, Firefox and WebKit: owner values/bounds/remount/Tab order, RTL/resizing,
real Loading resolution with a retained focused draft, pending disposal followed
by late resolution, and light/dark custom colors, enlarged narrow layouts,
reduced motion and axe checks. Three new Chromium images show Progress in
light/dark/mobile. Three gallery images update the component count and link.
All six changed images are visually reviewed.

| Command | Result | Time |
| --- | --- | ---: |
| `bun run check` | Pass | 3.03s |
| `bun run lint` | Pass | 1.39s |
| `bun run test --maxWorkers=2` | 191 tests passed | 7.12s |
| `bun run test:coverage --maxWorkers=2` | 191 tests; 100% statements/branches/functions/lines | 7.85s |
| `bun run test:server` | 13 tests passed | 0.94s |
| `RESULTS_FILE=docs/evidence/progress-hydration.json bun run test:hydration` | 99 passed (96 positive + 3 unsafe-pattern characterizations) | 56.29s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/progress-integration.json bun run test:integration` | 381 passed across Chromium/Firefox/WebKit | 296.01s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/progress-e2e.json bun run test:e2e` | 357 passed: 327 journey runs + 30 Chromium visual tests; fresh library and gallery builds | 207.78s |
| `git diff --check` | Pass | 0.085s |
| `python3 /tmp/audit-progress.py` | 837 final browser results without diagnostics/retries/skips; 33 baselines, 435 local links, 100% coverage, archived library evidence and final build size audited | 0.026s |

[Commands](evidence/progress-commands.json), [output](evidence/progress-verification.txt),
[coverage](evidence/progress-coverage.json), [hydration](evidence/progress-hydration.json),
[source integration](evidence/progress-integration.json), [built E2E](evidence/progress-e2e.json),
[audit](evidence/progress-audit.json), [review](evidence/progress-review.json).

The evidence audit traverses the final reports and their diagnostic attachments,
checks coverage totals, matches documentation images to baselines, resolves local
links and verifies the final bundle size. Rejected Kobalte reports are audited
separately and never counted as passing delivery tests.

Exploratory probes, adapter attempts, focused tests and screenshot generation
preceded the final measured gates and were not separately timed. An initial focused
browser invocation accidentally selected the full suite and was interrupted; an
anchored title filter then matched no tests. The corrected title filter ran the
intended 18 checks. These do not substitute for the final full reports.
Browser suites run sequentially on 4403, the isolated probe uses 4405, and the
user's 4399 preview remains available. Solid rc.14 is published, but this batch
retains rc.13. Unit coverage measures owned source execution, not every behavior
combination or third-party internals.

## DELIVERY.md disposition

| Criterion | Disposition |
| --- | --- |
| State has clear ownership | Value/max come from the application; normalized values, state and fill are derived without writeback. |
| Every state is usable | Zero/fractional/complete/unknown states are explicit; invalid inputs show unknown work and corrected props recover. Application operation errors stay outside the display. |
| Failures have a recovery path | Invalid value/bounds transitions recover when corrected. The component owns no retry or mutation; surrounding UI must explain operation errors. |
| Async work stays consistent | No internal async work. Real Loading resolution/disposal/late-completion cases preserve the shell and leave no indicator behind. |
| Platform boundaries hold | Browser display only; no AppApi/IPC/database/secret/CI access or change. |
| Reactivity and cleanup are deliberate | Two derived memos and normal attribute/style bindings; no effect, registration, listener or timer to leak. |
| Keyboard and assistive access work | Names, descriptions, bounds, current/custom text and unknown-state omission are checked. The status display stays outside Tab order; axe passes documented states. Manual AT remains open. |
| Appearance remains customizable | Semantic tokens, class/style, light/dark, RTL, resizing, custom colors, enlarged narrow layouts and reduced motion checked. No portal or filename content is owned. |
| Structure and performance fit the feature | One small component, no domain logic or new dependency; measured bundle delta. No large-scale performance claim. |
| Tests prove the behavior | Type/lint/unit/coverage/server/hydration/source integration/fresh built gallery E2E checked. No admin/Electron E2E claim. |
| Delivery evidence is accurate | Exact commands/times, raw library and failed-adapter evidence, reports, screenshots, docs/map/matrix and self-review retained. |

Remaining limits: physical screen-reader announcements, forced colors,
streaming/published SSR and real app/Electron composition. No vertical, buffered,
segmented or circular mode. The library hydration mismatch remains unresolved;
it is excluded from the delivered owned implementation.
