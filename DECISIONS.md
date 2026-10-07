# Solid 2 foundation decisions

## 2026-10-07 — begin the first implementation batch

Owner instruction: “implement that foundation and first five components instead
of starting another diagnostic investigation.” This authorizes the limited
Solid 2 package reopening described by D90 in the repository decision log and
supersedes this package's older requirement to finish broad Gate 0 before any
component code. D19 encapsulation remains in force; D52's Svelte storefront
choice remains in force.

Build Button, Badge, Card, Separator and Skeleton, shared tokens, package exports,
`cn`, a standalone playground, tests and documentation. Do not port an admin
screen or adopt the experimental headless-library patches in this batch.

Kobalte was evaluated first: its Button adds polymorphic tag bookkeeping, and its
Separator does not directly provide the React decorative/data-attribute contract.
The native platform supplies this batch's required semantics without those
abstractions. Badge, Card and Skeleton are presentations rather than interaction
primitives. Kobalte stays first for subsequent complex controls; no corvu gap
has been demonstrated.

Keep the React radix-nova variant tables except for the destructive text utility:
axe found insufficient light-mode contrast. A derived `destructive-emphasis`
color corrects it without changing the canonical token blocks. This is an
intentional visual difference, covered by the class-parity and browser tests.

Use exact Solid/web/signals rc.13 pins, which were already verified in this
repository. TypeScript 5.9.3 is supported by the lint toolchain. Keep the new
package's standalone lockfile; do not resolve or repin unrelated workspaces.

## 2026-10-07 — standalone Input, Textarea and Label

Owner instruction: “commit and implement Input, Textarea, and Label.” Commit
`b82f86c` records the completed foundation and earlier compatibility evidence.
The owner subsequently requested committing the new batch separately.

Kobalte was evaluated first: `@kobalte/core/text-field` in 2.0.0-alpha.2 exports
Root, Input, TextArea and contextual Label. That composed field context is useful
for a future Field API, but is not required by the sibling standalone contracts.
Use native input/textarea/label here, as already mapped in COMPONENT-MAP.md.
No demonstrated Kobalte gap requires corvu, and no dependency is added.

Preserve the sibling React class strings exactly. Adapt only JSX conventions
(`class`, `for`, `readonly`, `maxlength`) and DOM types to Solid 2. Forward refs,
native validation/form attributes and events. Components own no draft, generated
ID, error state or reset effect. The application associates labels and
help/error descriptions and resets controlled draft signals on the form's reset
event and supplies the matching native `defaultValue` reset baseline;
uncontrolled fields use `defaultValue` alone. Browser regression testing caught
and fixed an example that reset its signal but omitted the textarea's native
reset baseline. Label is a native label without
Radix `asChild` or custom pointer-selection suppression.

## 2026-10-07 — Checkbox and Switch after a real Kobalte evaluation

Owner instruction: “implement Checkbox and Switch, evaluating Kobalte first.”
The standalone unpatched `2.0.0-alpha.2` probe in both Chromium and Firefox
confirmed initial/toggled state but failed default-on Switch reset and emitted
STRICT_READ_UNTRACKED, EFFECT_RELAY_TEAR and EFFECT_WRITES_OWN_SOURCE diagnostics.
Retain the exact probe and output in validation/solid2-toggles. This is evidence
against adopting the tested composition as-is, not a claim that Kobalte cannot
be fixed. No existing diagnostic patches are promoted into production.

The native checkbox platform already provides the required labels, keyboard,
validation and form submission. Implement Checkbox and Switch on native inputs
with an owned Solid helper for controlled/uncontrolled checked state, mixed
checkbox state and reset synchronization. Corvu's mapped catalog has neither
primitive, so no fallback dependency is installed. Kobalte stays the first
candidate for later components.

Keep the React classes and data slots, add native appearance/indicator positioning,
explicit indeterminate styling, RTL thumb movement and reduced-motion support.
Unlike the React button roots, public refs and events target a native input;
there is one input and no duplicate hidden form control. An inert span positions
the decorative indicator/thumb. `class` applies to the input; disabled-label
presentation should use a wrapping group instead of relying on sibling peer
selectors across this wrapper. Inputs retain native Space operation (Enter is
not a toggle shortcut). Use explicit associated Labels for a generous click area.

`defaultChecked` is a mount-time reset baseline. Controlled owners receive
`onCheckedChange` requests and may reject them; native DOM state is reconciled
without generating a second change event. Form reset waits for the browser's
reset action and checks cancellation/unmount before restoring state, including
mixed state and controls linked by a reactive `form` attribute. The listener is
removed on ownership change or unmount. No backend mutation/retry is built in.
