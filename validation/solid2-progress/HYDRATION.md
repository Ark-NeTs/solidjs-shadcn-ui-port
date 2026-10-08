# Rejected Progress integration shapes

The ordinary browser fixture in this directory is unpatched Kobalte. The failed
hydration reports instead come from the package's shared source SSR/client fixture,
using a draft public wrapper. They are historical failures, not acceptance results
for the final owned Progress.

The draft used the final component's value/max normalization and value text. It
omitted `aria-labelledby` from the forwarded root props and supplied this supported
Kobalte rendering adapter:

```tsx
function ProgressElement(attributes: JSX.HTMLAttributes<HTMLDivElement>) {
  return <div {...attributes} aria-labelledby={props['aria-labelledby']} />;
}

return <Root {...rest} as={ProgressElement}
  value={value() ?? 0} minValue={0} maxValue={max()}
  indeterminate={value() === undefined} getValueLabel={valueLabel}
  data-slot="progress" data-state={state()} class={/* shared track classes */}>
  <Fill data-slot="progress-indicator" data-state={state()} aria-hidden="true"
    class={/* shared indicator classes */}
    style={{width: value() === undefined ? '40%' : 'var(--kb-progress-fill-width)',
      'margin-inline-start': value() === undefined ? '30%' : '0'}} />
</Root>;
```

The same public browser scenarios pass with that shape. During source hydration,
the default Fill requests key `acceptanceA30040350`, but the server indicator has
`acceptanceA30040360`, halting the reactive system. This is recorded in
[hydration-default-fill-failed.json](hydration-default-fill-failed.json).

Repair attempt 1 adds `as={ProgressIndicator}` to Fill with a static renderer:

```tsx
function ProgressIndicator(attributes: JSX.HTMLAttributes<HTMLDivElement>) {
  return <div {...attributes} />;
}
```

The same key mismatch remains, now diagnosed as a detached indicator and one
unclaimed server node. See [hydration-static-fill-failed.json](hydration-static-fill-failed.json).

Repair attempt 2 removes Fill entirely and renders the final owned indicator div
under the same Kobalte Root/ProgressElement. The indicator still requests a key one
position earlier (`acceptanceA3004031` versus `acceptanceA3004032`). See
[hydration-owned-fill-failed.json](hydration-owned-fill-failed.json).

The final implementation removes the Root/ProgressElement boundary too. It passes
node/ID retention, external label changes, actual hydrated width updates and
root disposal in all three engines. The comparison localizes the failure to these
Kobalte integration shapes, but does not establish whether the root cause is Solid,
Kobalte, the naming adapter or their combined serialization behavior.

The historical command was
`RESULTS_FILE=docs/evidence/progress-hydration-focused.json bun run test:hydration --grep 'hydrates Progress'`.
Hydration keys depend on the surrounding fixture and are not hard-coded into any
production component or assertion. See [the final delivery](../../docs/PROGRESS-DELIVERY.md).
