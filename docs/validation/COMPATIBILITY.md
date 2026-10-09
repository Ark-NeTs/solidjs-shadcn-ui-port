> Historical compatibility probes below describe the state on 2026-10-07.
> The implemented 65-family package and its current tests are recorded in
> [catalog completion](../CATALOG-COMPLETION-AUDIT.md) and
> [final package delivery](../PROJECT-COMPLETION.md). The isolated Router next.36 /
> Query rc.5 consumer now verifies the client router/query/Loading/Tabs/Dialog leg
> on the same Solid rc.13 runtime. Older “unrun” and “no package” notes remain
> dated probe history, not the current delivery status.

# Kobalte and corvu compatibility

Checked 2026-10-07 following the owner's selection of Kobalte as the primary
headless library and corvu for complementary primitives. This is verification
evidence for the selection in [specs.md](../project/specs.md), not a completed Gate 0.

**Owner priority clarified:** evaluate Kobalte first for every primitive,
including its existing Drawer and Resizable. Corvu is a fallback for a
documented capability gap, not a dependency to add preemptively. The corvu
and corvu-next probes below are fallback research, not adoption decisions.

**Current finding:** original `@corvu/*` releases fail the Solid 2 linking
probe, but an existing third-party Solid 2 port, `@corvu-next/*`, was found
in the expanded search below. Its Drawer and Resizable passed the `rc.13`
linking probe. Corvu-next runtime compatibility remains untested; maintaining
a new in-house port has not been established as necessary.

**Kobalte browser follow-up:** [BROWSER-VALIDATION.md](BROWSER-VALIDATION.md)
preserves the unpatched five-primitive results. The subsequent
[lifecycle investigation](KOBALTE-LIFECYCLE.md) fixes Drawer Escape and observed
ownerless effects with a pinned harness-only patch, tested in development and
production in Chromium and Firefox. The [presence follow-up](KOBALTE-PRESENCE.md)
also removes Drawer/DialogRoot feedback and relay diagnostics. The subsequent
[ID investigation](KOBALTE-DIALOG-IDS.md) fixes plain Dialog untracked reads,
with zero diagnostics in its tested Drawer/Dialog interactions. The subsequent
[OTP repair](KOBALTE-OTP.md) resolves tested Input OTP diagnostics and label/form
wiring with harness-only Kobalte and shared a11y patches. Explicit Direction,
other primitive diagnostics and a newly observed Drawer timing warning remain
open. Gate 0 remains incomplete.

## Versions tested

| Package | Exact version |
| --- | --- |
| `solid-js` | `2.0.0-rc.13` |
| `@solidjs/web` | `2.0.0-rc.13` |
| `@kobalte/core` | `2.0.0-alpha.2` |
| `corvu` | `0.7.2` |
| `esbuild` | `0.25.12` |

The probe ran outside the repository in
`/private/tmp/solid2-compatibility.sRjLyD`, using Bun `1.4.2`.
The scratch manifest overrode both Solid packages to the versions above so
dependencies could not silently load a second runtime. No dependencies were
added to the application or design-system workspace.

## Method and results

The probe bundled each published JavaScript entry independently with esbuild:
browser platform, ESM output, ES2022 target, production `NODE_ENV`, no external
dependencies, no aliases, and no compatibility shims. Each entry re-exported
the primitive's public exports so its code was retained. This checks dependency
resolution and linking. It does not test JSX compilation, component behavior,
keyboard access, rendering, or cleanup.

Commands were run from the scratch directory. Install time is Bun's reported
duration; build times were measured with `performance.now()` around each build.

| Command / entry | Outcome | Time |
| --- | --- | ---: |
| `bun install --ignore-scripts` | Passed; 61 packages installed in scratch directory | 1.770 s |
| `bun run check.mjs` — `@kobalte/core/dialog` | Build passed; runtime untested | 0.425 s |
| `bun run check.mjs` — `@kobalte/core/select` | Build passed; runtime untested | 0.029 s |
| `bun run check.mjs` — `corvu/drawer` | Build failed; 7 resolution errors | 0.030 s |
| `bun run check.mjs` — `corvu/resizable` | Build failed; 2 resolution errors | 0.014 s |

The overall probe exited with code 1. Source and detailed results remain in
the scratch directory as `check.mjs` and `results.json`; temporary files may
be removed by the system.

## Findings

- Published corvu `0.7.2` declares a `solid-js: ^1.8` peer dependency.
  Drawer, Resizable, and supporting modules import `solid-js/web`; the probe
  failed with `Could not resolve "solid-js/web"`. Solid 2 moved its web
  runtime to `@solidjs/web`. See the
  [official migration guide](https://raw.githubusercontent.com/solidjs/solid/next/documentation/solid-2.0/MIGRATION.md).
- A follow-up check added only an esbuild alias from `solid-js/web` to
  `@solidjs/web`. Both entries still failed. Drawer reported 19 missing-export
  errors covering `splitProps`, `mergeProps`, `batch`, `createComputed`, `on`,
  `getListener`, `onMount`, and `equalFn`; Resizable reported 5 errors covering
  `mergeProps`, `splitProps`, `on`, and `batch`. The published `.jsx` source
  also uses legacy helpers and effects, so selecting the `solid` export
  condition does not by itself remove the migration work.
- Kobalte's two checked entries linked with `rc.13`, but its published peer
  dependencies pin Solid and its web runtime to `2.0.0-rc.3`. Passing this
  linking check does not establish supported or working runtime behavior.
- Using both libraries on Solid 2 therefore remains unverified. A port of
  the required corvu primitives or a compatible upstream release is needed
  before adopting them; the later search identified an existing port to test.
  The selected library direction has not been replaced
  with Solid 1, Ark UI, or another implementation.

## Reassessment — 2026-10-07

The initial failure assessment holds for the exact published versions tested.
It does not establish that corvu can never support Solid 2, or that maintaining
a corvu port is the only way to obtain Drawer and Resizable.

The installed Kobalte `2.0.0-alpha.2` already exposes both
`@kobalte/core/drawer` and `@kobalte/core/resizable`. Both passed the same
browser-linking check against Solid 2 `rc.13`. Their runtime behavior and
feature parity with corvu remain untested. Evaluate these implementations
before deciding that corvu is needed specifically for these two components.
This finding does not change the owner's library selection automatically.

The follow-up probes ran as `bun --input-type=module -` from the same scratch
directory with inline esbuild scripts. Alias results are saved there as
`alias-results.json`; Kobalte results were inspected from the emitted metadata.

| Follow-up entry | Outcome | Time |
| --- | --- | ---: |
| `corvu/drawer`, web-runtime alias added | Build failed; 19 missing-export errors | 0.061 s |
| `corvu/resizable`, web-runtime alias added | Build failed; 5 missing-export errors | 0.016 s |
| `@kobalte/core/drawer`, no alias | Build passed; runtime untested | Not measured |
| `@kobalte/core/resizable`, no alias | Build passed; runtime untested | Not measured |

## Expanded prerelease and signals-core search — 2026-10-07

The initial assessment checked the main corvu package's tags and stable
components. It did not search the individual packages' complete published
version histories or separately scoped Solid 2 forks. The resulting suggestion
to maintain a new port was premature.

Direct npm-registry queries now covered all published versions and dist-tags
for `corvu`, its nine documented primitive packages, and `@corvu/utils`.
No prerelease versions or tags, or metadata declaring `@solidjs/signals`, were
found in those original packages. This does not claim to rule out unpublished
branches or every community fork.

A separate [Solid 2 fork](https://github.com/opencenter-cloud/corvu-next)
publishes `@corvu-next/drawer` and `@corvu-next/resizable`. Both have
`latest: 0.1.5` (peers pinned to `solid-js` and `@solidjs/web` `2.0.0-beta.19`)
and `next: 0.1.3` (peers pinned to beta.15). The umbrella `corvu-next` package's
latest is `0.1.4`, so it does not select the newest individual versions.

Both individual packages were installed at `0.1.5` in the same scratch probe.
Solid overrides stayed at `rc.13`; no aliases or source patches were added.
Entries used `export * as Primitive from '<package>'` to retain default exports
as well as named exports. Both linked successfully. The resolved dependency
graph included `@solidjs/signals@2.0.0-rc.13` through `solid-js`; a direct
`@solidjs/signals` import in a UI package is not necessary to use that core.

| Command / entry | Outcome | Time |
| --- | --- | ---: |
| `bun add --exact --ignore-scripts @corvu-next/drawer@0.1.5 @corvu-next/resizable@0.1.5` | Installed in scratch only | 2.820 s |
| `bun --input-type=module -` — `@corvu-next/drawer` namespace | Build passed; runtime untested | 0.058 s |
| `bun --input-type=module -` — `@corvu-next/resizable` namespace | Build passed; runtime untested | 0.019 s |

Detailed probe results are in the scratch directory's `corvu-next-results.json`.
These are compatibility experiments outside the fork's declared peer pins.
Evaluate the existing fork's runtime behavior and integration with Kobalte
before deciding whether any new porting work is needed. No fork dependency
has been adopted into the design-system package.

## Outstanding acceptance checks

Gate 0 remains incomplete. Vite JSX compilation and the five scoped browser
fixtures have now run; see BROWSER-VALIDATION.md for exact outcomes and limits.
Testing-library cleanup, dedicated mounted Dialog/Select tests, router/query
compatibility, async rendering and cross-library overlay behavior remain unrun.

The package has no implementation or `package.json` yet. Package `check`,
`lint`, `test`, `test:integration`, `test:server`, and `test:e2e` commands do not
exist and were not claimed as passing. Repository-wide checks were not run
for these guidance-only changes. Electron and IPC checks do not apply to this
standalone browser-library compatibility probe.
