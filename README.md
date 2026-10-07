# shadcn-solidjs-theme

## Role and decisions

An owned Solid 2 design system for the future Solid admin, behind the D19 package
boundary. The implementation contains **Button, Badge, Card, Separator, Skeleton, Input,
Textarea, Label, Checkbox, Switch, Tabs, Popover, Alert Dialog and Combobox**. The React admin and Svelte storefront keep their existing themes.
See [DECISIONS.md](DECISIONS.md) for the owner's 2026-10-07 foundation direction
and [COMBOBOX-DELIVERY.md](COMBOBOX-DELIVERY.md) for current measured acceptance.
[FOUNDATION-DELIVERY.md](FOUNDATION-DELIVERY.md) retains the earlier five-component results.

These fourteen components use native HTML and Solid 2. Popover positioning uses
`@floating-ui/dom@1.8.0`. Kobalte remains the first
candidate for richer interaction primitives. Neither Kobalte nor corvu, nor the
experimental validation patches, is a dependency of this implementation.
Kobalte Checkbox/Switch were browser-tested first; reset and diagnostic failures
are recorded in [KOBALTE-TOGGLES.md](KOBALTE-TOGGLES.md).
Combobox adoption evidence is in [KOBALTE-COMBOBOX.md](KOBALTE-COMBOBOX.md).
The Tabs/Popover/Alert Dialog probe is in [KOBALTE-OVERLAYS.md](KOBALTE-OVERLAYS.md).

## Key files

| File | Purpose |
| --- | --- |
| `src/components/ui/*.tsx` | Fourteen components and their compound parts |
| `src/lib/utils.ts` | Conditional classes and Tailwind 4 conflict resolution |
| `src/theme.css` | Shared oklch tokens, Inter, utilities and reduced motion |
| `src/index.ts` | Public library barrel |
| `playground/` | Interactive documentation using package exports |
| `tests/unit/` | Reactivity, native contracts, loading, token and class parity |
| `tests/integration/` | Source-component browser integration and axe checks |
| `tests/e2e/` | Built-library journeys and screenshot baselines |
| `validation/` | Earlier experiments; excluded from production builds/tests |

## Exports and usage

```tsx
import { Button } from 'shadcn-solidjs-theme/ui/button';
import { Badge } from 'shadcn-solidjs-theme/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription,
  CardAction, CardContent, CardFooter } from 'shadcn-solidjs-theme/ui/card';
import { Separator } from 'shadcn-solidjs-theme/ui/separator';
import { Skeleton } from 'shadcn-solidjs-theme/ui/skeleton';
import { Input } from 'shadcn-solidjs-theme/ui/input';
import { Textarea } from 'shadcn-solidjs-theme/ui/textarea';
import { Label } from 'shadcn-solidjs-theme/ui/label';
import { Checkbox } from 'shadcn-solidjs-theme/ui/checkbox';
import { Switch } from 'shadcn-solidjs-theme/ui/switch';
import { cn } from 'shadcn-solidjs-theme/utils';
```

```css
@import 'shadcn-solidjs-theme/theme.css';
```

`ui/*` and `utils` compile from source. The package root exposes source under the
`solid` condition and built ESM otherwise. `styles.css` exposes compiled CSS.
`hooks/*` reserves the sibling package's export shape; no hooks are delivered yet.
The root build emits declarations. No application imports this package yet.

Detailed examples, every variant/size, accessibility notes and customization:
[Component guide](docs/components.md).
[Per-component acceptance matrix](docs/TEST-MATRIX.md) links requirements to tests
and tracks browser, SSR, visual and accessibility gaps. Run `bun run dev` for the live gallery.
Open `/?combobox-contracts` for focused native-form, object-result and controlled-owner
examples; [CMB-1 delivery](docs/COMBOBOX-CMB1-DELIVERY.md) records their browser acceptance.
The same page includes long-list and modal navigation examples, verified in
[CMB-2 delivery](docs/COMBOBOX-CMB2-DELIVERY.md).

![Light component gallery](docs/screenshots/light.png)
![Dark component gallery](docs/screenshots/dark.png)

## Environment and secrets

No secrets, network requests, application API, router or query cache. Components
receive props and signals. The playground's save action is explicitly a local
preview; the completion button lets tests and readers control pending state.
`THEME_PORT` changes the local documentation port (default 4399).

Use Bun 1.4.2 and Node >=22.12.0. Dependencies are exactly pinned in package.json
and the package-local bun.lock. To install this package independently without
resolving unrelated monorepo workspaces:

```sh
tools_dir=$(mktemp -d /private/tmp/solid-theme-tools.XXXXXX)
cp package.json bun.lock "$tools_dir/"
(cd "$tools_dir" && bun install --frozen-lockfile --ignore-scripts)
# Only when this package has no node_modules already:
ln -s "$tools_dir/node_modules" node_modules
```

The playground allow list resolves that node_modules link so local fonts remain
servable. A normal workspace installation can also supply dependencies; this
increment does not update the monorepo lockfile or claim its all-workspace gates.

## Commands

```sh
bun run dev                 # interactive gallery, 127.0.0.1:4399
bun run check               # TypeScript source, tools, playground and tests
bun run typecheck           # workspace-compatible alias
bun run lint                # handwritten source and tests
bun run test                # Vitest + Solid 2 testing-library + jsdom
bun run test:coverage       # 100% thresholds on all components and library helpers
bun run test:server         # server rendering without DOM globals
bun run build               # ESM, declarations and compiled CSS
bun run test:integration    # source JSX in Chromium and Firefox, including axe
bun run test:e2e            # fresh builds; journeys in both browsers; Chromium visuals
bun run build:playground    # static documentation in playground-dist/
bun run parity:report       # update the remaining admin import inventory
bun run parity:admin        # strict full-admin gate; still fails for later components
```

Playwright browsers must be installed (`bunx --no-install playwright install
chromium firefox`). Tests own their local server and do not reuse a running one.
Use `RESULTS_FILE` to retain a browser JSON report. Visual baselines are committed
files under `tests/e2e/visual.spec.ts-snapshots`; regenerate deliberately with
`bun run test:e2e --update-snapshots=all` and review the images before accepting them.

## Agent gotchas

- Solid core/web/signals stay on **2.0.0-rc.13**. JSX imports/types come from
  `@solidjs/web`; helpers use `omit`, and props are read inside tracked JSX.
  The official [Solid 2 migration guide](https://raw.githubusercontent.com/solidjs/solid/next/documentation/solid-2.0/MIGRATION.md)
  supersedes older recipes in specs.md.
- `vite-plugin-solid@3.0.0-next.27`, testing-library `1.0.0-beta.3` and Vitest
  `4.1.10` are the verified toolchain. Newer Vitest exists; upgrades are separate
  changes. Run tests through Vitest, not `bun test`.
- Use `class`, lowercase `tabindex`, string ARIA booleans, plain `ref`, and
  `<Loading>` (Solid 2's loading boundary). Native DOM props remain reactive.
- Input and Textarea preserve native `value`/`defaultValue`, form reset, refs and
  events. Use `onInput` for live drafts, `readonly` and `maxlength` in Solid JSX,
  and connect Label `for` to the field `id`. Controlled draft reset belongs to
  the form owner; see the component guide and playground.
- Checkbox accepts `boolean | 'indeterminate'`; Switch accepts boolean and
  `size="sm" | "default"`. Both expose `onCheckedChange`, native input refs,
  label/form association and controlled rejection. Their visual wrappers are
  noninteractive; use Label `for` with the native input `id`.
- Button defaults to `type="button"`; request `type="submit"` explicitly.
  `as="a"` supports links and disabled-link behavior. Badge supports `as="a"`.
  React's `asChild` and arbitrary `as` components are not supported in this batch;
  use `buttonVariants`/`badgeVariants` with a router-owned link component.
- The React radix-nova class tables are preserved with one tested correction:
  destructive text uses `text-destructive-emphasis`, derived from destructive
  and foreground tokens for contrast. Shared `:root`/`.dark` blocks remain
  byte-identical. `tailwind-merge@3.6.0` understands the Tailwind 4 utilities.
- Separator defaults to decorative and supplies both `data-orientation` and
  `data-horizontal`/`data-vertical` hooks. Skeleton is decorative and always
  `aria-hidden`; the app supplies a loading status or `aria-busy` on its region.
- Browser tests reject all warnings/errors. Coverage measures this batch, not
  full catalog completeness. Existing primitive findings stay in validation/.
- Read AGENTS.md, DELIVERY.md and the current delivery report before extending
  the package. No registry script may overwrite the owned Solid 2 source.
