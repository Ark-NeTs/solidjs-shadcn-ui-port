# Data Table delivery

Data Table now passes source-browser interaction and hydration checks in Chromium,
Firefox and WebKit without development diagnostics. Final package-wide evidence
and acceptance are recorded in [catalog status](REMAINING-CATALOG-STATUS.md).

Kobalte has no table model; its controls do not supply sorting/filtering or paging.
This implementation uses framework-independent `@tanstack/table-core@8.21.3`,
matching the v8 API generation, with owned Solid state and the accepted native
Table/Input/Checkbox/menu controls. No React adapter, second Solid runtime,
corvu dependency, fetching or server cache is introduced.

## Resolved adapter and hydration failures

The original proxy made consumers subscribe to every core option/state read.
Core caching does not establish Solid dependency boundaries. Each state slice,
option and model now has an owned memo; shallow-equal immutable slices preserve
identity. Page selection has its own derived value. This removed the reproduced
`WIDE_SCOPE_DEPS` and `UNSTABLE_MEMO_OUTPUT` warnings without filtering them.

Hydration exposed inconsistent allocation order from JSX attribute derivations.
Header and row components now establish selection/sort memos before rendering.
Each data row owns its native `<tr>` bindings; wrapping that row in a second
component had let the parent body subscribe to 42 sources at 20 rows. The native
row boundary removes that diagnostic while preserving the shared row classes.
All three engines preserve the server nodes and IDs, then sort, filter, select,
paginate and dispose the table. Native filter/page-size controls restore canonical
values after controlled rejection and ignore detached elements. Grouped headers
reserve one selection column with the correct row span. A custom current page
size remains represented even when omitted from the offered size list.

## API boundaries

`DataTable` supplies local global filtering, column sorting/visibility, selection,
pagination, loading/empty/error states and an explicit retry callback.
`createDataTable` exposes the core instance for custom compositions; `flexRender`
renders plain content or owned Solid formatters. State slices in `state` remain
caller-owned, and omitted slices are local. Supply immutable data/options and
stable `getRowId` values to retain record identity. `initialState` is an initial
snapshot, not a reactive reset API. Column definitions use the TanStack v8 types.

Data fetching, stale-response policy, persistence, virtualized rows, column drag
reordering and application mutation workflows are outside this composition.
There is no large-dataset performance or React adapter compatibility claim.

## DELIVERY dispositions

| Criterion | Evidence and limits |
| --- | --- |
| Ownership | Controlled and local state slices, immutable row replacement, stable row elements and serialized core state are unit-tested. |
| States | Loading, empty, error with retained data, filtering, sorting, mixed selection, grouped headers and paging are asserted. |
| Recovery | Rejected sort/filter/page-size changes retain canonical state; explicit retry and clear/append/remount are verified. |
| Async consistency | No transport; caller owns request ordering, loading and retries. |
| Platform boundaries | Browser library only; no AppApi/IPC/desktop service. |
| Cleanup | Detached native controls receive no deferred write; owner disposal/remount and strict browser diagnostics are tested. |
| Keyboard/access | Native sort/menu/select/page controls and checkbox semantics; enlarged light/dark axe checks pass. Manual assistive-technology work is unrun. |
| Customization | Semantic wrappers and unchanged shared tokens; reviewed light/dark/mobile images show horizontal record scrolling without page overflow. |
| Structure/performance | Memo boundaries isolate core model subscriptions. Representative gallery has 24 rows; no benchmark claim. |
| Tests | Unit contracts, source/built browser assertions, SSR, hydration and three visual baselines; final package totals linked above. |
| Evidence | Exact final commands/durations and coverage are recorded in the catalog status; earlier failure JSON remains historical evidence. |

[Source](../src/components/ui/data-table.tsx), [units](../tests/unit/catalog-data-table.test.tsx),
[browser contracts](../tests/catalog-data-table.ts),
[initial failure](evidence/catalog-data-table-focused.json),
[initial source repair](evidence/catalog-data-table-repair.json),
[row-boundary regression](evidence/catalog-data-table-render-boundary-failure.json),
[final source results](evidence/catalog-final-integration.json),
[hydration repair](evidence/catalog-data-table-hydration.json).
