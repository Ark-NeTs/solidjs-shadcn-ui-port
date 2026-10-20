# Isolated Solid 2 consumer

This harness is separate from library dependencies. It verifies actual Solid
Router `2.0.0-next.36` and TanStack Solid Query `6.0.0-rc.5` against the package's
Solid and web `2.0.0-rc.13` pins. Router next.37 and next.38 declare rc.14 peers;
using next.36 avoids overriding an incompatible peer requirement.

From the Solid package directory, prepare its isolated install once:

```sh
(cd validation/consumer-stack && bun install --frozen-lockfile --ignore-scripts)
node scripts/check-consumer.mjs
THEME_PORT=4403 bun run test:consumer
```

Set `CONSUMER_DEPS_DIR` to the installed `node_modules` directory when using a
different install location. No router/query dependency enters the component
package and no existing app changes. The original compatibility service makes
no network calls; the HTTP workflow below uses a separate loopback service.
The committed lock records the exact nine-package consumer dependency tree.

The browser cases use public Button/Input/Label/Skeleton/Tabs/Dialog exports.
They assert Loading replacement, shell draft retention through intercepted native
links and browser history, query-cache remount without a refetch, a previous tab
retained during a pending query, and cancellation/reopening/resolution of query
content inside a modal. Diagnostic budgets remain enabled.

This is a client-side compatibility check, not authentication, production API,
streaming SSR, query-cache hydration or application migration acceptance.

## HTTP-backed Data Table editor

The `/workflow?session=<id>` route composes public Data Table, Dialog, Input,
Label and Button exports with an application-owned Query cache and a loopback
HTTP service. `workflow.spec.ts` creates a fresh server session per case; neither
`fetch` nor the UI component implementations are mocked. State survives browser
reloads for the lifetime of that Vite server. This is a controlled integration
fixture, not an existing production application's backend or database.

The workflow checks server-normalized names/prices, stable row selection, native
keyboard opening/focus return, Query cache reuse across routes, full-reload
persistence, explicit rejection/retry, duplicate-submit guards, a version conflict,
and an unreadable acknowledgement after the server commits. Unknown writes stay
blocked across editor/route remounts until a full reload reads confirmed state.
Rejection states also pass axe and 390px layouts with 24px text in both themes.
The local protocol returns application rejection envelopes over HTTP 200; network
outages, HTTP error statuses, authentication and production concurrency are not
certified by those cases. Server control/state endpoints exist only for tests.

Query rc.5 reconciles records into stable store proxies. TanStack Table core
caches accessor values using immutable row identity. The consumer therefore
creates tracked, plain row snapshots before passing Query data to Data Table.
Passing the reconciled proxies directly produced stale name/price cells after
an accepted save. The successful-save and explicit-retry cases assert the cell
text and authoritative server state, so updated action labels alone cannot pass.

Run the entire consumer suite against source and freshly built exports,
**sequentially**:

```sh
node scripts/check-consumer.mjs
THEME_PORT=4403 bun run test:consumer
THEME_PORT=4403 CONSUMER_BUILT=1 bun run test:consumer
```

Built mode first rebuilds the library, then resolves the UI imports to its ESM
barrel. The consumer/router/query application still runs in Vite; this mode does
not claim an independently packaged production application build. No new
primitive or production dependency is adopted. See the
[workflow delivery report](../../docs/delivery/CONSUMER-WORKFLOW-DELIVERY.md).
