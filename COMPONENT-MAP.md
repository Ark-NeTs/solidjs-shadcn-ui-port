# shadcn/ui → Solid 2 component map

**Implemented (2026-10-08):** Button, Badge, Card, Separator, Skeleton, Input,
Textarea, Label, Checkbox, Switch, Tabs, Popover, Alert Dialog, Combobox, Accordion, Collapsible, Tooltip, Hover Card, Radio Group, Toggle and Toggle Group now have Solid 2 source, documentation and passing unit, browser and built-library tests.
See [choice delivery](docs/CHOICES-DELIVERY.md), [preview delivery](docs/HINTS-DELIVERY.md), [disclosure delivery](docs/DISCLOSURES-DELIVERY.md), [COMBOBOX-DELIVERY.md](COMBOBOX-DELIVERY.md), [OVERLAYS-DELIVERY.md](OVERLAYS-DELIVERY.md), [TOGGLES-DELIVERY.md](TOGGLES-DELIVERY.md), [FORM-FIELDS-DELIVERY.md](FORM-FIELDS-DELIVERY.md) and the earlier
[FOUNDATION-DELIVERY.md](FOUNDATION-DELIVERY.md). These use native HTML; Toggle wraps Kobalte after its scoped acceptance;
headless-library findings below remain relevant to later primitives.

Assessed 2026-10-07 against `@kobalte/core@2.0.0-alpha.2`.

**Finding: no catalog gap currently requires corvu.** Kobalte has candidates
for all nine primitive categories in corvu's documented catalog. Several
shadcn components still need substantial implementation work that neither
library supplies. This is a source/API assessment, not runtime certification,
complete API parity, or a delivery claim. This initial mapping added no dependencies; the implemented Popover now uses
Floating UI, as recorded in DECISIONS.md.

**Browser follow-up:** [BROWSER-VALIDATION.md](BROWSER-VALIDATION.md) preserves
unpatched results. [KOBALTE-LIFECYCLE.md](KOBALTE-LIFECYCLE.md) records the tested
harness patch: Drawer Escape and observed ownerless effects are fixed in both
browsers. [KOBALTE-PRESENCE.md](KOBALTE-PRESENCE.md) subsequently removes
Drawer/DialogRoot feedback and relay diagnostics. [KOBALTE-DIALOG-IDS.md](KOBALTE-DIALOG-IDS.md)
then fixes plain Dialog untracked ID reads and verifies live ID/ARIA updates.
[KOBALTE-OTP.md](KOBALTE-OTP.md) subsequently fixes tested OTP diagnostics and
label/form wiring. Explicit Direction and other primitive diagnostics remain
unresolved, including an observed Drawer timing warning. Dependencies and
patches are isolated from production;
Kobalte remains the first candidate, with no corvu fallback selected.

Per-component behavioral acceptance and remaining test gaps are tracked in the
[acceptance matrix](docs/TEST-MATRIX.md). Catalog mappings alone do not close those gaps.

## Scope and evidence

- The [current main catalog](https://ui.shadcn.com/docs/components) contains
  **64 components**. Include **Sonner** too: it remains in the
  [Radix docs](https://ui.shadcn.com/docs/components/radix/sonner) and the local
  React package. The map therefore contains **65 entries**.
- All **60** files in `../shadcn-theme/src/components/ui/*.tsx` are covered.
  The five additional entries are Data Table, Date Picker, Questionnaire,
  Toast, and Typography. Keep these in scope even though the React sibling
  has no corresponding standalone file yet.
- Use the sibling's `radix-nova` classes, tokens, filenames, and export names
  as the existing visual/API baseline per [specs.md](specs.md). Generic docs
  URLs now often redirect to Base UI; that is not authorization to replace
  this baseline or adopt every Base UI API. In particular, the
  [Radix Drawer](https://ui.shadcn.com/docs/components/radix/drawer) still uses
  Vaul while the default Drawer docs describe Base UI.
- Kobalte evidence is the exact published package's `dist/*/index.d.ts`, its
  referenced `dist/index/*.d.ts`, and export map, inspected from the existing
  scratch install documented in [COMPATIBILITY.md](COMPATIBILITY.md).
  Reproducible public sources: [package manifest](https://unpkg.com/@kobalte/core@2.0.0-alpha.2/package.json)
  and [declarations](https://unpkg.com/@kobalte/core@2.0.0-alpha.2/dist/).
  Below, each backticked Kobalte subpath expands to `@kobalte/core/<subpath>`.
  Do not infer alpha coverage from the older stable documentation sidebar.
- Corvu evidence: its [nine documented primitives](https://corvu.dev/docs/),
  plus the installed `@corvu-next/drawer@0.1.5` and
  `@corvu-next/resizable@0.1.5` declarations. Original corvu and the Solid 2
  fork are distinct compatibility candidates; see COMPATIBILITY.md.

This enumerates component families, including new message components. It is
not an inventory of every demo, block, chart preset, third-party registry,
or every historical release. Those examples become per-component acceptance
cases. Legacy React Hook Form integration is not an extra current catalog
component; Solid form integration belongs with Field and the form recipes.

## Full mapping

Routes: **K** = a matching Kobalte primitive exists; **C** = compose existing
primitives with owned Solid logic; **N** = native markup/CSS; **G** = unresolved
behavior or engine gap. Every route still needs implementation, theme styling,
documentation, screenshots, and applicable tests. **K does not mean drop-in.**
No row currently selects corvu; alternatives are evaluated below.

| Route | Entries |
| --- | ---: |
| Matching Kobalte primitive | 24 |
| Owned composition | 9 |
| Native markup/CSS | 25 |
| Unresolved behavior/engine gap | 7 |
| Total | 65 |

| shadcn component | Route | Kobalte first / implementation path | Required adaptation or acceptance focus |
| --- | --- | --- | --- |
| [Accordion](https://ui.shadcn.com/docs/components/accordion) | N | `accordion` evaluated first; owned signals/native buttons | Single/multiple, heading/region semantics, disabled items, orientation/RTL, controlled selection and mount policy delivered. Alpha.2/rc.13 warns; see KOBALTE-DISCLOSURES.md and docs/DISCLOSURES-DELIVERY.md. |
| [Alert](https://ui.shadcn.com/docs/components/alert) | K | `alert` | Title/description/icon slots; use alert announcements only when appropriate. |
| [Alert Dialog](https://ui.shadcn.com/docs/components/alert-dialog) | N | `alert-dialog` evaluated first; native modal chosen | Implemented explicit cancel/action, controlled state, least-destructive focus, nesting and scroll locks. Delayed native close after reopening is guarded; see docs/ALERT-REOPEN-DELIVERY.md. Library routing remains as recorded in KOBALTE-OVERLAYS.md and OVERLAYS-DELIVERY.md. |
| [Aspect Ratio](https://ui.shadcn.com/docs/components/aspect-ratio) | N | CSS `aspect-ratio` | Ratio prop, sizing and overflow behavior; no headless state needed. |
| [Attachment](https://ui.shadcn.com/docs/components/attachment) | C | `button` + owned presentation | File preview/metadata/removal slots; uploads and transport remain host-owned. `file-field` is optional only if an upload control is added. |
| [Avatar](https://ui.shadcn.com/docs/components/avatar) | K | `image` | Image/fallback timing, failures, alt text; add group/badge presentation parts. |
| [Badge](https://ui.shadcn.com/docs/components/badge) | K | `badge` | Semantic variants, sizing, polymorphic link rendering. |
| [Breadcrumb](https://ui.shadcn.com/docs/components/breadcrumb) | K | `breadcrumbs` | Ordered links, current page, separators and ellipsis; menus compose separately. |
| [Bubble](https://ui.shadcn.com/docs/components/bubble) | N | Owned markup/CSS | Grouping, content, reaction slots and variants from the sibling. |
| [Button](https://ui.shadcn.com/docs/components/button) | K | `button` | Variants, sizes, disabled semantics, submit type and Solid polymorphism. |
| [Button Group](https://ui.shadcn.com/docs/components/button-group) | C | `button`, `separator` | Group orientation and joined borders; not automatically a toggle group. |
| [Calendar](https://ui.shadcn.com/docs/components/calendar) | K | `calendar` | Single/multiple/range modes, disabled dates, multiple months, locale and Date adapter. |
| [Card](https://ui.shadcn.com/docs/components/card) | K | `card` | Map HeaderAction to CardAction, preserve heading/content/footer classes. |
| [Carousel](https://ui.shadcn.com/docs/components/carousel) | G | `button` only supplies controls | No carousel engine. Evaluate Embla core with an owned Solid lifecycle adapter; drag, loop, resize, plugins and keyboard behavior need tests. |
| [Chart](https://ui.shadcn.com/docs/components/chart) | G | No chart engine | Select a Solid 2-compatible or framework-neutral renderer; recreate chart config, tooltip, legend and theme contracts. Recharts is React-specific. |
| [Checkbox](https://ui.shadcn.com/docs/components/checkbox) | N | `checkbox` evaluated first; native input chosen | Implemented checked/mixed/disabled, controlled rejection, forms/reset and labels. Unpatched Kobalte emits diagnostics; see KOBALTE-TOGGLES.md and TOGGLES-DELIVERY.md. |
| [Collapsible](https://ui.shadcn.com/docs/components/collapsible) | N | `collapsible` evaluated first; owned signals/native button | Controlled/uncontrolled expansion, hidden shell and optional retained drafts delivered. Alpha.2/rc.13 warns; animated exit is unsupported. See KOBALTE-DISCLOSURES.md and docs/DISCLOSURES-DELIVERY.md. |
| [Combobox](https://ui.shadcn.com/docs/components/combobox) | C | `combobox` evaluated first; owned composition | Evaluated first; alpha.2/rc.13 reset and diagnostics fail. Owned Input/Popover composition delivers single/multiple selection, search, chips, forms and keyboard access. API limits and evidence: COMBOBOX-DELIVERY.md. No corvu Combobox primitive. |
| [Command](https://ui.shadcn.com/docs/components/command) | G | `search` / `combobox`, `listbox`, `dialog` candidates | No cmdk equivalent. Own item registration, ranking/filtering, grouped visibility, inline palette and action dispatch; prove focus semantics before selecting composition. |
| [Context Menu](https://ui.shadcn.com/docs/components/context-menu) | K | `context-menu` | Pointer/keyboard opening, submenus, checkbox/radio items and dismissal. |
| [Data Table](https://ui.shadcn.com/docs/components/data-table) | G | `checkbox`, `dropdown-menu`, `pagination` for controls | No table model. Evaluate TanStack Table core/compatible adapter for sort, filter, selection and paging; server data stays host-owned. |
| [Date Picker](https://ui.shadcn.com/docs/components/date-picker) | K | `date-picker` (or `calendar` + `popover`) | Trigger/value formatting, range/multiple modes, bounds and Date adapter; time examples compose `time-field` where needed. |
| [Dialog](https://ui.shadcn.com/docs/components/dialog) | K | `dialog` | Modal/nonmodal, portal, accessible naming, nested layers, Escape and focus restoration. |
| [Direction](https://ui.shadcn.com/docs/components/direction) | G | `i18n` supplies locale-derived direction | Explicit `dir` provider parity is missing from I18nProvider's public props. Resolve locale-independent and nested direction before claiming RTL parity. |
| [Drawer](https://ui.shadcn.com/docs/components/drawer) | K | `drawer` | Gestures, snap points and four sides exist. Adapt direction→side, state attributes, scroll interactions and Vaul-facing props. |
| [Dropdown Menu](https://ui.shadcn.com/docs/components/dropdown-menu) | K | `dropdown-menu` | Submenus, typeahead, groups, checkbox/radio items, disabled items and close behavior. |
| [Empty](https://ui.shadcn.com/docs/components/empty) | N | Owned markup/CSS | Media/title/description/content slots; actions use Button. |
| [Field](https://ui.shadcn.com/docs/components/field) | C | Control-specific Label/Description/ErrorMessage + native fieldset | Generic layout, legends, errors and IDs across all controls; do not put unrelated controls in a TextField context. |
| [Hover Card](https://ui.shadcn.com/docs/components/hover-card) | N | `hover-card` evaluated first; owned native preview | Alpha.2/rc.13 emits diagnostics. Delivered delay, pointer bridge, focus travel, native link, Escape, placement and cleanup; see KOBALTE-HINTS.md and docs/HINTS-DELIVERY.md. |
| [Input](https://ui.shadcn.com/docs/components/input) | N | Native input; `text-field` evaluated for field composition | Implemented and tested: native input, type/event/ref/reactive props, validation and form reset. See FORM-FIELDS-DELIVERY.md; TextField.Root is not required. |
| [Input Group](https://ui.shadcn.com/docs/components/input-group) | C | Input/Textarea + `button` | Addons, focus/invalid state, disabled propagation and grouped borders. |
| [Input OTP](https://ui.shadcn.com/docs/components/input-otp) | K | `otp-field` | Harness patch passes tested editing, label/ARIA, native form and reset contracts; see KOBALTE-OTP.md. Build slots/groups/separators; native paste/autofill/password managers remain unverified. |
| [Item](https://ui.shadcn.com/docs/components/item) | N | Owned markup/CSS | Media/title/description/actions, links and separators; preserve chosen element semantics. |
| [Kbd](https://ui.shadcn.com/docs/components/kbd) | N | Native kbd | Key/group styling; display does not register shortcuts. |
| [Label](https://ui.shadcn.com/docs/components/label) | N | Native label; control-specific Kobalte Label when contextual | Implemented and tested: standalone `for` association, click-to-focus and native refs/events, without a provider. See FORM-FIELDS-DELIVERY.md. |
| [Marker](https://ui.shadcn.com/docs/components/marker) | N | Owned markup/CSS | Icon/content slots and variants; do not convey state by color alone. |
| [Menubar](https://ui.shadcn.com/docs/components/menubar) | K | `menubar` | Cross-menu arrow navigation, submenus, item selection and focus retention. |
| [Message](https://ui.shadcn.com/docs/components/message) | N | Owned markup/CSS | Role/avatar/content/action presentation; streaming transport remains outside UI. |
| [Message Scroller](https://ui.shadcn.com/docs/components/message-scroller) | G | No scroll-follow controller | Own stick-to-bottom, user-scroll interruption, streamed growth, anchor preservation and cleanup; React helper cannot be imported into Solid. |
| [Native Select](https://ui.shadcn.com/docs/components/native-select) | N | Native select/option/optgroup | Form value, keyboard/browser behavior, disabled state and styled icon. |
| [Navigation Menu](https://ui.shadcn.com/docs/components/navigation-menu) | K | `navigation-menu` | Links, trigger/content/viewport composition, pointer/focus transitions and RTL. |
| [Pagination](https://ui.shadcn.com/docs/components/pagination) | K | `pagination` | Map generated state to link-shaped parts; preserve href/current-page semantics and host-controlled paging. |
| [Popover](https://ui.shadcn.com/docs/components/popover) | N | `popover` evaluated first; native top layer + Floating UI chosen | Implemented trigger/anchor/content, modal choice, collision placement, controlled rejection and focus restoration. See KOBALTE-OVERLAYS.md and OVERLAYS-DELIVERY.md. |
| [Progress](https://ui.shadcn.com/docs/components/progress) | K | `progress` | Determinate/indeterminate values, accessible text and themed indicator. |
| [Questionnaire](https://ui.shadcn.com/docs/components/questionnaire) | C | `radio-group`, `checkbox`, `text-field`, `button`, `progress`; evaluate `steps` | Own ordered answers/navigation/validation, freeform and skipped answers, reset/resume, shortcuts and controlled state. No ready-made questionnaire exists. |
| [Radio Group](https://ui.shadcn.com/docs/components/radio-group) | N | `radio-group` evaluated first; owned native radios | Default reset and diagnostics fail on alpha.2/rc.13. Native forms, controlled rejection, required/disabled/readonly, reset ownership, arrows and SSR/hydration delivered. See KOBALTE-CHOICES.md and docs/CHOICES-DELIVERY.md. |
| [Resizable](https://ui.shadcn.com/docs/components/resizable) | K | `resizable` | Drag/keyboard sizing, intersections and collapse exist; adapt units, public refs and persisted layouts. |
| [Scroll Area](https://ui.shadcn.com/docs/components/scroll-area) | G | No custom scrollbar primitive | Need viewport/track/thumb/corner behavior, both axes, dragging, RTL and resize observation. Native overflow alone is not full parity. |
| [Select](https://ui.shadcn.com/docs/components/select) | K | `select` | Trigger/value/options, groups, portal, keyboard/typeahead and native form integration. |
| [Separator](https://ui.shadcn.com/docs/components/separator) | K | `separator` | Horizontal/vertical and decorative versus semantic separator. |
| [Sheet](https://ui.shadcn.com/docs/components/sheet) | C | `dialog` | Side-panel layout and transitions; Drawer is not necessary for a nongestural sheet. |
| [Sidebar](https://ui.shadcn.com/docs/components/sidebar) | C | Sheet/`dialog`, `collapsible`, `tooltip`, `button` | Own responsive and controlled/collapsed state, shortcut and persistence boundary. |
| [Skeleton](https://ui.shadcn.com/docs/components/skeleton) | K | `skeleton` | Shape, dimensions, visibility and reduced-motion styling. |
| [Slider](https://ui.shadcn.com/docs/components/slider) | K | `slider` | Single/multiple thumbs, bounds/step, orientation/RTL and keyboard changes. |
| [Spinner](https://ui.shadcn.com/docs/components/spinner) | N | SVG/icon + CSS | Reduced motion and accessible busy/status presentation. |
| [Switch](https://ui.shadcn.com/docs/components/switch) | N | `switch` evaluated first; native input chosen | Implemented checked/disabled/readonly, sizes, labels, forms/reset and RTL. Unpatched Kobalte default-on reset and diagnostics fail; see KOBALTE-TOGGLES.md and TOGGLES-DELIVERY.md. |
| [Table](https://ui.shadcn.com/docs/components/table) | N | Native table elements | Caption/header/body/footer semantics and overflow; data logic belongs to Data Table. |
| [Tabs](https://ui.shadcn.com/docs/components/tabs) | N | `tabs` evaluated first; owned signal/native button composition | Implemented automatic/manual activation, RTL/orientation, disabled tabs, controlled selection and panel mounting. See KOBALTE-OVERLAYS.md and OVERLAYS-DELIVERY.md. |
| [Textarea](https://ui.shadcn.com/docs/components/textarea) | N | Native textarea; `text-field` evaluated for field composition | Implemented and tested: native multiline editing, controlled drafts, reset, sizing and label association without context. See FORM-FIELDS-DELIVERY.md. |
| [Toast](https://ui.shadcn.com/docs/components/toast) | K | `toast` | Region/queue, dismiss/actions, duration/pause, announcements, swipe and positioning. |
| [Toggle](https://ui.shadcn.com/docs/components/toggle) | K | `toggle-button` adopted with public-API adapter | Quiet activation/SSR on alpha.2/rc.13. Adapter preserves canceled clicks and canonical pressed state; variants, keyboard, refs and hydration verified. See KOBALTE-CHOICES.md and docs/CHOICES-DELIVERY.md. |
| [Toggle Group](https://ui.shadcn.com/docs/components/toggle-group) | N | `toggle-group` evaluated first; owned native buttons | Alpha.2/rc.13 emits diagnostics. Single/multiple selection, roving focus, DOM order, orientation/RTL, disabled state and shared styling delivered. See KOBALTE-CHOICES.md and docs/CHOICES-DELIVERY.md. |
| [Tooltip](https://ui.shadcn.com/docs/components/tooltip) | N | `tooltip` evaluated first; owned native preview | Alpha.2/rc.13 emits diagnostics. Delivered provider delay/skip window, hover/focus, Escape, description IDs and collision placement; see KOBALTE-HINTS.md and docs/HINTS-DELIVERY.md. |
| [Typography](https://ui.shadcn.com/docs/components/typography) | N | Semantic elements + classes | Heading/list/prose/code styles, hierarchy, long content and theme tokens. |
| [Sonner](https://ui.shadcn.com/docs/components/radix/sonner) | C | `toast` + owned imperative facade | Preserve Toaster/notification use cases, promise updates, IDs, variants and stacking; no claim of automatic Sonner API equivalence. |

## What corvu can actually fill

| corvu primitive | Kobalte candidate | Current decision |
| --- | --- | --- |
| Accordion | `accordion` | Overlap; no fallback justified. |
| Calendar | `calendar` | Overlap including single/multiple/range declarations; test required behavior first. |
| Dialog | `dialog` | Overlap; prefer one overlay stack. |
| Disclosure | `collapsible` | Same primitive category under a different name. |
| Drawer | `drawer` | Gestures and snaps already declared; compare failures only after browser probes. |
| OTP Field | `otp-field` | Overlap; slot presentation remains wrapper work. |
| Popover | `popover` | Overlap; no fallback justified. |
| Resizable | `resizable` | Keyboard, pointer and collapse already declared. |
| Tooltip | `tooltip` | Overlap; no fallback justified. |

Neither catalog supplies Carousel, Chart, Command, Data Table, Direction,
Message Scroller, Scroll Area, or a ready-made Questionnaire. Adding corvu
does not close those gaps. Corvu utilities are not equivalent to complete
implementations of those components.

### Drawer and Resizable: evidence beyond the export names

- [Kobalte Drawer declarations](https://unpkg.com/@kobalte/core@2.0.0-alpha.2/dist/index/B6JUzNAO.d.ts)
  include `side`, `snapPoints`, `breakPoints`, controlled `activeSnapPoint`,
  velocity/damping functions, `allowSkippingSnapPoints`, and
  `handleScrollableElements`. The declarations credit corvu's drawer math.
  This establishes API presence, not reliable touch behavior or Vaul parity.
- [Kobalte Resizable declarations](https://unpkg.com/@kobalte/core@2.0.0-alpha.2/dist/resizable/index.d.ts)
  include controlled `sizes`, keyboard delta, min/max, collapsible panels,
  imperative resize/collapse/expand and intersecting handles. Sizes use
  fractions or pixel strings; do not forward the React wrapper's values
  without checking units. Persistence needs an adapter through size callbacks.
- The fork exposes additional details, e.g. Drawer context includes a
  `resizing` transition state absent from Kobalte's declared union. That API
  difference alone is not a required shadcn feature or reason to add a library.

Only open a fallback decision when a named acceptance case fails or a required
capability cannot be implemented through the selected Kobalte public API.
Record the reproducer, the exact missing behavior, the compatible corvu package
and version that addresses it, its test evidence, incremental bundle cost, and
cross-library focus/scroll-lock/cleanup results. Existing fork linker success
does not satisfy that decision. Original Solid 1 corvu is not an approved
fallback for this Solid 2 package.

## Implementation gaps and next checks

1. **Direction:** the published `I18nProviderProps` only offers `locale` and
   `children`; `useLocale` supplies direction inferred from locale. A DOM `dir`
   attribute alone cannot be assumed to change internal keyboard/placement
   behavior. Test explicit RTL with an LTR locale and nested overrides; choose
   a supported bridge or upstream change if necessary. Corvu has no replacement
   direction provider in its documented catalog.
2. **Command:** Kobalte Search describes itself as a combobox with external
   filtering. It is a useful building block, not cmdk. Specify item registration,
   ranking, groups, disabled/empty behavior, inline versus dialog rendering and
   action activation before committing to that composition.
3. **Carousel / Data Table / Chart:** these need engines, not another overlay
   library. Investigate framework-neutral cores or explicitly Solid 2-compatible
   adapters. [Embla's module approach](https://www.embla-carousel.com/docs/get-started)
   and [TanStack Table's core/adapters](https://tanstack.com/table/latest/docs/installation)
   are candidates to investigate, not verified Solid 2 dependencies.
   The sibling's React imports cannot be reused. Engine/version
   selection, bundle measurement and runtime checks remain open; no new library
   has been selected by this map.
4. **Scroll Area / Message Scroller:** treat custom scrollbars and following
   message growth as separate behaviors. Verify pointer/keyboard scrolling,
   resize observers, user interruption, anchor stability and unmount cleanup.
   The [Message Scroller behavior reference](https://ui.shadcn.com/docs/react/message-scroller)
   is React-specific and needs a Solid implementation.
5. **Questionnaire / Sidebar / Sonner:** own the composition and its state
   contracts. Test transitions, controlled updates and disposal, not just render
   output. These are larger tasks than adding styled containers.
6. **Calendar / Date Picker:** Kobalte declares single, multiple and range
   selection. In this exact alpha, `DateValue` aliases native JavaScript `Date`,
   with Gregorian-only math and no explicit per-value timezone. Define public
   date/time semantics, unavailable dates, month navigation and localization
   explicitly. The earlier internationalized-date-object assessment was incorrect.
7. **All interactive wrappers:** preserve public names/classes while translating
   props, refs, contexts, event semantics and `data-*` state hooks. A simple
   library import replacement cannot preserve all Radix/Vaul contracts.

Run the existing Gate 0 runtime/tooling checks first, then prioritize Drawer,
Resizable, Calendar/Date Picker, Input OTP and Direction behavior probes. For
every row, attach unit, browser integration, E2E, accessibility and visual
evidence plus documented examples/screenshots before marking it delivered.
Use browser tests for gestures, layout, focus, portals and cleanup; unit tests
alone cannot certify these. Keep tests for async rejection and stale responses
at the component/host boundary wherever applicable.

## Historical delivery report for the initial mapping

This change only records research and implementation routing. State ownership,
failure recovery, async consistency, cleanup, accessibility, theming and
performance criteria in DELIVERY.md are future implementation acceptance
requirements, not passed checks. No UI or runtime code changed. Desktop IPC,
backend mutations and Electron packaging do not apply to this mapping.

Package `check`, `lint`, `test`, `test:integration`, `test:server` and `test:e2e`
were not run: this package still has no package.json or implementation. No
new runtime, accessibility, screenshot or bundle-size claims are made. The
earlier linker results and their peer-version limitations remain recorded in
COMPATIBILITY.md. This map applies the existing owner decision; it does not
adopt a fallback library or supersede the pending architecture decision.

Verification commands ran from this package unless stated otherwise. The
Python audit and downloaded catalog snapshot remain in `/private/tmp`; these
are temporary research artifacts, not package tests. The audit compared the
live index's normalized component URLs plus Sonner with all map rows, checked
the sibling's filenames, checked 42 referenced Kobalte declaration/JS entry
files, and resolved local Markdown links. It did not mount components or
verify every prop, example, or remote link.

| Command / check | Outcome | Time |
| --- | --- | ---: |
| `python3 -` — urllib fetch of the public catalog and URL extraction | 64 unique component slugs; initial sandbox DNS attempt failed, network-enabled retry passed | 0.835 s |
| `python3 /private/tmp/audit-solid-component-map.py` — inventory/API-file/link audit | 65 unique rows; all 60 local components covered; 42 entry files present | 0.002 s |
| `git diff --check` | Passed for tracked edits | 0.031 s |
| `git diff --no-index --check /dev/null COMPONENT-MAP.md` | No whitespace diagnostics; exit 1 denotes the new-file difference | 0.013 s |
