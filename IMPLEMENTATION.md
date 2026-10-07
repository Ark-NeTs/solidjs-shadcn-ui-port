# Solid 2 implementation progress

## Current increment

Foundation and five components committed as `b82f86c`; the owner then authorized
Input, Textarea and Label on 2026-10-07. No bucket number or admin
migration slot is invented. This package-level plan tracks the bounded work;
application scheduling remains in the repository roadmap.

## Built — what shipped, and what the build did that the plan didn't say

- **Owned native components:** Button, Badge, all seven Card exports, Separator,
  Skeleton, Input, Textarea, Label and `cn` now exist under the React-style subpaths. **REASONING:** this
  batch's behavior is provided by native elements; importing experimental overlay
  patches would add an unrelated acceptance dependency. Kobalte remains first
  for richer primitives. Verified against the source and dependency manifest.
- **Explicit link support:** Button accepts button/a and Badge span/a.
  **REASONING:** native links cover this batch's navigation needs while avoiding
  an untested arbitrary-component polymorphism contract. Router-owned links can
  use the exported class helpers. Disabled links are tested for both navigation
  prevention and handler suppression.
- **Contrast correction:** destructive text uses a derived emphasis color.
  **REASONING:** the reference light-mode text/background pair failed axe contrast;
  exact visual copying would preserve that defect. Byte-identical canonical token
  blocks and all other variant classes are guarded by tests.
- **Solid 2-specific tooling:** JSX types use @solidjs/web; async fallback tests
  use Loading. **REASONING:** the current migration guide and rc.13 APIs supersede
  the historical spec's Solid 1-style JSX/Suspense examples. Source browser tests,
  built-library browser journeys and server rendering cover different consumers.
- **Independent package lock and install:** tests run with isolated dependencies.
  **REASONING:** this increment must not repin the monorepo's other frameworks or
  applications. A frozen package-local installation is documented and verified.

## Remaining catalog work

Eight components are implemented, not the complete Tier 1 or catalog.
`useIsMobile` and the remaining form controls are subsequent work. The existing COMPONENT-MAP.md remains
the full inventory. Full admin-import parity, router/query interoperability,
headless controls and application integration are not claimed complete.
