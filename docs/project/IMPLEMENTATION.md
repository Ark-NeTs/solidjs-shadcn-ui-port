# Solid 2 implementation status

All 65 component families in the [catalog map](COMPONENT-MAP.md) have source,
examples and documented contracts. See the [completion report](../PROJECT-COMPLETION.md)
and [test matrix](../TEST-MATRIX.md) for measured acceptance and remaining limits.
This plan applies only to the standalone repository.

## Delivered foundation

- Shared semantic light/dark tokens, class utilities, public source subpaths and
  a built ESM/declaration boundary. Captured reference fixtures guard token,
  class and export parity without requiring another checkout.
- Owned Solid 2 state and native semantics for most components. Kobalte was
  evaluated first; Toggle uses its accepted adapter. Primitive investigations
  remain isolated from production. No corvu fallback is currently required.
- Engine adapters for Carousel, Data Table and Chart, with package-owned cleanup
  and explicit Solid APIs. Applications retain routing, cache and service policy.
- Unit, server, source-browser, built-browser and hydration coverage, with
  representative visual and accessibility checks. Documented scope limits remain
  explicit rather than being hidden by coverage percentages.
- A Solid + Vite documentation site, live previews, screenshots and the theme
  generator. The public build has a curated content boundary and local provider
  tests; registry publication and hosted deployment remain separate actions.
- A realistic local form/Data Table composition and an isolated router/query
  consumer harness. Neither requires the former application's source or services.

## Continuing work

Follow the [specification](specs.md) and [delivery checklist](../checklists/DELIVERY.md)
for future changes. Use the test matrix's open cases and the completion report's
release decisions to select the next increment. Evaluate Kobalte first when a
new primitive is needed, document API limits, and verify affected compositions.

Keep active guides independent of the former workspace. Historical reports
remain dated evidence; they do not reinstate old application rules or approvals.
