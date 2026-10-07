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
