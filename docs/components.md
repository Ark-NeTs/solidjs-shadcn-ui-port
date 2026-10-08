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

Reset synchronization uses a cancelable next-task timer: a browser can run a
microtask between native event listeners, before an ancestor cancels the reset.
Changing the `form` prop or unmounting removes the old listener and cancels its
pending timers. A missing target ID detaches the control; removing `form` restores
its enclosing form. [CHK-1/SWT-1 browser checks](TOGGLES-FORMS-DELIVERY.md) verify
these transitions independently for Checkbox and Switch, native FormData, node
identity, queued-work disposal and mixed Checkbox restoration.
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

## Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from 'shadcn-solidjs-theme/ui/tabs';
<Tabs defaultValue="overview">
  <TabsList aria-label="Workspace sections">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
    <TabsTrigger value="restricted" disabled>Restricted</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Ready to work.</TabsContent>
  <TabsContent value="activity">Your activity goes here.</TabsContent>
  <TabsContent value="restricted">Unavailable.</TabsContent>
</Tabs>
```

Root: `value`, `defaultValue`, `onValueChange(value)`,
`orientation="horizontal" | "vertical"` and
`activationMode="automatic" | "manual"`. Without a valid uncontrolled default,
the first enabled registered tab is selected. Controlled owners may reject a
request. Use unique values within a root and one matching panel per trigger.
List: `variant="default" | "line"`, `loop` (true by default), and a required
accessible name via `aria-label` or `aria-labelledby`. Also exported:
`tabsListVariants` and all four part prop types.

Arrow keys skip disabled tabs; horizontal navigation follows inherited CSS
direction, vertical navigation uses Up/Down. Home/End target the endpoints.
Manual activation moves focus without selecting until Space, Enter or click.
Tab leaves the tablist. IDs, native attributes, events, classes and refs stay
reactive; caller-cancelled click/keydown handlers prevent internal actions.
Panel refs target divs and trigger refs target buttons. Selection changes
unmount inactive children; `TabsContent forceMount` preserves local drafts under
`hidden`. Store drafts above Tabs when they must survive ordinary panel switches.
The scrolling tablist prevents narrow layouts from overflowing the page. Its
default `tabindex="-1"` prevents an extra native scroll-container Tab stop; the
roving trigger remains the entry point. A removed or reinserted focused trigger
recovers focus to the remaining roving tab after DOM reconciliation. If no
enabled tab remains, the list receives focus so Tab can leave it. Recovery does
not override a newer focus destination and stops when the list unmounts.

The [dynamic collection example](../playground/tabs-lifecycle.tsx) runs at
`/?tabs-lifecycle` (append `&manual` for manual activation). Delete and Alt+End
are example-owned commands for removal/reordering, not new Tabs keyboard APIs.
[TAB-1 acceptance](TABS-TAB1-DELIVERY.md) verifies focused removal, adjacent and
nonadjacent keyed moves, outside-focus preservation and both panel lifetimes in
Chromium and Firefox, using source and built exports.

## Popover

```tsx
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader,
  PopoverTitle, PopoverDescription, PopoverClose } from 'shadcn-solidjs-theme/ui/popover';
<Popover>
  <PopoverTrigger class={buttonVariants({ variant: 'outline' })}>Edit details</PopoverTrigger>
  <PopoverContent align="start" side="bottom">
    <PopoverHeader>
      <PopoverTitle>Details</PopoverTitle>
      <PopoverDescription>Changes stay in this preview.</PopoverDescription>
    </PopoverHeader>
    <Label for="display-name">Display name</Label>
    <Input id="display-name" defaultValue="North studio" />
    <PopoverClose class={buttonVariants({ variant: 'outline' })}>Done</PopoverClose>
  </PopoverContent>
</Popover>
```

Root: `open`, `defaultOpen`, `onOpenChange(open)`, `modal` (false by default).
Trigger/Close are native buttons, styled by callers; no nested Button or React
`asChild`. Optional `PopoverAnchor` is a div used for positioning, while the
trigger remains the focus-return target. Content accepts `side` (four edges),
`align="start" | "center" | "end"`, `sideOffset` (4), `alignOffset` (0),
`collisionPadding` (8), `avoidCollisions` (true), and `forceMount` (false).
Floating UI flips/shifts and limits available width/height; `data-side` reflects
the final placement. Position updates stop on close/unmount. Override dimensions
and semantic tokens through `class`, `style` or the original theme ancestor.

Provide Title or an explicit `aria-label`/`aria-labelledby`; Description wires
`aria-describedby` automatically. Content is a div in nonmodal mode and a native
dialog in modal mode; Header is a div, Title an h2 and Description a p. The browser
renders content above clipping ancestors while keeping inherited theme variables.
Nonmodal Escape and outside pointer clicks dismiss. Outside clicks preserve the
new focus target; explicit close/Escape returns focus to the trigger. Modal mode
blocks background interaction, locks document scrolling and wraps Tab focus.
Choose modality before opening. Native auto popovers are exclusive unless nested;
coordinate controlled owners rather than forcing unrelated auto popovers open.

Content lifecycle hooks are `onOpenAutoFocus`, `onCloseAutoFocus` and
`onEscapeKeyDown`, each receiving a cancellable Event. Prevent default to replace
the component's focus step or refuse Escape. Native initial focus still runs when
showModal is called; a custom open hook can focus a chosen element itself.
Controlled close rejection is reconciled after the native close notification.
Closed content unmounts by default; `forceMount` keeps it hidden and stops its
positioning observers. There is no delayed exit animation, portal-container API,
virtual anchor or complete Radix/Kobalte prop compatibility in this release.

The [placement examples](../playground/popover-placement.tsx) run at
`/?popover-placement&placement-case=scroll` (also `resize`, `motion`, `edge`,
`clip`). [Browser acceptance](POPOVER-POP1-DELIVERY.md) covers real scrolling,
viewport/element resizing, transform motion, viewport flipping/shifting and
clicks outside a transformed clipping ancestor in Chromium and Firefox, against
source and built exports. Placement coordinates update without CSS transitions;
the opening animation is retained. Avoid overriding content with `transition-all`,
which would interpolate `left`/`top` and make the popup trail its anchor.

## Alert Dialog

```tsx
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction } from 'shadcn-solidjs-theme/ui/alert-dialog';
<AlertDialog>
  <AlertDialogTrigger class={buttonVariants({ variant: 'destructive' })}>Remove item</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Remove this item?</AlertDialogTitle>
      <AlertDialogDescription>You can cancel and keep it.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Keep item</AlertDialogCancel>
      <AlertDialogAction onClick={removeLocalItem}>Remove item</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

Root shares the open/defaultOpen/onOpenChange contract. Content accepts
`size="default" | "sm"`, `forceMount` and the three lifecycle hooks described
above. Always provide a title or explicit accessible name; description is
optional. Native modal behavior makes the background inert; outside clicks do
not dismiss. Cancel receives initial focus; Escape and accepted action/cancel
requests close and restore the trigger. Keyboard Tab/Shift+Tab wrap inside the
active modal. Scroll locks remain until the last nested modal closes. Initial
focus candidates belong to the opening layer; controls inside a nested dialog
are excluded even when its content is kept mounted while closed.

All sibling parts are exported: Trigger, Portal, Overlay, Content, Header,
Footer, Media, Title, Description, Action and Cancel. Portal preserves children
in place because native top-layer rendering supplies the stacking behavior.
Content includes its overlay automatically. The optional standalone Overlay is
hidden while closed; do not add a second one to a normal Content composition.
Content ref/native attributes target the inner div; accessible naming attributes
also name the outer `role="alertdialog"` native dialog. Title is h2, Description
is p, other layout parts are divs, and actions are native buttons. Action/Cancel
accept Button variants/sizes; Cancel defaults to outline. Trigger styling is
caller-owned. Do not place these triggers inside another button.

For async work use controlled `open`. In Action's click handler call
`event.preventDefault()`, guard/disable duplicate submissions, and start the
application-owned operation. Keep Cancel and Escape disabled/cancelled while
an operation's outcome is uncertain; close explicitly only on confirmed success.
Render an error with an explicit retry after failure and preserve the draft.
The playground demonstrates those transitions with manual completion/failure
buttons; no operation or retry is hidden inside the library.

The [focused keyboard example](../playground/alert-dialog-focus.tsx) runs at
`/?alert-dialog-focus`; append `&force-mounted` to keep the closed child mounted.
[ALT-1 acceptance](ALERT-ALT1-DELIVERY.md) verifies exact forward/reverse Tab
boundaries, nested Escape/Cancel/Confirm, draft preservation, background inertness,
scroll-lock release and focus return in Chromium and Firefox, against both
source and built exports.

![Light popover](screenshots/popover-light.png)
![Dark alert dialog](screenshots/alert-dark.png)
![Mobile alert dialog](screenshots/alert-mobile.png)

The new components require modern HTML popover/dialog APIs. Chromium and Firefox
are tested; older browsers, WebKit, hydration and physical assistive-technology
sessions are not certified by this batch. See [delivery evidence](../OVERLAYS-DELIVERY.md).

## Combobox

```tsx
import { createSignal } from 'solid-js';
import {
  Combobox, ComboboxInput, ComboboxContent, ComboboxList,
  ComboboxItem, ComboboxEmpty,
} from 'shadcn-solidjs-theme/ui/combobox';
import { Label } from 'shadcn-solidjs-theme/ui/label';

function FruitField() {
  const [fruit, setFruit] = createSignal<string | null>('Apple');
  return <>
    <Label for="fruit">Favorite fruit</Label>
    <Combobox items={['Apple', 'Banana', 'Cherry']} value={fruit()}
      onValueChange={next => setFruit(next)} name="fruit" required>
      <ComboboxInput id="fruit" showClear />
      <ComboboxContent>
        <ComboboxList>{(item: string) =>
          <ComboboxItem value={item}>{item}</ComboboxItem>
        }</ComboboxList>
        <ComboboxEmpty>No matches. Try another search.</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  </>;
}
```

`items` is required. Strings work directly; objects require stable unique keys
with `itemToStringValue` and human-readable labels with `itemToStringLabel`.
Null represents no single selection. Empty string is a real item; a required
single-value form field rejects its empty serialized value, following HTML.
Do not use null/undefined as option values or duplicate keys.

`value`/`onValueChange` and `open`/`onOpenChange` are independently controlled.
Omit them to use `defaultValue` and `defaultOpen`. Defaults are read at mount;
reset returns to that baseline. A controlled owner can reject selection or
closure. Search is a draft: typing alone never changes the submitted value.
Selection, Escape, Tab and dismissal discard the uncontrolled search draft.
`inputValue`/`onInputValueChange` let the application own search; callback reasons
are `input-change`, `input-clear`, `item-select`, and `dismiss`. Input paste follows
the browser's input event and reports `input-change`.

Default filtering is a trimmed, case-insensitive label substring. `filteredItems`
bypasses it for application filtering or asynchronously supplied results. Keep
request cancellation, stale-result checks, pending/error presentation, and retry
in the application. Render loading/status/error content beside the list; show
ComboboxEmpty only when an empty result is ready. The library starts no requests,
submits no mutations, and performs no retries. Large lists are not virtualized.

`isItemDisabled` excludes options from keyboard selection and pointer activation.
Root `disabled` blocks editing and submission; `readOnly` blocks user changes
while retaining submitted values. `name`, `form`, and `required` configure a
visually hidden native select. Multiple values use repeated FormData entries.
For controlled forms, provide `defaultValue` as the reset baseline and accept
the reset request in `onValueChange` when the owner permits it.
The [form and ownership examples](../playground/combobox-contracts.tsx) run at
`/?combobox-contracts`; their [browser contracts](../tests/combobox-contracts.ts)
exercise both source and built exports in Chromium and Firefox.
Rejected controlled changes preserve canonical values. Reset waits until the
browser finishes resetting fields, respects cancellation, and cancels pending
restoration on unmount. Invalid submission exposes a named error and opens the
chooser; use `aria-describedby` for additional help.

Arrow Up/Down open and navigate enabled choices with wrapping; Enter commits;
Escape cancels. Tab discards the draft after native focus navigation: from an
inline input it reaches the optional trigger, then the next control; Shift+Tab
reaches the preceding control. From popup search, Tab reaches the next outside
control and Shift+Tab returns to the trigger. Deferred closure is canceled on
unmount or a newer open/close request. Home/End retain native text-cursor behavior.
IME composition does not commit selections. Active options scroll inside the
list while DOM focus remains on the input. Scrolling accounts for the opening
scale animation. List/Collection render callbacks use layout-neutral presentation
wrappers to isolate reactive row reads; style options by their data-slot rather
than assuming they are direct DOM children of the list.
[Navigation acceptance](COMBOBOX-CMB2-DELIVERY.md) covers a 40-option list, native
Tab destinations and a chooser inside modal Popover. Physical IME remains unrun.
Use a Label or explicit aria-label;
ComboboxLabel is a **group** label, not a field label.

For the admin's popup-search pattern, place `ComboboxTrigger` outside Content,
and place `ComboboxInput showTrigger={false}` inside Content. The trigger opens
a named chooser dialog and focus enters its search field. Selection/Escape
return focus to the trigger. `ComboboxValue` displays the current canonical label
or its `placeholder`. Both editable-input and trigger-first examples are in the
live gallery. Content inherits Popover's placement/lifecycle props and theme
ancestry; it contains an explicitly named listbox.

For multiple selection use `multiple` and an array value. Compose
`ComboboxChips`, `ComboboxValue<string>` with a one-argument render callback,
`ComboboxChip value={item}`, and `ComboboxChipsInput`. Chips provide named remove
buttons (`showRemove={false}` hides one); multiple selection keeps the popup open.
`ComboboxClear` clears through the owner and supports a cancellable click handler.
The gallery demonstrates this complete composition.

Additional parts: `ComboboxGroup` (name it with aria-label/aria-labelledby),
`ComboboxLabel`, `ComboboxSeparator`, and `ComboboxCollection` for rendering the
filtered items inside manual group markup. A List render callback must declare
its item parameter; zero-argument functions are treated as Solid JSX. Manual
markup must represent the same options as the root's filtered collection.

Intentional differences from the React/Base UI sibling: Solid `class`, lowercase
native attributes, callback refs, and native Popover placement; no React ref
object `useComboboxAnchor`, custom anchor prop, arbitrary Base UI `render` prop,
virtualization, auto-highlight/auto-select, chip arrow-navigation, or exit-presence
animation is promised. Input/Content reuse existing token-based field/popover
styles instead of the sibling's unavailable InputGroup/Base UI internals. The
seven names currently imported by the React admin are present, but that inventory
check does not certify a port of the admin or every Base UI behavior.

![Light searchable chooser](screenshots/combobox-light.png)
![Dark searchable chooser](screenshots/combobox-dark.png)
![Narrow searchable chooser](screenshots/combobox-mobile.png)

## Acceptance evidence

See the [per-component test matrix](TEST-MATRIX.md) for linked assertions,
SSR/visual scope, and open acceptance gaps for every implemented family.
