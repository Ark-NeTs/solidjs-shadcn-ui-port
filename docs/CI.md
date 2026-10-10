# Continuous integration

[GitHub Actions CI](../.github/workflows/ci.yml) runs on pull requests targeting
`main` and on manual dispatch; topic branches get CI by opening a pull request.
Merges to `main` do not start another run: the ruleset only merges pull requests
that are up to date with `main`, so the merged tree is the one the pull request
already tested. Use **Run workflow** to recheck `main`, for example after an
administrator bypass. New runs cancel older runs for the same pull request. There
are no publishing, account-login or deployment steps.

The repository ruleset “Protect main: require CI” requires a pull request into
`main` and all 17 jobs below (the two core jobs and the 15 browser matrix jobs) to
pass while up to date with `main`. Force pushes and deletion of `main` are blocked;
administrators may bypass. Rename a job only together with the ruleset's required
check names, or merges will wait for a check that never reports. Cloudflare's
deployment check runs only on `main` and must not be required.

## Checks

| Job | Runner | Acceptance |
| --- | --- | --- |
| Types, lint, units and SSR | Ubuntu 24.04 | Typecheck, lint, unit coverage thresholds, server rendering and the captured public-import contract |
| Browser / Chromium, Firefox, WebKit | macOS 15 arm64, one isolated job per engine, suite and source shard | Full source integration, built E2E, existing Chromium visuals, hydration and isolated router/query consumer |
| Documentation and public artifact | Ubuntu 24.04 | Guide examples, Markdown generation, three-engine navigation/accessibility and a fresh public build tested through the local provider |

Each job installs Bun 1.4.2, Node 25.3.0 and frozen dependencies. External actions
are pinned to reviewed release commits. Browser downloads match the pinned
Playwright package. Standard `macos-15` and `ubuntu-24.04` runners are used;
there are no larger-runner labels. macOS 15 matches the platform used to review
the committed visual baselines. Runner images still receive provider updates.

Each browser job runs one suite on its own runner and port 4403, with one worker,
no retries and strict console diagnostics. The development profiler uses a CI-only
32 ms accumulated compute budget per one-second window; local development keeps
Solid’s 8 ms default. Hosted findings varied across unrelated scopes (8–15 ms),
so this timing limit allows runner variance without disabling performance checks.
All emitted warnings and errors remain fatal; this is not a production performance
benchmark. Separate source, built, hydration and consumer jobs report independently
so a failing suite cannot skip another. Source integration runs in two shards per
engine, each with one worker; Playwright distributes the full suite without
skipping tests. Source shards allow 20 minutes, other full suites 15 minutes and
consumer checks two minutes, within a 25-minute browser-job limit. Individual suite timeouts leave room for
artifact upload before the job timeout. Source, E2E, hydration, consumer and
documentation outputs have separate folders so a later suite cannot erase an
earlier failure report.

## Failure evidence and retention

Playwright already keeps traces on failure and takes failure screenshots.
Visual comparison failures also produce expected, actual and diff images.
Failed jobs upload their test results and JSON reports; failed coverage checks
may upload the coverage directory. These artifacts expire after **three days**.
Successful jobs do not upload screenshots, traces, dependency directories or
site builds. Workflow log retention is a separate repository setting.

Open a failed run in GitHub Actions, download the corresponding failure artifact,
and inspect its JSON report or screenshots. Open a trace locally with:

```sh
bunx --no-install playwright show-trace /path/to/trace.zip
```

Keep baseline updates deliberate and review images before committing them. CI
does not regenerate or accept snapshots automatically. Tests use local simulated
services and need no repository secrets; the workflow token has read-only content
permissions and checkout credentials are not persisted.

## References

- [GitHub runner images](https://github.com/actions/runner-images#available-images)
- [Playwright CI guidance](https://playwright.dev/docs/ci)
- [Artifact retention](https://github.com/actions/upload-artifact#retention-period)
- [Per-component acceptance matrix](TEST-MATRIX.md)

[CI delivery evidence](delivery/CI-DELIVERY.md) records local checks and the first hosted run.
