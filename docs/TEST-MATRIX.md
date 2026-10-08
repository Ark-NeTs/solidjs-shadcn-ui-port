# Component acceptance and test matrix

Initially audited 2026-10-08 against source at `314f27a`; updated with the
[three-engine browser evidence](WEBKIT-DELIVERY.md) and
[source hydration regression](HYDRATION-DELIVERY.md). Covers the **14
implemented component families**, including their compound parts. The other
catalog entries in [COMPONENT-MAP.md](../COMPONENT-MAP.md) remain unimplemented;
their adoption probes are not delivered-component acceptance tests.

This is a behavior inventory, not a claim that every possible state is tested.
Read the assertions in the linked tests: a broad test title alone is not evidence
for every behavior it mentions. Gaps below are unverified acceptance cases, not
confirmed implementation bugs. The initial audit added no tests; the CMB-1, CMB-2, POP-1, ALT-1, TAB-1, CHK-1/SWT-1, BTN-1/BDG-1 and native field/Label/Card/Separator/Skeleton
follow-ups add the browser contracts linked below.

## Reading the evidence

| Mark | Meaning |
| --- | --- |
| U | Vitest + Testing Library in jsdom. Events can be synthetic; overlay APIs and geometry may be mocked. |
| B | Playwright against source components in the development gallery and focused examples, in Chromium, Firefox and WebKit. |
| E | Playwright against a freshly built package/gallery, in Chromium, Firefox and WebKit. This is not an admin application E2E test. |
| S | Server-rendered HTML assertions in Node. This is not hydration verification. |
| H | Matched source SSR/client builds, exact server-node identity and live interaction in all three browser engines. |
| V | Chromium screenshot comparison. A shared gallery image is not a separate assertion for every component/state. |
| Open | No sufficient assertion at the specified layer; tracked in the gap register. |
| N/A | The behavior is not owned by this component; reason stated. |

An evidence mark applies only to the requirement on its row. Multiple marks show
complementary tests, not identical coverage at each layer. No entire component is
marked universally accepted. Unsupported APIs listed in the [component guide](components.md)
are implementation scope limits, not features that an existing test proves.

## Shared gates and limits

| Requirement | Evidence | Boundary |
| --- | --- | --- |
| Public exports resolve | [U: exports every delivered component through the barrel and source subpaths](../tests/unit/contracts.test.ts#L25) | Export-name presence does not prove React API compatibility. |
| Canonical light/dark tokens remain identical | [U: matches both shared theme blocks byte for byte](../tests/unit/contracts.test.ts#L16) | Token equality is not pixel parity across frameworks. |
| Source hydration retains server nodes and IDs; forms, Tabs and overlays remain interactive | [H: integration scenarios](../tests/hydration/hydration.spec.ts), [two-tab/one-input differential](../tests/hydration/tabs-minimal.spec.ts) | Exactly the documented compositions; the unsafe registration negative control characterizes the rejected algorithm. |
| Diagnostics and cleanup are checked | [Unit setup](../vitest.setup.ts), [browser fixture](../tests/browser-fixture.ts) | Every unit test checks console warn/error after cleanup; every B/E/H test checks console warning/error and page errors. The hydration build also rejects server warnings/errors; ordinary S tests have no equivalent diagnostic fixture. |
| Whole-gallery accessibility | [B: light/dark examples have no axe accessibility violations](../tests/integration/foundation.spec.ts#L27) | Applies to the rendered, settled gallery state. Axe does not certify screen-reader usability or all dynamic states. |
| Whole-gallery visual appearance | [V: light/dark/mobile component gallery](../tests/e2e/visual.spec.ts#L3) | Shared images include every family; not every variant/state combination. |
| Unit execution coverage | [Coverage configuration](../vitest.config.ts), [measured coverage](evidence/tabs-registration-coverage.json) | 100% statements, branches, functions and lines for included component/helper source; not exhaustive behavior coverage. |

The current hydration delivery records **104 unit tests, 7 grouped SSR tests,
255 browser integration runs (85 scenarios × 3 engines), and 213 E2E runs
(67 journeys × 3 engines + 12 Chromium visual tests), and 45 hydration runs
(42 positive assertions + 3 unsafe-pattern characterizations)**. Those visual tests compare
15 images. These totals are package-wide, not per component. See the
[hydration verification](HYDRATION-DELIVERY.md) for current results and the
[initial matrix verification](TEST-MATRIX-DELIVERY.md) for the original audit.

WebKit runs on macOS with process-scoped button Tab navigation and native
Option-Tab/Option-Shift-Tab for links. Pointer activation does not focus native
buttons there; keyboard-focused mutation scenarios use Enter, and outside-click
checks retain native focus behavior. [Differences and limits](WEBKIT-DELIVERY.md).

## Button

| Acceptance requirement | Existing evidence |
| --- | --- |
| Native attributes, callback ref, default button type and exactly-once click callback | [U: preserves native attributes, refs, default type and click handlers](../tests/unit/components.test.tsx#L12) |
| Reactive variant/size/children/disabled props preserve node identity | [U: updates variants, size, children and disabled state without replacing its node](../tests/unit/components.test.tsx#L19) |
| Disabled anchor removes navigation and suppresses its callback | [U: supports data-bound handlers and a disabled link cannot invoke them or navigate](../tests/unit/components.test.tsx#L29) |
| Keyboard activation, visible focus, disabled state and anchor navigation work in a browser | [B: keyboard activation, focus ring, disabled examples and navigation](../tests/integration/foundation.spec.ts#L5) |
| Submit action blocks duplicate pending submission and recovers | [E: form validation, pending submit protection and recovery to ready](../tests/e2e/playground.spec.ts#L3); pending state is owned by the example |
| Variant/size class contract and token customization | [U: reference button classes](../tests/unit/contracts.test.ts#L17), [B: custom theme changes token-driven button colors](../tests/integration/foundation.spec.ts#L18) |
| Anchor participates in Tab/Shift+Tab order, shows light/dark keyboard focus, navigates on Enter and does not activate on Space | [B/E: native Button link](../tests/link-navigation.ts#L37), parameterized by theme |
| Initially disabled anchor is skipped in both tab directions and blocks real pointer activation | [B/E: disabled entry and pointer](../tests/link-navigation.ts#L68) |
| Disabling a focused anchor blocks Enter/Space/pointer and callbacks; re-enabling restores navigation on the same node | [B/E: live availability change](../tests/link-navigation.ts#L84) |

**BTN-1 closed:** dedicated scenarios run in Chromium, Firefox and WebKit through source
and built exports. Native same-document fragment navigation and callback counts
are covered; external/router navigation and new-tab gestures are untested. See
[delivery](LINKS-NAVIGATION-DELIVERY.md). Shared S/V scope is below.

## Badge

| Acceptance requirement | Existing evidence |
| --- | --- |
| Default/updated variants, caller class and anchor href render correctly | [U: updates a badge variant and supports links with caller classes](../tests/unit/components.test.tsx#L45), [U: uses the default badge variant](../tests/unit/components.test.tsx#L50) |
| Variant class contract matches the documented React reference correction | [U: reference badge classes](../tests/unit/contracts.test.ts#L18) |
| Appearance and accessibility in the gallery | Shared V and whole-gallery B axe; dedicated link behavior below |
| Native anchor has light/dark keyboard focus, forward/backward Tab order, Enter navigation and no Space activation; a span Badge adds no tab stop | [B/E: native Badge link](../tests/link-navigation.ts#L37), parameterized by theme |

**BDG-1 closed:** Badge has independent light/dark scenarios in all three engines via
[source integration](../tests/integration/link-navigation.spec.ts#L3) and
[built E2E](../tests/e2e/link-navigation.spec.ts#L3). The same navigation limits as
Button apply. Selection, reset and async recovery are N/A: Badge owns no selection
or request. Badge has no disabled API.

## Card

| Acceptance requirement | Existing evidence |
| --- | --- |
| All six child slots, caller classes, children and reactive size compose correctly | [U: composes every card slot and preserves reactive size, native props and children](../tests/unit/components.test.tsx#L51) |
| Compact size changes actual rendered padding | [B: card size and separator orientation update geometry and semantics](../tests/integration/foundation.spec.ts#L12) |
| A form inside the card remains usable at narrow width/enlarged text | [E: narrow viewport, enlarged text and long input stay usable](../tests/e2e/playground.spec.ts#L9); this is a composition test, not Card-owned submission logic |
| Default/compact padding and title size scale correctly, long content stays inside slots, titles/actions do not overlap, and actions remain usable | [B/E: light/dark desktop and narrow/enlarged geometry](../tests/card-layout.ts#L35) |
| Long-title/filename compositions and both sizes have dedicated visual evidence | [V: three focused Card/Separator baselines](../tests/e2e/visual.spec.ts#L19) |

**CRD-1 closed for the tested composition:** caller wrapping classes handle long
unbroken content and flexible footer copy; see [guide](components.md#card) and
[delivery](CARD-LAYOUT-DELIVERY.md). This does not certify arbitrary action widths
or unstyled unbroken content. Card-owned keyboard/selection/reset are N/A.

## Separator

| Acceptance requirement | Existing evidence |
| --- | --- |
| Decorative default is hidden; semantic mode has a role and live orientation | [U: switches orientation and decorative semantics reactively](../tests/unit/components.test.tsx#L60) |
| Changing orientation changes browser semantics and vertical geometry | [B: card size and separator orientation update geometry and semantics](../tests/integration/foundation.spec.ts#L12) |
| Initial example appears in light/dark/mobile layouts | Shared V |
| Vertical semantic/decorative separators stretch, custom width/height/color/alignment work, Tab skips them and orientation updates geometry | [B/E: separator contracts](../tests/card-layout.ts#L70) |
| Stretched and custom vertical lines appear in light/dark/mobile | [V: focused Card/Separator baselines](../tests/e2e/visual.spec.ts#L19) |

**SEP-1 closed:** all three engines verify geometry/semantics and Chromium captures
three dedicated visual states. Override orientation dimensions with the matching
`data-vertical:` class hook; see [guide](components.md#separator). Form and request
state are N/A for this noninteractive boundary.

## Skeleton

| Acceptance requirement | Existing evidence |
| --- | --- |
| Attributes/classes pass through and decorative placeholders are aria-hidden | [U: forwards placeholder attributes while hiding decorative content](../tests/unit/components.test.tsx#L66) |
| A real Solid Loading boundary replaces the fallback when data resolves | [U: works as a Solid 2 Loading fallback and releases it when content resolves](../tests/unit/components.test.tsx#L69) |
| Browser reduced-motion preference stops animation | [B: loading placeholders are hidden from accessibility tree and stop motion](../tests/integration/foundation.spec.ts#L22) |
| Application pending state adds/removes placeholders through a complete workflow | [E: form validation, pending submit protection and recovery to ready](../tests/e2e/playground.spec.ts#L3), shared pending-state V |
| Real Loading replaces the fallback, preserves shell editing and releases ready content on unmount | [B/E: light desktop and dark narrow/enlarged](../tests/skeleton-loading.ts#L24) |
| Pending disposal survives late resolution before/after a fresh mount; old requests cannot replace the fresh fallback | [B/E: late settlement and remount](../tests/skeleton-loading.ts#L61) |

**SKL-1 closed:** [real promise-driven browser fixture](SKELETON-LOADING-DELIVERY.md)
exercises resolution and unmounting in all three engines and export modes. Skeleton-owned
retry is N/A; request rejection, refetch transitions and hydration remain unverified.

## Input

| Acceptance requirement | Existing evidence |
| --- | --- |
| Ref, values, native constraints, events, form serialization and reset work | [U: forwards refs, native attributes, input/change handlers and default values](../tests/unit/form-fields.test.tsx#L8), parameterized for Input |
| Controlled changes, IDs, disabled/read-only/invalid state and classes update without remounting | [U: updates controlled values, native states, label association and classes without replacing the node](../tests/unit/form-fields.test.tsx#L19), parameterized for Input |
| Label/keyboard focus, read-only/disabled restrictions, file upload and error-description recovery | [B: label focus](../tests/integration/form-fields.spec.ts#L5), [B: read-only, disabled, file and invalid fields retain their native behavior](../tests/integration/form-fields.spec.ts#L11) |
| Email validation, draft retention, successful form submission and reset | [E: native validation preserves drafts and reset restores controlled and uncontrolled fields](../tests/e2e/form-fields.spec.ts#L3) |
| Long values/filenames remain within an enlarged narrow viewport | [E: long field values, file names and enlarged fonts fit a narrow screen](../tests/e2e/form-fields.spec.ts#L12) |
| Number required/min/max/step validation, keyboard step, native submission and reset | [B/E: number constraints](../tests/native-fields.ts#L18) |
| Date/time/datetime-local reject overflow, recover, submit native strings and reset | [B/E: three native date/time types](../tests/native-fields.ts#L42) |
| Range keyboard steps clamp to endpoints, serialize and reset | [B/E: range navigation](../tests/native-fields.ts#L60) |
| Text/search/tel/url/password/email preserve values; URL/email reject type mismatch; native reset clears edits | [B/E: text-like types](../tests/native-fields.ts#L78) |

**INP-1 closed for the documented type scope:** see [delivery](NATIVE-FIELDS-DELIVERY.md)
and [guide](components.md#input-textarea-and-label). Browser-native picker UI,
month/week/color/hidden, autofill and arbitrary native input types remain unverified;
forwarding attributes does not certify every type.

## Textarea

| Acceptance requirement | Existing evidence |
| --- | --- |
| Native constraints, refs, events, default/controlled values and reset work | [U: shared field contracts](../tests/unit/form-fields.test.tsx#L8), [U: reactive field state](../tests/unit/form-fields.test.tsx#L19), both parameterized for Textarea |
| Rows, columns and wrap pass through | [U: forwards label ref/events/classes and textarea dimensions](../tests/unit/form-fields.test.tsx#L31) |
| Label activation, keyboard focus ring and disabled state | [B: label focus](../tests/integration/form-fields.spec.ts#L5), [B: disabled field assertions](../tests/integration/form-fields.spec.ts#L11) |
| Multiline draft survives another field's validation failure; required validation/reset/submission work | [E: native validation preserves drafts and reset restores controlled and uncontrolled fields](../tests/e2e/form-fields.spec.ts#L3) |
| Long text remains usable at narrow width with enlarged fonts | [E: long field values, file names and enlarged fonts fit a narrow screen](../tests/e2e/form-fields.spec.ts#L12) |
| Read-only textarea rejects typing, receives label focus, scrolls by wheel, submits and accepts edits after unlocking | [B/E: read-only/scroll/submission](../tests/native-fields.ts#L101) |
| Native resize-handle drag changes height while preserving width/value; narrow enlarged layout stays usable | [B/E: desktop and narrow/enlarged resizing](../tests/native-fields.ts#L122) |

**TXT-1 closed:** all three engines and export modes verify an explicitly bounded
`field-sizing-fixed resize-y` composition. This is not a claim about resizing
all auto-growing default configurations; see [delivery](NATIVE-FIELDS-DELIVERY.md).

## Label

| Acceptance requirement | Existing evidence |
| --- | --- |
| Callback ref, classes and click handler pass through | [U: forwards label ref/events/classes and textarea dimensions](../tests/unit/form-fields.test.tsx#L31) |
| Updated for/ID wiring preserves an accessible field name | [U: updates controlled values, native states, label association and classes without replacing the node](../tests/unit/form-fields.test.tsx#L19) |
| Clicking the label focuses its actual input/textarea | [B: labels focus their controls and keyboard navigation exposes focus rings](../tests/integration/form-fields.spec.ts#L5) |
| Clicking associated toggle labels changes the corresponding control | [B: labels and Space update checkboxes, mixed selections and switches once](../tests/integration/toggles.spec.ts#L5) |
| Live for/ID reassociation targets the correct Input/Textarea, preserves nodes/drafts and respects disabled targets | [B/E: live native targeting](../tests/native-fields.ts#L144), all three engines |
| Accessible names follow reassociation and a target ID change | [B/E: three-engine name assertions](../tests/native-fields.ts#L144) |
| Repeated association changes during editing preserve label/content identity, focus, selection and draft | [B/E: editing lifetime](../tests/native-fields.ts#L195) |
| Refresh only stale old/new collections, leave healthy/missing targets alone, and stop on disposal | [U: stale collections](../tests/unit/form-fields.test.tsx#L38), [U: removed association](../tests/unit/form-fields.test.tsx#L63) |

**LBL-1 closed for reactive for/ID reassociation.** Both engines now assert live
accessible names through source and built exports. The feature-detected refresh
invalidates stale native collections without moving the label or its content;
see [delivery](LABEL-REFRESH-DELIVERY.md). Physical AT, arbitrary external DOM
changes and form-associated custom elements remain unverified. Label-owned form
values, validation and request recovery are N/A.

## Checkbox

| Acceptance requirement | Existing evidence |
| --- | --- |
| Native click/ref/callback and rejected controlled changes preserve owner authority | [U: shared toggle callbacks](../tests/unit/toggles.test.tsx#L7), [U: shared controlled edits](../tests/unit/toggles.test.tsx#L13), both parameterized for Checkbox |
| Mixed state clears on activation and returns on reset | [U: renders mixed state, clears it on activation, and restores it on form reset](../tests/unit/toggles.test.tsx#L18); [B: mixed-state keyboard and explicit restore](../tests/integration/toggles.spec.ts#L5) |
| Canceled reset, disabled submission exclusion, explicit form reassociation and disposal | [U: reset/form values](../tests/unit/toggles.test.tsx#L32), [U: rebinds explicit form ownership, cancels queued resets after unmount, and cleans listeners](../tests/unit/toggles.test.tsx#L38) |
| Required validation, checked-value serialization and default restoration | [E: notification form validates, serializes checked values and restores default-on controls](../tests/e2e/toggles.spec.ts#L3) |
| Light/dark mixed indicator and accessibility; enlarged mobile label interaction | [B: toggles including invalid controls pass axe](../tests/integration/toggles.spec.ts#L23), [E: enlarged toggles](../tests/e2e/toggles.spec.ts#L9) |
| A canceled native reset preserves state, callbacks and submitted values; a later allowed reset recovers | [B/E: Checkbox cancellation](../tests/toggle-forms.ts#L27), [B/E: mixed reset](../tests/toggle-forms.ts#L105) |
| Live form reassociation preserves node identity, resets only from the current form, and supports detachment/ancestor fallback | [B/E: Checkbox ownership](../tests/toggle-forms.ts#L46) |
| Reassociation/unmount cancels pending reset work; remount restores a single functional listener | [U: queued reassociation](../tests/unit/toggles.test.tsx#L54), [B/E: Checkbox pending work](../tests/toggle-forms.ts#L79) |

**CHK-1 closed:** Checkbox runs its own source/built scenarios in Chromium and
Firefox; see [delivery](TOGGLES-FORMS-DELIVERY.md). This covers reactive `form`
props, not arbitrary DOM reparenting or replacement/renaming of the target form.

## Switch

| Acceptance requirement | Existing evidence |
| --- | --- |
| Native callbacks, controlled rejection and reactive size work | [U: shared callbacks](../tests/unit/toggles.test.tsx#L7), [U: shared controlled edits](../tests/unit/toggles.test.tsx#L13), [U: updates switch size and allows uncontrolled use without callbacks](../tests/unit/toggles.test.tsx#L44) |
| Disabled/read-only/owner-rejected changes preserve displayed state, with error recovery | [B: disabled/read-only and rejected controlled changes preserve the displayed value](../tests/integration/toggles.spec.ts#L10) |
| Both sizes position the thumb in LTR/RTL and honor reduced motion | [B: both switch sizes move the thumb correctly in LTR and RTL and respect reduced motion](../tests/integration/toggles.spec.ts#L15) |
| Form serialization and default-on/default-off reset work in the built package | [E: notification form validates, serializes checked values and restores default-on controls](../tests/e2e/toggles.spec.ts#L3) |
| A canceled native reset preserves state/callbacks/FormData; an allowed reset recovers without duplicate requests | [B/E: Switch cancellation](../tests/toggle-forms.ts#L27) |
| Explicit ownership, detachment, ancestor fallback, stale reset disposal and clean remount work independently | [U: Switch reset/reassociation parameterization](../tests/unit/toggles.test.tsx#L32), [B/E: Switch ownership](../tests/toggle-forms.ts#L46), [B/E: Switch pending work](../tests/toggle-forms.ts#L79) |

**SWT-1 closed:** Switch independently runs all three binary scenarios through
[source integration](../tests/integration/toggle-forms.spec.ts#L3) and
[built E2E](../tests/e2e/toggle-forms.spec.ts#L3), in both browsers. The same external
DOM mutation limits as Checkbox apply; see [delivery](TOGGLES-FORMS-DELIVERY.md).

## Tabs

[H: minimal and full hydration scenarios](HYDRATION-DELIVERY.md) assert server-node
identity, retained drafts, controlled/uncontrolled selection, keyboard navigation
and live bidirectional IDs. The unsafe read/write registration case is a separate
negative control.

| Acceptance requirement | Existing evidence |
| --- | --- |
| Enabled defaults, live IDs, conditional trigger removal and lazy panels | [U: derives an enabled default and wires reactive IDs, selection, refs and lazy panels](../tests/unit/tabs.test.tsx#L6) |
| Controlled rejection, manual activation and force-mounted hidden panels | [U: honors controlled selection, manual activation, callbacks and forceMount](../tests/unit/tabs.test.tsx#L11) |
| Keyboard navigation skips disabled entries and supports automatic/manual, vertical and RTL modes | [B: tabs skip disabled entries and support automatic, manual, vertical and RTL navigation](../tests/integration/overlays.spec.ts#L5) |
| Invalid controlled value/all-disabled list retains defined semantics | [U: provides a tab stop for invalid controlled values and no selection with every tab disabled](../tests/unit/tabs.test.tsx#L20) |
| Built selected panel accepts a draft and composes with a confirmation workflow | [E: built tabs and popover compose into a keyboard-only confirmation flow](../tests/e2e/overlays.spec.ts#L3) |
| Focused removal recovers the remaining roving tab, or the list when none remain | [U: automatic/manual removal](../tests/unit/tabs.test.tsx#L25), [U: empty collection](../tests/unit/tabs.test.tsx#L31), [B/E: removal and exit after the last enabled tab](../tests/tabs-lifecycle.ts#L25) |
| Keyed reordering retains the focused node and navigates the new DOM order in both activation modes | [B/E: adjacent and nonadjacent moves](../tests/tabs-lifecycle.ts#L47), [U: moved node and unrelated mutations](../tests/unit/tabs.test.tsx#L48) |
| A force-mounted draft keeps its DOM identity/value while hidden; default lazy content is disposed | [B/E: native draft lifetime and hidden Tab exclusion](../tests/tabs-lifecycle.ts#L81) |
| External updates preserve outside focus; disposal cancels recovery and releases listeners | [B/E: external removal/reorder and Tab entry](../tests/tabs-lifecycle.ts#L109), [U: newer destination](../tests/unit/tabs.test.tsx#L36), [U: root disposal](../tests/unit/tabs.test.tsx#L41) |

**TAB-1 closed:** six scenarios run through
[source integration](../tests/integration/tabs-lifecycle.spec.ts#L3) and
[built E2E](../tests/e2e/tabs-lifecycle.spec.ts#L3) in Chromium, Firefox and WebKit.
These verify uncontrolled dynamic collections in automatic/manual activation;
controlled-owner rejection remains covered by the earlier tests, not every
combination of rejection and collection mutation.

## Popover

| Acceptance requirement | Existing evidence |
| --- | --- |
| Live naming IDs, refs, positioning, observer cleanup and stale-result rejection | [U: live IDs/lifetime](../tests/unit/overlays.test.tsx#L19), [U: disposes placement observers, follows anchors and rejects stale async positions after changes or unmount](../tests/unit/overlays.test.tsx#L58); geometry engine mocked |
| Controlled close rejection and cancellable callbacks | [U: keeps controlled dismissal subject to the owner and cancels consumer actions](../tests/unit/overlays.test.tsx#L22), [B: controlled popup remains open](../tests/integration/overlays.spec.ts#L11) |
| Real open/naming/initial placement, Escape focus return and outside-click focus retention | [B: popover positions, labels and restores focus on Escape but preserves outside clicks](../tests/integration/overlays.spec.ts#L11) |
| Modal focus containment/scroll release and nested alert focus return | [B: modal popover traps focus and releases scroll locking](../tests/integration/overlays.spec.ts#L20), [B: nested alert dismissal](../tests/integration/overlays.spec.ts#L17), [E: built keyboard confirmation](../tests/e2e/overlays.spec.ts#L3) |
| Open light/dark/enlarged-mobile accessibility and visual appearance | [B: open overlay axe/viewport checks](../tests/integration/overlays.spec.ts#L26), [V: open overlays](../tests/e2e/visual.spec.ts#L12) |
| Two-axis ancestor and document scrolling retain the declared gap/alignment | [B/E: scroll forward/back and Escape](../tests/popover-placement.ts#L37) |
| Viewport, anchor and content resizing recompute placement without reopening | [B/E: resize each geometry source and restore it](../tests/popover-placement.ts#L57) |
| Transformed anchor movement stays attached in motion and at rest | [B/E: sampled animation and return](../tests/popover-placement.ts#L77); transient lag bounded to 12px, settled alignment/gap within 1px; not a frame-rate guarantee |
| Viewport collisions flip/shift and constrain oversized content without losing its close action | [B/E: edge collision and 320×300 viewport](../tests/popover-placement.ts#L108) |
| A transformed paint-clipping ancestor does not clip or intercept the popup | [B/E: outside-boundary hit test, real click, reopen and Escape](../tests/popover-placement.ts#L130) |

**POP-1 closed:** five shared scenarios pass in Chromium, Firefox and WebKit through
[source integration](../tests/integration/popover-placement.spec.ts#L3) and
[built E2E](../tests/e2e/popover-placement.spec.ts#L3). The tests use actual browser
layout and native top layers. They do not certify every transform, continuous
scroll frame, occluded/offscreen anchor policy or mobile visual viewport behavior.

## Alert Dialog

| Acceptance requirement | Existing evidence |
| --- | --- |
| Newest modal contains escaped programmatic focus, falls back when a target is removed and releases listeners on close/unmount | [U: modal owner guard](../tests/unit/overlays.test.tsx#L93), [B/E: nested parent focus attempts](../tests/alert-dialog-focus.ts#L59) |
| Native modality, live naming, cancellable Escape and explicit actions | [U: uses native modality, ref callbacks and cancellable Escape with explicit alert actions](../tests/unit/overlays.test.tsx#L28); native dialog methods adapted in jsdom |
| External close rejection, disposal and nested scroll-lock balancing | [U: external close and unmount](../tests/unit/overlays.test.tsx#L33), [U: balances nested scroll locks and releases only the final owner](../tests/unit/overlays.test.tsx#L39) |
| Cancel receives focus; outside click does not close; pending failure retains draft and retry can complete | [B: alert blocks outside dismissal and preserves a draft through pending failure and retry](../tests/integration/overlays.spec.ts#L23), [E: built alert preserves rejected drafts and completes only an explicit retry](../tests/e2e/overlays.spec.ts#L6) |
| Nested keyboard confirmation returns focus to the right owner | [B: nested alert dismissal](../tests/integration/overlays.spec.ts#L17), [E: built keyboard confirmation](../tests/e2e/overlays.spec.ts#L3) |
| Open light/dark/enlarged-mobile accessibility and appearance | [B: open overlay axe/viewport checks](../tests/integration/overlays.spec.ts#L26), [V: open overlays](../tests/e2e/visual.spec.ts#L12) |
| Own Tab/Shift+Tab boundaries wrap, skip excluded controls, reject background focus and restore native page order on close | [B/E: exact Alert Dialog focus destinations](../tests/alert-dialog-focus.ts#L28) |
| Nested alerts contain focus, preserve the parent draft/scroll lock, and restore focus on Escape, Cancel and Confirm | [B/E: nested dismissal paths and reopen](../tests/alert-dialog-focus.ts#L59), parameterized by dismissal and forceMount |
| A hidden, mounted child cannot supply the parent's initial focus target | [U: parents with/without Cancel](../tests/unit/overlays.test.tsx#L80), [B/E: force-mounted child](../tests/alert-dialog-focus.ts#L59) |

**ALT-1 closed:** five scenarios run through
[source integration](../tests/integration/alert-dialog-focus.spec.ts#L3) and
[built E2E](../tests/e2e/alert-dialog-focus.spec.ts#L3) in Chromium, Firefox and WebKit.
This proves the named parent/child composition, not arbitrary depth, every
focusable element type or custom focus-hook behavior. Pending/failure examples
remain simulated application state, not backend fault-injection tests.

## Combobox

| Acceptance requirement | Existing evidence |
| --- | --- |
| Search draft does not commit selection; single selection serializes and resets | [U: filters without committing drafts, selects, serializes and resets to the original default](../tests/unit/combobox.test.tsx#L15), [B: keyboard/form/reset/required selection](../tests/integration/combobox.spec.ts#L4), [E: built workflow](../tests/e2e/combobox.spec.ts#L3) |
| Controlled null/value/input/open rejection preserves the owner | [U: keeps null/value/input/open owners authoritative when requests are rejected](../tests/unit/combobox.test.tsx#L22); [B: rejected single selection](../tests/integration/combobox.spec.ts#L7), [B/E: rejected opening/query/dismissal and explicit owner updates](../tests/combobox-contracts.ts#L70) |
| Object keys and selected values survive replacement/empty external results | [U: uses object keys for selection and preserves selected items absent from async results](../tests/unit/combobox.test.tsx#L25); [B/E: replacement/empty results, stable-key selection and reset](../tests/combobox-contracts.ts#L40). These supply signals, not out-of-order network responses |
| Multiple selection, chip removal, repeated FormData entries and reset | [U: supports multiple chips, clear, repeated values and removing selected options](../tests/unit/combobox.test.tsx#L28); [B: original chip UI scenario](../tests/integration/combobox.spec.ts#L13), [B/E: controlled and uncontrolled native submission, removal, clear and reset](../tests/combobox-contracts.ts#L7) |
| Disabled skipping, empty search, popup search focus/return and required error | [B: empty/disabled/rejected](../tests/integration/combobox.spec.ts#L7), [B: searches inside a popup and returns focus to its trigger](../tests/integration/combobox.spec.ts#L10), [B: required error](../tests/integration/combobox.spec.ts#L4) |
| Composition Enter does not commit | [U: synthetic isComposing event](../tests/unit/combobox.test.tsx#L19); physical IME remains open |
| Active options stay visible during opening animation, wrapping and scrolling | [U: transformed geometry](../tests/unit/combobox.test.tsx#L64), [B/E: 40 options at desktop and narrow/enlarged sizes](../tests/combobox-navigation.ts#L21) |
| Tab preserves the native destination and closes an uncommitted search | [B/E: inline Tab/Shift+Tab](../tests/combobox-navigation.ts#L44), [B/E: popup next control/previous trigger](../tests/combobox-navigation.ts#L62); the default inline trigger remains a native tab stop |
| Nested chooser selection/Escape/Tab preserve its parent modal, focus containment and scroll locking | [B/E: modal composition](../tests/combobox-navigation.ts#L82); tested with modal Popover, not every possible dialog implementation |
| Canceled/deferred reset and input work are disposed on unmount | [U: disabled/reset disposal](../tests/unit/combobox.test.tsx#L34), [U: deferred input disposal](../tests/unit/combobox.test.tsx#L46), [U: reset-owner unmount](../tests/unit/combobox.test.tsx#L58) |
| Open dark/enlarged-mobile accessibility and light/dark/mobile appearance | [B: keeps open content accessible and within enlarged narrow viewports](../tests/integration/combobox.spec.ts#L16), [V: open combobox](../tests/e2e/visual.spec.ts#L16) |

**CMB-1 closed:** four shared scenarios run in Chromium, Firefox and WebKit through
[source integration](../tests/integration/combobox.spec.ts#L21) and
[built E2E](../tests/e2e/combobox.spec.ts#L8), covering native repeated form values,
reset, fresh object identities and rejected controlled requests.

**CMB-2 automated checks complete:** long-list visibility, native Tab destinations
and nesting inside modal Popover pass in all three engines against source and built
exports. **CMB-2 remains open for a physical IME session only.** The synthetic Home key in U is not an assertion
about the native text caret. Complete Base UI API parity remains an implementation
limit documented in [the guide](components.md#combobox).

## SSR and visual scope by component

| Component | Server assertions / presence | Visual scope |
| --- | --- | --- |
| Button | [S1](../tests/server.test.tsx#L5): native button type and anchor href | Shared gallery variants and example sizes |
| Badge | S1 includes Badge, but has no Badge-specific output assertion | Shared gallery variants |
| Card | S1 asserts contained title text; no assertion for every slot | Shared gallery plus dedicated default/compact long-content layouts |
| Separator | S1 asserts semantic role and vertical orientation | Shared gallery plus dedicated stretched/custom vertical states |
| Skeleton | S1 asserts its data-slot | Shared pending gallery placeholders |
| Input | [S2](../tests/server.test.tsx#L10): type/name/default value/required | Shared normal, disabled, read-only, invalid and file examples |
| Textarea | S2 asserts default text and help association; no Textarea-name assertion | Shared normal and disabled examples |
| Label | S2 asserts for attributes | Shared field/toggle labels |
| Checkbox | [S3](../tests/server.test.tsx#L15): mixed state and name | Shared checked/unchecked/mixed examples |
| Switch | S3 asserts role, checked state, name and small size | Shared sizes, disabled/read-only/invalid/RTL examples |
| Tabs | [S4](../tests/server.test.tsx#L22): selected panel, absent inactive child, selected state and panel role | Shared default/line lists; not all activation/orientation states |
| Popover | S4 asserts a closed expanded state in shared markup; [S5](../tests/server.test.tsx#L26) asserts forced title and popover attribute | Shared closed triggers plus dedicated open light/dark/mobile |
| Alert Dialog | S4 asserts no alertdialog while closed; S5 asserts forced title/role | Shared closed trigger plus dedicated open light/dark/mobile |
| Combobox | [S6](../tests/server.test.tsx#L31): role, initial value, name, closed state and absent listbox | Shared single/multiple examples plus dedicated open single-select light/dark/mobile |

S1 title: “renders semantic foundation markup on the server”; S2: “renders named
fields with labels, native values and validation attributes”; S3: “server-renders
toggle state, native forms and accessible roles”; S4: “renders tabs and closed
overlay triggers without a browser”; S5: “renders forced overlay structure without
opening native layers on the server”; S6: “renders the Combobox canonical value
and form field without a browser”. None tests browser hydration.

## Open acceptance register

These are proposed follow-up checks, not work completed by this audit. Priorities
order the next test work; they do not assign bug severity to untested behavior.

| Priority | ID | Component(s) | Concrete closure condition |
| --- | --- | --- | --- |
| Manual follow-up | CMB-2 | Combobox | Browser scrolling/Tab/modal checks pass; record a physical IME composition/commit/cancel session before closing the remaining manual portion. |
| Extended coverage | ALL-2 | All 14 | [H: real hydration, forms, Tabs and overlays](HYDRATION-DELIVERY.md) passes for the documented source fixtures. Streaming, Loading boundaries, multiple roots, every variant and a published SSR build remain unverified. |
| Cross-cutting | ALL-3 | Interactive controls and semantic content | Record manual assistive-technology navigation/announcements; axe success is only automated evidence. |
| Cross-cutting | ALL-4 | All 14 | Expand representative state/variant visual cases; isolate assertions currently supported only by shared gallery/SSR markup (notably Badge SSR). |
| Before app adoption | ALL-5 | Full package | Verify real admin composition, router/query integration and application errors; measure representative large-list/overlay performance. Current E2E is the gallery only. |

No claim is made that every supported combination appears above. The matrix maps
currently stated component contracts to concrete evidence and highlights the
reviewed gaps. Full catalog/API parity remains tracked separately in the catalog
and component guide; it cannot be closed by increasing execution coverage alone.

## Completed acceptance work

| ID | Closed | Evidence |
| --- | --- | --- |
| ALL-1 | 2026-10-08 | [Delivery](WEBKIT-DELIVERY.md): all 85 source scenarios and 67 built journeys run in WebKit 26.6 on macOS; nested modal focus fixed, native navigation differences documented. Packaged Safari, devices and WebKit screenshot baselines remain outside this claim. |
| SKL-1 | 2026-10-08 | [Delivery](SKELETON-LOADING-DELIVERY.md): three real Loading scenarios × two engines × source and built exports; resolution, pending/ready disposal, late settlement and remounts. No component change. |
| CRD-1, SEP-1 | 2026-10-08 | [Delivery](CARD-LAYOUT-DELIVERY.md): six geometry/interaction scenarios × two engines × source and built exports, plus three new reviewed visual baselines. No component fix needed. |
| LBL-1 | 2026-10-08 | [Delivery](LABEL-REFRESH-DELIVERY.md): native cache refresh, restored Firefox name assertions and repeated editing checks in both export modes/engines. |
| INP-1, TXT-1; LBL-1 targeting portion | 2026-10-08 | [Delivery](NATIVE-FIELDS-DELIVERY.md): ten field scenarios × two engines × source and built exports. Firefox names were deferred here and closed in the follow-up above. |
| BTN-1, BDG-1 | 2026-10-08 | [Delivery](LINKS-NAVIGATION-DELIVERY.md): six link scenarios × two engines × source and built exports. No runtime fix needed. |
| CHK-1, SWT-1 | 2026-10-08 | [Delivery](TOGGLES-FORMS-DELIVERY.md): seven native form scenarios × two engines × source and built exports. Fixed premature synchronization before reset cancellation. |
| TAB-1 | 2026-10-08 | [Delivery](TABS-TAB1-DELIVERY.md): six lifecycle scenarios × two engines × source and built exports. Fixed removal/reorder focus loss and Firefox’s extra scrolling-list tab stop. |
| ALT-1 | 2026-10-08 | [Delivery](ALERT-ALT1-DELIVERY.md): five focus/nesting scenarios × two engines × source and built exports. Fixed parent initial focus selecting a force-mounted child’s hidden Cancel. |
| POP-1 | 2026-10-08 | [Delivery](POPOVER-POP1-DELIVERY.md): scrolling, resize, transform movement, collision and clipping; five scenarios × two engines × source and built exports. Fixed unintended coordinate transitions. |
| CMB-2 browser portion | 2026-10-08 | [Delivery](COMBOBOX-CMB2-DELIVERY.md): five navigation/geometry/modal scenarios × two engines × source and built exports. Physical IME remains open above. |
| CMB-1 | 2026-10-08 | [Delivery](COMBOBOX-CMB1-DELIVERY.md): four form/object/owner scenarios × two engines × source and built exports. No runtime fix was needed. |

## Maintenance

When implementing or changing a component, update its requirements, exact test
links/names, relevant S/V scope and open gap IDs in the same batch. Mark a gap
closed only after the named assertion passes at the requested layer; retain the
closing evidence in the delivery report. A new family needs its own section and
SSR/visual row. Refresh counts from reports, distinguishing scenarios from browser
runs. Recheck line anchors after test edits. Preserve this matrix's distinction
between unit adapters, actual browser behavior, grouped evidence and unrun checks.
