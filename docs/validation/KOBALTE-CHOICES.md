# Kobalte Radio Group, Toggle and Toggle Group evaluation

2026-10-08. Unpatched `@kobalte/core@2.0.0-alpha.2`, Solid core/web/signals
`2.0.0-rc.13`, Vite `8.3.3`, vite-plugin-solid `3.0.0-next.27`, Playwright
`1.63.0`. This is evaluation of the selected pins, not a fresh registry survey.

[Fixture](../../validation/solid2-choices/main.tsx), [probe](../../validation/solid2-choices/probe.mjs),
[raw outcomes and diagnostics](../../validation/solid2-choices/unpatched.json).

| Primitive | Chromium and Firefox behavior | Diagnostics per engine | Decision |
| --- | --- | ---: | --- |
| Radio Group | Arrow selection and native form value pass; reset does not restore default selection after a one-second assertion window | 14 | Owned native radios and group state |
| Toggle | Click and Space pass; canceled click still toggles | 0 | Adopt with a controlled public-API adapter that preserves canceled activation |
| Toggle Group | Arrow navigation skips the disabled item; multiple selection passes | 5 | Owned native pressed buttons and roving focus |

The Toggle adapter translates `onChange` to `onPressedChange`, supplies canonical
controlled state to Kobalte, and rejects its change request when the caller canceled
that click. It adds no patch, internal import or warning suppression. This is the
first production Kobalte adoption in the package, via its per-component
`@kobalte/core/toggle-button` entry. The package pins the dependency and keeps it
behind its own exports. No corvu dependency is needed: these are overlapping
capabilities, not a missing Kobalte catalog entry.

Kobalte's declared Solid peer pins are older than rc.13; the package overrides core,
web and signals to the shared rc.13 runtime. Acceptance is scoped to the wrapped
Toggle and recorded interactions, not approval of other Kobalte primitives.
A direct server probe also renders the native pressed button successfully:

```js
import { renderToString, createComponent } from '@solidjs/web';
import { Root } from '@kobalte/core/toggle-button';
console.log(renderToString(() => createComponent(Root, {
  defaultPressed: true, children: 'Bold',
})));
```

Run that code with `node --conditions=development --input-type=module` in the
fixture directory. The earlier exploratory attempt used an unsupported
`@solidjs/web/server` entry; that import error was a probe error, not a Kobalte failure.

For the browser probe, install the fixture package/lock in isolation with
`bun install --frozen-lockfile --ignore-scripts`, expose its node_modules in the
fixture directory, start `bun run dev` there on 4405, then run `node probe.mjs`.
Exploratory commands were not separately timed. Radio Group/Toggle Group WebKit
and exhaustive library APIs were not evaluated after the recorded failures.
The production implementations and Toggle adapter are verified in all three
engines, SSR and hydration; see [delivery evidence](../CHOICES-DELIVERY.md).
