# shadcn/ui → Solid 2 component map

**Implemented (through 2026-10-09):** Button, Badge, Card, Separator, Skeleton, Input,
Textarea, Label, Checkbox, Switch, Tabs, Popover, Alert Dialog, Combobox, Accordion, Collapsible, Tooltip, Hover Card, Radio Group, Toggle, Toggle Group, Select, Slider, Progress, Alert, Aspect Ratio, Attachment, Breadcrumb, Bubble, Button Group, Empty, Field, Input Group, Item, Kbd, Marker, Message, Native Select, Spinner, Table, Avatar, Pagination, Direction, Typography, Dialog, Sheet, Drawer, Dropdown Menu, Context Menu, Menubar, Navigation Menu, Command, Calendar, Date Picker, Input OTP, Resizable, Scroll Area, Carousel, Message Scroller, Toast, Sonner, Sidebar, Chart, Questionnaire and Data Table now have Solid 2 source, documentation and passing unit, browser and built-library tests.
See [menu catalog delivery](docs/MENU-CATALOG-DELIVERY.md), [modal catalog delivery](docs/MODAL-CATALOG-DELIVERY.md), [display catalog delivery](docs/DISPLAY-CATALOG-DELIVERY.md), [native catalog delivery](docs/NATIVE-CATALOG-DELIVERY.md), [Progress delivery](docs/PROGRESS-DELIVERY.md), [Slider delivery](docs/SLIDER-DELIVERY.md), [Select delivery](docs/SELECT-DELIVERY.md), [choice delivery](docs/CHOICES-DELIVERY.md), [preview delivery](docs/HINTS-DELIVERY.md), [disclosure delivery](docs/DISCLOSURES-DELIVERY.md), [COMBOBOX-DELIVERY.md](COMBOBOX-DELIVERY.md), [OVERLAYS-DELIVERY.md](OVERLAYS-DELIVERY.md), [TOGGLES-DELIVERY.md](TOGGLES-DELIVERY.md), [FORM-FIELDS-DELIVERY.md](FORM-FIELDS-DELIVERY.md) and the earlier
[FOUNDATION-DELIVERY.md](FOUNDATION-DELIVERY.md). These use native HTML; Toggle wraps Kobalte after its scoped acceptance;
headless-library findings below explain the adoption decisions and retained API limits.

**Full catalog acceptance (2026-10-09):** the remaining 13 families—Calendar,
Date Picker, Input OTP, Resizable, Scroll Area, Carousel, Message Scroller, Toast,
Sonner, Sidebar, Chart, Questionnaire and Data Table—complete all 65 entries.
See [final gates and limits](docs/REMAINING-CATALOG-STATUS.md). The K/C/N/E mapping
below distinguishes primitive candidates from owned compositions and engine adapters.
All rows are delivered; letters do not denote acceptance status or Kobalte adoption.

Assessed 2026-10-07 against `@kobalte/core@2.0.0-alpha.2`.

**Finding: no catalog gap currently requires corvu.** Kobalte has candidates
for all nine primitive categories in corvu's documented catalog. The five
engine/controller gaps identified in the original assessment are now
implemented using owned controllers or framework-independent engines. The original
API assessment alone did not certify runtime behavior; current delivery evidence
is linked above. Production dependencies are recorded in DECISIONS.md.

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

- The [main catalog assessed on 2026-10-07](https://ui.shadcn.com/docs/components) contains
  **64 components**. Include **Sonner** too: it remains in the
  [Radix docs](https://ui.shadcn.com/docs/components/radix/sonner) and the local
  React package. The map therefore contains **65 entries**.
- All **60** original React reference files are covered, now captured in
  `validation/reference-theme/src/components/ui/*.tsx`.
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
primitives with owned Solid logic; **N** = native markup/CSS; **E** = delivered
engine adapter or owned controller without a Kobalte equivalent. **K records
a candidate, not production adoption or drop-in compatibility.** The implementation
column and linked delivery report describe the actual shipped choice.
No row currently selects corvu; alternatives are evaluated below.

| Route | Entries |
| --- | ---: |
| Matching Kobalte primitive | 11 |
| Owned composition | 18 |
| Native markup/CSS | 31 |
| Delivered engine adapter / owned controller | 5 |
| Total | 65 |

| shadcn component | Route | Kobalte first / implementation path | Required adaptation or acceptance focus |
| --- | --- | --- | --- |
| [Accordion](https://ui.shadcn.com/docs/components/accordion) | N | `accordion` evaluated first; owned signals/native buttons | Single/multiple, heading/region semantics, disabled items, orientation/RTL, controlled selection and mount policy delivered. Alpha.2/rc.13 warns; see KOBALTE-DISCLOSURES.md and docs/DISCLOSURES-DELIVERY.md. |
| [Alert](https://ui.shadcn.com/docs/components/alert) | N | `alert` evaluated first; native semantic wrapper | Delivered title/description/action slots and destructive variant; see docs/NATIVE-CATALOG-DELIVERY.md. Use alert announcements only when appropriate. |
| [Alert Dialog](https://ui.shadcn.com/docs/components/alert-dialog) | N | `alert-dialog` evaluated first; native modal chosen | Implemented explicit cancel/action, controlled state, least-destructive focus, nesting and scroll locks. Delayed native close after reopening is guarded; see docs/ALERT-REOPEN-DELIVERY.md. Library routing remains as recorded in KOBALTE-OVERLAYS.md and OVERLAYS-DELIVERY.md. |
| [Aspect Ratio](https://ui.shadcn.com/docs/components/aspect-ratio) | N | CSS `aspect-ratio` | Ratio prop, sizing and overflow behavior; no headless state needed. |
| [Attachment](https://ui.shadcn.com/docs/components/attachment) | C | `button` + owned presentation | File preview/metadata/removal slots; uploads and transport remain host-owned. `file-field` is optional only if an upload control is added. |
| [Avatar](https://ui.shadcn.com/docs/components/avatar) | C | `image` evaluated first; owned preload lifecycle | Delivered load/error/retry/stale-event cleanup, fallback delay, badge/group parts; alpha.2 relay diagnostic retained in validation/solid2-avatar. See docs/DISPLAY-CATALOG-DELIVERY.md. |
| [Badge](https://ui.shadcn.com/docs/components/badge) | K | `badge` | Semantic variants, sizing, polymorphic link rendering. |
| [Breadcrumb](https://ui.shadcn.com/docs/components/breadcrumb) | N | `breadcrumbs` evaluated first; native semantic wrappers | Delivered ordered links, current page, separators and ellipsis; menus compose separately. See docs/NATIVE-CATALOG-DELIVERY.md. |
| [Bubble](https://ui.shadcn.com/docs/components/bubble) | N | Owned markup/CSS | Grouping, content, reaction slots and variants from the sibling. |
| [Button](https://ui.shadcn.com/docs/components/button) | K | `button` | Variants, sizes, disabled semantics, submit type and Solid polymorphism. |
| [Button Group](https://ui.shadcn.com/docs/components/button-group) | C | `button`, `separator` | Group orientation and joined borders; not automatically a toggle group. |
| [Calendar](https://ui.shadcn.com/docs/components/calendar) | K | `calendar` evaluated first; owned Gregorian calendar | Delivered single/multiple/range selection, disabled intervals, bounded keyboard/month navigation, locale and multiple months. Local Gregorian Date API; [scope and evidence](docs/DATE-CATALOG-DELIVERY.md). |
| [Card](https://ui.shadcn.com/docs/components/card) | K | `card` | Map HeaderAction to CardAction, preserve heading/content/footer classes. |
| [Carousel](https://ui.shadcn.com/docs/components/carousel) | E | No Kobalte carousel engine; Embla core adapter | Delivered owned engine lifetime, real snaps/dragging, dynamic slides, controls and orientation/direction changes. Options/plugins use Embla core types; [scope and evidence](docs/LAYOUT-CATALOG-DELIVERY.md). |
| [Chart](https://ui.shadcn.com/docs/components/chart) | E | No Kobalte chart engine; Chart.js adapter | Delivered seven chart kinds, native table alternative, themed canvas, keyboard tooltip and legend. Explicit Solid renderer API; [scope and evidence](docs/CHART-QUESTIONNAIRE-DELIVERY.md). |
| [Checkbox](https://ui.shadcn.com/docs/components/checkbox) | N | `checkbox` evaluated first; native input chosen | Implemented checked/mixed/disabled, controlled rejection, forms/reset and labels. Unpatched Kobalte emits diagnostics; see KOBALTE-TOGGLES.md and TOGGLES-DELIVERY.md. |
| [Collapsible](https://ui.shadcn.com/docs/components/collapsible) | N | `collapsible` evaluated first; owned signals/native button | Controlled/uncontrolled expansion, hidden shell and optional retained drafts delivered. Alpha.2/rc.13 warns; animated exit is unsupported. See KOBALTE-DISCLOSURES.md and docs/DISCLOSURES-DELIVERY.md. |
| [Combobox](https://ui.shadcn.com/docs/components/combobox) | C | `combobox` evaluated first; owned composition | Evaluated first; alpha.2/rc.13 reset and diagnostics fail. Owned Input/Popover composition delivers single/multiple selection, search, chips, forms and keyboard access. API limits and evidence: COMBOBOX-DELIVERY.md. No corvu Combobox primitive. |
| [Command](https://ui.shadcn.com/docs/components/command) | C | Owned command collection; Kobalte candidates evaluated | Delivered authored-order filtering, groups, active descendant and Dialog composition; see docs/MENU-CATALOG-DELIVERY.md. |
| [Context Menu](https://ui.shadcn.com/docs/components/context-menu) | C | `context-menu` | Delivered owned native behavior after Kobalte diagnostic failure; see docs/MENU-CATALOG-DELIVERY.md for acceptance and API limits. |
| [Data Table](https://ui.shadcn.com/docs/components/data-table) | E | No Kobalte table model; TanStack Table core adapter | Delivered filtering, sorting, selection, visibility, paging and loading/error recovery with owned Solid memo boundaries. Server data stays host-owned; [scope and evidence](docs/DATA-TABLE-DELIVERY.md). The [admin composition](docs/ADMIN-MENU-DELIVERY.md) also verifies form editing and isolates unrelated local state updates. |
| [Date Picker](https://ui.shadcn.com/docs/components/date-picker) | K | `date-picker` assessed; owned Calendar + Popover | Delivered formatting, bounds, selection modes, focus return and local-date form/reset behavior. No time editor; [scope and evidence](docs/DATE-CATALOG-DELIVERY.md). |
| [Dialog](https://ui.shadcn.com/docs/components/dialog) | C | `dialog` evaluated first; shared native modal | Delivered names, nested focus, canceled dismissal, controlled state and hydration; see docs/MODAL-CATALOG-DELIVERY.md. |
| [Direction](https://ui.shadcn.com/docs/components/direction) | C | `i18n` evaluated; owned explicit direction | Delivered nested reactive provider with native div boundary, Tabs keyboard direction and Popover alignment; not an external Kobalte context bridge. See docs/DISPLAY-CATALOG-DELIVERY.md. |
| [Drawer](https://ui.shadcn.com/docs/components/drawer) | C | `drawer` evaluated first; native modal and owned handle | Delivered four sides, panel-fraction/pixel snaps, keyboard and handle drag, native content scrolling. Not full Vaul physics/API; see docs/MODAL-CATALOG-DELIVERY.md. |
| [Dropdown Menu](https://ui.shadcn.com/docs/components/dropdown-menu) | C | `dropdown-menu` | Delivered owned native behavior after Kobalte diagnostic failure; see docs/MENU-CATALOG-DELIVERY.md for acceptance and API limits. |
| [Empty](https://ui.shadcn.com/docs/components/empty) | N | Owned markup/CSS | Media/title/description/content slots; actions use Button. |
| [Field](https://ui.shadcn.com/docs/components/field) | C | Control-specific Label/Description/ErrorMessage + native fieldset | Generic layout, legends, errors and IDs across all controls; do not put unrelated controls in a TextField context. |
| [Hover Card](https://ui.shadcn.com/docs/components/hover-card) | N | `hover-card` evaluated first; owned native preview | Alpha.2/rc.13 emits diagnostics. Delivered delay, pointer bridge, focus travel, native link, Escape, placement and cleanup; see KOBALTE-HINTS.md and docs/HINTS-DELIVERY.md. |
| [Input](https://ui.shadcn.com/docs/components/input) | N | Native input; `text-field` evaluated for field composition | Implemented and tested: native input, type/event/ref/reactive props, validation and form reset. See FORM-FIELDS-DELIVERY.md; TextField.Root is not required. |
| [Input Group](https://ui.shadcn.com/docs/components/input-group) | C | Input/Textarea + `button` | Addons, focus/invalid state, disabled propagation and grouped borders. |
| [Input OTP](https://ui.shadcn.com/docs/components/input-otp) | K | `otp-field` evaluated first; one native input | Delivered decorative slots/groups, editing, selection, native clipboard paste, labels/forms/reset and controlled rejection. Physical SMS/password-manager autofill is unrun; [scope and evidence](docs/DATE-CATALOG-DELIVERY.md). |
| [Item](https://ui.shadcn.com/docs/components/item) | N | Owned markup/CSS | Media/title/description/actions, links and separators; preserve chosen element semantics. |
| [Kbd](https://ui.shadcn.com/docs/components/kbd) | N | Native kbd | Key/group styling; display does not register shortcuts. |
| [Label](https://ui.shadcn.com/docs/components/label) | N | Native label; control-specific Kobalte Label when contextual | Implemented and tested: standalone `for` association, click-to-focus and native refs/events, without a provider. See FORM-FIELDS-DELIVERY.md. |
| [Marker](https://ui.shadcn.com/docs/components/marker) | N | Owned markup/CSS | Icon/content slots and variants; do not convey state by color alone. |
| [Menubar](https://ui.shadcn.com/docs/components/menubar) | C | `menubar` | Delivered owned native behavior after Kobalte diagnostic failure; see docs/MENU-CATALOG-DELIVERY.md for acceptance and API limits. |
| [Message](https://ui.shadcn.com/docs/components/message) | N | Owned markup/CSS | Role/avatar/content/action presentation; streaming transport remains outside UI. |
| [Message Scroller](https://ui.shadcn.com/docs/components/message-scroller) | E | No Kobalte scroll-follow controller; owned native scrolling | Delivered following, user interruption, streamed growth, stable-item anchor preservation and cleanup. No virtualization or transport; [scope and evidence](docs/LAYOUT-CATALOG-DELIVERY.md). |
| [Native Select](https://ui.shadcn.com/docs/components/native-select) | N | Native select/option/optgroup | Form value, keyboard/browser behavior, disabled state and styled icon. |
| [Navigation Menu](https://ui.shadcn.com/docs/components/navigation-menu) | C | `navigation-menu` | Delivered owned native behavior after Kobalte diagnostic failure; see docs/MENU-CATALOG-DELIVERY.md for acceptance and API limits. |
| [Pagination](https://ui.shadcn.com/docs/components/pagination) | N | `pagination` evaluated first; passive native links | Delivered sibling link composition, current/disabled state and native navigation; page data stays host-owned. See docs/DISPLAY-CATALOG-DELIVERY.md. |
| [Popover](https://ui.shadcn.com/docs/components/popover) | N | `popover` evaluated first; native top layer + Floating UI chosen | Implemented trigger/anchor/content, modal choice, collision placement, controlled rejection and focus restoration. See KOBALTE-OVERLAYS.md and OVERLAYS-DELIVERY.md. |
| [Progress](https://ui.shadcn.com/docs/components/progress) | N | Owned div/indicator after Kobalte hydration rejection | Implemented known/unknown values, bounds, custom text, external labels, RTL, reduced motion and SSR/hydration. [Evaluation](KOBALTE-PROGRESS.md), [delivery](docs/PROGRESS-DELIVERY.md). |
| [Questionnaire](https://ui.shadcn.com/docs/components/questionnaire) | C | Kobalte controls assessed; owned native form composition | Delivered ordered answer metadata, navigation/validation, freeform/multiple/skipped answers, reset, shortcuts and controlled drafts. No branching or transport; [scope and evidence](docs/CHART-QUESTIONNAIRE-DELIVERY.md). |
| [Radio Group](https://ui.shadcn.com/docs/components/radio-group) | N | `radio-group` evaluated first; owned native radios | Default reset and diagnostics fail on alpha.2/rc.13. Native forms, controlled rejection, required/disabled/readonly, reset ownership, arrows and SSR/hydration delivered. See KOBALTE-CHOICES.md and docs/CHOICES-DELIVERY.md. |
| [Resizable](https://ui.shadcn.com/docs/components/resizable) | K | `resizable` evaluated first; owned adjacent percentage panels | Delivered constrained drag/keyboard sizing, collapse/restore, orientation, RTL and rejection. No intersections, persisted layout or imperative React refs; [scope and evidence](docs/LAYOUT-CATALOG-DELIVERY.md). |
| [Scroll Area](https://ui.shadcn.com/docs/components/scroll-area) | E | No Kobalte custom scrollbar; native overflow and owned tracks | Delivered viewport/tracks/thumbs, both axes, pointer/keyboard control, RTL and resize observation. No Radix visibility-animation API; [scope and evidence](docs/LAYOUT-CATALOG-DELIVERY.md). |
| [Select](https://ui.shadcn.com/docs/components/select) | N | Owned native select + combobox/listbox | Delivered keyboard/typeahead, controlled state, form/reset, groups and top-layer placement. Kobalte alpha.2 passes basic interaction but emits 25 diagnostics in each tested engine; [evaluation](KOBALTE-SELECT.md), [delivery](docs/SELECT-DELIVERY.md). Explicit item data; no Radix item-aligned mode or portal API. |
| [Separator](https://ui.shadcn.com/docs/components/separator) | K | `separator` | Horizontal/vertical and decorative versus semantic separator. |
| [Sheet](https://ui.shadcn.com/docs/components/sheet) | C | `dialog` evaluated; shared native modal | Delivered four physical sides, long-content scrolling, retained drafts and hydration. Immediate closure, no delayed exit-presence claim. |
| [Sidebar](https://ui.shadcn.com/docs/components/sidebar) | C | Kobalte Dialog/Tooltip assessed; accepted native controllers | Delivered responsive preserved content, controlled desktop/mobile states, collapsed modes, shortcut, hints and focus lifecycle. Persistence stays host-owned. Desktop role overrides support embedded regions; mobile overlays retain dialog semantics ([inline docs](docs/LIVE-DOCS-DELIVERY.md)); [scope and evidence](docs/SIDEBAR-CATALOG-DELIVERY.md). |
| [Skeleton](https://ui.shadcn.com/docs/components/skeleton) | K | `skeleton` | Shape, dimensions, visibility and reduced-motion styling. |
| [Slider](https://ui.shadcn.com/docs/components/slider) | N | Owned Solid values + ARIA slider buttons/native form inputs | Single/multiple thumbs, bounds/step/gap, keyboard/pointer capture, commits, native reset and SSR/hydration. Kobalte alpha.2 emits seven diagnostics per tested engine; [evaluation](KOBALTE-SLIDER.md), [delivery](docs/SLIDER-DELIVERY.md). |
| [Spinner](https://ui.shadcn.com/docs/components/spinner) | N | SVG/icon + CSS | Reduced motion and accessible busy/status presentation. |
| [Switch](https://ui.shadcn.com/docs/components/switch) | N | `switch` evaluated first; native input chosen | Implemented checked/disabled/readonly, sizes, labels, forms/reset and RTL. Unpatched Kobalte default-on reset and diagnostics fail; see KOBALTE-TOGGLES.md and TOGGLES-DELIVERY.md. |
| [Table](https://ui.shadcn.com/docs/components/table) | N | Native table elements | Caption/header/body/footer semantics and overflow; data logic belongs to Data Table. |
| [Tabs](https://ui.shadcn.com/docs/components/tabs) | N | `tabs` evaluated first; owned signal/native button composition | Implemented automatic/manual activation, RTL/orientation, disabled tabs, controlled selection and panel mounting. See KOBALTE-OVERLAYS.md and OVERLAYS-DELIVERY.md. |
| [Textarea](https://ui.shadcn.com/docs/components/textarea) | N | Native textarea; `text-field` evaluated for field composition | Implemented and tested: native multiline editing, controlled drafts, reset, sizing and label association without context. See FORM-FIELDS-DELIVERY.md. |
| [Toast](https://ui.shadcn.com/docs/components/toast) | K | `toast` evaluated first; owned DOM and timers | Delivered region, actions, dismissal, duration/pause, announcements and four-axis swipe threshold. No drag animation; [scope and evidence](docs/NOTIFICATION-CATALOG-DELIVERY.md). |
| [Toggle](https://ui.shadcn.com/docs/components/toggle) | K | `toggle-button` adopted with public-API adapter | Quiet activation/SSR on alpha.2/rc.13. Adapter preserves canceled clicks and canonical pressed state; variants, keyboard, refs and hydration verified. See KOBALTE-CHOICES.md and docs/CHOICES-DELIVERY.md. |
| [Toggle Group](https://ui.shadcn.com/docs/components/toggle-group) | N | `toggle-group` evaluated first; owned native buttons | Alpha.2/rc.13 emits diagnostics. Single/multiple selection, roving focus, DOM order, orientation/RTL, disabled state and shared styling delivered. See KOBALTE-CHOICES.md and docs/CHOICES-DELIVERY.md. |
| [Tooltip](https://ui.shadcn.com/docs/components/tooltip) | N | `tooltip` evaluated first; owned native preview | Alpha.2/rc.13 emits diagnostics. Delivered provider delay/skip window, hover/focus, Escape, description IDs and collision placement; see KOBALTE-HINTS.md and docs/HINTS-DELIVERY.md. |
| [Typography](https://ui.shadcn.com/docs/components/typography) | N | Semantic elements + classes | Heading/list/prose/code styles, hierarchy, long content and theme tokens. |
| [Sonner](https://ui.shadcn.com/docs/components/radix/sonner) | C | `toast` assessed; owned immutable notification service | Delivered Toaster, promise tickets, IDs, variants, FIFO queue and update/dismiss callbacks. One viewport per store; [scope and evidence](docs/NOTIFICATION-CATALOG-DELIVERY.md). |

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

## Implementation outcomes and remaining verification

All 65 planned families are implemented. The five original engine/controller gaps
are closed within the documented contracts:

- Carousel uses Embla 8.6.0; Scroll Area and Message Scroller use owned native
  scrolling/controllers. [Layout delivery](docs/LAYOUT-CATALOG-DELIVERY.md).
- Data Table uses TanStack Table core 8.21.3 with owned Solid memo boundaries.
  [Data Table delivery](docs/DATA-TABLE-DELIVERY.md).
- Chart uses Chart.js 4.5.1 with an accessible table alternative.
  [Chart and Questionnaire delivery](docs/CHART-QUESTIONNAIRE-DELIVERY.md).

Direction, Command, Questionnaire, Sidebar, notifications and date controls also
have delivered implementations and linked tests in the table above. Their public
contracts are described in the [component guide](docs/components.md). A matching
family/export name does not establish every React, Radix, Vaul or Base UI prop.
The React ref-object `useComboboxAnchor` hook is intentionally omitted; the owned
Combobox positions its input/trigger internally, as documented in the guide.

The [catalog inventory regression](tests/unit/catalog-inventory.test.ts) checks
all 65 dated map entries against source modules and root value exports, and checks
sibling value export names with that explicit ref-hook exception. It complements
behavior tests; it cannot establish compatible props, physical device behavior or
upstream additions after the dated inventory.

Remaining work is verification beyond these delivered contracts: manual assistive
technology and physical IME/touch/autofill, broader variant/composition coverage,
consumer bundle measurements and real admin/router/query integration. Keep those
limits visible in the [acceptance matrix](docs/TEST-MATRIX.md); they are not five
unimplemented engine components. See [final gates](docs/REMAINING-CATALOG-STATUS.md)
and [completion audit](docs/CATALOG-COMPLETION-AUDIT.md).

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
