# Spec: rebuild the design system on SolidJS 2 — `packages/shadcn-solidjs-theme`

Written 2026-09-04 for the agent that will build this package. Read this
whole file, then the repo's `CLAUDE.md`, then `packages/shadcn-theme/README.md`
and `packages/shadcn-svelte-theme/README.md`, before writing a line of code.

## Current owner direction — 2026-10-08

**Current scope:** implement all remaining catalog components, evaluating Kobalte first.
Deliver in verified logical batches; track remaining work in [catalog delivery](docs/CATALOG-DELIVERY.md).
The full 65-family catalog is now implemented and verified within its documented
contracts; see [final acceptance](docs/REMAINING-CATALOG-STATUS.md) and
[completion audit](docs/CATALOG-COMPLETION-AUDIT.md) for evidence and remaining limits.

**Previous batch:** implement Progress, evaluating Kobalte first. Deliver the component,
examples, unit/browser/SSR/hydration tests, screenshots and documentation, then commit
and push under the working agreement. See [Progress delivery](docs/PROGRESS-DELIVERY.md).

**Previous batch:** implement Slider, evaluating Kobalte first. Deliver the component,
examples, unit/browser/SSR/hydration tests, screenshots and documentation, then commit
and push under the working agreement. See [Slider delivery](docs/SLIDER-DELIVERY.md).

**Previous batch:** implement Select, evaluating Kobalte first. Deliver the public
component, examples, unit/browser/SSR/hydration tests, screenshots and documentation,
then commit and push under the working agreement. See [Select delivery](docs/SELECT-DELIVERY.md).

**Previous batch:** implement Radio Group, Toggle and Toggle Group, evaluating
Kobalte first. Deliver implementations, examples, tests, documentation and measured
evidence under the full commit/push agreement. See [choice delivery](docs/CHOICES-DELIVERY.md).

**Previous batch:** implement Tooltip and Hover Card, evaluating Kobalte first.
Deliver source, examples, tests, screenshots and docs under the full commit/push
working agreement. See [preview delivery](docs/HINTS-DELIVERY.md).

**Previous batch:** implement Accordion and Collapsible after evaluating Kobalte.
Deliver source, examples, unit/browser/SSR/hydration tests and screenshots; follow
the commit/push working agreement. See [disclosure delivery](docs/DISCLOSURES-DELIVERY.md).

**Previous batch:** implement Combobox as the next increment. Evaluate Kobalte first;
deliver source, docs and tests, then commit/push on a codex branch under the latest
working agreement. See [COMBOBOX-DELIVERY.md](COMBOBOX-DELIVERY.md).

**Previous batch authorized:** “Continue with Tabs, Popover, Alert Dialog.”
Evaluate Kobalte first, preserve diagnostics, and deliver the three components,
tests and docs. The owner subsequently authorized the full commit/push workflow
and requested merging into local main; push only the codex branch. See
[KOBALTE-OVERLAYS.md](KOBALTE-OVERLAYS.md) and
[OVERLAYS-DELIVERY.md](OVERLAYS-DELIVERY.md).

**Previous batch:** “implement Checkbox and Switch, evaluating Kobalte
first.” The form-field batch is committed as `a916220`. Preserve that priority,
record measured adoption failures, and deliver this bounded component batch
with tests and docs. See [KOBALTE-TOGGLES.md](KOBALTE-TOGGLES.md) and
[TOGGLES-DELIVERY.md](TOGGLES-DELIVERY.md).

**Earlier batch:** “commit and implement Input, Textarea, and Label.”
The foundation is committed as `b82f86c`. Extend its native-field contract with
these three components; see [FORM-FIELDS-DELIVERY.md](FORM-FIELDS-DELIVERY.md).
The earlier broad Gate 0 restriction does not block this explicitly requested batch.

**Implementation checkpoint authorized:** the owner explicitly requested the
foundation plus Button, Badge, Card, Separator and Skeleton now, instead of
another diagnostic investigation. This supersedes the original broad Gate 0
stop-before-code requirement for this limited batch. Use owned native HTML for
these five components; no experimental Kobalte patch enters production. Keep
Kobalte first for subsequent interaction primitives. See [DECISIONS.md](DECISIONS.md)
and [FOUNDATION-DELIVERY.md](FOUNDATION-DELIVERY.md). Full catalog, router/query,
complex primitives and admin migration remain later increments.

This section takes precedence over the original scope and library alternatives
below where they differ.

- Build an owned SolidJS implementation of the full
  [shadcn/ui component catalog](https://ui.shadcn.com/docs/components), using
  Solid signals. The tiers below determine delivery order; they do not remove
  components from the final goal. Maintain an explicit component inventory
  against a dated upstream reference.
- **Kobalte first for every primitive; corvu only for demonstrated gaps.**
  This is the owner's selected priority. Kobalte `2.0.0-alpha.2` includes
  `@kobalte/core/drawer` and `@kobalte/core/resizable`; evaluate those first
  for Drawer and Resizable. Both passed the Solid 2 `rc.13` linking probe,
  but still require runtime, accessibility, and behavior tests before adoption.
  Ark UI is no longer an equal candidate. Keep implementation libraries behind
  this package's public exports (D19).
- For each shadcn component, record its required behavior and the Kobalte
  primitive or composition that provides it. Consult corvu only when this
  evaluation demonstrates a missing capability. Record the gap and the reason
  for the fallback; do not install both libraries for overlapping primitives
  merely because both offer them.
  See [COMPONENT-MAP.md](COMPONENT-MAP.md) for the complete catalog assessment
  and unresolved implementation gaps. It currently establishes no required
  corvu fallback; its API mappings still need runtime and parity verification.
- A corvu fallback must support the selected Solid 2 runtime. Evaluate the
  existing `@corvu-next/*` fork where relevant; original `@corvu/*` releases
  have failed the compatibility probe. A successful build is not runtime
  verification. Do not assume a new in-house port is necessary before checking
  existing compatible versions and their behavior.
- Install only the corvu component packages that are actually needed, and use
  per-component imports. Keep Solid as a shared runtime. Verify interactions
  between the libraries, especially nested overlays, focus restoration,
  Escape handling, scroll locking, and cleanup.
- The selection does not establish complete shadcn coverage. Charts, data-table
  logic, and higher-level compositions still need explicit implementations or
  suitable supporting libraries. Track these gaps rather than claiming that
  installing the two libraries completes the component set.
- Require unit tests, real-browser UI integration tests, and end-to-end tests
  for the documented component behavior. Include customizable semantic themes,
  light/dark examples, accessible keyboard interaction, and visual regression
  coverage of representative states. Documentation must include usable Solid
  examples and screenshots of the implemented components. A component counts
  as delivered only with its implementation, applicable tests, and docs.
- **Solid 2 remains the target.** The September version table and API recipes
  below are historical inputs to re-verify, not proof of compatibility.
  Do not switch to Solid 1 or add a second Solid runtime to make corvu load.
  A required port or replacement must be made explicit before adoption.
  See [COMPATIBILITY.md](COMPATIBILITY.md) for the current verification result.
  The five-primitive browser probe and its outstanding acceptance failures are
  recorded in [BROWSER-VALIDATION.md](BROWSER-VALIDATION.md); it is not a complete
  Gate 0 or permission to mark the component set delivered.
  [KOBALTE-LIFECYCLE.md](KOBALTE-LIFECYCLE.md) records the subsequent harness-only
  patch for Drawer Escape and effect ownership. Its passing scoped regressions
  do not approve production adoption. [KOBALTE-PRESENCE.md](KOBALTE-PRESENCE.md)
  subsequently resolves Drawer/DialogRoot feedback and relay diagnostics.
  [KOBALTE-DIALOG-IDS.md](KOBALTE-DIALOG-IDS.md) resolves plain Dialog untracked
  ID reads and verifies live ARIA wiring. [KOBALTE-OTP.md](KOBALTE-OTP.md)
  subsequently resolves tested OTP diagnostics and label/form wiring through
  harness-only Kobalte and shared a11y patches. Other primitive findings and
  Gate 0 requirements still block production acceptance.

## 1. What this is

The platform has one look, defined once as oklch tokens, and two design-system
packages that render it: `packages/shadcn-theme` (React 19, shadcn/ui, used by
`apps/admin`) and `packages/shadcn-svelte-theme` (Svelte 5, shadcn-svelte, used
by `apps/storefront`). Both hide their component libraries behind package
exports (decision D19, extended by D50) and carry byte-identical token blocks in
their `theme.css`.

This task builds a THIRD sibling, `packages/shadcn-solidjs-theme`, on
**SolidJS 2**, and its purpose is fixed by the owner (2026-09-04): **it is the
design system for a Solid 2 version of the admin web app.** So it must be as
close to `packages/shadcn-theme` as Solid allows — the same export shape, the
same file names, the same export names, the same component set, the same
class strings — so that porting a screen from `apps/admin` is a package rename
and `className` → `class`, nothing more. Where the two must differ, the
difference is Solid's (no `forwardRef`, `class` not `className`, no `asChild`)
and is documented, never invented.

A Solid package existed once (decision D49, 2026-07-08: the solid-ui /
Kobalte / corvu set on Solid 1.9, built for the STOREFRONT's islands) and was
deleted when Svelte won the storefront framework evaluation (D52, 2026-07-12).
It is recoverable from git history at commit `5498eac`. Reuse its TOOLING
(vite/vitest config, test setup, scripts, playground) — that part is
known-good and quoted below — but not its shape: it exported components off
the package root and vendored solid-ui's API. This rebuild mirrors the React
package instead (§6), because its consumer is the admin, not the storefront.

**The consumer's stack is decided** (owner, 2026-09-04): the admin will be
rebuilt on Solid 2 with the latest release candidates of **Solid Router**
(`@solidjs/router` 2.x line) and **TanStack Query** (`@tanstack/solid-query`
6.x line), with a clear split of responsibilities — **Solid owns async
rendering and transitions; TanStack Query owns server-cache policy.** For this
package that means two things, spelled out in §2.9 and §8: the design system
carries NO data layer (no query hooks, no fetching, no cache), and every
component must behave correctly INSIDE Solid 2's async rendering — under a
`Suspense` boundary, during a transition, with a pending state driven by the
app. The package's job is to render; the app decides when data is ready.

**What this task is NOT**: it does not rewrite `apps/admin` in Solid. That is
the next increment after this package exists (see §11). Build the package, a
playground, tests and docs; stop there.

## 2. Non-negotiables (from `CLAUDE.md` — read it, these are the ones that bite here)

1. **Decision first.** D52 closed the Solid track and recorded the package as
   deleted. Reopening it is a decision. Before any code: draft a decision-log
   entry (the next free number — D89 is the last as of 2026-09-04, so D90 unless
   another lands first) that reopens the Solid design system on Solid 2,
   supersedes D52 IN PART (the "Solid theme deleted" clause; Svelte stays the
   storefront's framework), and records the headless-library choice from §4.
   Present it to the owner and wait for confirmation. Never edit D49/D52's
   text — supersede with a tail, the log's convention.
2. **Never commit.** Present finished increments; the owner says "commit".
3. **Encapsulation (D19).** Consumers import only this package's exports.
   `solid-js` is a peer dependency; every headless library, `clsx`,
   `tailwind-merge`, `class-variance-authority`, toast libraries, etc. are
   dependencies of THIS package and never appear in an app's `package.json`.
   Vendored/generated component code stays unannotated (the CLAUDE.md
   exemption); everything hand-written — `utils.ts`, scripts, tests, the
   playground, any component you author yourself — carries the 1–3 line file
   header with decision numbers and JSDoc on every function.
4. **One look.** `src/theme.css`'s `:root` and `.dark` token blocks must be
   byte-identical to `packages/shadcn-theme/src/theme.css`'s. A test enforces
   it (§7). Semantic utilities (`bg-primary`, `ring-ring`, `bg-sidebar`, …) are
   the contract; component class strings port from the React package's
   `radix-nova` style so both render the same pixels.
5. **The React package's export shape, exactly** (owner direction
   2026-09-04, replacing D49's root-level subpaths): `shadcn-solidjs-theme/ui/*`,
   `/utils`, `/hooks/*`, `/theme.css`, plus the `.`/`styles.css` build entries —
   `import { Button } from 'shadcn-solidjs-theme/ui/button'`, the same line as
   the admin writes today with one word changed.
6. **Docs move with code.** `package.json` `description`, a full `README.md`
   (role & decisions → key files → exports → environment & secrets → commands →
   agent gotchas), the CLAUDE.md Stack paragraph (add the package beside the
   other two themes), and the plan doc's Built section with per-item REASONING
   re-verified against code and tests before it is presented.
7. **Plain language, named predicates, no recursion, no conflatable
   phrasing** — as CLAUDE.md states them. In this package that means: no
   recursive tree walks in scripts (use a work list), predicates for variant
   logic instead of stacked ternaries, and "Solid 2" spelled out where "Solid"
   alone could mean the 1.x line.
8. **Bun everywhere, except this package's tests.** Bun cannot apply Solid's JSX
   transform, so tests run under vitest (`bun run test` delegates to it, as the
   Svelte theme does). Root `bun run typecheck` and `bun run test` use
   `bun run --filter '*' <script>`, so the package must define both scripts.
9. **No data layer in the design system.** No `@tanstack/solid-query`, no
   `@solidjs/router`, no fetching, no caching anywhere in this package — not
   even as peer dependencies. Components receive data and state as props and
   signals; loading and pending are STATES the app passes in or renders
   around (a `Suspense` fallback of `Skeleton`s, a `Spinner` while a
   transition is pending, a disabled `Button` during a mutation). Toasts
   (`sonner`) are fired by the app from its query/mutation callbacks; the
   package only renders them.

## 3. Version reality (checked 2026-09-04) and the gate it imposes

| Package | `latest` | pre-release line |
|---|---|---|
| `solid-js` | 1.9.15 | **2.0.0-rc.6** (`next`), also 1.10.0-beta.0 |
| `vite-plugin-solid` | 2.11.14 | 3.0.0-next.27 (`next`) |
| `@solidjs/testing-library` | 0.8.10 | 1.0.0-beta.3 (`next`) |
| `@kobalte/core` | 0.13.14 | 2.0.0-alpha.2 (`alpha`) |
| `corvu` | 0.7.2 | — |
| `@ark-ui/solid` | 5.39.1 | 1.0.0-beta.3 is an OLD tag, ignore |
| `@solidjs/router` (the admin's, not this package's) | 1.0.0 | **2.0.0-next.21** (`next`) |
| `@tanstack/solid-query` (the admin's, not this package's) | 5.102.8 | **6.0.0-rc.3** (`rc`) |

The last two rows are the CONSUMER's stack (owner ruling 2026-09-04). They
are listed so the package is verified against them (Gate 0 and §8) — they are
not dependencies of this package (§2.9).

Solid 2 is a release candidate, not a release. Its Vite plugin and testing
library for Solid 2 are pre-release. That is acceptable for a design-system
package that no app consumes yet, but it must be handled deliberately:

- **Pin exact versions** (no caret) for `solid-js`, `vite-plugin-solid`,
  `@solidjs/testing-library` and the headless library, and record each pin and
  its reason in the README's gotchas. Re-verify the table above with
  `bun pm view <pkg> dist-tags` at the start of the work; versions move.
- **Read the official Solid 2 migration guide** before writing components. Do
  not rely on memory of Solid 1.x or on this spec for API details: the
  reactivity core, stores, async primitives and some control-flow components
  changed between 1.x and 2.0. Every 1.x idiom used in the old package's
  components must be checked against the guide, not assumed.
- **Gate 0 (before the decision entry):** confirm on a scratch Vite project
  that `vite-plugin-solid@next` compiles Solid 2 JSX, that
  `@solidjs/testing-library@next` renders and cleans up under vitest + jsdom
  with Solid 2, that the chosen headless library (§4) mounts a Dialog and a
  Select under Solid 2 without console errors, AND that the scratch project
  also runs `@solidjs/router@next` + `@tanstack/solid-query@rc` on the same
  Solid 2 pin (one route, one query, one `Suspense` fallback) — the package
  must be built against the pins the admin will actually use. Record the
  exact versions that passed. If any leg fails, stop and report — the owner decides whether
  to wait for GA or to build on Solid 1.9 with a documented upgrade path.

**Release timing, as far as anyone has said (checked 2026-09-04).** No date
has been published for Solid 2.0 stable, for Solid Router 2.0 stable, or for
the main docs switching to 2.0. Core is at `rc.6` (2026-09-02, a new candidate
every few days since March); the router's `next` line is at `next.21`
(2026-09-01, six builds in three weeks) and ships as part of the coordinated
2.0 platform release, not on its own schedule; TanStack Solid Query is at
`6.0.0-rc.3` and tracks core to stable. The official 2.0 documentation
already exists at https://v2.solidjs.com/ (Solid Router 2.0 included), with
the caveat that APIs may change before stable; https://docs.solidjs.com/ stays
on 1.x with no announced switch date. Therefore:

- Gate 0 and exact pins are the posture: build against `solid-js@2.0.0-rc.6`,
  `@solidjs/router@2.0.0-next.21` (the admin's) and
  `@tanstack/solid-query@6.0.0-rc.3` (the admin's), record them in the README,
  and re-pin when stable lands — as its own small increment with the owner's
  word, not silently.
- Watch two places for the stable release: the solidjs/solid releases page
  (https://github.com/solidjs/solid/releases) and the "Road to 2.0"
  discussion (https://github.com/solidjs/solid/discussions/2425).
- Read the router's 2.0 API from https://v2.solidjs.com/, never from the
  router repository's README on `main`, which still describes the 1.x design.

## 4. The headless-library decision (part of the decision entry)

shadcn-style components are styling over headless primitives. The React
package uses Radix/Base UI; the old Solid package used Kobalte (with corvu for
the drawer). For Solid 2, evaluate in this order and record the outcome:

- **A. Kobalte 2 (`@kobalte/core@2.0.0-alpha.x`)** — if its 2.x line targets
  Solid 2 and passes Gate 0, it is the closest to the old package and to
  shadcn's primitives (Dialog, Popover, Select, Tabs, Checkbox, Switch, …).
  Alpha status is the risk: pin it, and list the primitives it lacks.
- **B. Ark UI for Solid (`@ark-ui/solid`)** — a maintained headless set on
  Zag machines; check whether its current major supports Solid 2. Broad
  coverage (Combobox, Date picker, Tooltip, Toast), different data-attribute
  vocabulary than Kobalte.
- **C. Hand-written primitives** for the tier-1 subset only (§5) — the
  fallback if neither library runs on Solid 2 yet. Dialog/Popover on native
  `<dialog>` and the Popover API, Tabs/Checkbox/Switch on native elements with
  ARIA. More work, zero pre-release dependencies, and every file becomes
  hand-written and annotated.

Whichever wins, the choice, the versions, and the primitives that had to be
substituted go into the decision entry and the README.

## 5. Component scope: parity with `shadcn-theme`, delivered in tiers

The target is the React package's WHOLE component set (61 files under
`packages/shadcn-theme/src/components/ui/` as of 2026-09-04) with the same file
names and export names, because any admin screen may be ported next. Deliver
it in tiers so the owner can check parity early.

**Tier 1 — what `apps/admin` imports today** (import sites as of 2026-09-04);
ships first, with full tests, and is the parity gate for the first checkpoint:

| Subpath | Admin import sites | Notes |
|---|---|---|
| `ui/button` (+ `buttonVariants`) | 26 | variants default/outline/secondary/ghost/link/destructive; sizes sm/default/lg/icon |
| `utils` (`cn`) | 20 | `clsx` + `tailwind-merge`; identical behavior to the React `cn` |
| `ui/input` | 16 | |
| `ui/skeleton` | 9 | |
| `ui/textarea` | 6 | |
| `ui/switch` | 5 | |
| `ui/label` | 3 | |
| `ui/popover` | 2 | portals to `document.body` |
| `ui/card` (+ Header/Title/Description/Content/Footer/Action) | 2 | |
| `ui/tabs` (+ List/Trigger/Content) | 1 | |
| `ui/combobox` | 1 | the hardest tier-1 item — see the open question in §11 |
| `ui/checkbox` | 1 | |
| `ui/badge` (+ `badgeVariants`) | 1 | |
| `ui/alert-dialog` (+ every part) | 1 | `role="alertdialog"` — the admin's mocked tests rely on that role for confirm modals |
| `hooks/use-mobile` (`useIsMobile`) | 0 today | same name, same 768px breakpoint; the admin shell will want it |

**Tier 2 — the rest of the set the admin is likely to need next**: `accordion`,
`alert`, `avatar`, `breadcrumb`, `collapsible`, `dialog`, `drawer`,
`dropdown-menu`, `empty`, `field`, `hover-card`, `item`, `kbd`, `native-select`,
`pagination`, `progress`, `radio-group`, `scroll-area`, `select`, `separator`,
`sheet`, `sidebar`, `slider`, `sonner`, `spinner`, `table`, `toggle`,
`toggle-group`, `tooltip`, `button-group`, `input-group`, `context-menu`,
`menubar`, `navigation-menu`, `aspect-ratio`, `direction`.

**Tier 3 — port only if a Solid 2 counterpart exists, else record as deferred
with the reason**: `chart` (recharts), `calendar` (react-day-picker), `carousel`
(embla), `resizable` (react-resizable-panels), `input-otp`, `command` (cmdk),
`attachment`, `bubble`, `message`, `message-scroller`, `marker`.

Rules that apply to every tier:

- **File and export names are the React package's.** Open the React file,
  keep its exports (`Card`, `CardHeader`, …; `AlertDialog`, `AlertDialogAction`,
  …), keep its `data-slot` attributes and its class strings verbatim where the
  markup is the same, and adapt only what Solid or the headless library
  forces. `className` becomes `class`; `asChild` becomes the headless library's
  polymorphism (`as`) and is documented per component; `forwardRef` becomes a
  plain `ref` prop. State selectors in class strings (`data-[state=open]`) map
  to the library's vocabulary, and the mapping is written down once in the
  README so it is applied the same way everywhere.
- **Variants are `class-variance-authority`** with the React package's variant
  tables copied, so `buttonVariants({ variant: 'ghost' })` yields the same
  classes in both packages.
- **Icons**: the React components use `@remixicon/react`. Use the Remix Icon
  Solid package if one is current, otherwise inline the handful of SVG paths
  the components need (check, chevron, close, spinner) as annotated local
  pictograms — never a React dependency.
- **Parity is checked by a script, not by eye**: `scripts/check-admin-parity.ts`
  scans `apps/admin/src` for `from 'shadcn-theme/…'` imports and their named
  bindings, and fails if this package lacks the subpath or the export. It runs
  as a vitest test so the root `bun run test` guards it.

## 6. Package layout and contracts

Mirror the D49 package (git `5498eac`), updated for Solid 2:

```
packages/shadcn-solidjs-theme/
  package.json          name shadcn-solidjs-theme; description (D19 + the new D#)
  README.md             the template order from CLAUDE.md §Documentation
  specs.md              this file (keep; update the "checked" dates if you re-verify)
  tsconfig.json         extends ../../tsconfig.base.json; jsx preserve; jsxImportSource solid-js
  vite.config.ts        library build + vitest config (vite-plugin-solid, @tailwindcss/vite, dts)
  vitest.setup.ts       jest-dom matchers, ResizeObserver/matchMedia stubs, cleanup()
  src/theme.css         shared tokens (byte-identical blocks) + @source './components'
  src/lib/utils.ts      cn (annotated) + utils.test.ts
  src/hooks/use-mobile.ts          `useIsMobile` (annotated) + test — same file/name as the React package
  src/components/ui/<name>.tsx    one file per component (+ <name>.test.tsx)
  src/index.ts          barrel for the dist build
  scripts/fetch-registry.ts       only if a registry with Solid 2 components exists (see gotcha)
  scripts/normalize-imports.ts    rewrites `~/` or `@/` aliases to relative paths
  scripts/measure-sizes.ts        optional: per-component min+gzip sizes
  scripts/check-admin-parity.ts   the import/export parity check against apps/admin (§5)
  playground/           dev-only visual check; index.html, index.tsx, index.css, vite.config.ts
```

`package.json` exports — the React package's map with `solid` conditions
added (compare `packages/shadcn-theme/package.json`):

```json
{
  ".": { "types": "./dist/index.d.ts", "solid": "./src/index.ts", "import": "./dist/shadcn-solidjs-theme.js" },
  "./ui/*": "./src/components/ui/*.tsx",
  "./utils": "./src/lib/utils.ts",
  "./hooks/*": "./src/hooks/*.ts",
  "./theme.css": "./src/theme.css",
  "./styles.css": "./dist/shadcn-solidjs-theme.css"
}
```

Apps consume SOURCE (`.tsx`), so
no build step gates dev and `theme.css`'s `@source` makes the consuming app's
Tailwind scan the components. `dist/` is the gitignored library build.

Scripts (`bun run …`): `typecheck` (tsc --noEmit), `test` (vitest run),
`test:watch`, `build` (vite library build), `normalize-imports`, `sizes`
(optional), `fetch-registry` (only if applicable).

Playground: `.claude/launch.json` already carries a `solidjs-theme` entry
(`bunx vite --config packages/shadcn-solidjs-theme/playground/vite.config.ts`,
port 4399). Keep that path and port. The playground page renders every shipped
component in light and dark, with a dark toggle, so the owner can eyeball
parity against the admin.

Registry gotcha: solid-ui's registry (the D49 source) ships Solid 1.x code. If
you vendor from it, every file must be ported to Solid 2 by hand — at which
point it is hand-written code and carries headers and JSDoc. Decide per
component: vendor-and-port (document the upstream commit) or write fresh. Do
not leave a `fetch-registry` script that would overwrite ported files.

## 7. Tests (what "green" means)

Runner: vitest + `@solidjs/testing-library@next` + jsdom, with the setup file
from D49 (`vitest.setup.ts` above; keep the ResizeObserver/matchMedia stubs —
overlays and drawers probe them).

- **Per component**: renders with role/name; default variant classes; variant
  and size overrides; caller `class` merged; overlays open/close through the
  controlled `open` prop and are queried via `screen` (they portal to
  `document.body`); `alert-dialog` exposes `role="alertdialog"`; form
  controls forward `disabled`, `name`, `value`, and fire `onChange`/`onInput`
  as Solid 2 expects.
- **Theme parity**: a test reads both `theme.css` files, extracts the `:root`
  and `.dark` blocks, and asserts byte equality. Any drift is a red test, not a
  README claim.
- **Export map**: a test resolves every `./ui/*` component and the explicit
  entries through `import()` so a missing file or a bad alias fails loudly.
- **Admin parity**: `check-admin-parity` (§5) runs as a test — every
  `shadcn-theme/…` subpath and named export the admin uses today exists here.
- **`cn`**: the same cases as the React/Svelte packages' utils tests.
- **`useIsMobile`**: breakpoint edge, listener cleanup on dispose.
- Root gates stay green: `bun run typecheck` (13 → 14 workspaces) and
  `bun run test` (which now includes this package's vitest run). Do not touch
  the admin/storefront suites.

## 8. Solid 2 checklist (verify each against the migration guide, then apply)

- Signals/memos/effects: the 2.0 scheduling and equality semantics; where
  `createEffect` now runs relative to render; whether `on` and `untrack` kept
  their signatures.
- Stores: the 2.0 store API for any component holding structured state.
- Async: the 2.0 async primitives replace 1.x `createResource` patterns; toasts
  and comboboxes are the likely users.
- Control flow: `Show`/`For`/`Switch` changes, and `Suspense`/transition
  behavior around portals.
- Events: delegated vs native handlers (`onClick` vs `on:click`) — form
  controls in tests must use whichever Solid 2 dispatches.
- JSX runtime: `jsxImportSource: solid-js` with the 2.0 transform via
  `vite-plugin-solid@next`; confirm `dev`/`browser` export conditions for the
  test resolver (the D49 `resolve.conditions` block).
- Refs: plain `ref` props; no `forwardRef`.
- Types: `ComponentProps`, `ParentProps`, `splitProps` in their 2.0 forms.
- **Async rendering (Solid owns it):** every overlay (dialog, sheet, drawer,
  popover, tooltip, dropdown) must open and close correctly when its content
  reads an async value under a `Suspense` boundary INSIDE the overlay, and
  must not tear or double-portal when a transition is pending. `Skeleton` and
  `Spinner` are the fallback vocabulary — verify they render inside a
  `Suspense` fallback without their own reactivity leaking out.
- **Transitions:** a `Tabs` switch or a `Select` change that the app wraps
  in a transition keeps the previous content until the new one is ready;
  the package must not force synchronous re-renders that defeat it (no
  `untrack` around content children, no manual DOM toggling).
- **TanStack Query owns the cache:** nothing in this package assumes when
  data exists. A `Combobox` receives its options as a signal/prop and shows
  the app's loading state; it never fetches. `sonner` exposes the toast
  function the app calls from `onSuccess`/`onError`; the package does not
  wire mutations.
- **Router:** components render `<a>` through the polymorphic `as`/`href`
  path so the app can hand them the router's link; the package never imports
  the router.

Record any 1.x-to-2.0 change that affected a shipped component in the README
gotchas, so the next reader does not rediscover it.

## 9. Docs to write

- `package.json` `description` (one line, names D19 and the new decision).
- `README.md` in the CLAUDE.md order. Include: the component list with tiers
  shipped, the headless library and its pins, the "Solid, not React" gotchas
  (`class`, no `forwardRef`, `as` vs `asChild`, state attributes), the vitest
  rule, and the theme-parity test.
- `CLAUDE.md` Stack paragraph: add the package beside `shadcn-theme` and
  `shadcn-svelte-theme` with its export shape.
- Decision log: the new entry (§2.1) plus the supersede-in-part tail on D52.
- Plan doc under `docs/buckets/…` with the bucket number the owner assigns,
  with rulings, how it works, tests, and the Built section written to the
  reasoning rule. Roadmap row on the owner's slotting.
- Vocabulary: nothing new expected; if a term stumbles in review, propose an
  entry at the end of that exchange.

## 10. Acceptance criteria

1. Gate 0 passed and recorded; the decision entry confirmed by the owner
   before component code.
2. Tier 1 complete with tests and the admin-parity test green; tier 2
   complete or each missing item listed under deferred with a reason; tier 3
   as agreed.
3. `bun run typecheck` and `bun run test` green at the root; the admin and
   storefront suites untouched and green.
4. Theme-parity and export-map tests present and green.
5. Playground renders every shipped component in light and dark, and
   includes one page that mounts the admin's stack pins (router + TanStack
   Query on Solid 2) with a `Suspense` + `Skeleton` fallback and a
   transition-pending `Tabs` switch — the package's async-rendering contract,
   visible.
6. No app imports the package yet; `apps/admin` is untouched (the Solid 2
   admin is a separate, later increment).
7. README, package description, CLAUDE.md, decision log, plan doc and
   roadmap updated in the same increment as the code.
8. Working tree presented for the owner's checkpoint; no commit made.

## 11. Open questions for the owner (ask at the checkpoint, not before starting)

- The Solid 2 admin itself: a new app (`apps/admin-solid`?) built beside the
  React admin and switched over, or an in-place rewrite? (The stack is
  decided — Solid 2 + Solid Router 2 + TanStack Query 6, Solid owning async
  rendering and transitions, TanStack Query owning server-cache policy; this
  spec builds the package only. The answer shapes tier 2's priority order.)
- Should `combobox` be a tier-1 must even if it must be hand-written?
- If Solid 2 reaches GA mid-task, re-pin immediately or finish on the RC?
- Slot: which bucket number and position in `docs/02-roadmap.md`.

## 12. Suggested work plan (each phase ends at an owner checkpoint)

0. Version re-check, Gate 0 scratch project, headless-library evaluation,
   decision entry drafted → owner confirms.
1. Skeleton: package.json, tsconfig, vite/vitest config, theme.css with the
   parity test, `cn`, `useIsMobile`, `button` with tests, playground
   running on port 4399 → checkpoint.
2. Tier 1 → checkpoint. 3. Tier 2 → checkpoint.
4. Docs, README, decision/plan/roadmap, Built section with verified
   reasoning, final green run → checkpoint and the owner's commit word.
