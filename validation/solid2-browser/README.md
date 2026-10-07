# Solid 2 browser validation harness

An isolated compatibility experiment for the Kobalte-first decision in
`../../specs.md`, informing the D19 package boundary. It exports no production
components and is not the design-system package or the complete Gate 0.
The owner requested these five browser probes before implementation.

See [KOBALTE-OTP.md](../../KOBALTE-OTP.md) for current findings and
limits; [BROWSER-VALIDATION.md](../../BROWSER-VALIDATION.md) preserves the unpatched
baseline. The manifest applies cumulative Kobalte and shared a11y patches. It is
an experiment, not production adoption or an upstream release.
The acceptance suite intentionally fails for unresolved library/API gaps;
there are no expected-failure annotations that turn those failures green.

## Files

- `main.jsx`: independent Drawer, Resizable, Calendar and Direction fixtures.
- `otp-probe.jsx`: controlled/uncontrolled OTP, form and ARIA contracts.
- `tests/primitives.spec.js`: browser interactions, diagnostics and cleanup checks.
- `vite.config.js`, `playwright.config.js`: Solid compiler and two-browser matrix.
- `bun.lock`: exact resolved dependency graph, including the compiler and plugin.
- `patches/`: cumulative Kobalte patch and shared a11y source-registration patch.
- `dialog-presence.jsx`: plain Dialog and unchanged presence-helper isolation fixtures.
- `scripts/trace-presence.mjs`: independent presence diagnostic capture.
- `scripts/trace-dialog-reads.mjs`: untracked-read call stacks and ID/ARIA snapshots.
- `scripts/trace-otp.mjs`: OTP warning stacks, input IDs and native FormData.
- `baseline/dialog-ids/`: previous patch before the OTP repair.
- `evidence/otp-*.json`: current matrix, control, and OTP traces.
- `baseline/presence/`: independently installable patch before the ID repair.
- `evidence/reads-*.json`, `evidence/dialog-reads-*.json`: historical Dialog matrix and ID traces.
- `baseline/lifecycle/`: previous lifecycle-only patch, manifest and lockfile.
- `evidence/feedback-*.json`, `evidence/presence-*.json`: historical presence-stage evidence.
- `baseline/`: original unpatched manifest/lockfile for the control run.
- `evidence/patched-*.json`, `evidence/unpatched-control.json`: historical lifecycle outcomes
  with full console diagnostics preserved.
- `evidence/dev.json`, `evidence/production.json`: retained case-level outcomes,
  console diagnostic codes and assertion errors from 2026-10-07.
- `evidence/screenshots/`: diagnostic fixture captures, not shadcn visual baselines.

## Environment and commands

No secrets, application servers, databases, production dependencies or package
exports are involved. Run in a fresh directory outside the monorepo to avoid
altering its dependency resolution. The following commands assume this folder
is the current directory:

```sh
harness_dir=$(mktemp -d /private/tmp/solid2-browser.XXXXXX)
cp -R . "$harness_dir/"
cd "$harness_dir"
bun install --frozen-lockfile --ignore-scripts
# Only if these Playwright browsers are not already installed:
bunx --no-install playwright install chromium firefox
bun run dev
```

Run tests from a second terminal in that same temporary directory:

```sh
RESULTS_FILE=dev-results.json bun run test
bun run build
bunx --no-install vite preview --host 127.0.0.1 --port 4400 --strictPort
```

While preview is running, use another terminal in the same directory:

```sh
HARNESS_URL=http://127.0.0.1:4400 RESULTS_FILE=production-results.json \
  bun run test --output=production-test-results
```

Development uses localhost port 4399; production preview uses 4400.
`HARNESS_URL` overrides the test target; `RESULTS_FILE` selects the raw JSON
report path. These are scratch-harness settings, not application configuration.
Both servers can be stopped with Ctrl+C. Tests use one worker, zero retries,
Europe/Istanbul timezone, Chromium and Firefox. The CDP touch case is explicitly
skipped in Firefox; it does not represent physical touchscreen testing.

Open `/?case=drawer`, `resizable`, `calendar`, `otp`, `direction`, `dialog`, or
`presence`. The presence fixture is an intentionally unchanged positive control;
its diagnostics are not an accepted implementation.
Calendar accepts `&mode=single|multiple|range`; Resizable accepts
`&orientation=horizontal|vertical`. OTP's optional `&wire=explicit` demonstrates
the public-prop workaround: set Label `for` and Input `id`/`name` explicitly.
The default OTP fixture now exercises repaired library wiring. `&uncontrolled`,
`&default=12` and `&cancelReset` exercise reset contracts. Unmount/Mount controls reset a fixture's ownership tree.

## Agent gotchas

- Tested with Bun 1.4.2 and Node 25.3.0. The resolved Solid Vite plugin requires
  Node >=22.12.0; do not silently use a legacy Solid 1 compiler.
- `vite-plugin-solid@3.0.0-next.27` is a forwarding package. Its lockfile resolves
  `@solidjs/vite-plugin@3.0.0-next.47` and the `rc.13` compiler. Preserve the lock.
- Solid core, web and signals are overridden to the same `rc.13` version.
  Kobalte declares `rc.3` peers, so this is an experiment outside those exact
  peer pins. Do not portray it as upstream-certified compatibility.
- Development diagnostics are enabled. Production silence does not resolve
  development ownership/reactivity warnings.
- Every case rejects ownership diagnostics for its full lifetime. Drawer also
  rejects all warnings/errors, as do plain Dialog and OTP.
  Other interaction diagnostics are retained but not all are failing assertions; see
  the current report before making an acceptance claim.
- The ResizeObserver instrument tracks observed DOM targets through observe,
  unobserve and disconnect. It is a narrow detached-target cleanup check, not
  a complete heap, timer, event-listener or reactive-effect leak detector.
- Calendar date cells and their triggers both have `data-value`. Interact with
  the `data-type="day"` trigger. Drawer CloseButton's accessible name defaults
  to “Dismiss”, independently of its visible text.
- Wait for Drawer opening/snapping transitions before subsequent gestures.
  Native OTP autofill, OS clipboard paste and password-manager behavior are
  outside this run. Do not infer them from typing/fill tests.
- Source files here are fixtures, not reusable UI wrappers. Do not copy their
  plain diagnostic CSS into the production design system.

## Distribution and unpatched control checks

To exercise Kobalte's published compiled JS instead of its Solid JSX exports,
stop the development server and restart it with the explicit alias switch:

```sh
KOBALTE_DISTRIBUTION=js bun run dev --force
```

From another terminal in that directory:

```sh
RESULTS_FILE=patched-js-results.json bun run test --grep 'drawer|resizable'
```

For an unpatched control, make a separate fresh scratch copy, replace its
`package.json` and `bun.lock` with the two files in `baseline/`, then run
`bun install --frozen-lockfile --ignore-scripts`. The same current fixtures and
regression assertions run against the original dependency. Serve with
`bun run dev --port 4411` and run:

```sh
HARNESS_URL=http://127.0.0.1:4411 RESULTS_FILE=unpatched-control-results.json \
  bun run test --grep 'nested layer|prevented Escape|dispose document|disposed panels'
```

The original control fails all eight cases. The current patched matrix has 74 cases per
mode (63 pass/10 fail/1 skip in dev; 67 pass/6 fail/1 skip in production). The
current compiled JS Drawer/Dialog subset has 37 pass/1 skip (use
`--grep 'drawer|dialog'`). No expected-failure
annotations hide unresolved cases. See the report for diagnostic limitations.
Drawer accepts `&nested` and `&preventEscape` for the added regressions.

## Reproduce the feedback/relay isolation

Run `TRACE_FILE=presence-after.json node scripts/trace-presence.mjs` against the
normal development server. It captures the standalone helper, plain Dialog and
Drawer through two open/close cycles and unmount, preserving full messages.
Expected with the current patch: the unchanged helper still reports both target
codes; plain Dialog and Drawer report no diagnostics. The retained presence
before/after captures are historical snapshots from before the ID repair.

For the prior-patch control, make a fresh scratch copy of this harness. Replace
its manifest, lockfile **and patch directory** with those in `baseline/lifecycle/`,
then install with `bun install --frozen-lockfile --ignore-scripts`. Serve on 4411:

```sh
bun run dev --port 4411 --force
```

From another terminal in that control directory:

```sh
HARNESS_URL=http://127.0.0.1:4411 TRACE_FILE=presence-before.json \
  node scripts/trace-presence.mjs
HARNESS_URL=http://127.0.0.1:4411 RESULTS_FILE=feedback-control-results.json \
  bun run test --grep 'dialog:|derived Dialog presence'
```

The six new cases in two browsers produce 4 pass/8 fail with the prior patch;
all 12 pass with the current patch. Dialog accepts `&initial`, `&uncontrolled`
and `&force`. The force-mounted fixture supplies CSS to hide closed content.
`@solid-primitives/presence@1.0.0-next.2` is an explicit dev dependency only for
this isolation; it was already a transitive dependency and remains unmodified.

## Reproduce the Dialog ID isolation

Against the current development server:

```sh
TRACE_FILE=dialog-reads-after.json node scripts/trace-dialog-reads.mjs
```

It opens a plain Dialog, changes the root ID, and captures warning stacks plus
DOM IDs and ARIA references. Current output updates every ID/reference and has
no warnings. For the preceding implementation, make another fresh scratch copy,
replace its manifest, lockfile and patch directory with `baseline/presence/`,
install frozen, and serve on 4411. Then run:

```sh
HARNESS_URL=http://127.0.0.1:4411 TRACE_FILE=dialog-reads-before.json \
  node scripts/trace-dialog-reads.mjs
HARNESS_URL=http://127.0.0.1:4411 RESULTS_FILE=reads-control-results.json \
  bun run test --grep 'dialog: generated IDs|dialog: explicit part IDs|dialog: title and description'
```

All six control cases fail; all pass with the current patch. The additional
string-registration compatibility case passes after Solid's update flush.
Optional fixture IDs are omitted with a conditional spread: explicitly passing
`id={undefined}` overrides defaults in this Solid 2 merge implementation and
would test a different contract. Explicit child IDs remain authoritative until
removed. The getter-only intermediate trace is retained to show the additional
relay and layer-callback diagnostics that the complete patch resolves.

## Reproduce the OTP repair

Use the current install for patched behavior; use `baseline/dialog-ids/` manifest,
lockfile and patch directory in a fresh scratch copy for the previous stage.
Serve the control on 4411. The a11y package was already transitive; its explicit
dev dependency supports the fixture's public registration-contract probe.

```sh
TRACE_FILE=otp-after.json node scripts/trace-otp.mjs
RESULTS_FILE=otp-only-results.json bun run test --grep 'otp:'
HARNESS_URL=http://127.0.0.1:4411 RESULTS_FILE=otp-control-results.json \
  bun run test --grep 'otp: provided Label|otp: Root name'
```

The strict OTP suite rejects every warning/error for the full interaction. It
records completion events in a plain array instead of mirroring the value into
a second signal. Copy checks dispatch a synthetic event, not OS clipboard I/O.
Cleanup checks cover document selection listeners, styles, observed roots,
cancelled reset work and detached input/form callbacks, not a complete heap audit.
Place Playwright artifacts outside the served directory; Vite also ignores test
result folders so trace HTML cannot trigger a mid-test reload.
