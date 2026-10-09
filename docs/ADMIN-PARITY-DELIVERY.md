# Admin import availability — 2026-10-09

After the verified catalog was merged into local `main` at `cb3cabf`, the next
package adoption check exposed a stale hard-coded fourteen-component inventory.
The old report could accept a removed export or reject a newly implemented one;
it did not inspect the actual modules. The README also incorrectly said the
strict check still failed for later components.

The audit now reads public entry points from the package manifest and uses the
TypeScript checker to inspect actual source exports. It follows aliases, default
exports and named re-exports without executing component code. Exact denied
entries take precedence over wildcards; undeclared or absent modules fail even
for namespace/side-effect imports. Source paths cannot traverse into private
modules. App file references make each imported name traceable.

The current admin uses **35 names across 14 package subpaths in 42 files**.
All are available. [Generated inventory](evidence/admin-parity.json).
The real admin audit also runs in the ordinary unit suite, so future missing
public modules or names fail `bun run test` without a manually maintained list.
Ten isolated module regressions plus this real-repository test cover discovery,
renaming/removal, aliases/defaults, unresolved re-exports, namespace/side-effect
imports, denied entries, source conditions and deterministic aggregation.

## Scope and verification

This proves static module/name availability for imports and re-exports.
It does not certify compatible props, namespace member use, dynamic imports,
React-to-Solid behavior, router/query integration or a working admin migration.
The resolver targets this package's source conditions and manifest patterns;
it is not a general-purpose implementation of every Node export-map feature.
No application, component runtime, theme, dependency or CI configuration changed.

Commands ran from `packages/shadcn-solidjs-theme`; measured wall times:

| Exact command | Result | Time |
| --- | --- | ---: |
| `bun run check` | Passed | 4.328 s |
| `bun run lint` | Passed | 1.923 s |
| `bun run test` | 380 passed (11 audit regressions) | 5.682 s |
| `bun run test:server` | 24 passed | 1.182 s |
| `bun run parity:admin` | 35 names / 14 subpaths / 42 admin files; no missing exports | 0.446 s |

[Raw command measurements](evidence/admin-parity-commands.json).
Full diff review and whitespace checks passed. Browser, visual and hydration
suites were not rerun for this tooling-only change; the component tree retains
its [catalog acceptance](REMAINING-CATALOG-STATUS.md) evidence at `cb3cabf`.
Manual assistive-technology/device checks, consumer bundle measurements and real
admin composition remain open. The import check only advances the name-availability
portion of ALL-5 in [the acceptance matrix](TEST-MATRIX.md).
