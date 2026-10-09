# Unpatched Kobalte toggle comparison

See [KOBALTE-TOGGLES.md](../../docs/validation/KOBALTE-TOGGLES.md) for results and reproduction.
The manifest/lock are standalone and contain no patchedDependencies. `probe.mjs`
records observed states and every browser warning/error in `unpatched.json`.
A zero observation-process exit does not imply acceptance: the recorded Switch
reset and diagnostic results fail the production component requirements.

No package exports use this directory. Native production counterparts and their
passing acceptance evidence are described in
[TOGGLES-DELIVERY.md](../../docs/delivery/TOGGLES-DELIVERY.md).
