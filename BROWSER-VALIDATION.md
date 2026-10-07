# Solid 2 browser validation — unpatched baseline, 2026-10-07

**Subsequent investigation:** [KOBALTE-LIFECYCLE.md](KOBALTE-LIFECYCLE.md) records
the isolated Escape cause and the tested harness patch for Escape/effect ownership.
The later [presence investigation](KOBALTE-PRESENCE.md) resolves Drawer/DialogRoot
feedback and relay diagnostics. [KOBALTE-DIALOG-IDS.md](KOBALTE-DIALOG-IDS.md)
then resolves plain Dialog untracked ID reads. [KOBALTE-OTP.md](KOBALTE-OTP.md)
records the later OTP repair and current matrix. The sections below preserve
the original unpatched findings and totals; use the follow-up for current status.

**The five primitives render and the production harness builds, but this
Kobalte/Solid combination is not ready for an unconditional acceptance.**
Four behavior/API failures reproduce in Chromium and Firefox, in both
development and production. Development also reports reactivity/ownership
diagnostics for Resizable, OTP and the Tabs consumer used to test Direction.

The reproducible [harness](validation/solid2-browser/README.md), pinned lockfile,
[development evidence](validation/solid2-browser/evidence/dev.json),
[production evidence](validation/solid2-browser/evidence/production.json), and
fixture screenshots are retained in this package. Execution and dependencies
were isolated in `/private/tmp/solid2-browser-validation`. No production
component, application manifest, root lockfile or library source was changed.

## Exact environment

| Dependency/tool | Version |
| --- | --- |
| `solid-js`, `@solidjs/web`, `@solidjs/signals` | `2.0.0-rc.13` each |
| `@kobalte/core` | `2.0.0-alpha.2` |
| `vite-plugin-solid` forwarding package | `3.0.0-next.27` |
| Resolved `@solidjs/vite-plugin` | `3.0.0-next.47` |
| `@solidjs/compiler`, `@solidjs/babel-plugin` | `2.0.0-rc.13` each |
| Vite | `8.3.3` |
| Playwright | `1.63.0` |
| Chromium | `153.0.8010.12` |
| Firefox | `155.0` |
| Bun / Node | `1.4.2` / `25.3.0` |

Public npm tags were rechecked before installation. `bun pm ls --all` showed
one resolved version each of Solid, web and signals: rc.13. Kobalte's peer
pins remain rc.3; the test override does not change upstream support claims.
The fixtures use Solid 2 JSX through Vite and `render` from `@solidjs/web`.
Both browser projects use a 1000×900 viewport and Europe/Istanbul timezone.

## Results by primitive

| Primitive | Passed probes | Unresolved findings |
| --- | --- | --- |
| Drawer | Initial focus; forward focus wrap; mouse snap to half-open then dismissal; scrollable child; portal/body-style/observed-target cleanup; close-button focus restoration and two open/close cycles; Chromium injected touch dismissal | **Escape does not close the open drawer.** Reproduces after the opening transition finishes, in both browsers and build modes. |
| Resizable | Controlled pointer sizing and geometry; arrow-key resizing; max constraint; Enter collapse/expand; vertical keyboard movement; no detached observed target after unmount | Development emits `STRICT_READ_UNTRACKED` and `NO_OWNER_EFFECT`. Passing the observer check does not prove disposal of the warned effects. |
| Calendar | Diagnostic-free mount; single pointer selection; unavailable date rejects a forced pointer click; month navigation; ArrowRight focus and Enter selection; range and multiple selection/deselection | No failure in these cases. Full calendar/localization, DST, SSR and shadcn API parity are not certified. |
| Input OTP | Typing and completion; external controlled value; dynamic disabled state; invalid-character rejection; Backspace; length limit; injected-style cleanup and remount; explicit wiring workaround | **Default Label is not associated with Input. Root `name="code"` produces no `code` entry in FormData.** Development also emits `STRICT_READ_UNTRACKED`. |
| Direction | Locale-derived RTL; nested English locale stays LTR; locale change updates direction and Tabs arrow navigation | **DOM `dir="rtl"` with `locale="en-US"` remains LTR inside Kobalte's direction context and keyboard logic.** Tabs also emits `EFFECT_RELAY_TEAR` in development. |

The failures were left as failing assertions. Totals include the original
44-case matrix and a separate two-browser close-button test added to exercise
the path that the Escape failure prevented from reaching. A fresh full run of
the retained suite discovers 46 cases per build mode.

| Build mode | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| Development | 31 | 14 | 1 |
| Production | 37 | 8 | 1 |

The development failures are four behavior/API cases × two browsers, plus
three diagnostics cases × two browsers. Production repeats all eight behavior
failures; turning off diagnostics therefore does not fix them. The skipped
case in each mode is Firefox CDP touch injection. No uncaught page exceptions
were recorded in the retained cases. No retries or expected-failure annotations
were used. Earlier exploratory runs exposed fixture-selector/timing mistakes;
those were corrected before the retained matrix and are not library findings.

## Reproducers and implications

### Drawer Escape

Open `/?case=drawer`, wait for opening to complete, and press Escape. The
controlled open state stays `true` and the dialog remains visible. Clicking
the close button changes it to `false`, removes the dialog, and restores focus.
The assertion also fails in the production bundle, so it is not just a
development diagnostic. The exact underlying cause is not established.

Kobalte's published DismissableLayer source registers an Escape shortcut and
checks the top layer before dismissal; investigate that path before adding a
second overlay library. This is now a concrete acceptance failure against
which a fix or a targeted corvu-next comparison can be tested. It is not yet
evidence that a corvu fallback is required or that it passes the same case.

### OTP field wiring

At `/?case=otp`, Root receives `name="code"` and the fixture uses the exported
Label and Input. The rendered input lacks the automatic association and form
name. Entering six digits and submitting produces `FormData.get('code') === null`.
Published OTP Input source does not register a form-control field or forward
the Root's name, consistent with these observations.

At `/?case=otp&wire=explicit`, the same fixture sets Label `for="explicit-code"`
and Input `id="explicit-code" name="code"`. Label lookup and native submission
then pass in both browsers and modes. That provides a tested public-prop
wrapper option; it does not fix the reactivity warnings or establish all form
semantics such as required-field validation/reset.

### Direction contract

`I18nProvider` derives direction from locale and exposes no separate `dir`
prop. The fixture's English-locale region inside a DOM RTL container has CSS
direction RTL, but its context remains LTR: ArrowLeft from the first tab wraps
to the third, instead of advancing to the second as in the Arabic-locale region.
This is a mismatch with the desired explicit-direction contract, not proof
that locale-derived RTL is broken. Resolve the package's public direction
contract before implementation; corvu has no documented replacement provider.

### Development diagnostics

Warnings are captured separately from uncaught errors in the retained JSON.
Resizable's published registration path creates a memo/effect while registering
a panel from an effect's apply phase; the browser reports `NO_OWNER_EFFECT`.
OTP reports reads of controlled value outside tracking. Direction's diagnostics
originate in the Tabs consumer/collection state, not evidence that I18nProvider
alone emits them. Root-cause fixes and reactive-effect disposal tests remain
open. No dependency patches or suppressed console messages were used.

### Calendar correction

The exact alpha's `dist/types/CfIQoHy3.d.ts` defines `DateValue = Date` and
describes Gregorian-only native dates without an explicit per-value timezone.
The previous map's internationalized-date-object claim was incorrect and is
corrected. These fixtures use local native dates fixed to October 2026.

## Commands and measured evidence

All commands below ran in the isolated scratch folder. Test durations come
from Playwright's JSON reports, install time from Bun, and build time from Vite.
The long-lived dev/preview server lifetime is not a test duration. Browser and
server launches needed sandbox escalation; the approved runs succeeded.

| Command | Outcome | Time |
| --- | --- | ---: |
| `bun install --ignore-scripts` | 120 packages installed in scratch | 4.360 s |
| `bun run build` | Production JSX/bundle build passed, 114 modules | 0.131 s |
| `RESULTS_FILE=dev-results.json bun run test` | 29 pass / 14 fail / 1 skip; exit 1 | 62.813 s |
| `HARNESS_URL=http://127.0.0.1:4400 RESULTS_FILE=production-results.json bun run test --output=production-test-results` | 35 pass / 8 fail / 1 skip; exit 1 | 49.142 s |
| `RESULTS_FILE=dev-close-results.json bun run test --grep 'drawer: close button' --output=dev-close-test-results` | 2 pass | 6.456 s |
| `HARNESS_URL=http://127.0.0.1:4400 RESULTS_FILE=production-close-results.json bun run test --grep 'drawer: close button' --output=production-close-test-results` | 2 pass | 4.952 s |
| `python3 -` — retained-file/evidence audit from this package | Harness source matches executed files; 92 case records, local links, five screenshots and source whitespace checked | 0.007 s |

Raw Playwright JSON, traces, failure screenshots and logs remain in the scratch
folder; temporary files can be removed by the system. The retained evidence
combines final case outcomes and diagnostic codes without requiring those
temporary files. Five production-fixture captures are saved:
[Drawer](validation/solid2-browser/evidence/screenshots/drawer.png),
[Resizable](validation/solid2-browser/evidence/screenshots/resizable.png),
[Calendar](validation/solid2-browser/evidence/screenshots/calendar.png),
[OTP](validation/solid2-browser/evidence/screenshots/otp.png), and
[Direction](validation/solid2-browser/evidence/screenshots/direction.png).
Drawer and Calendar captures were visually inspected; these are evidence of
diagnostic rendering, not theme parity or visual-regression approval.

## Delivery scope and remaining acceptance

- **Ownership/state:** fixture interaction state is local and controlled where
  applicable. Calendar output and OTP slots are derived. No backend data or
  editable server drafts exist in this harness.
- **Usable states/recovery/async:** focused, disabled, unavailable, open/closed
  and selected states are exercised where described. Network loading, errors,
  stale responses, mutations and retry recovery do not apply to these fixtures.
  This does not certify Solid async rendering or application state transitions.
- **Boundaries:** no AppApi, desktop APIs, IPC, router or server-cache layer is
  used. Electron/backend checks do not apply. Production D19 exports remain
  unimplemented.
- **Reactivity/cleanup:** the checks above provide partial evidence; the
  ownership warnings keep acceptance open. No full heap/listener/timer audit
  or nested-overlay lifecycle test was performed.
- **Keyboard/accessibility:** concrete keyboard cases are covered, with the
  Escape/OTP/Direction failures outstanding. No screen-reader or axe audit was
  performed. A passing keyboard test is not full accessibility certification.
- **Theming/structure/performance:** this is minimally styled test UI. Semantic
  production tokens, light/dark parity, font enlargement, narrow layouts,
  screenshot baselines and performance benchmarks were not evaluated.
- **Tests:** real Chromium/Firefox integration cases and Vite build ran.
  Package-wide `check`, `lint`, unit `test`, `test:integration`, `test:server`
  and application `test:e2e` scripts remain unavailable in the design-system
  package. The scratch `test` script is Playwright; it does not replace them.
  SSR/hydration, Vitest/testing-library cleanup, Dialog/Select Gate 0 tests,
  router/query compatibility, native clipboard/autofill/password managers,
  physical mobile devices and WebKit were not tested.
- **Evidence/decision:** the component map and compatibility report are updated.
  No corvu dependency was adopted and no new architecture decision is claimed.
  Gate 0 and full component acceptance remain incomplete.

Next, isolate/fix Drawer Escape and the ownership warnings, retain the tested
OTP wiring in the future wrapper contract, and decide how explicit direction
will reach Kobalte consumers. Rerun these same acceptance cases before either
approving Kobalte or evaluating a narrowly scoped corvu-next replacement.
