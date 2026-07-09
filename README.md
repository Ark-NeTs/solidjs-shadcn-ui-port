# shadcn-solidjs-theme

The **SolidJS** design system (decision **D49**): the
[solid-ui](https://github.com/stefan-karger/solid-ui) component set (an
unofficial SolidJS port of shadcn/ui, built on [Kobalte](https://kobalte.dev)
and [corvu](https://corvu.dev)) plus the platform's shared oklch Tailwind theme
and the `cn` helper. It is the Solid sibling of `packages/shadcn-theme`
(React) — same tokens, same encapsulation rule — for the storefront's Astro +
SolidJS islands.

**Encapsulation rule (D19, extended by D49):** solid-ui, Kobalte, corvu, cva,
tailwind-merge, solid-sonner and everything they pull in are implementation
details of this package. Apps depend only on `shadcn-solidjs-theme` and import
only its package exports below — never `@kobalte/core`, `@corvu/*`, `clsx`,
etc. directly, and never via relative paths into this package.

**Same look as the admin.** `theme.css` carries token values byte-identical to
`packages/shadcn-theme/src/theme.css` (same oklch palette, `--radius: 0.45rem`,
Inter). Solid components reference the same semantic utilities (`bg-primary`,
`ring-ring`, `bg-sidebar`, …), so a Solid storefront and the React admin render
identically. The only theme additions Kobalte needs are baked in: the `dark`
variant also matches `[data-kb-theme="dark"]`, and status tokens
(`info`/`success`/`warning`/`error`) back the badge/field variants solid-ui ships.

## Exports

Each component is importable **one-by-one** straight off the package root
(owner requirement) — there is no `/ui/` segment:

| Specifier | Resolves to | Use for |
|---|---|---|
| `shadcn-solidjs-theme/<name>` | `src/components/ui/<name>.tsx` | a component, e.g. `import { Button } from 'shadcn-solidjs-theme/button'` |
| `shadcn-solidjs-theme/utils` | `src/lib/utils.ts` | the `cn` class-merge helper |
| `shadcn-solidjs-theme/theme.css` | `src/theme.css` | the Tailwind theme — `@import` it once in the app's CSS entry |
| `shadcn-solidjs-theme` | `dist/shadcn-solidjs-theme.js` | prebuilt ES bundle of everything (requires `bun run build`) |
| `shadcn-solidjs-theme/styles.css` | `dist/shadcn-solidjs-theme.css` | prebuilt compiled CSS (requires `bun run build`) |

The `<name>` subpath is a wildcard (`"./*": "./src/components/ui/*.tsx"`), so it
resolves any vendored component; `./utils`, `./theme.css`, `./styles.css` are
explicit and win over it. Apps consume source (`.tsx`) — no build step gates dev,
and `theme.css`'s `@source` directive makes the consuming app's Tailwind build
scan these components for utility classes.

**Components (26):** `accordion`, `alert`, `alert-dialog`, `badge`, `button`,
`card`, `checkbox`, `collapsible`, `dialog`, `drawer`, `dropdown-menu`, `label`,
`number-field`, `popover`, `select`, `separator`, `sheet`, `skeleton`, `sonner`,
`switch`, `table`, `tabs`, `text-field`, `toggle`, `toggle-group`, `tooltip`.
(`text-field` bundles input, textarea, label, description and error message.)

## Wiring up a new app

```css
/* src/index.css */
@import 'shadcn-solidjs-theme/theme.css';
```

```tsx
import { Button } from 'shadcn-solidjs-theme/button';
import { Dialog, DialogContent, DialogTitle } from 'shadcn-solidjs-theme/dialog';
```

Add `"shadcn-solidjs-theme": "workspace:*"` to dependencies; `solid-js ^1.9` is a
peer dependency, and the app must compile Solid JSX (Astro's Solid integration or
`vite-plugin-solid`). Toggle dark mode with a `.dark` class **or** Kobalte's
`[data-kb-theme="dark"]` on an ancestor.

## Adding or updating components

Two ways — both write to `src/components/ui/`, then normalize the `~/` alias:

```sh
cd packages/shadcn-solidjs-theme
# a) pull the agreed set from the registry (edit COMPONENTS in the script to add):
bun run fetch-registry
# b) or use the solid-ui CLI for a one-off (ui.config.json is preconfigured):
bunx solidui-cli@latest add <name>

bun run normalize-imports   # rewrite solid-ui's `~/…` imports to relative paths
```

solid-ui components import siblings/utils via a `~/` alias (`~/lib/utils`,
`~/registry/ui/<name>`); consumers resolve this package's *source*, where no
alias exists, so `normalize-imports` rewrites them to relative paths. New
components also need an `export * from './components/ui/<name>'` line in
`src/index.ts` to be part of the `dist` barrel.

## Scripts

```sh
bun run typecheck           # tsc --noEmit (Solid JSX)
bun run test                # vitest run (see gotcha below)
bun run test:watch          # vitest watch
bun run build               # Vite library build → dist/ (js, css, .d.ts)
bun run sizes               # per-component minified + gzipped size, plus theme.css
bun run fetch-registry      # vendor the component set from the solid-ui registry
bun run normalize-imports   # fix `~/` imports after fetch/add
```

`bun run sizes` builds each component in isolation (real Vite build, Solid
transform applied, npm deps externalized) and prints its own minified + gzipped
weight — the marginal cost of `import … from 'shadcn-solidjs-theme/<name>'` —
plus the deduped `index (bundled)` total and the compiled `theme.css`. Per-component
numbers exclude the shared runtime (solid-js/Kobalte/corvu), so they sum higher
than the bundled figure.

## Environment & secrets

None. This is a client-side component library — no env vars, no secrets, no
network at runtime. `fetch-registry` fetches public solid-ui registry JSON over
HTTPS at author time only.

## Agent gotchas

- **Solid, not React.** Components take a `class` prop (never `className`), pass
  `ref` as an ordinary prop (no `forwardRef`), and use `splitProps`. Children
  reactivity follows Solid rules.
- **Polymorphism is Kobalte's `as`, not `asChild`.** Change the rendered element
  with `<Button as="a" href="…">`; there is no `asChild`/`Slot`.
- **State attributes are Kobalte's.** Animate/style on `data-[expanded]` /
  `data-[closed]` / `data-[selected]` / `data-[pressed]` — not Radix's
  `data-[state=open]`. (`table`'s `data-[state=selected]` is consumer-set on
  `<TableRow>`.)
- **Overlays portal to `document.body`.** In tests query them via `screen`, not
  the render container; drive them with the controlled `open` prop for
  determinism.
- **Tests run under vitest, not `bun test`.** Bun can't apply Solid's JSX
  transform, so this package uses vitest + `@solidjs/testing-library` (jsdom).
  Run it via `bun run test` (the root `bun run test` delegates here); a bare
  `bun test` at the repo root would try to run these `.test.tsx` under Bun and
  fail. `vitest.setup.ts` stubs `ResizeObserver`/`matchMedia` for Kobalte/corvu.
- **Re-fetching overwrites components byte-for-byte.** Don't hand-edit files in
  `src/components/ui/` expecting edits to survive `fetch-registry`; change the
  theme or wrap components instead. These vendored files are intentionally
  unannotated (CLAUDE.md exemption).
- **`drawer` is corvu-backed**, the rest are Kobalte; `sonner` wraps
  `solid-sonner`. Their prop shapes follow those upstream libraries.
