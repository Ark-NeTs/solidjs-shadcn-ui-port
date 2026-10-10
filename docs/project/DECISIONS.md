# Solid 2 foundation decisions

## 2026-10-07 — begin the first implementation batch

Owner instruction: “implement that foundation and first five components instead
of starting another diagnostic investigation.” This authorizes the limited
Solid 2 implementation described by D90 in [project origins](../ORIGINS.md) and
supersedes this package's older requirement to finish broad Gate 0 before any
component code. The public package boundary remains in force.

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

## 2026-10-08 — Tabs, Popover and Alert Dialog

Owner instruction: “Continue with Tabs, Popover, Alert Dialog.” Checkbox/Switch
were committed as bb04c79. The owner subsequently authorized commit and push
through a codex branch and requested a local main merge. Direct pushes to main
remain prohibited by the working agreement.

Evaluate Kobalte first, retain the isolated unpatched failures in
KOBALTE-OVERLAYS.md, and implement the requested components without importing
the cumulative experimental patches. No missing catalog capability requires a
corvu dependency. This is not blanket rejection of either library for later work.

Tabs owns uncontrolled selection and derives roving focus, selection and IDs
from live registrations; controlled values remain authoritative. The native
button list supports disabled entries, RTL, orientation and manual activation.
Inactive panel children unmount by default; forceMount preserves them under a
hidden panel. Bound the tab list with scrolling for narrow/enlarged layouts;
line lists reserve space for the indicator inside the scroll viewport.

Use HTML popover for nonmodal top-layer rendering and HTML dialog showModal for
modality and background inertness. Add modal Tab wrapping because Chromium may
otherwise move focus to browser chrome. Shared lifecycle code restores focus,
uses Cancel as the alert's least-destructive target, balances scroll locks and
removes listeners on cleanup. Native toggle/close notifications request an
owner update; any rejected close reopens only after the native event completes
and only while the original effect is still alive. Avoid reopening during
beforetoggle, which produced browser warnings and a Firefox InvalidStateError.

Top-layer content stays in its original DOM/theme ancestry. AlertDialogPortal is
a compatibility composition wrapper, not a document.body portal. Content owns
the default overlay. This intentionally differs from Radix internals; document
native node/ref types and unsupported APIs rather than promising full API parity.
No exit-presence delay is implemented. Modern native popover/dialog support is
required; the accepted engines are Chromium and Firefox from the pinned tooling.

Use framework-neutral @floating-ui/dom 1.8.0 for fixed placement, flip, shift and
available-size constraints. Observe only while open; dispose observers and guard
both coordinate and size writes against stale completions. The built ESM includes
Floating UI; source consumers resolve the pinned dependency. There are no network
requests or application services. Async confirmation belongs to the owner, which
prevents default closure, disables duplicate submission, preserves drafts on
failure, and closes explicitly after success.

## 2026-10-08 — Combobox

Implement the next component, Combobox, with Kobalte evaluated first. The
unpatched alpha.2 probe on rc.13 records working search/selection, an empty input
following reset, and 21 diagnostics in each browser (KOBALTE-COMBOBOX.md).
Corvu's existing catalog has no Combobox primitive; add neither library nor the
experimental patches. Compose the owned Input/Popover with Solid 2 state.

Keep canonical selection, editable query, active option and open state distinct.
Controlled null is authoritative. Use explicit labels and unique serialization
keys for object options. The native select bridge handles form association,
repeated values and validation; reset restoration runs after the native reset
operation and is canceled on unmount. Browser testing exposed that a microtask
can run before the browser finishes its reset default action, so a cancelable
next-task restoration is necessary even when jsdom's synthetic reset passes.

Reuse the Popover top layer, theme ancestry, placement and controlled dismissal.
Floating UI now tracks the anchor's geometry with animationFrame enabled and
ancestorScroll disabled while open. REASONING: Firefox emitted its scroll-linked
positioning warning during real Combobox navigation; changing coordinate writes
to translations did not resolve it. Geometry tracking passes both engines
without suppressing diagnostics and retains resize/position updates and disposal.
It checks anchor geometry each frame while open; no speed or battery-use claim.

Preserve the admin's seven imported Combobox names and render callback pattern.
Document the public subset, multiple/chips, form/search contracts, native node
semantics and unsupported Base UI APIs explicitly. This is the fourteenth
component; neither the whole catalog nor an admin framework migration is done.
The latest working agreement requires a codex branch for commit/push, superseding
the earlier direct-main exception for this task.

## Combobox navigation follow-up — 2026-10-08 (D19/D90)

Browser acceptance exposed underscrolling during the popup scale animation,
wide list insertion dependencies and Firefox focus restoration after Tab. Keep
geometry changes local to Combobox: convert rectangle deltas into unscaled
scrollTop units. Cache filtered/enabled/active derivations and give rendered rows
layout-neutral presentation wrappers under For so their template reads belong to
individual insertion scopes; the collection helper uses the same contract.

Let native Tab navigation finish before closing in the next task. Suppress
restoration for that dismissal only; cancel queued closure on disposal or a newer
request. Popup Shift+Tab returns to the trigger, following native DOM order.
No focusable-element enumeration, forced clicks, diagnostic filters or library
pin changes are introduced. See [CMB-2 delivery](../COMBOBOX-CMB2-DELIVERY.md).

## Popover placement follow-up — 2026-10-08 (D19/D90)

Keep Floating UI's position updates immediate: PopoverContent now defaults to
`transition-none` while retaining `duration-100` for its opening keyframe animation.
REASONING: the duration utility sets transition-duration too. With the default
transition-property of all, each left/top update restarted a CSS transition;
real-browser sampling measured roughly 17–21px lag behind a moving anchor.
Do not hide the defect by disabling motion in the test or widening its tolerance.
The regression samples intermediate frames, then requires subpixel attachment
at rest. No placement engine, observer lifecycle or public prop API changes.
See [POP-1 delivery](../POPOVER-POP1-DELIVERY.md).

## Alert Dialog focus follow-up — 2026-10-08 (D19/D90)

Restrict initial-focus candidates in the shared native-layer helper to controls
whose nearest dialog/alertdialog is the layer being opened. Apply the same owner
rule to the fallback content lookup. REASONING: a force-mounted child remains in
the parent's DOM while closed; an unrestricted Cancel query found that hidden
child button before the parent's own Cancel, so the parent's Cancel did not
receive initial focus in either browser. Preserve Cancel priority, consumer cancellation
hooks, native modality, Tab handling and scroll-lock cleanup. No new library,
observer or delayed focus task is needed. See
[ALT-1 delivery](../ALERT-ALT1-DELIVERY.md).

## Tabs lifecycle follow-up — 2026-10-08 (D19/D90)

Observe child-list changes within each mounted TabsList after its DOM ref has
committed. Track the most recent document focus destination. If reconciliation
removed the list's focused node and focus has fallen to body, restore the settled
roving tab, or the list when no enabled tab remains. REASONING: removing a trigger
loses browser focus; keyed nonadjacent moves can also detach/reinsert a node
without disposing its component, so trigger cleanup alone is insufficient.
Do not restore during unrelated mutations or after a newer focus destination.
Dispose the observer and document listener with the list's effect.

Default TabsList to tabindex=-1 while honoring explicit caller overrides.
REASONING: Firefox exposed the overflow container as an additional Tab stop,
before the intended roving trigger. Preserve existing registration-based fallback
selection and manual activation; no collection state or draft mirror is added.
Force-mounted panels already preserve their draft nodes; lazy panels already
dispose children. See [TAB-1 delivery](../TABS-TAB1-DELIVERY.md).

## Toggle reset cancellation after native event propagation (2026-10-08)

CHK-1/SWT-1 browser checks exposed a shared reset scheduling bug: a reset-button
activation runs the helper's microtask before a later ancestor listener cancels
the event. Both Checkbox and Switch changed state and called onCheckedChange for
a canceled reset; mixed Checkbox state was also reset prematurely.

Use a zero-delay task for reset synchronization, tracking pending timers in the
form-association effect. Remove the listener and clear every pending timer on
reassociation or unmount. REASONING: a microtask is not an end-of-propagation
boundary for browser-generated events. Cancellation must be checked after all
native listeners and the reset default action. No API, theme or headless-library
choice changes. [Delivery evidence](../TOGGLES-FORMS-DELIVERY.md) covers source
and built exports in Chromium and Firefox.

## Refresh stale native label collections on reassociation (2026-10-08)

Firefox 155's cached control.labels lists can disagree with label.control after a
reactive for change. Native probing confirms a transient comment child invalidates
those collections; attribute rewrites do not. Preserve the label/content DOM and
caller focus by adding/removing only that marker when either the old target still
contains the label or the new target omits it. Check actual collection state,
not a browser version or user-agent string; healthy collections require no mutation.

REASONING: child-list invalidation fixes native computed names without moving
caller-owned content, remounting refs, or overriding accessible names through ARIA.
A DOM effect observes the static ref and reactive for prop after the DOM commit;
it retains only the previous target and is disposed with the component. No timer,
observer, global registry or external-DOM mutation monitoring is added. SSR remains
native markup. Consumers observing label child-list mutations can see the temporary
comment insertion/removal. [Delivery](../LABEL-REFRESH-DELIVERY.md) records the
probe, repeated focus/selection/identity tests and restored both-engine assertions.

## WebKit coverage and newest-modal focus containment (2026-10-08)

Run source integration and built journeys in Chromium, Firefox and WebKit.
On macOS launch the bundled WebKit through a small wrapper that supplies
AppleKeyboardUIMode=2 as process arguments. Preserve Playwright's transport,
headless/headed and profile arguments; leave system/Safari settings untouched.
Link tests use native Option-Tab, and pointer tests retain native button focus
behavior rather than adding tabindex or focus handlers to production controls.

WebKit 26.6 allowed a programmatic focus attempt into the parent of a nested
modal. Add a document-scoped modal-owner stack and focusin guard: only the most
recently opened modal remembers/reclaims focus. Restore the last connected,
enabled target, or the modal itself when that target has gone away. Guard
reentrancy and remove the listener/stack entry before native close and trigger
restoration. No user-agent branch enters component code.

REASONING: native showModal still owns top-layer display, inertness and dismissal;
the guard supplies the tested focus-containment contract where native behavior
falls short. Existing exact nested-focus tests now run in three engines; a unit
regression verifies target removal and disposal. [Delivery](../WEBKIT-DELIVERY.md)
records scope, native probes and remaining browser/device gaps.

## Hydration registration and DOM ownership (2026-10-08)

The hydration harness compiles public source exports for matched SSR and client
hydration, retaining the existing CSR distribution. Compound registration uses
render-local metadata on the server and owned boxed signal values in the browser;
metadata writes must not invoke server signal setters. Allocate the signal on both
sides to preserve hydration ordering. Box accessor values rather than using a
function initializer, which Solid 2 interprets as a derived source.

Registry insertion/removal uses functional updates. Do not replace these with
`set([...untrack(read), entry])`: rc.13 keeps hydration snapshot scope during
`untrack`, whereas the functional setter receives the current pending value.
The reduced two-tab/one-input reproduction demonstrates that the read/write pattern
replaces six SSR descendants and loses a pre-hydration draft without any package
components. Functional updates preserve them in the plain and package cases.
This fixes the remaining failure introduced by the local SSR metadata adaptation;
it is not evidence that ordinary Solid hydration or Kobalte Tabs is broken.

DOM effects wait for their refs because hydration can commit an initial effect
first. Input maps its server default to a native value attribute while preserving
client semantics. [Hydration evidence](../HYDRATION-DELIVERY.md) records exact
node identity, interactions, diagnostic checks and scope limits. No runtime patch,
dependency upgrade or diagnostic suppression is needed.

## Pending Loading hydration acceptance (2026-10-08)

For Solid 2.0.0-rc.13 synchronous SSR, distinguish the exact hydration claim from
its queued pending-boundary handoff. The runtime serializes an unresolved Loading
boundary as `$$f`; hydration first claims its server fallback, then recreates the
client boundary. Native placeholders and Skeleton exhibit the same four-node
fallback replacement. Require all nodes to survive the synchronous claim and all
nodes outside the fallback to survive the subsequent handoff. Keep persistent
editable drafts outside that fallback in the acceptance fixture.

REASONING: treating the fallback's documented-in-source runtime handoff as a
Skeleton defect would encourage unnecessary component workarounds. Real promise
resolution, late completion and disposal assertions remain strict, with no runtime
patch or diagnostics suppression. [Evidence](../LOADING-HYDRATION-DELIVERY.md)
is specific to pending renderToString output and client-owned completion; it does
not establish streaming or ready-at-SSR boundary support.


## Owned Accordion and Collapsible (2026-10-08)

Under D19/D90, evaluate Kobalte first, then keep these two wrappers native and
signal-owned: unpatched alpha.2 opens/closes in Chromium and Firefox but emits
Solid 2 rc.13 untracked-read, feedback and relay diagnostics.
[Kobalte evidence](../validation/KOBALTE-DISCLOSURES.md) records every message. No missing
capability justifies corvu; neither library is added to production.

REASONING: these disclosures need selection, button activation and hidden content,
without a portal, geometry effect or external listener. A shared disclosure helper
owns IDs and mounting; Accordion adds selection and DOM-order keyboard navigation.
Explicit trigger/content IDs belong to the root/item, so SSR knows both IDs before
rendering either part. Sibling-time registration produced an incorrect controls
link in the server regression and is not used here.

Keep content shells mounted and hidden while closed; unmount children unless
forceMount is requested. Natural height replaces animated height/exit presence.
These API differences are documented in the [component guide](../components.md).


## Tooltip and Hover Card lifetime (2026-10-08)

Keep Kobalte first: alpha.2 on Solid 2 rc.13 passes isolated pointer opening,
Escape, focus opening and explicit outside-focus dismissal in Chromium/Firefox,
but produces two Tooltip and five Hover Card warnings in each engine. The
[unpatched probe](../validation/KOBALTE-HINTS.md) therefore fails the strict diagnostic gate.
Both capabilities exist, so no corvu catalog fallback is introduced.

REASONING: one owned hint controller shares delay cancellation, owner state,
hover/focus engagement and disposal. Native manual popovers preserve DOM/theme
ancestry and avoid autofocus; Floating UI supplies fixed collision-aware placement.
Escape is consumed by the top preview so a containing modal remains open. Keyboard
focus events can run synchronously inside a parent modal's effect; their controller
work uses an explicit untrack event boundary. Descendant focus travel uses native
focusin/focusout, rather than non-bubbling focus/blur on the content shell.

Root-owned contentId is known before SSR, like the disclosure ID contract. Closed
shells stay hidden and retain children only with forceMount. Pointer travel uses
a rectangular bridge; provider delay windows are local to that provider. Geometry
writes reject stale async results and preserve caller CSS size constraints.

Shared rendering now contains utility classes in src/lib, so theme.css explicitly
scans that directory as well as components. Screenshots caught the previously
missing compiled preview colors and widths; real-browser assertions now cover them.
This increment intentionally omits the React tooltip arrow, transform-origin CSS
variables, portal-container APIs, asChild and exit animation; the guide records
these scope limits. No runtime dependency, patch or diagnostic suppression is added.


## Radio and pressed-button choices (2026-10-08)

Evaluate Kobalte first. Radio Group fails native default reset and emits 14
warnings in each tested engine; Toggle Group emits five. Own these two
implementations, but adopt the quiet standalone Toggle through its public
per-component entry. REASONING: the library priority applies per primitive;
rejection of other components does not justify replacing a usable Toggle.
Its canceled-click defect is contained by supplying canonical controlled state
and declining the library change request after a canceled caller event. No
library patch or diagnostic filter is used. See [evaluation](../validation/KOBALTE-CHOICES.md).

Native radios provide the actual label/focus/form/validity targets. One root
owns selection and one reset subscription. REASONING: native radio activation
may uncheck a sibling before a controlled owner accepts, so restore the entire
group after the request. Reset waits for bubbling cancellation, and queued work
is canceled on reassociation/disposal. Bind from the requested form ID or
nearest enclosing form: Firefox can expose the old input.form association
while the form attribute is being removed. Use an unmatched nonempty form ID
to detach without Firefox's native empty-form-attribute warning.

Share DOM-order navigation between radios and Toggle Group, keeping focus apart
from selection. Radio arrows activate; grouped toggle arrows only focus.
Root state remains canonical when an item disappears or becomes disabled.
Toggle Group uses pressed buttons for both modes; it is not a radio form control.
Its joined borders use logical start/end edges for RTL. Long groups can scroll
inside their available width. No data layer, toolbar mode, asChild, library
patch, focus restoration after focused-node removal or runtime selection-type
switching is promised by this increment. [Guide](../components.md#radio-group-toggle-and-toggle-group).

Focus callbacks explicitly leave the caller's reactive scope before inspecting
item metadata. REASONING: a parent effect may focus a native item synchronously;
those event reads must not become untracked effect reads in Solid 2.

Two existing regressions blocked this batch's required checks. Forced Alert Dialog
content checks forceMount before open state, avoiding useless subscriptions while
always mounted. Combobox re-reveals its active option when ResizeObserver reports
list shrinkage after floating placement, and disposes that observer with the
active-item effect. REASONING: the original one-shot scroll could leave the last
option below the resized viewport. No warning suppression or test relaxation.

## Select with explicit option data (2026-10-08)

Evaluate Kobalte alpha.2 first on rc.13. Basic browser interaction/form checks
pass, but 25 diagnostics per tested engine expose internal untracked reads,
feedback and relay tearing. Keep the accepted Toggle dependency, but implement
Select as owned state/native HTML with Floating UI. REASONING: do not ship
library-internal diagnostic failures or carry experimental patches into production.
See [probe evidence](../validation/KOBALTE-SELECT.md).

Select takes explicit `{value,label,disabled}` items at its root. REASONING:
closed server markup, the displayed label and native successful option must agree
before child registration, and remain available when the popup is closed. Compound
exports mirror the sibling; required data and placement-only alignment are documented
API differences. Value and open callbacks request independent owner acceptance.
A visually hidden native select provides FormData/required validity; invalid events
focus the visible named trigger. Reset honors cancellation and requested form ownership.

The manual native popover stays in its theme ancestry while entering the top layer.
Focus stays on the combobox trigger with aria-activedescendant. Explicit tabindex=-1
on the scrolling viewport prevents browsers from adding an extra Tab stop; deferred
Tab dismissal lets native focus navigation finish, and reopening/disposal cancels it.
REASONING: traces showed Firefox/Chromium entering the scroll viewport, then losing
focus when it hid. Outside dismissal preserves its new destination. An option render
function on SelectContent creates layout-neutral row owners; REASONING: returning
40 components directly from a consumer For widened one parent insertion to 41 reads.
Separators are decorative because listboxes permit option/group children, not separators.

## Owned Slider state and gesture boundaries (2026-10-08)

Evaluate unpatched Kobalte alpha.2 first on the shared rc.13 runtime. The two-engine
range probe emits seven internal diagnostics per engine and fails settled arrow,
End and drag updates. REASONING: implement the requested component without adopting
those lifecycle failures or a private library patch. Toggle remains on its accepted
Kobalte path; no corvu or new dependency is added. See [evaluation](../validation/KOBALTE-SLIDER.md).

Use an explicit numeric array with stable index-based thumb owners, normalized on
a min/step grid and constrained by neighbor gaps. REASONING: values, visible fill,
ARIA bounds and submitted inputs must derive from the same state without correction
effects. Invalid/nonfinite configuration, unsafe step grids and impossible gaps fail
explicitly. Native hidden inputs submit one repeated name per thumb; reset requests
initial values only after bubbling cancellation and follows reactive form ownership.
Hidden values use a typed reactive spread to serialize strings through the DOM binding.

Pointer capture owns one drag, track clicks choose the closest thumb and direct
thumb drags preserve their index. Commit callbacks report accepted values after
Solid's batch, once at release/key completion. Cancellation keeps the latest live
value without a completion callback; configuration changes and disposal release
capture. A memoized thumb count isolates that cleanup from ordinary value changes.
Teardown reads the current DOM registration as an explicit untracked snapshot;
focusout observes bubbling focus transitions and leaves any caller-owned reactive scope.
REASONING: native blur does not bubble to the root, and ordinary value updates must
not cancel their own active drag.

Use logical inline positioning and native computed direction for inherited RTL;
vertical values grow bottom-to-top unless inverted. The thumb surface uses semantic
background instead of the sibling's hard-coded white so custom/dark themes inherit.
Explicit thumb labels take precedence over the root's shared labelledby reference.
REASONING: the minimum and maximum must remain distinguishable to assistive tools.

## Owned Progress after Kobalte integration evaluation (2026-10-08)

Evaluate unpatched Kobalte alpha.2 on the shared Solid rc.13 runtime first. Its
Chromium/Firefox probe updates values, bounds, fill and known/unknown states without
diagnostics, but drops external aria-labelledby. A supported rendering adapter
restores the external name and passes source-browser checks. It fails hydration
at the indicator; both a static Fill renderer and an owned indicator under Kobalte
Root still produce mismatched hydration keys. The exact upstream-versus-adapter
cause remains unresolved. REASONING: two adapter repair attempts do not establish
hydration acceptance, so deliver the small owned display component with the same strict
hydration assertions instead of adding a private dependency patch or key workaround.
Preserve the failed reports in [the evaluation](../validation/KOBALTE-PROGRESS.md).

Normalize the public wrapper to zero-based value/max semantics: absent/null,
nonfinite or out-of-range values mean unknown work; nonpositive/nonfinite max
falls back to 100. Never write corrected values back to the owner. Default value
text is a deterministic rounded percent so SSR and hydration agree; callers can
provide localized getValueLabel text or explicit aria-valuetext. REASONING: a
progress bar cannot invent completion or honestly report an invalid percentage.

Port the sibling's thin semantic track, but use bounded width with logical flow
rather than a fixed 0–100 translateX calculation. REASONING: custom totals and RTL
must agree with announced values. Unknown work uses a centered 40% segment with
opacity pulse, reduced to a static segment for reduced motion. There is no timer,
fetch, form value or automatic live-region announcement; the application owns
operation status, retries, busy regions and completion messages.

## 2026-10-09 — native catalog compositions

Implement the sixteen native/presentation families under the owner's remaining-
catalog request. Kobalte Alert and Breadcrumbs are source-evaluated first;
use explicit native semantics matching the sibling composition API, without
claiming an upstream incompatibility. Field is a native mixed-control composition,
not a TextField provider. Existing Button/Input/Textarea/Label/Separator accept an
explicit `data-slot` so compound wrappers retain their styling contract.

Use Solid native `as` unions with element-specific ref/event types for applicable
presentation parts. Native buttons default to `type=button`. The host owns upload
transport, validation, shortcuts and message state. Keep canonical tokens intact;
use the existing destructive-emphasis token and foreground keyboard text for
contrast. Logical alert-action placement and bounded example grids address RTL
and enlarged text. [Delivery and limits](../NATIVE-CATALOG-DELIVERY.md).

## 2026-10-09 — display/navigation compositions

Evaluate Kobalte Image first and preserve its unpatched status-relay diagnostic.
Use an owned preload lifecycle with stale-event guards for Avatar. Match the
sibling's passive Pagination links rather than introduce a generated page engine.
Direction owns an explicit reactive context and native div boundary, independent
of locale; `display: contents` does not establish inline layout direction.
Typography provides semantic recipes without a Markdown parser or a claim to
upstream Typeset's complete CSS API. No new dependency or shared-token changes.
[Acceptance and limits](../DISPLAY-CATALOG-DELIVERY.md).

## 2026-10-09 — Dialog, Sheet and Drawer

Reuse the accepted native layer lifecycle after the pinned Kobalte Dialog/Drawer
probes and isolated diagnostic repairs. Kobalte has the required APIs; the choice
is about acceptance at alpha.2/rc.13, not missing exports. Share modal state, live
IDs, focus return and native top-layer rendering; retain DOM theme ancestry.
Drawer owns bounded snap selection and handle-only dragging so scrollable content
keeps native gestures. Numeric snaps refer to panel size; pixel snaps are explicit.
No Vaul momentum/background scaling or delayed exit-presence claim. A plain
accessor for the shell popover mode avoids the observed nested-getter hydration
memo mismatch. [Delivery](../MODAL-CATALOG-DELIVERY.md).

Full modal regression exposed two existing wasted-recomputation diagnostics.
Tabs now places an equality boundary at each panel's active value, after trigger
registration; a root memo would snapshot incomplete SSR metadata. Slider iterates
count-derived stable thumb indices while each thumb reads its current value.
Both changes keep registration and input values reactive without repeated
collection/visibility work. They are included because they blocked acceptance,
not as unrelated feature work; no diagnostic suppression is used.

## Owned menu and command collections after pinned Kobalte evaluation

The unpatched alpha.2/rc.13 menu probes report ownership/relay diagnostics in all
four menu primitives. Share a native popover menu owner for Dropdown, Context and
Menubar; keep site navigation and command listbox semantics separate. Preserve
DOM theme ancestry and cancel stale positioning work. Navigation supplies a shared
viewport by default; Command filters explicit values/keywords in authored order.
These are scoped APIs, not a claim of Radix/cmdk prop compatibility. No corvu,
private Kobalte patches or diagnostic suppression. See the menu delivery report.

## Gregorian date selection and a single native OTP input

Retain the pinned Kobalte Calendar/OTP evaluations as upstream compatibility
evidence. Avoid adopting the earlier distribution patches. Calendar owns local
Gregorian day arithmetic, bounded focus and host-controlled selection; Date
Picker composes it with the accepted native Popover. OTP uses one real input so
native paste, selection, labels, form association and autocomplete remain browser
responsibilities. Decorative slots do not introduce extra assistive input stops.
Deferred completion/dismissal checks owner acceptance and disposal. Non-Gregorian
calendars, time editing and external autofill integrations are explicit limits.

## Layout engines remain behind the Solid package boundary

Keep Kobalte first: its pinned Resizable evaluation still requires distribution
patches and leaves an unstable memo diagnostic. Own adjacent percentage panel
sizing instead. Kobalte has no custom scrollbar, carousel or message-following
engine. Scroll Area uses native overflow with measured tracks; Message Scroller
preserves a visible item while history grows and suspends following for user
scrolling. Carousel adapts framework-independent Embla 8.6.0, matching the sibling
engine generation without importing its React adapter. Engines, observers and
pointer capture have component-owned lifetimes; no diagnostic suppression.

## Owned notification records after the Kobalte Toast probe

The unchanged alpha.2 Toast primitive works behaviorally but reports store-write
and untracked-read diagnostics. Keep that evaluation evidence and implement a
small owner-neutral notification store plus native Toast composition. No global
Solid root, framework adapter, distribution patch or diagnostic suppression is
introduced. Promise tickets invalidate on replacement/dismissal; server calls do
not retain request data. Each viewport owns its subscription and visible timers.
Explicit stores support application lifetime boundaries; global service records
remain until dismissed. No application transport or persistence enters the package.

## Responsive Sidebar preserves its inner DOM owner

Compose the accepted native modal and hint controllers for Sidebar, since Kobalte
has no distinct Sidebar primitive and its underlying probes remain diagnostic
failures. Change only the outer aside/dialog shell at a breakpoint; own the inner
navigation subtree at the stable Sidebar scope. This preserves drafts without
invalid dialog landmark roles or duplicate mobile/desktop trees. Keep desktop
and mobile state separate; persistent preferences remain an application concern.

## Framework-neutral charts and native questionnaires

Kobalte and corvu have no chart engine or complete questionnaire. Use Chart.js
4.5.1 behind owned Solid Chart/legend/tooltip parts with a native table alternative;
keep the sibling export names while explicitly documenting the different renderer
API. CSS variables drive DOM colors directly; the canvas engine reads computed
colors in its owned synchronization effect. This avoids copying derived DOM color
state through an effect. Synchronous registration metadata preserves SSR legends.

Questionnaire uses explicit ordered item definitions, root draft values, native
fieldset/radio/checkbox/text controls and validated native FormData submission.
Applications own pending, retry and persistence. Reset completes after cancellation
has bubbled but before another user event; deferred timers caused a reproduced
lost-edit race. No transport or diagnostic suppression is introduced.

## Solid-owned boundaries around TanStack Table core

TanStack Table core 8.21.3 supplies framework-neutral models; each model, state
slice and option has a Solid memo boundary. Core caching alone did not isolate
reactive consumers and caused broad-subscription/unstable-memo diagnostics.
Shallow-equal immutable state slices and a dedicated page-selection derivation
remove those diagnostics. Header/row derivations are established before JSX so
server and client allocate matching hydration scopes. Each row owns its native
`<tr>` bindings so the table body does not collect per-row subscriptions through
an additional wrapper component. Native controlled filter
and page-size rejection restores canonical DOM properties after reconciliation.
Existing Solid/compiler pins remain rc.13; only explicit engines and their
required lock entries were added. See the Data Table delivery report.

## Native focus events in composed Select and Dialog — 2026-10-09

Native dialog opening/closing may synchronously dispatch `focusin` while a Solid
effect is running. Select's outside-focus dismissal reads controlled/uncontrolled
state as an event-time snapshot through `untrack`; it must not become a read in
the enclosing dialog effect. The restaurant menu composition reproduced this
with strict diagnostics enabled. No warning suppression or diagnostic threshold
change is used. Its editor resolves focus by stable row ID after reconciliation
because immutable table data can replace the original cell button. Application
service and draft state remain in the playground, behind an injected local API.
See [admin menu delivery](../ADMIN-MENU-DELIVERY.md).

The same composition acceptance run exposed a remaining shared uncontrolled-state
source in Data Table: each field memo woke on unrelated selection/pagination
changes, even when its equality check discarded the result. Local state now uses
one signal per field with the existing shallow equality policy. Controlled state
remains authoritative, and partial resets retain initial defaults. The regression
counts visibility getter reads while unrelated state changes, instead of relying
only on timing budgets to detect wasted work.


## Documentation delivery and consumer cost — 2026-10-09

The browser documentation is generated from the existing Markdown using Bun's
build-time parser, with raw HTML disabled and asset links restricted to maintained
package files. No Markdown runtime dependency enters the library. Documentation
and the legacy playground have separate HTML entry points; existing preview URLs
and their acceptance fixtures remain stable.

Chart.js registration moves from module import (`chart.js/auto`) to the first
mounted chart. A Button-only built consumer previously retained the eager engine
registration. The measured before/after bundles and mount-only unit regression
justify the change; component semantics and canvas disposal are unchanged.

The router/query compatibility probe lives in an isolated temporary install with
a committed manifest/lock. Router next.36 and Query rc.5 declare compatible rc.13
peers; newer Router tags require rc.14 and are not silently forced onto rc.13.
Applications continue owning cache/routing; neither dependency enters this package.
See [completion evidence](../PROJECT-COMPLETION.md).


## Scrollable menu tab stops — 2026-10-09

Menu items keep a single native tab stop on the focused, enabled action. Giving
every item a negative tab index worked for programmatic arrow focus but left a
scroll-constrained menu without a tab stop. Native focus/blur events update the
item's local focus state and preserve caller handlers. This keeps native Tab
departure and avoids introducing a separate container stop. A fixed-height browser
regression verifies overflow, keyboard scrolling, axe and departure in all engines.


## Controlled values gate unchanged owner updates — 2026-10-09

The shared controlled-state helper memoizes its effective value. A caller deriving
`open` from an edited draft previously forwarded every draft write through a plain
accessor into modal scopes, even while `open` stayed true. The equality boundary
keeps controlled ownership and rejected requests intact while avoiding downstream
work on unrelated owner changes. A subscriber-count regression covers unrelated
edits, rejected controlled requests and the transition to local state.


## Package license — 2026-10-09

The owner selected MIT for shadcn-solidjs-theme and supplied ArkNeT as the
copyright holder. The package-local LICENSE records that notice and the manifest
declares the MIT SPDX identifier. This applies to this package, not the entire
monorepo. Registry publication and website deployment remain separate actions;
`private: true` stays in place until a release is requested.
See [license delivery](../LICENSE-DELIVERY.md).


## Public documentation artifact — 2026-10-09

Public deployment has a separate curated build. Only getting started, component
contracts, public verification notes, screenshots and the license enter its docs
payload; internal instructions, raw diagnostics and delivery reports remain local.
The public root serves documentation and `/playground` serves existing examples.
Local development and existing browser acceptance retain their original URLs.
The public artifact also preserves notices for the production dependency graph
and font license. Missing notices fail the build; version-specific upstream
fallbacks are checked in for Solid and Embla.

Cloudflare Workers Static Assets is the recommended host for this static site,
following Cloudflare's current new-project guidance. No Worker request handler,
server-side Solid runtime, Cloudflare Vite plugin or hosted CI change is needed.
Wrangler is pinned in an isolated tooling manifest/lock and used locally to verify
provider routing, headers and 404 behavior. The site is prepared for publication;
selecting an account/domain and actually publishing remain separate actions.


## Documentation hostname — 2026-10-10

The public documentation hostname is `solidjs-shadcn-ui.westark.net`, a subdomain
of the owner's active `westark.net` Cloudflare zone, matching the repository name.
It is declared in `wrangler.jsonc` as a custom-domain route so every deploy keeps
the DNS record and certificate in sync with versioned configuration; `workers.dev`
stays enabled for pre-domain checks. Publishing still requires connecting the
repository in Cloudflare. See [deployment](../DEPLOYMENT.md).


## Live components inside documentation — 2026-10-09

Each component guide mounts a focused real example before its reference content.
The example registry is imported only on component pages; selecting a guide
instantiates one example owner. Theme controls preserve example state, while Reset
replaces its owner and disposes listeners, overlays and notification subscriptions.
Loading and module failure are explicit; failure keeps the reference content
available and offers a page reload. No arbitrary code evaluation or remote service
is added. Public subpath imports retain source/built verification boundaries.

Existing accepted primitives are reused; no additional headless library is needed.
The Sidebar's existing native `role` prop now applies to desktop rendering so an
embedded preview can be a named region. Mobile overlays always retain dialog
semantics. The default complementary landmark is unchanged.

## Live theme generator — 2026-10-09

The documentation entry supports `?create` locally and in the public static build.
A neutral customization shell surrounds a separately themed Solid component canvas.
The layout follows the shadcn/ui create reference, while reusing this package's
accepted components and token contract. No additional headless library is required.
Base color, accent, chart colors, heading/body font stacks, radius and density are
allowlisted settings. One pure function produces the preview variables and both
exported `:root` and `.dark` blocks; canonical defaults come from `src/theme.css`.
Font stacks use bundled Inter or system fonts, without network font downloads.

Settings update the URL using replaceState; form drafts remain local to mounted
examples. Shuffle honors per-setting locks; reset changes theme settings rather
than replacing the example owners. The native Dialog export contains only Theme
Tokens, selectable CSS and Copy Theme. It preserves semantic ancestry, restores
the opening button's focus and ignores clipboard completion after closing or
unmounting. New/existing-project flows, framework/library selection and code
scaffolding are intentionally absent from this theme-only tool.

## Reference-ordered theme canvas — 2026-10-09

The theme generator now follows the 37-card `preview-02` composition observed on
https://ui.shadcn.com/create: seven fixed columns, with columns three and four
forming a nested center group. The preview scrolls in both directions inside its
own focusable region. Narrow screens retain the reference ordering rather than
reflowing cards into a different gallery. Shared card/field/chart helpers and
three composition modules reuse accepted public Solid components.

Demo actions are local. Cover images use revocable object URLs, reject unsupported
files without discarding the previous preview, and never upload to a service.
Monetary summaries derive from editable amounts; informational rows keep stable
identity during updates. The connection pattern is explicitly illustrative.
The existing Theme-only export and token mapping remain unchanged.

## Standalone repository — 2026-10-09

The owner requested moving the entire Solid project into
`~/GitHub/solidjs-shadcn-ui-port`, initializing Git there first. Preserve scoped
project history, source, docs, deployment tools and validation evidence. Retain
the public package name and exports. Configuration and active dependency installs
are local to this repository. Capture external React-theme and admin import
contracts as dated fixtures so verification does not require the former monorepo.
Historical reports retain their original context. See [migration delivery](../REPOSITORY-MIGRATION.md).

## Documentation folders — 2026-10-09

The owner requested organizing root Markdown documents into appropriate folders.
README and agent instructions remain at the root. Project plans/specifications,
checklists, primitive evaluations and delivery reports use separate directories
under `docs`. Local website discovery is recursive; public-page publication stays
allowlisted. All maintained links follow the moved files.

## Standalone documentation boundaries — 2026-10-09

The owner requested checking for unrelated documentation carried over from the
former parent project. Active specs, implementation status and acceptance guidance
now describe only this Solid library. Former application framework, desktop,
roadmap and workspace requirements do not apply. Origin notes retain only the
design-system rationale and captured test-contract provenance. Dated validation
and delivery evidence remains historical, with its original command context.

Public packaging must match the exact generated component/guide page inventory,
including files absent from navigation. Reject extra documentation JSON pages
rather than treating every filename under the page directory as approved. See
[documentation boundary audit](../PARENT-DOCUMENTATION-AUDIT.md) for scope and evidence.

## GitHub Actions CI — 2026-10-09

The owner authorized a CI workflow for unit, browser and documentation checks
with short retention for screenshots and failure traces. Use frozen installs
and immutable action release pins. Standard Ubuntu runners execute static/unit
and public-site checks; standard macOS 15 arm64 runners match the reviewed visual
platform for three-engine source, built, hydration and consumer acceptance.
Maintain one worker, strict diagnostics and no retries. Preserve suite outputs
separately, upload diagnostics only on failure, and expire artifacts after three
days. Read-only workflow permissions and local provider tests require no secrets
or deployment actions. See [CI guide](../CI.md) and [delivery](../delivery/CI-DELIVERY.md).

Hosted VM acceptance uses the Vite plugin’s documented `performanceTracks.attribution.hotTime` setting at 32ms per one-second window only when `CI=true`. Two hosted source runs showed 8–15ms timing findings moving between unrelated scopes; keep local development at 8ms and all console diagnostics fatal. This changes the timing threshold, not ownership, feedback, read-tracking or other diagnostic checks. Accessibility checks must await finite visual transitions before evaluating final-state contrast.

Run each engine/suite combination in an isolated job. This allows source, built, hydration and consumer acceptance to report independently even when another suite fails, with one worker per runner and no shared server port. Artifact names include engine, suite and attempt.

The first complete matrix reached its 15-minute WebKit source limit with 258 passes and 52 unrun tests, without an assertion failure. Split source integration into two isolated shards per engine; allow each source shard 20 minutes within a 25-minute job. Keep built/hydration suite limits at 15 minutes and consumer at two minutes. Include the shard in failure artifact names.

## Admin editor open boundary — 2026-10-10

Hosted WebKit source shard 1 failed on PR #4 (run 38059719460) with
`WASTED_RECOMPUTE`: `createControllable.current` re-ran 5 times and 4 runs
returned the same value, discarding 2.0ms of compute. The cause was structural
rather than runner noise. The admin example passed `open={!!menu.draft()}`, so
every field edit reran the Dialog's controlled equality gate. Locally, the
default 2ms budget did not trip in 20 WebKit repeats. A temporary 0ms
`wastedRecompute` probe failed 3 of 3 runs on the same memo, with
`createAdminMenu.draft` named as the cause.

The 0ms probe also flagged the editor's Select and Checkbox, for the same reason:
each control read the whole draft object. A per-field memo would only move the
discarded runs. The admin model now keeps the open state in a separate `editing`
signal and the fields in a store. Each control tracks only its own property; reset
and reopen write only fields that changed. `draft()` still returns `MenuDraft | null`.
After the change, all admin cases pass in three engines at the 0ms probe budget.
`createControllable` and the controlled/uncontrolled contracts are unchanged.
No diagnostic or CI threshold changes; the `hotTime` CI adjustment above remains
the only timing exception. The component guide recommends this pattern to consumers.

## Chart list equality boundaries — 2026-10-10

PR #7 hosted run 38065582147 failed Firefox/Linux source shard 1 in the Chart
replacement case with `WASTED_RECOMPUTE` on the tooltip's `<For>`: 6 of 6 runs
discarded 2.0ms. The figure is not a shared signature with the earlier Dialog
case, because 2ms is the default budget. Every finding reports a value just past it.
A temporary 0ms `wastedRecompute` probe failed this case 3 of 3 times in each local
engine, flagging both `<For>` lists, the tooltip `<Show>` condition and the legend
label effects. One local WebKit run reached the 2.0ms default budget. The repair is
structural; it does not change the CI threshold.

Chart kind changes rebuilt `colors`, then `legend` and `tooltip`, with identical
content. `circular` is now a memo. `colors` uses the same list equality as `keys` and `labels`.
`legend` and `tooltip` compare entries field by field. The tooltip condition
reads a dedicated `visible` memo, which reads the chart kind only when a series is
hidden. Real changes, such as the category legend, colors for circular kinds,
hidden slices and active-row values, still propagate.

Local wasted-time readings were whole milliseconds even for trivial memos
(for example 1.0ms for four length checks in Firefox). That suggests coarse
browser timer resolution can quantize small amounts of work up to the 2ms budget.
The repair therefore removes structural reruns rather than relying on per-run cost.
The CI `hotTime` calibration remains the only timing exception.

## Wasted-recompute probe, Tabs and Combobox — 2026-10-10

Hosted Firefox and WebKit runs failed intermittently with `WASTED_RECOMPUTE` at
exactly 2.0ms (Slider `count`, Chart tooltip, the admin Dialog fixed above). A
local probe with `wastedRecompute.budgetMs` at 0 over source integration in
Chromium, Firefox and WebKit flagged nine scopes: Chart tooltip/legend (four),
multiple Combobox `active`, Menubar `createControllable.current`, Slider `count`,
force-mounted Tabs panels, and Data Table pagination (Firefox only).

Without cross-origin isolation, `performance.now()` resolves to 1ms in Firefox and
WebKit and 0.1ms in Chromium (measured locally). A microsecond scope that crosses
a tick is charged a whole millisecond, so two crossings meet the 2ms budget. With
COOP/COEP headers all three engines resolved to 0.02ms or finer, but Firefox then
measured real 10–16ms `HOT_SCOPE_TIME` in three source tests that pass without
isolation against the local 8ms budget. Isolation therefore changes the
`hotTime` calibration and is not adopted here.

Fixed upstream of the wasted scope, as the diagnostics guide requires:
- `TabsContent` reads `forceMount` before its active state, so force-mounted
  panels no longer subscribe to tab changes.
- Combobox `enabled` compares option lists by item identity and order, so a
  rebuilt but identical list no longer reruns the active-option lookup.

Both have counting unit tests that fail without the change; both scopes pass the
0ms probe in all three engines. A projection for Slider `count` only moved the
discarded runs into the projection; its measured cost is 0.0–0.1ms, so it is
left unchanged. Chart is fixed by the entry above; Menubar and Data Table remain
open. No diagnostic or CI threshold changes.

## CI wasted-recompute budget — 2026-10-10

Hosted CI uses an 8ms `wastedRecompute` budget, keeping Solid's other defaults:
five runs within 1000ms, of which 80% return an unchanged value. Local development
keeps the 2ms default, as it does for `hotTime`.

Without cross-origin isolation, Firefox and WebKit time these pages in 1ms steps.
Work of a few microseconds is charged a whole millisecond when it crosses a tick,
so two crossings meet the 2ms default. All four hosted `WASTED_RECOMPUTE` failures
since 9 October reported exactly 2.0ms in Firefox or WebKit. The 0ms probe showed
the reruns themselves were real: Dialog, Chart, Tabs and Combobox were fixed
structurally. The budget change does not replace those fixes; it stops timer
quantization from failing unrelated pull requests.

Slider `count` (0.0–0.1ms measured with accurate timers), Menubar and Data Table
remain known reruns. A slow structural rerun below 8ms per second can now merge
without failing CI; local runs still report it at 2ms. A later deterministic check
that ignores time, with the budget at 0ms, would close that gap once the known
reruns are fixed or allowed. Cross-origin isolation was not adopted; see the
probe entry above. Options and evidence were reviewed on 10 October 2026.

## Weekly scheduled CI on main — 2026-10-10

Merges to `main` no longer start CI, so `main` was rechecked only by manual dispatch.
Manual run 38075554379 passed all 17 jobs on `f53dfdb`, after the Dialog, Chart,
Tabs and Combobox fixes. Add a weekly `schedule` trigger (Mondays 06:17 UTC, off
the hour to avoid peak scheduling delay) running the same jobs, budgets and
artifact retention as pull request CI. The schedule detects drift no pull request
exercises, such as runner image updates and intermittent diagnostics. It does not
gate merges and is not a required check.

## Menubar and Slider reruns — 2026-10-10

The 0ms `wastedRecompute` probe still flags Menubar and Slider. Menubar passes
`open={bar.value()===value()}` to each menu, so switching the open menu re-runs
every menu's `createControllable.current`, though only two answers change. Slider's
`count` re-runs on every value change while the thumb count stays the same.

The diagnostics guide recommends a keyed `createProjection` for one-of-many state.
Both components were tried that way, and in Chromium, Firefox and WebKit the probe
then flagged the projection itself (`createBar.open`, `thumbs`) as producing the same
value, although every Menubar run wrote two keys. A standalone reproduction with
only `solid-js` shows the same result: a keyed projection is reported after five
switches, while per-key memos with genuinely discarded runs are not. This appears
to be an attribution false positive for projections; see
[the upstream issue draft](../validation/SOLID-PROJECTION-WASTED-RECOMPUTE.md).
The Menubar projection also cost 1.2ms in Chromium against 0.0ms for the original.

Both components keep their per-item comparisons. Measured with accurate timers they
cost 0.0–0.1ms, and the 8ms hosted budget prevents timer quantization from failing
CI. Data Table pagination stays as recorded above. Revisit if the upstream check
changes, or if a deterministic 0ms check is added to CI (it would need these three
scopes fixed or allowed).
