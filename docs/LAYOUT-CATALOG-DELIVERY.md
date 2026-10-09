# Layout catalog delivery

Resizable, Scroll Area, Carousel and Message Scroller continue the full catalog
request. Final acceptance: [full catalog gates](REMAINING-CATALOG-STATUS.md).

## Kobalte first

The unchanged alpha.2 / Solid rc.13 Resizable probe covers pointer constraints,
keyboard collapse and orientation. Its unpatched ownerless computations and
untracked reads, followed by an unstable memo warning after harness repairs, are
recorded in [browser validation](validation/BROWSER-VALIDATION.md) and
[lifecycle evaluation](validation/KOBALTE-LIFECYCLE.md). Those private patches are not
production dependencies. The package owns adjacent percentage panel sizing.

Kobalte has no Carousel engine, custom Scroll Area primitive or Message Scroller
controller; see the catalog map. Carousel uses the framework-independent
[Embla 8.6 core](https://www.embla-carousel.com/docs/v8), with a Solid lifecycle
adapter. Its options/plugins remain behind the package API; no Solid 1 or React
adapter is installed. Native overflow owns scrolling, with measured custom
scrollbars. Message Scroller owns following and visible-item anchor preservation.
No corvu dependency or diagnostic suppression is added.

## DELIVERY dispositions

| Criterion | Implementation and evidence |
| --- | --- |
| State ownership | Panel layouts may be controlled; Carousel delegates geometry to one engine; scroll state comes from native DOM; message data remains host-owned. |
| Usable states | Constrained/collapsed/rejected panels; overflowing and short content; both scrollbar axes; carousel ends and dynamic slides; following and interrupted message history. |
| Recovery | Controlled rejection leaves panel layout unchanged; pointer cancellation releases capture; unmount/remount releases engines and observers. |
| Async consistency | Resize/content observation does not fetch data; message growth follows only while the reader remains at the end. |
| Platform boundaries | Standalone library, no AppApi/IPC/desktop service. |
| Reactivity and cleanup | Engine instances, resize/mutation observers and captured gestures have explicit lifetimes; strict diagnostics remain enabled. |
| Keyboard/access | Separator ranges, scrollbar ranges, carousel buttons/arrow navigation and native message scrolling; focused browser/axe checks pass in all three engines. |
| Customization | Shared tokens unchanged; inherited direction, orientations and caller classes. |
| Structure/performance | Pure percentage/geometry helpers; third-party carousel engine is framework-independent. No frame-rate or virtualization claims. |
| Tests | Package units reached 305 passing and 100% coverage; focused source 24, built 27 and hydration 3 passed. Shared server 19 passed. Final full-suite results are linked above. |
| Evidence | Final commands, exact times and size are recorded in the full catalog report; screenshots are in docs/screenshots. |

## API boundaries

ResizablePanelGroup accepts layout/defaultLayout/onLayout percentage arrays,
orientation (direction alias), and disabled. Panels accept relative defaultSize
weights and percentage minSize/maxSize constraints. Handles support keyboard
steps, Home/End, Enter collapse, and primary pointer capture. There is no
persisted-layout storage, intersection handle, pixel-unit API or React ref API.
Provide a complete defaultLayout for deterministic initial percentage metadata.

ScrollArea owns an automatic viewport and vertical scrollbar; scrollbars can be
horizontal, both or false. Explicit ScrollBar children share its viewport.
viewportProps/viewportRef customize the native scrolling element. The two overlay
tracks meet at the corner; there is no Radix visibility-animation state machine.

Carousel exports the sibling family names plus framework-independent option and
plugin types. useCarousel exposes accessors. setApi receives the live engine and
undefined on disposal. Replacing orientation/options/plugins creates a new engine;
application-owned state can supply startIndex when preserving a selected snap.
Autoplay is opt-in through an Embla plugin; no automatic motion is installed.

MessageScrollerProvider wraps Root/Viewport/Content/Item/Button. Follow is enabled
by default, suspended when the reader scrolls away, and resumes at the end.
Stable item elements preserve a visible anchor when history is prepended.
Hooks expose reactive visibility and navigation. There is no virtualized message
store, networking, persistence or React helper prop compatibility claim.

## Focused checkpoint

Dark screenshot review found a missing theme wrapper; corrected it and asserted the dark scope in the browser accessibility scenario. Refreshed and reviewed all three images, copied to docs/screenshots. The final screenshot run (`RESULTS_FILE=docs/evidence/catalog-layout-visual-final.json bun run test:e2e tests/e2e/visual.spec.ts --grep 'Layout catalog compositions' --update-snapshots=all`) passed 3 checks in 6.46 seconds. The earlier post-wrapper built invocation matched 48 checks, all passing in 54.0 seconds; it did not include the visual cases. Evidence filenames describe checkpoints, not a clean full-suite acceptance.
