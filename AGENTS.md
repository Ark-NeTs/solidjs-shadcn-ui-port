# SolidJS theme package

## UI delivery requirements

These instructions apply to this package and its subdirectories.

Read [specs.md](specs.md) for the implementation scope and current owner
decisions. Evaluate Kobalte first for every primitive, including Drawer and
Resizable. Consider corvu only for a documented gap in Kobalte, subject to
the Solid 2 compatibility checks there. Do not add corvu preemptively.

Use [COMPONENT-MAP.md](COMPONENT-MAP.md) for the full catalog, initial Kobalte
mapping, unresolved behavior gaps, and corvu fallback criteria. Update it when
implementation or verification changes a mapping; a mapped API is not proof
that a component has passed its acceptance tests.

Before implementing or modifying UI in this package, read
[DELIVERY.md](DELIVERY.md) and use its checklist as the acceptance criteria.

Before declaring the work complete, review every checklist item. Report
verification evidence, unmet criteria, and any items that do not apply, with
reasons. Disclose checks that were not run.

Maintain [docs/TEST-MATRIX.md](docs/TEST-MATRIX.md) when adding or changing components.
Link acceptance requirements to actual test assertions and keep unverified gaps
explicit; shared coverage and unit percentages do not certify every behavior.

Keep DELIVERY.md as a reusable checklist; record task-specific results in the
delivery report.

## User-facing responses

End every response to the user with one concise, natural follow-up suggestion
for the next course of action. Make it specific to the current task and its
progress, with a concrete next step that advances the user's goal.

## Standalone repository

The repository root is `~/GitHub/solidjs-shadcn-ui-port`. All source, documentation,
playground, deployment and validation tools live here. Do not depend on files from
the former restaurant-management checkout. Historical delivery records retain
their original paths.

Run `bun run check`, `bun run lint`, `bun run test`, and `bun run test:server`.
Use isolated `THEME_PORT=4403` for browser suites so the development server on 4399
stays available. Run browser suites sequentially. Install deployment tools with
`(cd deployment && bun install --frozen-lockfile --ignore-scripts)`. The optional
router/query consumer has its own install in `validation/consumer-stack`.

`bun run parity:admin` checks the captured admin import contract in
`validation/admin-imports`; `--app-root <directory>` checks a current external app.
