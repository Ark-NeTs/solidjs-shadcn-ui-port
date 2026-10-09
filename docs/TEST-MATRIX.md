# Component acceptance and test matrix

Initially audited 2026-10-08 against source at `314f27a`; updated with the
[three-engine browser evidence](WEBKIT-DELIVERY.md) and
[source hydration regression](HYDRATION-DELIVERY.md), including
[real Loading boundaries](LOADING-HYDRATION-DELIVERY.md). Covers **65 implemented component families** and their compound parts.
[Final package acceptance](REMAINING-CATALOG-STATUS.md) records the commands and
limits. Adoption probes alone are not delivered-component acceptance tests.

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
| Rejected hydrated data recovers through explicit retry and preserves drafts; late results stay isolated | [H: five error/retry scenarios](../tests/hydration/errored.spec.ts), [three native Solid comparisons](../tests/hydration/retry-minimal.spec.ts) | Pending SSR followed by client rejection; the previous error stays visible until retry settlement. No SSR error serialization or streaming claim. |
| Diagnostics and cleanup are checked | [Unit setup](../vitest.setup.ts), [browser fixture](../tests/browser-fixture.ts) | Every unit test checks console warn/error after cleanup; every B/E/H test checks console warning/error and page errors. The hydration build also rejects server warnings/errors; ordinary S tests have no equivalent diagnostic fixture. |
| Whole-gallery accessibility | [B: light/dark examples have no axe accessibility violations](../tests/integration/foundation.spec.ts#L27) | Applies to the rendered, settled gallery state. Axe does not certify screen-reader usability or all dynamic states. |
| Whole-gallery visual appearance | [V: light/dark/mobile component gallery](../tests/e2e/visual.spec.ts#L3) | Shared gallery plus dedicated disclosure and preview images; not every variant/state combination. |
| Unit execution coverage | [Coverage configuration](../vitest.config.ts), [measured coverage](evidence/catalog-final-coverage.json) | 100% statements, branches, functions and lines for included component/helper source; not exhaustive behavior coverage. |

The final catalog delivery records **369 unit tests, 24 grouped SSR tests,
132 hydration runs, 609 source integration runs
and 618 built E2E/visual runs**. These totals are package-wide, not per
component. Three hydration runs characterize the rejected unsafe pattern.
See [final verification](REMAINING-CATALOG-STATUS.md).

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
| Pending SSR fallback is claimed, client handoff stays confined to that fallback, resolution/unmount preserve shell drafts, and disposed roots ignore late completion | [H: real Loading hydration and native comparison](../tests/hydration/loading.spec.ts), [runtime handoff evidence](LOADING-HYDRATION-DELIVERY.md) |
| Pending disposal survives late resolution before/after a fresh mount; old requests cannot replace the fresh fallback | [B/E: late settlement and remount](../tests/skeleton-loading.ts#L61) |

**SKL-1 closed:** [real promise-driven browser fixture](SKELETON-LOADING-DELIVERY.md)
exercises resolution and unmounting in all three engines and export modes. Skeleton-owned
retry is N/A. [Pending fallback hydration](LOADING-HYDRATION-DELIVERY.md) now covers
claim/handoff, resolution and disposal. [Client rejection/retry](ERRORED-HYDRATION-DELIVERY.md)
now covers explicit recovery, duplicate activation, draft preservation and stale
resolve/reject isolation. Refetch transitions and streamed server completion
remain unverified.

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
| A delayed native close cannot dismiss reopened content; real external close still reaches the owner | [U: delayed close regression](../tests/unit/overlays.test.tsx#L109), [B/E: real queued close](../tests/alert-dialog-focus.ts#L107), including trusted-event/open-state evidence, draft identity, focus and scroll locks |
| A hidden, mounted child cannot supply the parent's initial focus target | [U: parents with/without Cancel](../tests/unit/overlays.test.tsx#L80), [B/E: force-mounted child](../tests/alert-dialog-focus.ts#L59) |

**ALT-1 closed:** five scenarios run through
[source integration](../tests/integration/alert-dialog-focus.spec.ts#L3) and
[built E2E](../tests/e2e/alert-dialog-focus.spec.ts#L3) in Chromium, Firefox and WebKit.
This proves the named parent/child composition, not arbitrary depth, every
focusable element type or custom focus-hook behavior. Pending/failure examples
remain simulated application state, not backend fault-injection tests.

**ALT-2 closed:** the [deterministic native-event regression](ALERT-REOPEN-DELIVERY.md)
reproduced a trusted queued close arriving after force-mounted content reopened.
The shared modal handler now ignores that stale event while the dialog is open.
Source and built browser tests preserve genuine external closing, focus, drafts
and nested scroll locks. Controlled rejection/disposal remains covered in units.

## Combobox

| Acceptance requirement | Existing evidence |
| --- | --- |
| Search draft does not commit selection; single selection serializes and resets | [U: filters without committing drafts, selects, serializes and resets to the original default](../tests/unit/combobox.test.tsx#L15), [B: keyboard/form/reset/required selection](../tests/integration/combobox.spec.ts#L4), [E: built workflow](../tests/e2e/combobox.spec.ts#L3) |
| Controlled null/value/input/open rejection preserves the owner | [U: keeps null/value/input/open owners authoritative when requests are rejected](../tests/unit/combobox.test.tsx#L22); [B: rejected single selection](../tests/integration/combobox.spec.ts#L7), [B/E: rejected opening/query/dismissal and explicit owner updates](../tests/combobox-contracts.ts#L70) |
| Object keys and selected values survive replacement/empty external results | [U: uses object keys for selection and preserves selected items absent from async results](../tests/unit/combobox.test.tsx#L25); [B/E: replacement/empty results, stable-key selection and reset](../tests/combobox-contracts.ts#L40). These supply signals, not out-of-order network responses |
| Multiple selection, chip removal, repeated FormData entries and reset | [U: supports multiple chips, clear, repeated values and removing selected options](../tests/unit/combobox.test.tsx#L28); [B: original chip UI scenario](../tests/integration/combobox.spec.ts#L13), [B/E: controlled and uncontrolled native submission, removal, clear and reset](../tests/combobox-contracts.ts#L7) |
| Disabled skipping, empty search, popup search focus/return and required error | [B: empty/disabled/rejected](../tests/integration/combobox.spec.ts#L7), [B: searches inside a popup and returns focus to its trigger](../tests/integration/combobox.spec.ts#L10), [B: required error](../tests/integration/combobox.spec.ts#L4) |
| Composition Enter does not commit | [U: synthetic isComposing event](../tests/unit/combobox.test.tsx#L19); physical IME remains open |
| Active options stay visible during opening animation, list resizing, wrapping and scrolling | [U: transformed geometry and resize observer disposal](../tests/unit/combobox.test.tsx), [B/E: 40 options at desktop and narrow/enlarged sizes](../tests/combobox-navigation.ts#L21) |
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

## Accordion

| Acceptance requirement | Existing evidence |
| --- | --- |
| Single required/collapsible selection, multiple immutable values, controlled rejection, disabled items/root | [U: disclosure selection and ownership cases](../tests/unit/disclosures.test.tsx); [B/E: single accordion and multiple expansion](../tests/disclosures.ts) |
| Arrow/Home/End focus, disabled skipping, horizontal LTR/RTL, clamped/wrapped movement, canceled handlers, nested isolation | U keyboard/nested cases; B/E single accordion and nested disclosure assertions. Clamped navigation and canceled handlers are unit assertions. |
| Heading level, named region, generated and explicit live IDs | U semantics; [S: disclosure markup](../tests/server.test.tsx); [H: stable owner IDs](../tests/hydration/hydration.spec.ts); B/E controls/labelledby assertions |
| Forced draft identity and ordinary content removal | U selection/mount cases; B/E single selection draft; H server-node reuse, live IDs, keyboard selection and preserved draft |
| Focus, theme override, reduced motion, enlarged narrow layout and axe | B/E light/dark disclosure checks; [V: light/dark/mobile disclosure page](../tests/e2e/visual.spec.ts) |

## Collapsible

| Acceptance requirement | Existing evidence |
| --- | --- |
| Native button/ref, controlled/uncontrolled expansion, root/trigger disabled, canceled/bound click callbacks | [U: disclosure state, refs and owner cases](../tests/unit/disclosures.test.tsx) |
| Ordinary children remount, forceMount retains draft identity, custom IDs remain reactive | U mount/ID cases; [B/E: collapsible remounts and owner rejection](../tests/disclosures.ts); [H: ordinary remount after hydration](../tests/hydration/hydration.spec.ts) |
| Controlled rejected open/close retains canonical state until owner accepts | U and B/E owner assertions in both directions |
| SSR retained closed body and hidden shell; hydration retains all original slots | [S: disclosure markup](../tests/server.test.tsx); H disclosure fixture and disposal |
| Accessible names, long prose, light/dark/narrow layout and visuals | B/E whole disclosure page axe/layout checks; dedicated V screenshots. Physical assistive technology remains open. |

Both families use native buttons and own no network/async state. Host loading,
empty and error content is composed as children. No animated exit, arbitrary
`asChild`, or runtime change of Accordion selection type is promised. Custom IDs
are configured on the root/item; exact API boundaries are in the component guide.

## Tooltip

| Acceptance requirement | Existing evidence |
| --- | --- |
| Provider delay, skip window and hoverable policy; canceled pending open; root/native disabled; disposal | [U: preview delay, cancellation and default deadlines](../tests/unit/hints.test.tsx); [B/E: tooltip delay and preview availability](../tests/hints.ts) |
| Focus opening, existing description preserved, no name change, Escape/click dismissal and controlled rejection | U owner/ID and event cases; B/E tooltip/owner assertions and nested modal Escape |
| Hoverable content and stationary trigger/content gap | U bridge/deadline checks; B/E pointer journeys (gap specifically asserted on Hover Card, which shares the controller) |
| Correct compiled colors, viewport placement, long text width and stale geometry rejection | U geometry/size constraints; B/E actual tooltip background, bounds and long-description width |
| Custom SSR ID and stable hydrated shell; live description update | [S: preview markup](../tests/server.test.tsx); [H: preview shell reuse and interactions](../tests/hydration/hydration.spec.ts) |
| Light/dark/mobile appearance | [V: Tooltip/Hover Card screenshots](../tests/e2e/visual.spec.ts); screenshots are full-page because native top-layer content can extend outside main's bounding box |

## Hover Card

| Acceptance requirement | Existing evidence |
| --- | --- |
| Default/custom delay, controlled rejection and owner acceptance, disabling/removing pending preview | [U: preview timer/owner cases](../tests/unit/hints.test.tsx); [B/E: availability and owner scenario](../tests/hints.ts) |
| Native href/ref/click, accessible disabled anchor, focus travel into content and dismissal after departure | U native navigation, canceled handlers and focus-out; B/E native Tab/Enter/profile navigation (Option-Tab for macOS WebKit links) |
| Pointer bridge, stationary gap, hoverable content and close deadline not restarted by moves | U controller/geometry cases; B/E slow gap travel and content hover |
| Top-layer clipping escape, movement/scroll/resize, light/dark inherited tokens, reduced motion, enlarged narrow layout and axe | B/E preview layout scenarios; three V images. Resize/scroll assertions establish continued visibility and viewport bounds, not exhaustive subpixel placement for every side. |
| Server link/retained shell; hydration and root disposal | S preview markup; H live IDs, link navigation and unmount |

Both families own no data requests. Essential content and touch-accessible navigation
remain available outside the preview. The scope excludes a Tooltip arrow, animated
exit, asChild and portal-container APIs. Pointer drag-selection persistence, external
hidePopover calls, physical AT/touch devices and arbitrary cross-library nesting
remain unverified. Shared coverage percentages do not close those gaps.

## Radio Group

| Acceptance requirement | Existing evidence |
| --- | --- |
| Native label, single checked input, form value, default reset and controlled rejection | [U: choices](../tests/unit/choices.test.tsx); [B/E: radio labels/forms and controlled owner](../tests/choices.ts) |
| Later reset cancellation, reactive external ownership, detach/return, disposal and remount | U reset ownership/disposal; B/E external form journey (nonempty unmatched ID). External DOM relocation and form-node replacement are unverified. |
| Required/readonly/native disabled semantics, canceled item handlers and refs | U required/ref/readonly/cancellation; B/E disabled serialization. Native validation-message UI and assistive announcements remain unverified. |
| Arrow axes, direction, disabled skipping, Home/End and loop boundary | U navigation and owning-effect focus cases; B/E radio arrows, shared group navigation and RTL. Readonly arrow focus is asserted in U. |
| SSR name/value/checked/required; hydrated original inputs and keyboard selection | [S10](../tests/server.test.tsx); [H: choice hydration](../tests/hydration/hydration.spec.ts) |

## Toggle

| Acceptance requirement | Existing evidence |
| --- | --- |
| Kobalte adapter keeps default/controlled state, data-bound handlers and refs | U Kobalte adapter/local state cases; [adoption probe](validation/KOBALTE-CHOICES.md) |
| Space/Enter/click, canceled activation, disabled semantics, owner rejection then acceptance | B/E standalone and controlled Toggle scenarios; U adapter assertions |
| Native type button, variants, sizes, class overrides | U variants/attrs; B/E actual 28/32/36 px height; V light/dark/mobile |
| SSR and hydration of pressed state, no replacement or diagnostics | S10; H choice interaction/disposal |

## Toggle Group

| Acceptance requirement | Existing evidence |
| --- | --- |
| Single clear/rejected owner request; multiple add/remove without mutating initial arrays | U single/multiple owner cases; B/E single clear and multiple accumulation |
| Roving focus independent of selection; current DOM order, nested isolation, disabled skipping, orientation and RTL | U navigation/nested/roving opt-out/removal/owning-effect focus; B/E arrows, orientation, reorder/removal and keyboard activation |
| Root/item variant/size defaults, zero spacing, logical borders, disabled inheritance and refs | U presentation/ref/default cases; B/E computed spacing and theme checks; three V screenshots |
| Server pressed markup, hydrated nodes/selection and unmount | S10; H choice scenario |

All three share [B/E narrow enlarged light/dark axe and custom-token checks](../tests/choices.ts)
and [V choice screenshots](../tests/e2e/visual.spec.ts). Radio is a native form control;
pressed buttons intentionally have no form value/reset contract. Physical AT/touch,
automatic focus recovery after removing the focused DOM node, toolbar-specific radio
navigation, runtime ToggleGroup type changes and arbitrary polymorphism remain open
or outside this increment. Coverage is for owned source/adapter execution, not Kobalte internals.

## Select

[Unit assertions](../tests/unit/select.test.tsx), [shared source/built scenarios](../tests/select.ts),
[Kobalte evaluation](validation/KOBALTE-SELECT.md), [delivery](SELECT-DELIVERY.md).

| Acceptance requirement | Existing evidence |
| --- | --- |
| Single canonical value and independent controlled visibility; owner rejection and later acceptance | U: local/controlled cases; B/E: controlled owners may reject opening, selection and dismissal until explicitly accepting |
| Native FormData, required invalid focus, disabled omission, readOnly protection, canceled reset and changing form ownership | U: form/reset/validity cases; B/E: pointer choice, canceled reset and external ownership remain native through detach and remount; disabled and readonly controls retain values while required validation reaches the visible trigger |
| Arrow wrap, Home/End, disabled skipping, repeated-letter typeahead, Enter/Space, Escape and ordinary Tab destinations | U: keyboard/typeahead/cancellation cases; B/E: keyboard selection, typeahead, disabled skipping and Escape preserve focus and form values; Tab, Shift+Tab and outside pointer preserve ordinary destinations |
| Root data changes retain canonical selection and update labels; controlled native changes restore rejected values | U: item data and native change cases; B/E: long-list reversal/empty behavior |
| Large-list scroll/reveal after resizing, RTL, clipping escape and empty data | U: 40-row render scopes, geometry/stale-result/observer cleanup; B/E: long-list navigation survives resize, scrolling, RTL, data reversal and empty data |
| Nested modal selection/Escape stays independent; parent close restores its trigger | B/E: Select inside a modal dismisses independently and restores the modal trigger on closure |
| Names/roles, semantic themes, trigger sizes, reduced motion, custom colors and enlarged narrow layouts | B/E: Select light/dark theme, narrow enlarged layout and open accessibility; axe checks both states |
| Original SSR nodes/IDs remain interactive after hydration | S11; H: hydrates Select labels and native values before selecting, resetting, dismissing and disposal |
| Light/dark/mobile appearance | V: three Select choices snapshots; not all state/theme combinations |

No physical AT/touch, virtualized lists, data-fetch lifecycle, external DOM form
relocation/replacement, item-aligned placement, hover/hold scroll or published SSR
claim. Render every enabled item once in root data order. Explicit flat item data
and source hydration are the accepted composition contract.

## Slider

[Unit assertions](../tests/unit/slider.test.tsx), [shared source/built scenarios](../tests/slider.ts),
[Kobalte evaluation](validation/KOBALTE-SLIDER.md), [delivery](SLIDER-DELIVERY.md).

| Acceptance requirement | Existing evidence |
| --- | --- |
| Normalized values do not mutate parent arrays; steps, bounds, gaps and explicit invalid configurations | U: decimal/sorted normalization, invalid contracts, three-thumb adjustment and changing bounds; B/E: keyboard steps, range constraints, commit, form submission and reset |
| Controlled requests may be rejected; commit reports accepted values only | U: preserves canonical controlled values on rejection; B/E: controlled rejection preserves canonical position until accepted |
| Arrows, Home/End, Shift/Page steps, Tab order and exactly-once commits | U: keyboard/commit/focusout cases; B/E: keyboard steps, range constraints, commit, form submission and reset |
| Track chooses nearest thumb; capture tracks dragging outside bounds; cancellation and disposal clean up | U: captured drag, canceled events, zero geometry, config/capture loss/disposal; B/E: track clicks and captured dragging; capture cancels on disabled changes and unmount |
| Native repeated form names, reset cancellation, reassociation/detachment, disabled omission and readOnly protection | U: form/reset/ownership cases; B/E: canceled resets, changing form ownership, disabled, readonly and remount preserve native contracts |
| Inherited RTL, inversion and vertical placement agree with values | U: direction/vertical/inversion cases; B/E: decimal steps, inherited RTL, inversion and vertical pointer positions agree with values |
| Names, per-thumb labels, value text, theme overrides, reduced motion and narrow enlarged layouts | U: labels override shared labelledby and refs/classes; B/E: Slider light/dark theme, custom colors, enlarged narrow layout and accessibility; axe checks both modes |
| Original SSR thumb/input nodes and IDs remain interactive | S12; H: hydrates Slider thumbs and values before keyboard adjustment, form reset and disposal |
| Representative light/dark/mobile appearance | V: three Slider ranges snapshots; not every orientation/direction/state combination |

Physical AT/touch, forced-colors mode, focused-thumb removal recovery, arbitrary
DOM form relocation/replacement, published/streaming SSR and app integration remain
unverified. Three-thumb behavior and invalid configurations have unit coverage;
browser range scenarios use two thumbs. No crossing/swap mode or draggable fill.

## Progress

[Unit assertions](../tests/unit/progress.test.tsx), [shared browser scenarios](../tests/progress.ts),
[Kobalte evaluation](validation/KOBALTE-PROGRESS.md), [delivery](PROGRESS-DELIVERY.md).

| Acceptance requirement | Existing evidence |
| --- | --- |
| Zero/fractional/complete values and reactive totals share one normalized value model | U: zero/fractional/complete and invalid bounds; B/E: follows owner values and bounds, preserves identity |
| Missing/null/nonfinite/out-of-range values are unknown and corrected inputs recover | U: invalid value and bounds loops; B/E: known → unknown → zero, without stale ARIA text |
| External labels, custom text, native attributes/ref and class overrides | U: naming/ref/classes, dynamic external labels/text; B/E: accessible File transfer name and file counts; S13/H: labelledby survives SSR/hydration and ID changes |
| RTL, resized geometry, semantic colors, reduced motion, enlarged narrow layouts | B/E: fill follows inherited RTL and resized tracks; light/dark themes and axe; V: three dedicated states screenshots |
| Read-only status stays outside Tab order and form data | U: empty FormData; B/E: Tab moves from the preceding link directly to Advance transfer |
| Real Loading fallback resolves and disposes without replacing a focused draft | B/E: Loading fallback resolves; pending fallback stays unmounted after late resolution |
| SSR node identity and live updates after hydration | S13; H: hydrates Progress naming and fill before owner updates, label changes and disposal |

No manual screen-reader, forced-colors, streaming/published SSR or real application
claim. Progress owns no network state, live region, busy-region policy or retry.

## SSR and visual scope by component

| Component | Server assertions / presence | Visual scope |
| --- | --- | --- |
| Button | [S1](../tests/server.test.tsx#L5): native button type and anchor href | Shared gallery variants and example sizes |
| Badge | [Dedicated server regression](../tests/server.test.tsx#L117): all six variants, span semantics, class/label forwarding and native anchor href | Shared gallery variants |
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
| Accordion | S8: expanded/required state, custom controls/labelledby, region, visible/absent body | Dedicated light/dark/mobile disclosure page |
| Collapsible | S8: closed forced body and hidden shell in combined markup | Dedicated light/dark/mobile disclosure page |
| Tooltip | S9: role, custom and existing description IDs, manual popover attribute | Dedicated open light/dark/mobile previews |
| Radio Group | S10: native name, checked, required and disabled markup | Dedicated light/dark/mobile choices |
| Toggle | S10: native pressed button through Kobalte | Dedicated light/dark/mobile choices |
| Toggle Group | S10: pressed/unpressed buttons and grouped state | Dedicated light/dark/mobile choices |
| Progress | S13: zero-based bounds, external naming, known/complete/unknown states | Dedicated light/dark/mobile Progress examples |
| Slider | S12: thumb values/names, neighbor bounds, disabled inputs and vertical semantics | Dedicated light/dark/mobile Slider examples |
| Select | S11: canonical native value/label, combobox, required/disabled and closed retained options | Dedicated open light/dark/mobile Select examples |
| Hover Card | S9: native href, retained closed body, hidden shell in combined markup | Dedicated open light/dark/mobile previews |

S1 title: “renders semantic foundation markup on the server”; S2: “renders named
fields with labels, native values and validation attributes”; S3: “server-renders
toggle state, native forms and accessible roles”; S4: “renders tabs and closed
overlay triggers without a browser”; S5: “renders forced overlay structure without
opening native layers on the server”; S6: “renders the Combobox canonical value
and form field without a browser”. S8: “renders disclosure state, custom ID
relationships, disabled buttons and mount policy on the server”. None tests
browser hydration. S9: “renders preview description IDs and native links without
opening a browser layer”. S10: “renders choice values, names and pressed semantics on the server”. S11: “renders Select labels, native selected values, required state and retained closed options on the server”. S12: “renders Slider bounds, thumb values, names and vertical semantics on the server”. S13: “renders Progress values, external names, completed and unknown states on the server”.

**ASYNC-ERR-1 closed:** [Errored recovery](ERRORED-HYDRATION-DELIVERY.md) verifies
explicit retry, repeated activation, draft identity/focus, stale resolve/reject,
unmount and root disposal in all three engines. The original retry failure was
a harness deadlock: transaction-dependent settlement buttons could not appear
until the pending promise settled. Fixed controls let the actual request settle;
the retained error view is separately reproduced with native Solid controls.

## Open acceptance register

These are proposed follow-up checks, not work completed by this audit. Priorities
order the next test work; they do not assign bug severity to untested behavior.

| Priority | ID | Component(s) | Concrete closure condition |
| --- | --- | --- | --- |
| Manual follow-up | CMB-2 | Combobox | Browser scrolling/Tab/modal checks pass; record a physical IME composition/commit/cancel session before closing the remaining manual portion. |
| Extended coverage | ALL-2 | Full catalog | [H: real hydration, forms, Tabs and overlays](HYDRATION-DELIVERY.md) passes for the documented source fixtures. [Pending Loading boundary hydration](LOADING-HYDRATION-DELIVERY.md) and [client rejection/retry](ERRORED-HYDRATION-DELIVERY.md) are also covered. Streaming, ready-at-SSR boundaries, multiple roots, every variant and a published SSR build remain unverified. |
| Cross-cutting | ALL-3 | Interactive controls and semantic content | Record manual assistive-technology navigation/announcements; axe success is only automated evidence. |
| Cross-cutting | ALL-4 | Full catalog | Expand representative state/variant visual cases; isolate assertions currently supported only by shared gallery/SSR markup. Badge now has a dedicated server assertion for all variants and native link semantics. |
| Before app adoption | ALL-5 | Full package | Verify real admin composition, router/query integration and application errors; measure representative large-list/overlay performance. Current E2E covers component galleries and the package-only [admin menu composition](ADMIN-MENU-DELIVERY.md), not the actual application. [Static import availability](ADMIN-PARITY-DELIVERY.md) passes for 35 names across 14 subpaths; real application composition remains open. The [isolated router/query harness](../validation/consumer-stack/README.md) verifies pending Tabs, query caching, route history and modal queries on the pinned Solid 2 runtime. |

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

## Native catalog compositions

Shared examples do not establish every variant or consumer composition. All
sixteen families below appear in the explicit slot assertions in
[S: native catalog semantics](../tests/server.test.tsx) and the node-identity
checks before [H: native catalog hydration and form reset](../tests/hydration/hydration.spec.ts).
[V: Native catalog compositions](../tests/e2e/visual.spec.ts) compares light,
dark and mobile layouts, with the precise examples in
[the fixture](../playground/catalog-native.tsx).

| Family | Acceptance and actual assertions | Remaining limits |
| --- | --- | --- |
| Alert | [U](../tests/unit/catalog-native.test.tsx): retry removes error content; [B/E](../tests/catalog-native.ts): retry preserves edited inputs; both themes run axe. | Manual announcement timing; arbitrary long action labels. |
| Aspect Ratio | [U](../tests/unit/catalog-native.test.tsx): invalid bounds, live ratio, class/ref forwarding and node identity; [B/E](../tests/catalog-native.ts): 16:9 measured geometry. | Media decoding and intrinsic image dimensions belong to caller content. |
| Attachment | [U](../tests/unit/catalog-native.test.tsx): five owner states, retry callback, native anchor and non-submitting action; [B/E](../tests/catalog-native.ts): retry and preview act independently. | Upload transport, drop zones and backend failures are host-owned; all size/state image combinations remain unverified. |
| Breadcrumb | [U](../tests/unit/catalog-native.test.tsx): native anchor, navigation name and unfocusable current page; [B/E](../tests/catalog-native.ts): href and current-page state. | Custom router adapters; manual screen-reader navigation. |
| Bubble | [U](../tests/unit/catalog-native.test.tsx): native polymorphic links/buttons and explicit/default button type; grouped S/H/V. | All seven colors and reaction combinations do not have individual screenshot assertions. |
| Button Group | [U](../tests/unit/catalog-native.test.tsx): live orientation, separator slot and native action types; [B/E](../tests/catalog-native.ts): vertical state and normal form actions. | Horizontal RTL corner treatment; mixed nested groups. No toolbar keyboard behavior is claimed. |
| Empty | [U](../tests/unit/catalog-native.test.tsx): default media state; grouped S/H/V and axe. | Individual tests for every child ref/class combination remain open. |
| Field | [U](../tests/unit/catalog-native.test.tsx): unique messages, explicit children, recovery removes alert; [B/E/H](../tests/catalog-native.ts): labels, fieldset disable, retained draft and reset. | Host must wire IDs/descriptions; mixed checkbox/radio and nested fieldsets need further examples. |
| Input Group | [U](../tests/unit/catalog-native.test.tsx): canceled addon clicks, link preservation, missing field, default button type; [B/E](../tests/catalog-native.ts): addon input/textarea focus, independent clear, no accidental submission. | IME/voice input and all addon placements individually. |
| Item | [U](../tests/unit/catalog-native.test.tsx): default variants and native actions; [B/E](../tests/catalog-native.ts): working item action, grouped S/H/V. | Caller supplies listitem semantics inside ItemGroup; all media/size combinations not individually captured. |
| Kbd | [U](../tests/unit/catalog-native.test.tsx): semantic kbd nodes; [B/E](../tests/catalog-native.ts): contrast in enlarged light/dark examples. | Shortcut registration is explicitly not owned. |
| Marker | [U](../tests/unit/catalog-native.test.tsx): native actions/default types; grouped S/H/V. | All decorative variants and localized date content. |
| Message | Grouped S/H/V and [B/E](../tests/catalog-native.ts) enlarged RTL bounds/axe. | Host announcements, streaming and scrolling are not implemented by Message; independent state/prop forwarding tests remain limited. |
| Native Select | [U](../tests/unit/catalog-native.test.tsx): labels, name, groups, disabled option, ref and FormData; [B/E/H](../tests/catalog-native.ts): choose/reset/submit/fieldset disable. | Multiple selection, dynamic controlled value with SSR, nonfirst default selection and platform popup appearance require dedicated checks. |
| Spinner | [U](../tests/unit/catalog-native.test.tsx): custom status name and motion class; [B/E](../tests/catalog-native.ts): actual Loading promise resolution, pending unmount and late settlement; reduced-motion computed style. | Manual status announcements; streaming SSR fallback. |
| Table | [B/E](../tests/catalog-native.ts): caption, columnheaders and rowheader; grouped S/H/V. | Large tables, horizontal keyboard scrolling, sticky headers; Data Table sorting is separate work. |

Native contracts live in shared tests imported by both source integration and
built E2E suites. None of these limits is closed merely by reaching 100% code
execution coverage.

## Display and navigation compositions

| Family | Acceptance and actual assertions | Remaining limits |
| --- | --- | --- |
| Avatar | [U](../tests/unit/catalog-display.test.tsx): missing/load/error/recovery, stale events, image-only removal, srcset preload options, delayed fallback cleanup, ref; [B/E](../tests/catalog-display.ts): real decode/failure/retry, delayed completion after source change and root disposal; [S/H](../tests/hydration/hydration.spec.ts): fallback retained before interaction then load/recover/dispose. | One Image per Root; responsive/DPR device selection and initially valid source during hydration remain unverified. Image requests may finish after cleanup, but handlers are removed. |
| Pagination | [U](../tests/unit/catalog-display.test.tsx): current state, native ref/href, callback, disabled suppression and localization; [B/E/H](../tests/catalog-display.ts): Enter navigation, bounds, current page and disabled pointer/Tab attributes. | Page data, ranking and requests are host-owned; cross-origin/router and modified-click behavior have no dedicated browser case. |
| Direction | [U](../tests/unit/catalog-display.test.tsx): default, explicit local, nested inheritance and precedence; [B/E/H](../tests/catalog-display.ts): dynamic nested DOM direction and Tabs keyboard behavior; B/E also verifies RTL Popover start alignment. | Emits a native div. Not a bridge to external Kobalte I18n context; every other control/portal combination is not independently re-tested. |
| Typography | [U](../tests/unit/catalog-display.test.tsx): hierarchy, ref, text escaping and semantic elements; [B/E](../tests/catalog-display.ts): mobile/enlarged light/dark axe and native prose link; grouped S/H slot identity and V. | Not a Markdown parser or full upstream Typeset CSS implementation. All HTML element permutations and manual screen readers unverified. |

All four appear in [three focused visual baselines](../tests/e2e/visual.spec.ts).

## Dialog, Sheet and Drawer

| Family / acceptance requirement | Evidence and limits |
| --- | --- |
| All: root ownership, live content/title/description IDs, refs, canceled actions, retained drafts, unmount and reopening | [U: modal families](../tests/unit/catalog-modal.test.tsx), [B/E: modal contracts](../tests/catalog-modal.ts); compound exports in contracts.test.ts |
| Dialog: nested focus containment, return to opener, scroll locking, failed-save recovery and controlled close rejection | [B/E: Dialog scenarios](../tests/catalog-modal.ts); save behavior belongs to the fixture, not a transport API |
| Dialog: nonmodal page interaction | [U/B/E: companion example](../tests/catalog-modal.ts); native outside-dismiss, no modal focus trap |
| Sheet: all physical sides and retained draft | [U/B/E: side changes](../tests/catalog-modal.ts), light/dark/mobile open images; long content uses panel overflow |
| Drawer: all four directions, snap keyboard, pointer dismissal, content scrolling | [U/B/E: directional scenarios](../tests/catalog-modal.ts); synthetic pointer coverage in U, real mouse capture in B/E |
| Drawer: controlled rejection, pixel sizes, invalid points, cancellation and observer teardown | [U: controlled and lifecycle cases](../tests/unit/catalog-modal.test.tsx); no physical touch-device claim |
| All: server semantics and client continuity | [S: retained modal HTML](../tests/server.test.tsx), [H: modal journey](../tests/hydration/hydration.spec.ts); initial closed forceMount nodes, nested focus, draft edits, drawer size and disposal |
| All: customization and access | Light/dark/mobile [V: modal images](../tests/e2e/visual.spec.ts); enlarged mobile axe/geometry in B/E; no manual screen-reader certification |
| Open / scope boundaries | Real mobile touch/virtual keyboard, open modality changes and manual assistive technology unverified. No delayed exit presence, background scaling, momentum, arbitrary-content swipe or Vaul viewport-fraction semantics. See [guide](components.md). |

## Menu and command compositions

| Family | Assertions | Limits |
| --- | --- | --- |
| Dropdown Menu | U/B/E keyboard boundaries, typeahead, disabled skipping, live IDs, checkbox/radio ownership, canceled selection, native anchor, submenu hover/keys, Tab and focus return; constrained scrolling retains a single native tab stop; U forwarded focus/blur and disabled exclusion, stale placement and teardown. | Nonmodal; no exit-presence or arbitrary child cloning. |
| Context Menu | U/B/E pointer coordinates, ContextMenu/Shift+F10, disabled native context, nested action and focus return. | Physical touch long-press unverified. |
| Menubar | U/B/E enabled trigger roving, open-menu transfer, RTL and Escape; U controlled rejection and canceled requests. | Horizontal menus; application shortcuts remain host-owned. |
| Navigation Menu | U/B/E pointer intent, canceled stale timers, shared/inline viewport, native links, keyboard entry/Escape, outside focus and controlled ownership. | No polygon grace-area or custom reparenting. |
| Command | U/B/E keywords/custom filtering, empty/disabled results, active descendant, controlled query rejection, keyboard and pointer selection; named Dialog composition. | Authored order, explicit values, no async transport/ranking/virtualization engine. |

Tests: [units](../tests/unit/catalog-menus.test.tsx),
[shared source/built browser contracts](../tests/catalog-menus.ts),
[server](../tests/server.test.tsx), [hydration](../tests/hydration/hydration.spec.ts),
[visuals](../tests/e2e/visual.spec.ts). Final counts and gates belong in the
[menu delivery report](MENU-CATALOG-DELIVERY.md), not inferred from code coverage.

## Calendar, Date Picker and Input OTP

| Family | Actual assertions | Boundaries |
| --- | --- | --- |
| Calendar | U date arithmetic/leap-year clamping, immutable values, controlled rejection, disabled intervals, bounds, locale, multiple/month dropdown and queued-focus teardown; B/E date selection, keyboard month/week/RTL and disabled skipping. | Local Gregorian Dates; no react-day-picker renderer API, week numbers or time editing. |
| Date Picker | U/B/E accepted/rejected selection, popup focus return, local-date FormData, reset cancellation and disposal; controlled/empty values. | required prevents clearing, not hidden-field native validation; repeated names serialize ranges/multiple values. |
| Input OTP | U controlled rejection, invalid edits, paste normalization, callback cancellation, reset and label wiring; B/E real native typing/deletion/paste, one tab stop and submitted code. | Real SMS/password-manager autofill and physical keyboards unrun. |
| Shared | S semantic HTML, H node retention and live edits/reset/disposal, enlarged light/dark axe and no horizontal page overflow, light/dark/mobile visuals. | No manual assistive-technology certification. |

[Units](../tests/unit/catalog-dates.test.tsx), [browser contracts](../tests/catalog-dates.ts),
[delivery](DATE-CATALOG-DELIVERY.md). Final commands and times are recorded in the catalog report.

## Layout engines

| Family | Assertions | Limits |
| --- | --- | --- |
| Resizable | U constraints, controlled rejection, collapse/default expansion, disabled/canceled keyboard and pointer capture cleanup; B/E real dragging, horizontal/vertical/RTL, min/max and keyboard collapse. | Percentage adjacent pairs; no intersections, storage, pixel-size or React imperative ref API. |
| Scroll Area | U geometry, thumb/track gestures, cancellation, inherited direction observation and disposal; B/E native scrolling, both axes, thumb dragging and RTL. | Native overflow plus custom tracks; no Radix visibility-animation state machine. |
| Carousel | U lifecycle adapter and caller cancellation with a mocked engine; B/E real Embla snaps, dynamic slides, controls and direction/orientation changes. | Opt-in plugins; no implicit autoplay. Unit mocks do not certify engine geometry. |
| Message Scroller | U following, interruption, anchor adjustment, reduced motion, explicit navigation and observer cleanup; B/E streamed growth, user history reading, prepend preservation and remount. | Stable rendered items; no virtualization/networking or React hook compatibility. |

See [layout delivery](LAYOUT-CATALOG-DELIVERY.md), [units](../tests/unit/catalog-layout.test.tsx)
and [browser contracts](../tests/catalog-layout.ts). Final package acceptance is linked above.

## Toast and Sonner

| Family | Assertions | Boundaries |
| --- | --- | --- |
| Toast | U controlled rejection, overlapping pauses, visibility, cancellation, default expiry, cleanup, four swipe directions, repeated shortcut focus return and retained-root reopening. B/E actual hover/focus timers, action, Escape/F8, pointer capture and controlled rejection. | Four-axis threshold dismissal, no drag animation; no manual screen-reader certification. |
| Sonner | U immutable snapshots, replacement, automatic-ID collision avoidance, FIFO queue, callbacks, stale success/error work and subscription disposal. B/E queue advancement, named replacement, expiry/manual distinction, promise dismissal and remount. | One viewport per store; producers own cancellation and persistence. |
| Shared | S no request-data retention; H region/node retention and post-hydration actions; B/E narrow enlarged light/dark axe; reviewed screenshot triplet. | The Drawer scroll timing isolation is recorded in [native comparison](../validation/drawer-scroll/README.md). |

[Delivery](NOTIFICATION-CATALOG-DELIVERY.md), [units](../tests/unit/catalog-notifications.test.tsx),
[browser assertions](../tests/catalog-notifications.ts), [unpatched probe](../validation/solid2-toast/README.md).

## Sidebar

U tests cover controlled desktop/mobile rejection, shortcut exclusions, canceled
pointer/actions, rail behavior, responsive content identity, native modal cleanup,
disabled/active links, hint ownership and deterministic placeholders. B/E tests
assert real desktop icon/offcanvas/none modes, hints, shortcuts, right-side main
content geometry, actual modal Tab/Escape/outside dismissal, draft identity across
resizing, teardown/remount and enlarged light/dark mobile/desktop axe. S/H verify
stable desktop markup and post-hydration responsive draft use. Three screenshots
are reviewed. No persistence/router/manual assistive-technology claim.

[Delivery](SIDEBAR-CATALOG-DELIVERY.md), [units](../tests/unit/catalog-sidebar.test.tsx),
[browser assertions](../tests/catalog-sidebar.ts).

## Chart and Questionnaire

| Family | Actual assertions | Remaining boundaries |
| --- | --- | --- |
| Chart | U engine configuration/cleanup, stable row identity, inherited theme observation, gaps, native legend and keyboard tooltip; B/E actual canvas pixels, all seven kinds, empty/restore, category/series visibility, resize, narrow enlarged light/dark axe; S/H native alternatives, server node reuse and live updates/disposal. | Six sibling export names preserved, but not Recharts JSX/prop compatibility. No large-dataset or manual screen-reader certification. |
| Questionnaire | U and B/E required/optional validation, multiple/freeform native values, fixed/freeform exclusion, controlled rejection, cancellation, default reset, keyboard shortcuts, navigation focus, pending/failed/retry forms and disposal; S/H retained fieldsets and native submission after hydration. | Root values own answers; explicit ordered metadata; no branching, remote validation or data transport. |
| Shared | Six reviewed light/dark/mobile snapshots; final 27 source, 33 built/visual and 6 hydration checks pass with strict diagnostics. | Final coverage is 100% in all four configured metrics; API and manual-device limits remain explicit. |

[Delivery and API limits](CHART-QUESTIONNAIRE-DELIVERY.md),
[Chart assertions](../tests/catalog-chart.ts), [Questionnaire assertions](../tests/catalog-questionnaire.ts).

## Data Table

U covers actual core filtering/sorting/paging/selection, controlled rejection,
loading/empty/retry, immutable row retention, grouped headers, column visibility,
page-size options and deferred-write disposal. B/E covers 24 real rows, page sizes
up to 20, partial/all page selection, hidden columns, owner-rejected sorting,
filtering, retained error data, retry and remount, plus enlarged light/dark axe.
S/H verifies native table output and exact node reuse before interactive changes.
Three reviewed Chromium images cover light/dark/mobile layouts. No virtualized or
server-data/performance certification is claimed.

[Units](../tests/unit/catalog-data-table.test.tsx), [browser contracts](../tests/catalog-data-table.ts),
[adapter repairs and limits](DATA-TABLE-DELIVERY.md).

## Final review regressions

Calendar restores an owner-rejected month dropdown; Resizable restoration
reapplies changed adjacent bounds and retains CSS text. Questionnaire guards
pending changes inside authored callbacks. Data Table preserves row elements
through immutable data and column changes and separates row rendering from the
parent table-body subscription. These have direct assertions in their unit files.
Drawer waits for native editor focus paint before its independent scroll check;
[plain native reproduction](../validation/drawer-scroll/README.md) identifies why.

Popover geometry baselines now await the real opening animation and assert the
initial 240-pixel width. A transient zoom had satisfied center-alignment checks
before the starting x coordinate was stable. Fifteen affected source cases and
fifteen repeated built resize cases pass; production positioning and tolerances
are unchanged. See [final acceptance](REMAINING-CATALOG-STATUS.md).

## Admin import availability tooling

[Eleven audit tests](../tests/unit/admin-parity.test.ts) inspect real temporary
modules and the current admin imports against the package export map. Missing
modules/names, unresolved aliases and denied/private paths are rejected; newly
exported components need no inventory update. This tooling batch brings the unit
suite to 380 tests; component/browser behavior and the historical catalog gate
counts above are unchanged. [Measured delivery](ADMIN-PARITY-DELIVERY.md).

## Catalog inventory regression

[U: catalog inventory](../tests/unit/catalog-inventory.test.ts) matches all 65 dated
map entries to source files, imports every family, and requires each runtime export
to be the same value through the root barrel. It also checks all sibling module
value export names, allowing only the documented React `useComboboxAnchor`
ref-object hook difference. This guards omissions, not prop/behavior equivalence
or all future upstream additions. [Completion audit](CATALOG-COMPLETION-AUDIT.md).

Data Table's admin-composition follow-up adds a direct state-isolation assertion
in [its unit suite](../tests/unit/catalog-data-table.test.tsx): local selection,
sorting and paging updates must not re-read controlled column visibility. The
shared local state signal was replaced by per-field sources; controls and initial
reset defaults retain their contracts. See [admin delivery](ADMIN-MENU-DELIVERY.md).

## Admin form and Data Table composition

The [restaurant menu fixture](../playground/admin-menu.tsx) composes Data Table,
Dialog, Select, Input, Textarea, Label, Field, Checkbox, Switch, Button, Badge and
Card through public package exports. [Shared browser cases](../tests/admin-menu.ts)
run against both source integration and built E2E exports in three engines.
[State/race tests](../tests/unit/admin-menu.test.ts),
[SSR assertions](../tests/server.test.tsx),
[hydration journey](../tests/hydration/admin-menu.spec.ts) and
[visual cases](../tests/e2e/admin-menu/visual.spec.ts) provide the other layers.

| Requirement | Assertion evidence |
| --- | --- |
| Confirmed rows remain distinct from drafts | U: `admin-menu.test.ts` failed-save test; B/E: rejected save preserves name/price and table row until explicit retry. |
| Name/currency validation, field reset and record changes | U: valid integer cents, rejected decimal formats/name/notes; B/E: invalid field focus and ARIA, reset/cancel and subsequent different record. |
| Nested category choice and native toggles | B/E: Select inside Dialog changes category without closing the editor; Checkbox/Switch and notes persist through successful save/reopen. |
| Duplicate and pending actions | U: same-turn duplicate call guard; B/E: two programmatic submit events, disabled fields/actions and rejected Escape during a slow save; one service call. |
| Selection, sorting, filtering and paging | B/E: selection remains attached to stable row IDs across sort/edit; filtered-away row returns focus to the filter; page bounds and explicit refresh retry retain confirmed changes. |
| Stale reads and disposal | U: out-of-order reads cannot overwrite newest rows; opening an editor invalidates a pending read; late save success/read failure after disposal does not publish changes. Transport cancellation is requested. |
| SSR and hydration | S: seeded first page with no API calls or mounted editor; H: all server slot nodes reused, then edit/nested Select/save/selection/filter/disposal. |
| Appearance and access | B/E: axe and document bounds in 390px light/dark layouts at 24px root text; V: table and dialog screenshots in light/dark/mobile. |

This advances the composition portion of ALL-5. The service is an injected local
simulator; authentication, actual AppApi/IPC, shared-server conflicts, uncertain
network writes and real admin migration remain unverified. The isolated router/query
compatibility checks are recorded in the completion section below.
See [delivery and measured commands](ADMIN-MENU-DELIVERY.md).


## Website and consumer completion

[Website browser cases](../tests/docs-site.ts) run against source and built assets
in Chromium, Firefox and WebKit: search, native history, unknown page/error retry,
stable link identity, copy feedback, keyboard skip navigation, themes and enlarged
mobile accessibility. [Inventory tests](../tests/unit/docs-site.test.ts) require all
65 families to have their own JSX usage, screenshots and valid preview links, and check rendered
asset links and absence of executable markup. Four [visual cases](../tests/e2e/docs-site/visual.spec.ts)
cover desktop light/dark, mobile and custom tokens.

[The isolated consumer](../validation/consumer-stack/consumer.spec.ts) verifies
actual Router next.36 and Query rc.5 with Solid rc.13. It closes the scoped client
router/query compatibility gap in ALL-5, not actual application migration or
streaming/query-cache hydration. All application data is deterministic and local.

[Chart unit regression](../tests/unit/catalog-chart.test.tsx) asserts that import
alone does not register engines, first mount registers once, and later charts
reuse registration. [The size probe](../scripts/measure-consumer-bundles.mjs)
records source/built consumer costs. A dedicated server case also closes the explicit
Badge SSR assertion gap in ALL-4. No large-dataset performance claim is made.
[Completion report](PROJECT-COMPLETION.md).


The [controlled-state regression](../tests/unit/controllable.test.ts) observes
consumer notification counts across unrelated owner edits, controlled rejection
and returning to local ownership. The final admin, overlay and form browser runs
exercise this shared equality boundary with diagnostics enabled.


## Public deployment artifact

[Public-site acceptance](../tests/site/public-site.spec.ts) runs against Wrangler's
local static-assets runtime in Chromium, Firefox and WebKit. It checks the root,
deep links, working gallery routes, published verification/license, cache headers,
real missing-page status, absence of internal files and mobile theme accessibility.
The public generator regression clears obsolete assets and excludes raw reports;
[artifact checks](../scripts/check-site.mjs) inspect every emitted file and local
asset link. This validates local provider behavior, not account permissions, DNS,
remote TLS or an actual deployment. See [deployment delivery](DEPLOYMENT-DELIVERY.md).


## Inline documentation previews

[Shared preview acceptance](../tests/docs-previews.ts) mounts all 65 families
through source and built documentation in all three browsers. It exercises state
and reset, inherited themes, editable forms, keyboard Tabs, overlay dismissal and
reopening, Select/Command actions, Data Table empty/restore, and notification
cleanup. A held module response proves loading and explicit reload recovery;
nine representative families check dark mobile layout at a 24 px root font and
axe accessibility. [Visual cases](../tests/e2e/docs-site/visual.spec.ts) cover the
inline custom Button and dark Tabs, Data Table and Dialog surfaces.

The embedded Sidebar uses a desktop region; the default standalone complementary
landmark and mobile modal dialog remain unchanged. Its unit test verifies the
role across breakpoint transitions, and the existing browser/hydration Sidebar
journeys remain release gates. All-family mounting is not a claim that every
possible interaction or visual variant is tested. [Delivery](LIVE-DOCS-DELIVERY.md).

## Live theme generator

[Token unit contracts](../tests/unit/theme-model.test.ts) cover allowlisted URL
settings, complete light/dark export parity, every setting option and shuffle locks.
[Shared browser acceptance](../tests/theme-generator.ts) runs against source and
built exports in Chromium, Firefox and WebKit. It verifies immediate styles and
URL/reload persistence, retained form drafts, Tabs and holdings filtering, locked shuffle,
reset, live chart repaint, Theme-only export, exact clipboard payload, denied-copy
recovery, pending-copy disposal, Escape/reopen and focus restoration. Mobile
light/dark checks use 390px width, enlarged text and axe, including the modal.

[Visual baselines](../tests/e2e/docs-site/visual.spec.ts) cover the generator's light,
dark, mobile and export surfaces. [Public-site checks](../tests/site/public-site.spec.ts)
exercise `/?create` through the local deployment runtime. This does not certify
all possible palette/font combinations or replace manual screen-reader testing.
[Delivery](THEME-GENERATOR-DELIVERY.md).

### Expanded create canvas

[Generator browser cases](../tests/theme-generator.ts) assert all 37 card IDs in
the six column groups, left-to-right geometry, the double-width center, and
horizontal reachability without page overflow. They exercise new-goal dialog
submission, transaction menus, FAQ tabs/accordion, holdings filters, receiving
method changes, shades, mixed/select-all notifications, alert cancellation/focus,
canceled account syncing, linked amount fields and summaries, calendar selection,
and image selection with invalid-file recovery. These run against source and
built exports in Chromium, Firefox and WebKit with strict diagnostics.

The [visual suite](../tests/e2e/docs-site/visual.spec.ts) adds the full seven-column
canvas to light/dark/mobile/export baselines. Existing mobile checks include
enlarged text and axe. No primitive implementation changed; existing component
unit/server coverage is retained. Demo forms do not imply backend persistence.
See [expansion delivery](THEME-CANVAS-EXPANSION.md) for fresh evidence and limits.

### Standalone repository verification

Contract unit tests now read the captured React reference and admin import
fixtures in `validation`, preserving the pre-extraction baseline. These are dated
contracts rather than a live application audit. Component implementations and
browser assertions are unchanged. Fresh relocation checks and unrun scope are
recorded in [repository migration](REPOSITORY-MIGRATION.md).

### Documentation organization

[Documentation unit checks](../tests/unit/docs-site.test.ts) assert nested project,
checklist, validation and delivery pages, root-link rewriting and the unchanged
public-page allowlist. [Shared website browser checks](../tests/docs-site.ts)
follow the relocated decisions and foundation-report links, including a deep-link
reload, against source and built documentation in all three browsers.
See [organization delivery](DOCUMENTATION-ORGANIZATION.md) for measured results.

### Standalone documentation boundary

Active specifications and checklists describe only this Solid library. The
[public-generation unit check](../tests/unit/docs-site.test.ts) seeds an extra
document page and verifies it is removed alongside internal evidence. The
[public browser checks](../tests/site/public-site.spec.ts) require 404 responses
for internal specs, origin notes and an unapproved page in all three engines.
The [artifact checker](../scripts/check-site.mjs) also requires the exact approved
guide/component page inventory, even for files absent from navigation.
[Boundary audit](PARENT-DOCUMENTATION-AUDIT.md) records the negative packaging
probe, history/fixture review and verification limits.
