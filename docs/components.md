# Component guide

All components forward native attributes, events, children and refs. Use `class`
for caller overrides. Import only from `shadcn-solidjs-theme`; dependencies stay
inside the package (D19). The live playground demonstrates each component.

## Button

```tsx
import { createSignal } from 'solid-js';
import { Button } from 'shadcn-solidjs-theme/ui/button';

function SaveAction() {
  const [pending, setPending] = createSignal(false);
  return <Button disabled={pending()} aria-busy={pending() ? 'true' : 'false'}
    onClick={() => setPending(true)}>{pending() ? 'Saving…' : 'Save'}</Button>;
}
```

Variants: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`.
Sizes: `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`.
Icon-only controls need an accessible name, e.g. `aria-label="Add item"`.
The app owns pending state, errors and retries; Button never fetches or starts a
mutation itself. Native buttons support Enter/Space and disabled semantics.

```tsx
<Button as="a" href="/settings" variant="outline">Settings</Button>
<Button type="submit" form="preferences">Save preferences</Button>
<Button size="icon" aria-label="Add item">+</Button>
```

Disabled anchors lose href, leave the tab sequence, expose aria-disabled, and
block click handlers. `as` accepts `button` or `a`; custom router links can use
`class={buttonVariants({variant: 'outline'})}` and own navigation semantics.

## Badge

```tsx
<Badge variant="secondary">Ready</Badge>
<Badge variant="destructive">Needs attention</Badge>
<Badge as="a" href="#details" variant="outline">Details</Badge>
```

Uses a span by default, without an invented interactive role. The same six
variants are available. Status meaning must include text, not color alone.

## Card

```tsx
<Card size="sm">
  <CardHeader>
    <CardTitle><h2>Team preferences</h2></CardTitle>
    <CardDescription>Settings shared with your team.</CardDescription>
    <CardAction><Badge variant="outline">Preview</Badge></CardAction>
  </CardHeader>
  <CardContent>Your controls go here.</CardContent>
  <CardFooter><Button>Save changes</Button></CardFooter>
</Card>
```

Card has `size="default" | "sm"`; its six child parts are native divs. Supply a
heading at the appropriate document level inside CardTitle. No implicit section,
landmark or heading level is imposed. Use `class="min-w-0 break-words"` on content
that may contain long unbroken identifiers.

## Separator

```tsx
<Separator />
<Separator decorative={false} />
<div class="flex h-8 items-center gap-4">
  Overview <Separator orientation="vertical" class="h-6" /> Activity
</div>
```

Default decorative separators are hidden from assistive technology. Meaningful
separators use `decorative={false}`, expose `role="separator"` and the correct
aria-orientation. Both orientation and decorative state can be reactive.

## Skeleton

```tsx
import { Loading } from 'solid-js';
<Loading fallback={
  <div aria-busy="true">
    <span role="status">Loading profile…</span>
    <Skeleton class="h-12 w-12 rounded-full" />
    <Skeleton class="mt-3 h-4 w-48" />
  </div>
}>
  <Profile />
</Loading>
```

Skeleton is a decorative div; size it with utilities. Its animation stops under
`prefers-reduced-motion: reduce`. The application controls readiness and supplies
status text, recovery, and eventual content. A real async Loading boundary is
covered by the unit suite.

## Input, Textarea and Label

```tsx
import { createSignal } from 'solid-js';
import { Input } from 'shadcn-solidjs-theme/ui/input';
import { Textarea } from 'shadcn-solidjs-theme/ui/textarea';
import { Label } from 'shadcn-solidjs-theme/ui/label';

/** The form owns its editable draft and reset behavior. */
function DeliveryForm() {
  const [notes, setNotes] = createSignal('Call on arrival.');
  return <form onReset={() => setNotes('Call on arrival.')}>
    <Label for="email">Email (required)</Label>
    <Input id="email" name="email" type="email" required
      defaultValue="hello@example.com" autocomplete="email" />
    <Label for="notes">Delivery notes</Label>
    <Textarea id="notes" name="notes" rows={3} maxlength={240}
      defaultValue="Call on arrival." value={notes()} onInput={event => setNotes(event.currentTarget.value)}
      aria-describedby="notes-help" />
    <p id="notes-help">Include instructions for finding the entrance.</p>
    <Button type="reset">Reset draft</Button>
  </form>;
}
```

`InputProps`, `TextareaProps` and `LabelProps` extend the corresponding native
Solid JSX attributes. Refs, `form`, `name`, `required`, `disabled`, `readonly`,
`value`, `defaultValue`, native input types and events are forwarded. Use `onInput`
for every edit; `onChange` retains native commit semantics. An uncontrolled field
uses `defaultValue` and browser form reset; controlled drafts also reset their
own signals in the form's `onReset` and supply the matching native `defaultValue`
reset target. In Solid, `value` writes the current DOM property and `defaultValue`
sets the native reset baseline. Without that baseline, the browser can clear a
controlled textarea after its reset handler runs.

Input defaults to the native text type. File inputs must remain uncontrolled;
use their native `files` property in an event handler or ref. This package adds
no upload, file reading or persistence. Textarea supports `rows`, `cols`, `wrap`
and native resize; `field-sizing-content` progressively enhances supported
browsers with content sizing. Override dimensions with `class` when needed.

Connect each Label `for` to a unique control `id`. Placeholder text is not an
accessible label. Describe errors with text and `aria-describedby`, alongside
`aria-invalid="true"`; the owner clears the error and preserves the draft during
recovery. `required` drives native validation, while `aria-invalid` alone does
not block submission. Read-only fields remain focusable and submit their values;
disabled fields are skipped by keyboard navigation and native submission.

```tsx
<Label for="reference">Reference code</Label>
<Input id="reference" aria-invalid="true" aria-describedby="reference-error" />
<p id="reference-error" class="text-destructive-emphasis text-sm">
  Enter the reference from your confirmation.
</p>
<div class="space-y-2">
  <Input id="locked" class="peer" disabled defaultValue="Managed by your team" />
  <Label for="locked">Managed contact (disabled)</Label>
</div>
```

The disabled-label style requires a preceding `.peer` control or a wrapping
`.group` with `data-disabled="true"`. A native label does not accept `disabled`;
communicate why its associated field cannot be edited. The three components use
semantic tokens, caller class overrides and the sibling React class strings.
They have no variants, providers, generated IDs, `as` or `asChild` API. For a
future contextual Field composition, evaluate Kobalte TextField first.

## Checkbox and Switch

```tsx
import { createSignal } from 'solid-js';
import { Checkbox, type CheckedState } from 'shadcn-solidjs-theme/ui/checkbox';
import { Switch } from 'shadcn-solidjs-theme/ui/switch';

/** The parent owns controlled values and may reject a requested update. */
function Preferences() {
  const [selected, setSelected] = createSignal<CheckedState>('indeterminate');
  const [enabled, setEnabled] = createSignal(true);
  return <>
    <div class="flex items-center gap-3">
      <Checkbox id="categories" checked={selected()} onCheckedChange={setSelected} />
      <Label for="categories">Select all categories</Label>
    </div>
    <div class="flex items-center gap-3">
      <Switch id="updates" checked={enabled()} onCheckedChange={setEnabled} size="sm" />
      <Label for="updates">Live updates</Label>
    </div>
  </>;
}
```

Checkbox accepts `checked` and `defaultChecked` as `boolean | 'indeterminate'`.
Switch accepts boolean and `size="default" | "sm"`. `onCheckedChange` receives
the proposed value once per actual change. Controlled parents may accept or
reject the request; the input and its visual state stay consistent. Mixed
checkboxes expose `aria-checked="mixed"` and a dash, then become checked when
activated. The app derives any select-all state from its child selections.

```tsx
<form>
  <div class="flex items-center gap-3">
    <Checkbox id="terms" name="terms" value="accepted" required />
    <Label for="terms">Accept terms (required)</Label>
  </div>
  <div class="flex items-center gap-3">
    <Switch id="alerts" name="alerts" defaultChecked />
    <Label for="alerts">Delivery alerts</Label>
  </div>
  <Button type="submit">Save</Button>
  <Button type="reset">Reset</Button>
</form>
```

The focusable element and public ref are **HTMLInputElement**, unlike the
reference React button root. `id`, `name`, `value`, `form`, `required`, `disabled`,
`readonly`, ARIA props and native events are forwarded. Checked named inputs
submit `value` (default `"on"`); unchecked, mixed and disabled inputs are omitted.
Native required validation works. Label activation and Space toggle; disabled
inputs leave the tab sequence. `readonly` inputs remain focusable but activation
is cancelled. `onClick` can call `preventDefault()` to cancel an edit; native
change events are not cancellable in browsers. Use `onCheckedChange` for state.

`defaultChecked` is read once when mounting and supplies the reset baseline.
After native form reset, uncontrolled state returns to that baseline (including
mixed state). Controlled owners receive a baseline request; ignored requests
preserve the current controlled value. Cancelled reset and unmount prevent queued
updates; external form association via `form="id"` is supported and reactive.
Do not change a control between controlled and uncontrolled modes during its life.

`data-slot="checkbox"` / `"switch"` and caller `class` are on the input. Decorative
`checkbox-indicator` / `switch-thumb` spans are hidden from assistive technology.
The input has an inert positioning wrapper, so use a wrapping `.group` with
`data-disabled="true"` for disabled Label styling; a sibling Label's peer selector
cannot cross the wrapper. Input refs still support `.focus()`. There is no
`asChild`, arbitrary `as`, generated label, hidden duplicate input or form provider.
Switch thumb movement supports RTL; both controls respect reduced motion.

The components share the sibling class contract and semantic tokens. Kobalte
was evaluated first and was not adopted for this batch because of measured reset
and Solid 2 diagnostic failures; see [the evaluation](../KOBALTE-TOGGLES.md).

## Themes and screenshots

Import `theme.css` once. Add `.dark` to an ancestor for dark mode. Override semantic
variables on a containing element to customize a region:

```tsx
<div style={{'--primary': 'oklch(0.46 0.15 155)',
  '--primary-foreground': 'oklch(0.99 0 0)', '--radius': '0.8rem'}}>
  <Button>Custom brand</Button>
</div>
```

Keep foreground/background pairs accessible when overriding tokens. The default
destructive emphasis token mixes destructive with foreground for stronger small
text contrast; `:root`/`.dark` values still match the sibling React theme exactly.
These are reviewed Solid gallery baselines, not pixel comparisons against React.

![Light gallery](screenshots/light.png)
![Dark gallery](screenshots/dark.png)
![Narrow layout](screenshots/mobile.png)
