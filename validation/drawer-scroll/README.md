# Firefox native focus-scroll isolation

On 2026-10-09 the unmodified Drawer occasionally lost its explicit bottom scroll:
its body went from scrollTop 629 to 155, with identical dimensions and loaded fonts.
Moving focus to the handle alone did not prevent the pending native scroll.

A plain HTML input in an overflow container reproduced the overwrite (3878 to 184),
both with and without a native dialog. No Solid, Drawer, application script or CSS
framework was present. This establishes a native editor/focus-paint timing issue;
it does not establish which internal Firefox subsystem schedules the scroll.

Two animation frames after filling the input let that paint finish before the
independent programmatic scroll. All 24 measured repetitions (six per direction)
then reported full visibility and the expected final scroll offset. Production
Drawer is unchanged. The shared source/built test retains its viewport assertion,
snap keyboard checks, pointer dismissal and focus-return checks; it adds this
rendering boundary rather than retries, a timeout sleep or diagnostic suppression.

From this directory, with the package's development preview running:

- `node native-control.mjs` captures the independent native comparison.
- `THEME_URL=http://127.0.0.1:4399 node drawer-control.mjs` captures the original sequence.
- `SETTLED=1 THEME_URL=http://127.0.0.1:4399 node drawer-control.mjs` captures the corrected sequence.

The race is intermittent; a fresh baseline may not fail on every run. JSON captures
retain before/after offsets, rectangles, ancestors and visibility ratios. The final
full-suite commands and timings are in [catalog acceptance](../../docs/REMAINING-CATALOG-STATUS.md).
