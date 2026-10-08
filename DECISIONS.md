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
pin changes are introduced. See [CMB-2 delivery](docs/COMBOBOX-CMB2-DELIVERY.md).

## Popover placement follow-up — 2026-10-08 (D19/D90)

Keep Floating UI's position updates immediate: PopoverContent now defaults to
`transition-none` while retaining `duration-100` for its opening keyframe animation.
REASONING: the duration utility sets transition-duration too. With the default
transition-property of all, each left/top update restarted a CSS transition;
real-browser sampling measured roughly 17–21px lag behind a moving anchor.
Do not hide the defect by disabling motion in the test or widening its tolerance.
The regression samples intermediate frames, then requires subpixel attachment
at rest. No placement engine, observer lifecycle or public prop API changes.
See [POP-1 delivery](docs/POPOVER-POP1-DELIVERY.md).

## Alert Dialog focus follow-up — 2026-10-08 (D19/D90)

Restrict initial-focus candidates in the shared native-layer helper to controls
whose nearest dialog/alertdialog is the layer being opened. Apply the same owner
rule to the fallback content lookup. REASONING: a force-mounted child remains in
the parent's DOM while closed; an unrestricted Cancel query found that hidden
child button before the parent's own Cancel, so the parent's Cancel did not
receive initial focus in either browser. Preserve Cancel priority, consumer cancellation
hooks, native modality, Tab handling and scroll-lock cleanup. No new library,
observer or delayed focus task is needed. See
[ALT-1 delivery](docs/ALERT-ALT1-DELIVERY.md).

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
dispose children. See [TAB-1 delivery](docs/TABS-TAB1-DELIVERY.md).

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
choice changes. [Delivery evidence](docs/TOGGLES-FORMS-DELIVERY.md) covers source
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
comment insertion/removal. [Delivery](docs/LABEL-REFRESH-DELIVERY.md) records the
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
regression verifies target removal and disposal. [Delivery](docs/WEBKIT-DELIVERY.md)
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
client semantics. [Hydration evidence](docs/HYDRATION-DELIVERY.md) records exact
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
patch or diagnostics suppression. [Evidence](docs/LOADING-HYDRATION-DELIVERY.md)
is specific to pending renderToString output and client-owned completion; it does
not establish streaming or ready-at-SSR boundary support.
