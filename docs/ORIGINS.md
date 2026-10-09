# Project origins

Extracted from `restaurant-management/packages/shadcn-solidjs-theme` at
`603d56d`. Only the Solid package's history was imported. The
[migration report](REPOSITORY-MIGRATION.md) records the extraction and verification.
The standalone repository has its own configuration, dependencies and decisions.

## Design-system decisions retained from the original context

- **D19: public package boundary.** Consumers use component, utility and theme
  exports; underlying UI dependencies remain encapsulated. Historical reports
  and code comments use this identifier for that design-system rule.
- **D90: begin the owned Solid 2 implementation.** The owner authorized the
  foundation and first five components on 2026-10-07. Native semantics could be
  used after evaluating Kobalte, without adopting experimental dependency patches.
  [Foundation delivery](delivery/FOUNDATION-DELIVERY.md) preserves that evidence.

Those identifiers explain project history, not policies of another application.
The current [specification](project/specs.md) and
[decisions](project/DECISIONS.md) govern this project. Former application framework,
roadmap, desktop and workspace instructions are outside its scope.

## Captured test contracts

`validation/reference-theme` preserves class, token and export parity against a
dated React reference with provenance and checksums. `validation/admin-imports`
contains only design-system import/re-export declarations for a symbol-availability
audit. These fixtures are test inputs, not production application code, services
or documentation. They are excluded from the public site artifact.

Historical validation reports may contain original command paths and decision
identifiers. Retain those as evidence of the tested setup; do not treat them as
current installation instructions or copy former application documentation here.
