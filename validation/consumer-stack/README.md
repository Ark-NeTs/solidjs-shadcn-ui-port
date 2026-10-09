# Isolated Solid 2 consumer

This harness is separate from library dependencies. It verifies actual Solid
Router `2.0.0-next.36` and TanStack Solid Query `6.0.0-rc.5` against the package's
Solid and web `2.0.0-rc.13` pins. Router next.37 and next.38 declare rc.14 peers;
using next.36 avoids overriding an incompatible peer requirement.

From the Solid package directory, prepare its isolated install once:

```sh
mkdir -p /tmp/solid-theme-consumer
cp validation/consumer-stack/package.json validation/consumer-stack/bun.lock /tmp/solid-theme-consumer/
(cd /tmp/solid-theme-consumer && bun install --frozen-lockfile --ignore-scripts)
node scripts/check-consumer.mjs
THEME_PORT=4403 bun run test:consumer
```

Set `CONSUMER_DEPS_DIR` to the installed `node_modules` directory when using a
different temporary location. No router/query dependency enters the component
package, no existing app changes, and the local service makes no network calls.
The committed lock records the exact nine-package consumer dependency tree.

The browser cases use public Button/Input/Label/Skeleton/Tabs/Dialog exports.
They assert Loading replacement, shell draft retention through intercepted native
links and browser history, query-cache remount without a refetch, a previous tab
retained during a pending query, and cancellation/reopening/resolution of query
content inside a modal. Diagnostic budgets remain enabled.

This is a client-side compatibility check, not authentication, real API, streaming
SSR, query-cache hydration or application migration acceptance.
