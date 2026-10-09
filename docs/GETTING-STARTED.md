# Build with Solid UI

65 component families for Solid 2. Accessible interactions, semantic theme
variables, and explicit component contracts — with examples you can run and adapt.

This package is developed inside the restaurant-management workspace. It is
currently private and is not published to npm. Use the workspace dependency
below; no public registry installation is implied.

## Set up a workspace application

Use the package's tested pins: `solid-js` and `@solidjs/web` at `2.0.0-rc.13`,
with `vite-plugin-solid` `3.0.0-next.27`. Use Tailwind 4 with its Vite plugin.
Declare `shadcn-solidjs-theme` as a `workspace:*` dependency.

```css
/* Your application's CSS entry */
@import 'shadcn-solidjs-theme/theme.css';
```

```tsx
import { createSignal } from 'solid-js';
import { Button } from 'shadcn-solidjs-theme/ui/button';

export function Counter() {
  const [count, setCount] = createSignal(0);
  return <Button onClick={() => setCount(value => value + 1)}>
    Count: {count()}
  </Button>;
}
```

Import individual `ui/*` modules. Source exports require the Solid 2 JSX
compiler; built root exports are available after `bun run build`. Component
engines remain implementation details of this package.

## Choose your theme

Use semantic variables such as `--background`, `--foreground`, `--primary`,
`--primary-foreground` and `--radius`. A `.dark` ancestor selects the dark palette.
The website's palette and radius controls demonstrate overrides without changing
the shared defaults. Check contrast whenever supplying your own colors.

```css
.my-theme {
  --primary: oklch(0.46 0.15 155);
  --primary-foreground: oklch(0.99 0 0);
  --radius: 0.8rem;
}
```

## Compose an admin screen

Start with the [restaurant editor recipe](components.md#restaurant-admin-composition).
It combines a Data Table with Dialog, Select, labeled fields and native toggles.
Confirmed rows, editable drafts and pending requests have separate owners.
The playground uses a local simulated service; it never changes your restaurant data.

## Solid conventions

Use `class`, plain `ref` props, and signal reads in JSX. Supported polymorphism
varies by component; check its guide rather than assuming React `asChild` support.
The package targets the pinned Solid 2 prerelease and does not support Solid 1.
Apps own requests, caches, routing and persistence. Components own presentation
and local interaction state.

## Evidence and limitations

Each component page links to its live preview and documented contract.
[The test matrix](TEST-MATRIX.md) connects behavior to assertions and lists
remaining manual checks. [Catalog completion](CATALOG-COMPLETION-AUDIT.md)
and [admin composition validation](ADMIN-MENU-DELIVERY.md) record measured results.
Export names do not imply complete React API compatibility.

The repository has not declared an open-source license or published package
release. Distribution needs an owner-selected license and release destination.
