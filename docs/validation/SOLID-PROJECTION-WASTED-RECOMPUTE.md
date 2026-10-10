# Solid projection reported as wasted recompute — 2026-10-10

**Status:** draft upstream issue for `solidjs/solid`, not yet filed. Reproduced with
`solid-js` and `@solidjs/signals` 2.0.0-rc.13, Node 25.3.0, macOS 15.

## Summary

The attribution engine reports `WASTED_RECOMPUTE` for a `createProjection` whose
every run changes the projected store. The diagnostics guide recommends exactly
this pattern for one-of-many selection: a keyed map built with `createProjection`,
read as `open[key]`, so only the keys that flip notify. With the default run rules
and a 0ms budget, the projection is flagged after five switches, while a
per-key-memo version with genuinely discarded runs is not.

## Reproduction

[`validation/solid-projection-repro/repro.mjs`](../../validation/solid-projection-repro/repro.mjs)
uses only `solid-js` and `solid-js/attribution`. From the repository root:

```sh
node --conditions=browser --conditions=development validation/solid-projection-repro/repro.mjs
```

It enables attribution with
`wastedRecompute: {minRuns: 5, ratio: 0.8, budgetMs: 0, windowMs: 1000}`, switches
one active key among `a`, `b` and `c` six times, and compares:

1. **Projection:** `createProjection(draft => { delete stale keys; draft[active()] = true }, {})`,
   read by one effect per key.
2. **Control:** one `createMemo(() => active() === key)` per key.

Output:

```text
projection: 15 effect updates
  [WASTED_RECOMPUTE] memo "projection.open" re-ran 5 times in 1000ms and 5 of those produced the same value — 0.5ms of compute the equality gate then discarded. …

per-key memos: 15 effect updates
  no WASTED_RECOMPUTE
```

Both versions deliver the same 15 effect updates. With `log` enabled, the trace
shows that each projection run writes two child signals while the run itself is
recorded as unchanged:

```text
[why-run] memo "projection.open" ran (run 1, 0.26ms, unchanged)
    ← signal "projection.active" write (#1) "a" → "b"
[why-run] effect "effect" ran (run 1, 0.03ms)
    ← signal "projection.open.a" write (#2)
[why-run] effect "effect" ran (run 1, 0.03ms)
    ← signal "projection.open.b" write (#3)
```

## Expected

A projection run that writes to its store should count as a changed result, or
projections should be excluded from `WASTED_RECOMPUTE`. Only runs that leave the
store untouched were discarded work.

## Likely cause

The check compares the projection computation's committed value, which is the
stable root proxy. Store writes made during the run land through the adoption
channel and are not considered.

## Impact here

Following the guide's advice moves the finding instead of removing it. This
project tried a keyed projection for Menubar open state and for the Slider thumb
count; both were flagged in Chromium, Firefox and WebKit at the 0ms probe budget.
Both components keep their original per-item comparisons, which cost 0.0–0.1ms.
See "Menubar and Slider reruns" in [DECISIONS.md](../project/DECISIONS.md).
