# Solid 2 design-system specification

This specification applies to the standalone `solidjs-shadcn-ui-port` repository.
Read the root [agent instructions](../../AGENTS.md), the
[delivery checklist](../checklists/DELIVERY.md) and the affected component's
[acceptance matrix](../TEST-MATRIX.md) before changing UI. No parent-project
checkout, roadmap, framework decision or instruction file is required.

## Goal and current scope

Build an owned implementation of the full dated shadcn/ui catalog with Solid 2
signals, documented public APIs, customizable themes and live examples.
All 65 catalog families are implemented. The
[component map](COMPONENT-MAP.md) defines the inventory and adoption decisions;
the [component guide](../components.md) defines supported behavior. Catalog
completion does not imply complete React/Radix API compatibility or exhaustive
coverage of every combination.

Provide unit, browser integration, built-library E2E, server-rendering and
hydration checks for applicable contracts. Include keyboard and accessibility
assertions, representative visual baselines, screenshots and live documentation.
Keep remaining gaps explicit in the test matrix and
[completion report](../PROJECT-COMPLETION.md).

The package is MIT licensed, copyright © 2026 ArkNeT. Its import name remains
`shadcn-solidjs-theme`. Registry publication and public website deployment are
separate release actions; building or testing does not publish anything.

## Runtime and tooling

Use the exact pins in the root manifest and lockfile. The verified runtime is
`solid-js`, `@solidjs/web` and `@solidjs/signals` at `2.0.0-rc.13` with
`vite-plugin-solid@3.0.0-next.27` and
`@solidjs/testing-library@1.0.0-beta.3`. Run tests through Vitest, not `bun test`.
Use Bun 1.4.2 and Node >=22.12.0; `.tool-versions` selects the tested local Node.
Dependency upgrades require their own compatibility verification.

Use Solid 2 JSX conventions: types and JSX come from `@solidjs/web`, native
attributes use Solid spelling, refs are plain props, and reactive values are
read in tracked scopes. Use the pinned runtime's `Loading` and async APIs rather
than assuming Solid 1 patterns. The root README records current tooling gotchas.

## Primitive selection

Evaluate **Kobalte first for every interaction primitive**. The selected
`@kobalte/core@2.0.0-alpha.2` includes Drawer and Resizable candidates; successful
linking alone does not establish acceptable runtime behavior.

Record behavior, diagnostics, accessibility and cleanup results in
`docs/validation/` before adoption. Keep experiments and dependency patches in
`validation/`; never promote them silently into production. Most delivered
families use owned native behavior; Toggle wraps Kobalte with its documented
adapter. Consult the component map for each actual implementation.

Consider corvu only for a documented capability gap after evaluating Kobalte.
A fallback must work with the pinned Solid 2 runtime and pass the applicable
contract checks. Original corvu and `@corvu-next/*` are distinct candidates.
Do not install overlapping libraries preemptively or add another Solid runtime.
No current catalog gap requires corvu.

Framework-independent engines may support specialized components. Carousel uses
Embla, Data Table uses TanStack Table core, and Chart uses Chart.js. Keep their
lifecycle and integration behind documented package exports.

## Package and application boundaries

Consumers import public `ui/*`, utility, theme or built-root exports. Components
use relative imports internally. Preserve filenames, export names, semantic
slots, variants and canonical tokens where the documented Solid API permits.
Document deliberate differences rather than promising a package-rename-only
migration from React.

Use `validation/reference-theme` as the dated class, token and export contract.
Its checksums record provenance; it is not a runtime dependency. The
`validation/admin-imports` fixture contains import declarations only and checks
symbol availability. Neither fixture carries application behavior or defines
future consumer architecture. An optional external `--app-root` audit is a
separate operation.

Components receive data and state through props and signals. Applications own
requests, caches, routing, authentication, persistence and mutation policy.
Keep draft, confirmed and interaction state distinct. Components own only their
presentation and documented local interactions, with deliberate cleanup and
SSR-safe initialization. Application adapters and privileged APIs do not belong
in the library.

The optional `validation/consumer-stack` harness verifies router/query
interoperability without adding those packages to library dependencies. The
restaurant editor is an intentionally local form/Data Table composition with an
injected simulated service; it is not a copy of a production application.

## Themes and documentation

Use semantic CSS variables for light/dark colors, typography, radius and related
theme controls. Preserve canonical token parity with the captured reference;
keep the documented destructive-text contrast correction. Verify contrast for
new overrides, responsive layouts, reduced motion and affected portals.

Maintain usage examples and API limits in the component guide. The local
Solid + Vite site discovers repository Markdown and provides live previews for
all 65 families. The theme generator previews the preset and exports complete
light/dark CSS variables through its Theme-only dialog.

Only the curated `site-dist` artifact is suitable for public deployment. Its
explicit guide and asset allowlists exclude internal reports, raw diagnostics,
agent instructions and validation fixtures. `playground-dist` is an internal
preview. Keep active documentation independent of former application policies;
retain project-specific history only as clearly dated provenance and evidence.

## Verification and delivery

Run the root README's commands and the applicable layers of the delivery
checklist. Baseline commands are `bun run check`, `bun run lint`, `bun run test`
and `bun run test:server`. Use relevant browser suites for UI or documentation
changes, fresh built assets for E2E, and hydration tests when SSR continuity is
affected. The test matrix connects behavior to assertions and records limits.

Run browser suites sequentially on `THEME_PORT=4403` so the development preview
on 4399 stays available. Keep diagnostics enabled. Review deliberate visual
baseline changes before accepting them; passing coverage percentages do not
replace behavioral acceptance.

Record exact commands, outcomes and measured durations, and disclose checks not
run. Self-review the full diff, commit related files with conventional messages,
push a `codex/*` branch under the current working agreement and open a pull
request into `main`; CI runs on the pull request and must pass before merging.
No parent workspace gates, numbered roadmap slots or historical stop-before-code approval
checkpoints apply to this standalone project.
