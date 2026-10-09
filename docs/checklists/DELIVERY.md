# UI delivery checklist

Applies to this standalone Solid 2 component library, its playground and documentation.
Application services remain consumer-owned; mark unrelated criteria N/A with reasons.

- [ ] **State has clear ownership.** Backend-confirmed data, editable drafts, and interaction state are separate. Derived values are computed rather than duplicated.

- [ ] **Every state is usable.** Loading, empty, ready, pending, and error states are defined. Unimplemented actions are absent or disabled with an explanation.

- [ ] **Failures have a recovery path.** Rejected changes restore the displayed canonical value; drafts survive errors. Retryable reads expose a working retry action. Uncertain mutations are never automatically repeated.

- [ ] **Async work stays consistent.** Duplicate submissions are guarded. Stale responses cannot replace newer selections or preferences. Responses arriving after unmount have no effect.

- [ ] **Platform boundaries hold.** Components accept data, state and callbacks through public props and signals. Requests, caches, routing and persistence remain consumer-owned. Browser APIs initialize only in client-safe scopes; server rendering does not access DOM globals. Examples use explicit local simulators or injected services.

- [ ] **Reactivity and cleanup are deliberate.** Calculations use derived state; effects synchronize external systems. Listeners, timers, observers, and subscriptions are disposed with their owning scope. Retries do not create duplicate subscriptions.

- [ ] **Keyboard and assistive access work.** Controls have accessible names, visible focus, and keyboard operation. Updates preserve sensible focus. Errors explain recovery, and status is understandable without color alone.

- [ ] **Appearance remains customizable.** Themeable colors and typography use semantic tokens. Light/dark modes, enlarged fonts, long filenames, narrow windows, and affected portals remain readable without clipped controls.

- [ ] **Structure and performance fit the feature.** Components have clear responsibilities; domain rules stay outside rendering code. Expensive operations do not block interaction. Performance claims have measurements using representative data.

- [ ] **Tests prove the behavior.** Regression tests cover the changed interaction and relevant failure transitions. Fresh `bun run check`, `lint`, `test`, `test:integration`, `test:server`, and `test:e2e` pass. Browser integration exercises source components; E2E uses freshly built assets. Run hydration checks when server/client continuity changes. Document which suites apply to the increment and disclose unrun checks.

- [ ] **Delivery evidence is accurate.** Record exact commands, outcomes, and measured durations in a right-aligned `Time` column. Update backlog/audit evidence, disclose unrun checks, and record lasting architectural changes in `DECISIONS.md`.
