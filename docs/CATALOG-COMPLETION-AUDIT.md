# Catalog completion audit — 2026-10-09

The planned **65 of 65 component families are implemented**, including Drawer
and Data Table. This audit reconciles the dated catalog against the current
source and exports; it does not add new runtime components or change their APIs.
The original 2026-10-07 inventory is the scope, not a new live upstream snapshot.

Two regression checks now run in the normal unit suite:

- All 65 unique map entries must match the source directory, expose public source
  subpaths, and retain every runtime export's identity through the root barrel.
- All sibling component modules (currently 60) must retain their value export
  names. The only exception is the already documented React ref-object
  `useComboboxAnchor` hook; Solid Combobox owns input/trigger anchoring internally.

The five former engine/controller gaps are implemented: Carousel uses Embla,
Chart uses Chart.js, Data Table uses TanStack Table core, and Scroll Area and
Message Scroller own their scrolling behavior. The component map now labels
those delivered choices instead of calling them unresolved. Earlier “All 24”
acceptance-register labels now refer to the full catalog. Historical probe
failures remain preserved as evidence of the Kobalte-first evaluation.

## Fresh verification

Commands ran from `packages/shadcn-solidjs-theme`; wall times were measured.

| Exact command | Outcome | Time |
| --- | --- | ---: |
| `bun run check` | Passed | 4.988 s |
| `bun run lint` | Passed | 2.341 s |
| `bun run test` | 382 passed, including two full-catalog regressions | 9.298 s |
| `bun run test:server` | 24 passed | 1.563 s |
| `bun run parity:admin` | 35 names / 14 subpaths / 42 admin files; none missing | 0.476 s |

[Raw command results](evidence/catalog-completion-commands.json).
Full diff review, local documentation links and whitespace were checked.

No component, playground, theme, dependency or production build configuration
changed. Browser integration, built E2E/visual, hydration, coverage and builds
were not rerun for this test/documentation-only audit. Their previous passing
[full-catalog evidence](REMAINING-CATALOG-STATUS.md) remains applicable to the
unchanged runtime: 609 source browser runs, 618 built runs, 132 hydration runs
(including three negative controls), and 100% component/helper code coverage.
Those counts do not mean every possible behavior has been exercised.

## DELIVERY checklist disposition

| Criterion | Disposition for this audit |
| --- | --- |
| State ownership | No state implementation changes; per-family reports retain ownership evidence. |
| Usable states | All planned families have documented states/contracts; inventory tests prevent omitted families/exports, not all missing state cases. |
| Recovery | No failure-handling changes; existing recovery cases remain linked in the test matrix. |
| Async consistency | No async runtime changes; no new submissions or request handling. |
| Platform boundaries | No AppApi, IPC, desktop adapter or application changes; not applicable to the static inventory. |
| Reactivity and cleanup | No reactive runtime changes; TypeScript export inspection does not execute the sibling React modules. |
| Keyboard and assistive access | Existing browser/axe evidence retained; manual assistive-technology checks remain open. |
| Customizable appearance | No style/token changes; existing token parity tests passed, visual evidence retained. |
| Structure and performance | Checks cover real modules and barrel identity; no new UI performance claims or measurements. |
| Behavioral tests | Fresh typecheck/lint/unit/server/import gates passed; broader runtime suites were not repeated for unchanged UI. |
| Accurate evidence | Dated inventory, exact commands/durations, omitted checks and remaining limits recorded here; no architecture change requiring a new decision. |

## Remaining limits

The [test matrix](TEST-MATRIX.md) retains manual screen-reader, physical touch,
IME/SMS/password-manager, extended SSR/visual variants and actual admin
router/query/application composition checks. Consumer bundle splitting and
large-dataset performance remain unmeasured. Public export-name availability is
not full React/Radix/Vaul/Base UI prop or behavior compatibility; the
[component guide](components.md) documents the supported contracts.

The subsequent [admin form and Data Table composition](ADMIN-MENU-DELIVERY.md)
is verified. The [documentation website and isolated consumer check](PROJECT-COMPLETION.md)
complete the next package-delivery work; actual admin migration remains separate.
