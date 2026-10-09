# Public documentation deployment

Keep the current Solid + Vite site. **Vitest is the unit-test runner**, not a host
or site generator. If you meant VitePress, it uses Vue; migrating this Solid
component playground is unnecessary for deployment.

Recommended host: **Cloudflare Workers Static Assets**. Cloudflare recommends
Workers for new static sites. Static-asset requests are free and unlimited under
its current pricing; build limits and account conditions still apply. This site
needs static files only, without a Worker script or a server-side Solid adapter.
Sources checked 2026-10-09: [Cloudflare recommendation](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/),
[asset pricing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/),
[Vite static builds](https://vite.dev/guide/static-deploy.html),
[Vitest](https://vitest.dev/guide/), [VitePress](https://vitepress.dev/guide/what-is-vitepress).

## Build the reviewed artifact

Use Bun 1.4.2 and Node >=22.12.0. From this package directory, follow the
[repository installation](../README.md#environment-and-secrets) if dependencies
are missing. Dependencies install directly in this standalone repository.

```sh
bun run build:site
```

Only `site-dist` is deployable. The build generates curated documentation, builds
the library and site, then checks every emitted file. It rejects raw evidence,
instructions, source maps, local filesystem paths, broken local assets, files
larger than 25 MiB and more than 20,000 assets. Generated files are ignored by Git.
The ordinary `playground-dist` includes internal project material and must not be
published as the public website.

Routes: `/` is documentation, `/?component=button` is a component page,
`/playground?catalog-data-table` is a live example and `/legal/LICENSE.txt` is the
MIT notice. `/legal/THIRD-PARTY-NOTICES.txt` preserves installed dependency and
font licenses; pinned upstream notices cover packages whose published archives
omit the license file. Unknown file paths return the custom 404 page. The host configuration
serves extensionless HTML and preserves query strings. A dedicated hostname or
subdomain is required; deployment under a shared URL path prefix is not supported.

Public guides use client-side rendering. This increment does not add prerendered
component HTML, full-text search indexing, per-component social cards or a domain
specific sitemap. Those can be added if search visibility becomes a release goal.

## Install the pinned deployment tool

Wrangler is separate from library dependencies. Its manifest and lock are in
`deployment/`; no package or application runtime dependency is changed.

```sh
deploy_tools_dir=$(mktemp -d "${TMPDIR:-/tmp}/solid-docs-deploy.XXXXXX")
cp deployment/package.json deployment/bun.lock "$deploy_tools_dir/"
(cd "$deploy_tools_dir" && bun install --frozen-lockfile --ignore-scripts)
export WRANGLER_BIN="$deploy_tools_dir/node_modules/wrangler/bin/wrangler.js"
export WRANGLER_LOG_PATH="$deploy_tools_dir/wrangler.log"
export WRANGLER_SEND_METRICS=false
THEME_PORT=4403 bun run test:site
```

The browser test starts Wrangler locally after building; it never logs in or
publishes. It includes Chromium, Firefox and WebKit; install Playwright browsers
first using the package's usual test setup. For interactive inspection:

```sh
node "$WRANGLER_BIN" dev --local --port 4403
```

## Publish after selecting the account and hostname

No account, domain, token or production route is configured here. No login,
remote resource creation, CI change or publication was performed during preparation.
Review the Worker name `arknet-solid-ui-docs` in `wrangler.jsonc` before first use.
After explicitly choosing the destination, the operator can run:

```sh
bun run build:site
node "$WRANGLER_BIN" deploy --dry-run --outdir /tmp/solid-docs-upload-check
node "$WRANGLER_BIN" login
node "$WRANGLER_BIN" deploy
```

`deploy --dry-run` validates packaging without uploading. `login` accesses your
Cloudflare account; the final `deploy` publishes. Add the chosen custom domain in
Cloudflare after verifying the generated `workers.dev` address. The package's
`private: true` flag remains: website deployment does not publish an npm package.

For a future GitLab integration, choose the reviewed branch/commit explicitly:
local `main` may be ahead of the remote. Configure the same build command and
pinned toolchain, with an isolated package install. No pipeline is created here.

## Acceptance and rollback

On the remote preview, repeat root/deep-link refresh, component search, an example
interaction, dark/mobile appearance, license retrieval and a missing-page request.
Confirm HTTPS and the custom domain after DNS settles; local tests cannot certify
those account/network operations. HTML and JSON revalidate; hashed assets cache
for one year. Screenshots revalidate to avoid stale unversioned image names.

Keep the previously deployed artifact or commit. If a release fails acceptance,
redeploy that known-good artifact/commit through the same Worker; do not rewrite
Git history. [Measured preparation evidence](DEPLOYMENT-DELIVERY.md) records what
was actually checked before publication.
