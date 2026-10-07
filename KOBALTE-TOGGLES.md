# Kobalte-first Checkbox and Switch evaluation — 2026-10-07

**Decision:** use owned native inputs for this batch. The unpatched Kobalte
`2.0.0-alpha.2` composition did not pass the selected Solid 2 `2.0.0-rc.13`
acceptance checks. Kobalte remains first for later components; this result does
not claim that these failures cannot be fixed.

The [standalone probe](validation/solid2-toggles/main.tsx) uses public
`@kobalte/core/checkbox` and `@kobalte/core/switch` Root/Input/Control/Indicator
or Thumb/Label components. It uses the published alpha without either earlier
harness patch. Versions and transitive dependencies are pinned in its own
package.json/bun.lock. The production package's dependencies and lock are unchanged.

## Observed result in Chromium and Firefox

| Observation | Checkbox | Switch |
| --- | --- | --- |
| Initial state | Controlled false | Uncontrolled defaultChecked true |
| Space activation | True | False |
| Native form reset after activation | False | **False, expected true** |

Both browsers also record `STRICT_READ_UNTRACKED`, `EFFECT_RELAY_TEAR` and
`EFFECT_WRITES_OWN_SOURCE` warnings. The labels, checkbox indicator and input
paths appear in the diagnostic stacks. Full output is retained in
[unpatched.json](validation/solid2-toggles/unpatched.json). No warning was hidden
or reclassified as a passing acceptance check. The observation script's zero
exit means it captured results, not that the primitive passed.

The source inspection confirms that Kobalte Input binds current checked state
but does not provide the native `defaultChecked` reset baseline. The standalone
probe intentionally tests the documented Root `defaultChecked` composition.
Adding an input baseline may address that reset path, but would not by itself
establish that the remaining diagnostic and cleanup contracts pass. No patch
investigation or speculative production adoption was substituted for the owner's
request to implement the two components.

The owned implementation instead uses the native input for keyboard, labels,
validation and FormData, with Solid signals for controlled/uncontrolled state
and explicit form-reset cleanup. It avoids presence/effect registration for
purely decorative indicators. Corvu's catalog assessment in COMPONENT-MAP.md
has no Checkbox or Switch primitive to adopt here, so no second library is added.
This is a scoped implementation choice, not a reversal of Kobalte-first evaluation.

## Reproduce

Install the isolated manifest outside the monorepo; do not install the probe as
a production dependency. From `validation/solid2-toggles`:

```sh
tools_dir=$(mktemp -d /private/tmp/solid-toggle-probe.XXXXXX)
cp package.json bun.lock "$tools_dir/"
(cd "$tools_dir" && bun install --frozen-lockfile --ignore-scripts)
# Only if this directory does not already contain node_modules:
ln -s "$tools_dir/node_modules" node_modules
bun run dev
# In a second shell, in this same probe directory:
bun run probe
```

Playwright Chromium and Firefox must already be installed. The probe listens
on 127.0.0.1:4401; the production gallery uses 4399. `command.json` records the
measured probe command and duration. This harness is excluded from the package's
production exports/build and its passing unit/browser suites. There is no
claim of full Kobalte parity, all browser coverage, or an upstream fix.
