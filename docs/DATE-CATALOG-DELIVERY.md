# Date and OTP catalog delivery

Calendar, Date Picker and Input OTP continue the [full catalog task](CATALOG-DELIVERY.md).
Final acceptance: [full catalog gates](REMAINING-CATALOG-STATUS.md).

## Kobalte first

At the unchanged alpha.2/rc.13 pins, Kobalte Calendar's original interaction
probe is supplemented by the [lifecycle diagnostics](validation/KOBALTE-LIFECYCLE.md):
untracked reads and relay writes remained after the isolated shared repairs.
Kobalte OTP's [earlier harness repair](validation/KOBALTE-OTP.md) passed its tested cases
only with cumulative Kobalte and transitive a11y distribution patches. Those are
not production dependencies. This group reuses that exact-pin evaluation and
ships owned calendar behavior plus one native OTP input; Date Picker composes
Calendar and the accepted Popover. No new upstream compatibility claim, corvu,
private package patch or diagnostic suppression.

## DELIVERY dispositions

| Criterion | Evidence and limits |
| --- | --- |
| State ownership | Calendar selection, visible month and day focus are separate; Date Picker open state is separate from host values. OTP has one native editable value. |
| Usable states | Empty/single/multiple/range, unavailable dates, bounded navigation, required selection, disabled/read-only code input, empty/populated code and canceled/rejected edits. |
| Recovery | Controlled rejection retains accepted values. Invalid OTP edits restore canonical text. No transport or automatic retries are introduced. |
| Async consistency | Deferred date focus/dismissal and OTP completion stop after disposal; stale completion tickets are ignored. Form resets honor cancellation and release pending work. |
| Platform boundaries | Standalone library; no AppApi, IPC or desktop adapter applies. |
| Reactivity/cleanup | Local-day arithmetic uses date fields instead of elapsed DST milliseconds. Timers/listeners follow owner and form lifetimes. Strict diagnostics remain enabled. |
| Keyboard/access | Gregorian date grid, selected states, day arrows/Home/End/month/year keys, RTL, native labels, OTP single tab stop and native forms. Light/dark enlarged axe and geometry. Manual screen readers unrun. |
| Customization | Shared unchanged tokens, caller classes, calendar part classes, locale and first-weekday props; responsive day sizing and wrapped form actions. |
| Structure/performance | Pure date helpers, calendar state, existing Popover and native input. No virtualization or frame-rate claims. |
| Tests | Units, source/built browser behavior, SSR, hydration and images; final results in the linked catalog report. No Electron application integration applies here. |
| Evidence | TEST-MATRIX and raw browser reports distinguish real clipboard interaction from synthetic unit events; final gate timings in the linked catalog report. |

## API boundaries

Calendar uses local Gregorian JavaScript Dates; pass immutable Date values and
provide a stable today/defaultMonth for deterministic SSR across midnight. Locale
is a BCP 47 string; weekStartsOn is explicit. Single/multiple/range modes, up to
twelve displayed months, bounds, disabled predicates and month dropdowns are
supported. This is not react-day-picker prop compatibility, non-Gregorian date
arithmetic, time-of-day editing, week numbers or arbitrary day-renderer injection.
Range selection rejects intervals containing an unavailable day.

Date Picker accepts Calendar props, selected/defaultSelected/onSelect and
open/defaultOpen/onOpenChange. Named hidden fields serialize local ISO dates;
multiple/range selections produce repeated name entries. required constrains
selection clearing; hidden fields do not provide native required validation.
Transport, booking availability and timezones remain consumer responsibilities.

InputOTP keeps a single real text field for labeling, keyboard selection, forms,
paste and one-time-code autocomplete. Slots and separators are decorative.
Patterns validate whole edits; pasteTransformer is optional. Completion follows
accepted full-length edits after the current event settles, and is canceled on
newer edits/disposal. Native clipboard paste is tested; actual SMS autofill,
password-manager badges and physical mobile keyboards remain manual checks.

## Verification

Exact final commands, durations and size: [full catalog verification](REMAINING-CATALOG-STATUS.md).

### Earlier date checkpoint

The final date revisions pass typecheck/lint, 283 package unit tests with 100%
statements/branches/functions/lines, 24 focused source browser tests, 27 focused
built/visual tests and 3 focused hydration tests. See the `catalog-dates-final-*`
reports. Review corrected native OTP caret settlement, cached Intl formatters,
content-sized popup geometry, disabled month dropdowns and multi-month year
navigation. Six images were visually reviewed and copied into documentation.

The earlier broad date-stage run stopped on a Firefox Drawer visibility assertion.
Two attempted test corrections were reverted. The owner authorized further work;
final passing full-suite results and the isolated native focus-scroll race are
recorded in the catalog report. Controlled month rejection is now unit-covered.
