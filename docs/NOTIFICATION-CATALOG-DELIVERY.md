# Toast and Sonner delivery

Toast and Sonner are accepted within their documented contracts. Final commands, durations and coverage: [catalog acceptance](REMAINING-CATALOG-STATUS.md).

## Kobalte first

The unpatched alpha.2 / rc.13 [Toast probe](../validation/solid2-toast/README.md)
passes show/update/dismiss/expiry/unmount in Chromium and Firefox but reports
IMMUTABLE_UPDATE_IN_STORE in both and STRICT_READ_UNTRACKED in Chromium.
No private distribution patch or diagnostic filter is adopted. Toast uses
owned DOM/timer behavior; Sonner is a package-owned notification service and
composition, not the React sonner runtime. Corvu is unnecessary for this scope.

## DELIVERY dispositions

| Criterion | Evidence and limit |
| --- | --- |
| Ownership | Controlled Toast open values retain authority; the service stores immutable records by ID; queue snapshots do not create reactive roots. |
| Usable states | Normal/success/info/warning/error/loading, bounded FIFO queue, update by ID, dismissed, expired, absent viewport and remount. |
| Recovery | Rejected dismissal preserves content; an action that throws does not remove its notification. Producers own recovery and retries. |
| Async consistency | Promise outcomes require the same live record; dismissal/replacement invalidates late outcomes. No fetching or automatic retries. |
| Platform boundaries | No AppApi, IPC, desktop bridge, transport or persistence. Server producers retain no request data. |
| Cleanup | Component owners release expiry timers, focus/visibility listeners and store subscriptions. Explicit stores can outlive a viewport and retain queued records until dismissed. |
| Keyboard/access | Named regions, status/alert announcements, F8 entry, Escape and named close/action buttons, focus return, pause while reading. Native accessibility checks; manual screen-reader behavior unrun. |
| Customization | Semantic tokens, inherited theme, viewport positions, caller classes, narrow enlarged text and light/dark/mobile screenshots. |
| Structure/performance | Single expiry timer per visible notice; queued records have no timers. No throughput benchmark or animation physics claim. |
| Tests | Unit ownership/timer/promise cases, source/built browser interactions, server no-write assertions and hydration node reuse. Final full-suite results: [catalog acceptance](REMAINING-CATALOG-STATUS.md). |
| Evidence | Focused result files in docs/evidence; exact final command timings are recorded in the linked catalog report. |

## Public API boundaries

ToastProvider supplies duration (5000 ms default). ToastViewport supplies the
named region and F8 shortcut. Toast, ToastTitle, ToastDescription, ToastAction,
and ToastClose compose content; open/defaultOpen/onOpenChange own visibility.
The change callback reports timeout or dismiss. Duration 0/Infinity is persistent.
Hover, keyboard focus, document visibility and active swipes pause the timer.
Swipe dismissal supports four axes and a configurable threshold; it does not
implement a drag animation. Nondismissible notices still expire if duration is finite.

Toaster renders the first visibleToasts (default 3) records. toast is callable
with success/info/warning/error/loading helpers; dismiss removes one ID or all.
createToastStore creates an isolated producer/viewport scope. promise accepts an
already-created Promise and loading/success/error labels; it observes completion,
not cancellation of application work. Callbacks distinguish timeout from explicit
dismissal. Updating an ID replaces its options as well as text. Default generated
IDs skip active caller-supplied numeric IDs. Mount one viewport for each store;
multiple viewports would intentionally duplicate announcements. Unmounting a
viewport releases listeners but retains its store; use an isolated store and
explicit dismissal when ending a screen's notification lifetime.

Theme tokens follow DOM ancestry; theme="dark" can introduce a dark scope, while
light/system inherit the host scope. No global theme manager is installed. This
is an explicitly scoped Solid API, not full Radix Toast or React Sonner prop compatibility.

[Units](../tests/unit/catalog-notifications.test.tsx),
[browser contracts](../tests/catalog-notifications.ts),
[examples](components.md#toast-and-sonner),
[light screenshot](screenshots/catalog-notifications-light.png),
[dark screenshot](screenshots/catalog-notifications-dark.png),
[mobile screenshot](screenshots/catalog-notifications-mobile.png).
