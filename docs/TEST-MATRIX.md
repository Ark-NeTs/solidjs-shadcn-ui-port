# Component acceptance and test matrix

Initially audited 2026-10-08 against source at `314f27a`; updated with the
[POP-1 browser evidence](POPOVER-POP1-DELIVERY.md). Covers the **14
implemented component families**, including their compound parts. The other
catalog entries in [COMPONENT-MAP.md](../COMPONENT-MAP.md) remain unimplemented;
their adoption probes are not delivered-component acceptance tests.

This is a behavior inventory, not a claim that every possible state is tested.
Read the assertions in the linked tests: a broad test title alone is not evidence
for every behavior it mentions. Gaps below are unverified acceptance cases, not
confirmed implementation bugs. The initial audit added no tests; the CMB-1, CMB-2 and POP-1
follow-ups add the browser contracts linked below.

## Reading the evidence

| Mark | Meaning |
| --- | --- |
| U | Vitest + Testing Library in jsdom. Events can be synthetic; overlay APIs and geometry may be mocked. |
| B | Playwright against source components in the development gallery and focused examples, in Chromium and Firefox. |
| E | Playwright against a freshly built package/gallery, in Chromium and Firefox. This is not an admin application E2E test. |
| S | Server-rendered HTML assertions in Node. This is not hydration verification. |
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
| Diagnostics and cleanup are checked | [Unit setup](../vitest.setup.ts), [browser fixture](../tests/browser-fixture.ts) | Every unit test checks console warn/error after cleanup; every B/E test checks console warning/error and page errors. SSR has no equivalent diagnostic fixture. |
| Whole-gallery accessibility | [B: light/dark examples have no axe accessibility violations](../tests/integration/foundation.spec.ts#L27) | Applies to the rendered, settled gallery state. Axe does not certify screen-reader usability or all dynamic states. |
| Whole-gallery visual appearance | [V: light/dark/mobile component gallery](../tests/e2e/visual.spec.ts#L3) | Shared images include every family; not every variant/state combination. |
| Unit execution coverage | [Coverage configuration](../vitest.config.ts), [measured coverage](evidence/popover-pop1-coverage.json) | 100% statements, branches, functions and lines for included component/helper source; not exhaustive behavior coverage. |

The POP-1 delivery records **85 unit tests, 6 grouped SSR tests,
82 browser integration runs (41 scenarios × 2 engines), and 55 E2E runs
(23 journeys × 2 engines + 9 Chromium visual tests)**. Those visual tests compare
12 images. These totals are package-wide, not per component. See the
[POP-1 verification](POPOVER-POP1-DELIVERY.md) for current results and the
[initial matrix verification](TEST-MATRIX-DELIVERY.md) for the original audit.

## Button

| Acceptance requirement | Existing evidence |
| --- | --- |
| Native attributes, callback ref, default button type and exactly-once click callback | [U: preserves native attributes, refs, default type and click handlers](../tests/unit/components.test.tsx#L12) |
| Reactive variant/size/children/disabled props preserve node identity | [U: updates variants, size, children and disabled state without replacing its node](../tests/unit/components.test.tsx#L19) |
| Disabled anchor removes navigation and suppresses its callback | [U: supports data-bound handlers and a disabled link cannot invoke them or navigate](../tests/unit/components.test.tsx#L29) |
| Keyboard activation, visible focus, disabled state and anchor navigation work in a browser | [B: keyboard activation, focus ring, disabled examples and navigation](../tests/integration/foundation.spec.ts#L5) |
| Submit action blocks duplicate pending submission and recovers | [E: form validation, pending submit protection and recovery to ready](../tests/e2e/playground.spec.ts#L3); pending state is owned by the example |
| Variant/size class contract and token customization | [U: reference button classes](../tests/unit/contracts.test.ts#L17), [B: custom theme changes token-driven button colors](../tests/integration/foundation.spec.ts#L18) |

Open **BTN-1**: disabled-anchor behavior is U-only; no dedicated browser check for
keyboard activation after disabling that anchor. Shared S/V scope is below.

## Badge

| Acceptance requirement | Existing evidence |
| --- | --- |
| Default/updated variants, caller class and anchor href render correctly | [U: updates a badge variant and supports links with caller classes](../tests/unit/components.test.tsx#L45), [U: uses the default badge variant](../tests/unit/components.test.tsx#L50) |
| Variant class contract matches the documented React reference correction | [U: reference badge classes](../tests/unit/contracts.test.ts#L18) |
| Appearance and accessibility in the gallery | Shared V and whole-gallery B axe only; no Badge-specific interaction assertion |

Open **BDG-1**: no dedicated real-browser Badge link navigation/focus test.
Selection, reset and async recovery are N/A: Badge owns no selection or request.

## Card

| Acceptance requirement | Existing evidence |
| --- | --- |
| All six child slots, caller classes, children and reactive size compose correctly | [U: composes every card slot and preserves reactive size, native props and children](../tests/unit/components.test.tsx#L51) |
| Compact size changes actual rendered padding | [B: card size and separator orientation update geometry and semantics](../tests/integration/foundation.spec.ts#L12) |
| A form inside the card remains usable at narrow width/enlarged text | [E: narrow viewport, enlarged text and long input stay usable](../tests/e2e/playground.spec.ts#L9); this is a composition test, not Card-owned submission logic |

Open **CRD-1**: no dedicated compact-card screenshot or long-title/action-collision
assertion. Card-owned keyboard/selection/reset are N/A; descendants own them.

## Separator

| Acceptance requirement | Existing evidence |
| --- | --- |
| Decorative default is hidden; semantic mode has a role and live orientation | [U: switches orientation and decorative semantics reactively](../tests/unit/components.test.tsx#L60) |
| Changing orientation changes browser semantics and vertical geometry | [B: card size and separator orientation update geometry and semantics](../tests/integration/foundation.spec.ts#L12) |
| Initial example appears in light/dark/mobile layouts | Shared V; the orientation-toggle state has no dedicated screenshot |

Open **SEP-1**: vertical orientation has browser geometry coverage but no explicit
visual baseline. Keyboard, forms and requests are N/A for this noninteractive line.

## Skeleton

| Acceptance requirement | Existing evidence |
| --- | --- |
| Attributes/classes pass through and decorative placeholders are aria-hidden | [U: forwards placeholder attributes while hiding decorative content](../tests/unit/components.test.tsx#L66) |
| A real Solid Loading boundary replaces the fallback when data resolves | [U: works as a Solid 2 Loading fallback and releases it when content resolves](../tests/unit/components.test.tsx#L69) |
| Browser reduced-motion preference stops animation | [B: loading placeholders are hidden from accessibility tree and stop motion](../tests/integration/foundation.spec.ts#L22) |
| Application pending state adds/removes placeholders through a complete workflow | [E: form validation, pending submit protection and recovery to ready](../tests/e2e/playground.spec.ts#L3), shared pending-state V |

Open **SKL-1**: the actual Solid async boundary is tested only in U; the browser
example uses manually controlled pending state. Skeleton-owned retry is N/A.

## Input

| Acceptance requirement | Existing evidence |
| --- | --- |
| Ref, values, native constraints, events, form serialization and reset work | [U: forwards refs, native attributes, input/change handlers and default values](../tests/unit/form-fields.test.tsx#L8), parameterized for Input |
| Controlled changes, IDs, disabled/read-only/invalid state and classes update without remounting | [U: updates controlled values, native states, label association and classes without replacing the node](../tests/unit/form-fields.test.tsx#L19), parameterized for Input |
| Label/keyboard focus, read-only/disabled restrictions, file upload and error-description recovery | [B: label focus](../tests/integration/form-fields.spec.ts#L5), [B: read-only, disabled, file and invalid fields retain their native behavior](../tests/integration/form-fields.spec.ts#L11) |
| Email validation, draft retention, successful form submission and reset | [E: native validation preserves drafts and reset restores controlled and uncontrolled fields](../tests/e2e/form-fields.spec.ts#L3) |
| Long values/filenames remain within an enlarged narrow viewport | [E: long field values, file names and enlarged fonts fit a narrow screen](../tests/e2e/form-fields.spec.ts#L12) |

Open **INP-1**: number/date/range and other native input types have no dedicated
browser acceptance scenarios; tested examples do not establish every HTML input type.

## Textarea

| Acceptance requirement | Existing evidence |
| --- | --- |
| Native constraints, refs, events, default/controlled values and reset work | [U: shared field contracts](../tests/unit/form-fields.test.tsx#L8), [U: reactive field state](../tests/unit/form-fields.test.tsx#L19), both parameterized for Textarea |
| Rows, columns and wrap pass through | [U: forwards label ref/events/classes and textarea dimensions](../tests/unit/form-fields.test.tsx#L31) |
| Label activation, keyboard focus ring and disabled state | [B: label focus](../tests/integration/form-fields.spec.ts#L5), [B: disabled field assertions](../tests/integration/form-fields.spec.ts#L11) |
| Multiline draft survives another field's validation failure; required validation/reset/submission work | [E: native validation preserves drafts and reset restores controlled and uncontrolled fields](../tests/e2e/form-fields.spec.ts#L3) |
| Long text remains usable at narrow width with enlarged fonts | [E: long field values, file names and enlarged fonts fit a narrow screen](../tests/e2e/form-fields.spec.ts#L12) |

Open **TXT-1**: no browser assertion for manual resizing, internal text scrolling,
or read-only Textarea editing prevention (the browser's read-only example is Input).

## Label

| Acceptance requirement | Existing evidence |
| --- | --- |
| Callback ref, classes and click handler pass through | [U: forwards label ref/events/classes and textarea dimensions](../tests/unit/form-fields.test.tsx#L31) |
| Updated for/ID wiring preserves an accessible field name | [U: updates controlled values, native states, label association and classes without replacing the node](../tests/unit/form-fields.test.tsx#L19) |
| Clicking the label focuses its actual input/textarea | [B: labels focus their controls and keyboard navigation exposes focus rings](../tests/integration/form-fields.spec.ts#L5) |
| Clicking associated toggle labels changes the corresponding control | [B: labels and Space update checkboxes, mixed selections and switches once](../tests/integration/toggles.spec.ts#L5) |

Open **LBL-1**: dynamic for/ID reassociation is U-only. Label-owned form values,
validation and request recovery are N/A; it names a separate control.

## Checkbox

| Acceptance requirement | Existing evidence |
| --- | --- |
| Native click/ref/callback and rejected controlled changes preserve owner authority | [U: shared toggle callbacks](../tests/unit/toggles.test.tsx#L7), [U: shared controlled edits](../tests/unit/toggles.test.tsx#L13), both parameterized for Checkbox |
| Mixed state clears on activation and returns on reset | [U: renders mixed state, clears it on activation, and restores it on form reset](../tests/unit/toggles.test.tsx#L18); [B: mixed-state keyboard and explicit restore](../tests/integration/toggles.spec.ts#L5) |
| Canceled reset, disabled submission exclusion, explicit form reassociation and disposal | [U: reset/form values](../tests/unit/toggles.test.tsx#L32), [U: rebinds explicit form ownership, cancels queued resets after unmount, and cleans listeners](../tests/unit/toggles.test.tsx#L38) |
| Required validation, checked-value serialization and default restoration | [E: notification form validates, serializes checked values and restores default-on controls](../tests/e2e/toggles.spec.ts#L3) |
| Light/dark mixed indicator and accessibility; enlarged mobile label interaction | [B: toggles including invalid controls pass axe](../tests/integration/toggles.spec.ts#L23), [E: enlarged toggles](../tests/e2e/toggles.spec.ts#L9) |

Open **CHK-1**: canceled reset and live external-form reassociation need real-browser
assertions; current browser reset checks cover the normal in-form path.

## Switch

| Acceptance requirement | Existing evidence |
| --- | --- |
| Native callbacks, controlled rejection and reactive size work | [U: shared callbacks](../tests/unit/toggles.test.tsx#L7), [U: shared controlled edits](../tests/unit/toggles.test.tsx#L13), [U: updates switch size and allows uncontrolled use without callbacks](../tests/unit/toggles.test.tsx#L44) |
| Disabled/read-only/owner-rejected changes preserve displayed state, with error recovery | [B: disabled/read-only and rejected controlled changes preserve the displayed value](../tests/integration/toggles.spec.ts#L10) |
| Both sizes position the thumb in LTR/RTL and honor reduced motion | [B: both switch sizes move the thumb correctly in LTR and RTL and respect reduced motion](../tests/integration/toggles.spec.ts#L15) |
| Form serialization and default-on/default-off reset work in the built package | [E: notification form validates, serializes checked values and restores default-on controls](../tests/e2e/toggles.spec.ts#L3) |

Open **SWT-1**: explicit form reassociation/disposal is exercised via Checkbox's
shared helper, not a Switch-specific browser scenario. Shared logic is supporting
evidence, not an independent Switch acceptance run for that case.

## Tabs

| Acceptance requirement | Existing evidence |
| --- | --- |
| Enabled defaults, live IDs, conditional trigger removal and lazy panels | [U: derives an enabled default and wires reactive IDs, selection, refs and lazy panels](../tests/unit/tabs.test.tsx#L6) |
| Controlled rejection, manual activation and force-mounted hidden panels | [U: honors controlled selection, manual activation, callbacks and forceMount](../tests/unit/tabs.test.tsx#L11) |
| Keyboard navigation skips disabled entries and supports automatic/manual, vertical and RTL modes | [B: tabs skip disabled entries and support automatic, manual, vertical and RTL navigation](../tests/integration/overlays.spec.ts#L5) |
| Invalid controlled value/all-disabled list retains defined semantics | [U: provides a tab stop for invalid controlled values and no selection with every tab disabled](../tests/unit/tabs.test.tsx#L20) |
| Built selected panel accepts a draft and composes with a confirmation workflow | [E: built tabs and popover compose into a keyboard-only confirmation flow](../tests/e2e/overlays.spec.ts#L3) |

Open **TAB-1**: focused-trigger removal/reordering and forceMount draft preservation
need browser scenarios. Existing U verifies selection after removal and hidden
visibility; it does not prove every focus or draft-preservation case.

## Popover

| Acceptance requirement | Existing evidence |
| --- | --- |
| Live naming IDs, refs, positioning, observer cleanup and stale-result rejection | [U: live IDs/lifetime](../tests/unit/overlays.test.tsx#L19), [U: disposes placement observers, follows anchors and rejects stale async positions after changes or unmount](../tests/unit/overlays.test.tsx#L58); geometry engine mocked |
| Controlled close rejection and cancellable callbacks | [U: keeps controlled dismissal subject to the owner and cancels consumer actions](../tests/unit/overlays.test.tsx#L22), [B: controlled popup remains open](../tests/integration/overlays.spec.ts#L11) |
| Real open/naming/initial placement, Escape focus return and outside-click focus retention | [B: popover positions, labels and restores focus on Escape but preserves outside clicks](../tests/integration/overlays.spec.ts#L11) |
| Modal focus containment/scroll release and nested alert focus return | [B: modal popover traps focus and releases scroll locking](../tests/integration/overlays.spec.ts#L19), [B: nested alert dismissal](../tests/integration/overlays.spec.ts#L16), [E: built keyboard confirmation](../tests/e2e/overlays.spec.ts#L3) |
| Open light/dark/enlarged-mobile accessibility and visual appearance | [B: open overlay axe/viewport checks](../tests/integration/overlays.spec.ts#L25), [V: open overlays](../tests/e2e/visual.spec.ts#L12) |
| Two-axis ancestor and document scrolling retain the declared gap/alignment | [B/E: scroll forward/back and Escape](../tests/popover-placement.ts#L37) |
| Viewport, anchor and content resizing recompute placement without reopening | [B/E: resize each geometry source and restore it](../tests/popover-placement.ts#L57) |
| Transformed anchor movement stays attached in motion and at rest | [B/E: sampled animation and return](../tests/popover-placement.ts#L77); transient lag bounded to 12px, settled alignment/gap within 1px; not a frame-rate guarantee |
| Viewport collisions flip/shift and constrain oversized content without losing its close action | [B/E: edge collision and 320×300 viewport](../tests/popover-placement.ts#L108) |
| A transformed paint-clipping ancestor does not clip or intercept the popup | [B/E: outside-boundary hit test, real click, reopen and Escape](../tests/popover-placement.ts#L130) |

**POP-1 closed:** five shared scenarios pass in Chromium and Firefox through
[source integration](../tests/integration/popover-placement.spec.ts#L3) and
[built E2E](../tests/e2e/popover-placement.spec.ts#L3). The tests use actual browser
layout and native top layers. They do not certify every transform, continuous
scroll frame, occluded/offscreen anchor policy or mobile visual viewport behavior.

## Alert Dialog

| Acceptance requirement | Existing evidence |
| --- | --- |
| Native modality, live naming, cancellable Escape and explicit actions | [U: uses native modality, ref callbacks and cancellable Escape with explicit alert actions](../tests/unit/overlays.test.tsx#L28); native dialog methods adapted in jsdom |
| External close rejection, disposal and nested scroll-lock balancing | [U: external close and unmount](../tests/unit/overlays.test.tsx#L33), [U: balances nested scroll locks and releases only the final owner](../tests/unit/overlays.test.tsx#L39) |
| Cancel receives focus; outside click does not close; pending failure retains draft and retry can complete | [B: alert blocks outside dismissal and preserves a draft through pending failure and retry](../tests/integration/overlays.spec.ts#L22), [E: built alert preserves rejected drafts and completes only an explicit retry](../tests/e2e/overlays.spec.ts#L6) |
| Nested keyboard confirmation returns focus to the right owner | [B: nested alert dismissal](../tests/integration/overlays.spec.ts#L16), [E: built keyboard confirmation](../tests/e2e/overlays.spec.ts#L3) |
| Open light/dark/enlarged-mobile accessibility and appearance | [B: open overlay axe/viewport checks](../tests/integration/overlays.spec.ts#L25), [V: open overlays](../tests/e2e/visual.spec.ts#L12) |

Open **ALT-1**: full Tab/Shift+Tab boundary wrapping is directly asserted for Alert
Dialog in [U](../tests/unit/overlays.test.tsx#L45), but the dedicated real-browser
trap loop targets modal Popover. Add an Alert Dialog-specific loop, including a
nested confirmation. Pending/failure examples are simulated application state,
not backend fault-injection tests.

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
| Tab preserves the native destination and closes an uncommitted search | [B/E: inline Tab/Shift+Tab](../tests/combobox-navigation.ts#L43), [B/E: popup next control/previous trigger](../tests/combobox-navigation.ts#L61); the default inline trigger remains a native tab stop |
| Nested chooser selection/Escape/Tab preserve its parent modal, focus containment and scroll locking | [B/E: modal composition](../tests/combobox-navigation.ts#L81); tested with modal Popover, not every possible dialog implementation |
| Canceled/deferred reset and input work are disposed on unmount | [U: disabled/reset disposal](../tests/unit/combobox.test.tsx#L34), [U: deferred input disposal](../tests/unit/combobox.test.tsx#L46), [U: reset-owner unmount](../tests/unit/combobox.test.tsx#L58) |
| Open dark/enlarged-mobile accessibility and light/dark/mobile appearance | [B: keeps open content accessible and within enlarged narrow viewports](../tests/integration/combobox.spec.ts#L16), [V: open combobox](../tests/e2e/visual.spec.ts#L16) |

**CMB-1 closed:** four shared scenarios run in both Chromium and Firefox through
[source integration](../tests/integration/combobox.spec.ts#L21) and
[built E2E](../tests/e2e/combobox.spec.ts#L8), covering native repeated form values,
reset, fresh object identities and rejected controlled requests.

**CMB-2 automated checks complete:** long-list visibility, native Tab destinations
and nesting inside modal Popover pass in both engines against source and built
exports. **CMB-2 remains open for a physical IME session only.** The synthetic Home key in U is not an assertion
about the native text caret. Complete Base UI API parity remains an implementation
limit documented in [the guide](components.md#combobox).

## SSR and visual scope by component

| Component | Server assertions / presence | Visual scope |
| --- | --- | --- |
| Button | [S1](../tests/server.test.tsx#L5): native button type and anchor href | Shared gallery variants and example sizes |
| Badge | S1 includes Badge, but has no Badge-specific output assertion | Shared gallery variants |
| Card | S1 asserts contained title text; no assertion for every slot | Shared default-card compositions |
| Separator | S1 asserts semantic role and vertical orientation | Shared initial gallery orientation |
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
| Next | ALT-1 | Alert Dialog | Browser loops Tab/Shift+Tab across both boundaries, then verifies a nested dialog returns focus without escaping the parent. |
| Follow-up | TAB-1 | Tabs | Browser removes/reorders the focused trigger and verifies focus/selection; a force-mounted panel retains its edited draft. |
| Follow-up | CHK-1, SWT-1 | Checkbox, Switch | Each control passes canceled reset and changing explicit form ownership in both browsers, including unmount before pending reset work. |
| Follow-up | BTN-1, BDG-1 | Button, Badge | Browser proves focus/navigation of enabled links and disabled Button anchor nonactivation. |
| Follow-up | INP-1, TXT-1, LBL-1 | Input, Textarea, Label | Define supported native input-type scenarios; add Textarea resize/read-only/scroll checks and live label reassociation in browser. |
| Follow-up | CRD-1, SEP-1 | Card, Separator | Add compact/long-content Card layout assertions and a vertical Separator visual state. |
| Follow-up | SKL-1 | Skeleton | Actual Solid Loading resolution/unmount is exercised in a browser, separate from the manually toggled preview. |
| Cross-cutting | ALL-1 | All 14 | Add WebKit runs and inspect differences; a mobile viewport alone does not certify Safari or a touch device. |
| Cross-cutting | ALL-2 | All 14 | Add hydrate-then-interact scenarios, including live IDs, form values, selected panels and open/closed overlays. |
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
