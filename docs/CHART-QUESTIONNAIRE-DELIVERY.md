# Chart and Questionnaire delivery

Both families passed the final package gates, including 100% coverage. See [full catalog acceptance](REMAINING-CATALOG-STATUS.md).

## Kobalte-first assessment

The alpha.2 export inventory in [COMPONENT-MAP.md](project/COMPONENT-MAP.md) contains
neither a chart engine nor a complete questionnaire. Corvu supplies neither.
Chart uses framework-independent `chart.js@4.5.1`; no React adapter or second
Solid runtime is installed. Questionnaire composes native form controls and the
accepted Button/Input/Progress parts. Earlier Kobalte radio/checkbox findings
remain in [KOBALTE-CHOICES.md](validation/KOBALTE-CHOICES.md) and
[KOBALTE-TOGGLES.md](validation/KOBALTE-TOGGLES.md). No new claim of Kobalte runtime
acceptance is made for these compositions.

Chart follows the engine's [lifecycle/update documentation](https://www.chartjs.org/docs/latest/developers/updates.html).
Because canvas pixels are not a screen-reader alternative, the component adds
named canvas markup, a native table, keyboard inspection, HTML tooltips and
native legend buttons as required by the engine's
[accessibility guidance](https://www.chartjs.org/docs/latest/general/accessibility.html).
Questionnaire's compound names and interaction scope were compared with the
[Radix questionnaire documentation](https://ui.shadcn.com/docs/components/radix/questionnaire).

## API boundaries

Chart preserves the sibling's six component export names and ChartConfig, adding
a Solid-owned Chart renderer. This is not the Recharts JSX API. Pass records,
an index key and numeric series; supported kinds are bar, line, area, pie, donut,
radar and radial. Missing/nonfinite values are gaps. Native legend buttons toggle
series or circular categories. Left/Right/Home/End inspect a data row. One Chart
belongs in each ChartContainer. Configuration labels are strings; colors can
use inherited CSS variables or explicit light/dark values. Configured icons are
supported in the legend. Animations are disabled; Chart.js owns canvas sizing.
No fetching, tooltip placement engine, streaming decimation, arbitrary Recharts
children, full Chart.js options passthrough or large-dataset performance claim.

The Chart lifecycle recreates the engine for changed data/options and destroys
it on replacement/unmount. Theme changes are observed on ancestor attributes.
The native table remains in SSR output. Registration metadata is available
synchronously during hydration so the server legend is claimed rather than
replaced. Canvas observers wait for the actual reference; the initial hydration
snapshot may not contain that reference yet.

Questionnaire requires ordered `items` metadata with unique names. Each item may
be required, disabled, multiple and have declared value/disabled choice metadata.
Root `values/defaultValues/onValuesChange` own the draft. Answers are records of
`{choices?, text?, skipped?}`. Item/defaultItem/onItemChange own navigation.
Choice checked state and Input value belong to this root rather than independent
controlled props. Native form submission supplies fixed and freeform values under
the item's name. Inactive fieldsets stay mounted and successful controls remain
in FormData. Disabled steps are skipped; optional steps require an answer or an
explicit skip. Skipping clears stale answers. Required validation navigates and
focuses the first missing answer. The caller owns pending state, submit errors,
retry and persistence; the component never sends data.

Letters (default) or numbers select enabled choices without advancing. Native
radio arrows work; Enter continues from an answer, Ctrl/Cmd+Enter validates and
continues, Left/Right outside radio/text controls navigate. Typing, composition,
modifiers and canceled events remain with their owner. This version does not
provide branching schemas, remote validation, React Hook Form integration or
arbitrary custom choice renderers. An Input must have a native accessible name.

Reset observes cancellation after event bubbling and applies the initial draft
in a microtask, before another user interaction. A timer previously allowed a
following text edit to be erased; the browser regression now covers that flow.
Rejected controlled edits restore DOM properties after reconciliation.

## DELIVERY dispositions

| Criterion | Evidence and limits |
| --- | --- |
| Ownership | Chart receives immutable records; visual interaction is local. Questionnaire keeps application drafts separate from local validation/navigation. Controlled rejection is tested. |
| Usable states | Chart empty/ready/hidden series and dynamic data/kinds; Questionnaire incomplete/invalid/answered/skipped/disabled/pending and failed submission with retained drafts. |
| Recovery | Clear/restore Chart and unmount/remount; Questionnaire rejected edits, canceled reset, invalid-submit focus, explicit retry and retained answers. |
| Async consistency | Chart has no data request. Questionnaire guards same-turn duplicate submit and honors caller pending state. No transport retries or cache. |
| Platform boundaries | Browser canvas/native forms only; no AppApi, IPC, desktop APIs, secrets or persistence. |
| Cleanup | Chart engines and ancestor observers dispose; registration is owner-local. Questionnaire queued callbacks check disposal. |
| Keyboard/access | Named canvas, table alternative, HTML tooltip/legend; native fieldset/legend, named answers, invalid focus, shortcuts, three-engine axe checks. Manual assistive-technology checks remain unrun. |
| Customization | Shared tokens unchanged; scoped chart variables, light/dark/narrow enlarged layouts and six reviewed visual baselines. |
| Structure/performance | Chart uses a framework-neutral engine, explicit records and owned UI; Questionnaire remains a form composition. No large-dataset performance claim. |
| Tests | Focused source, built, SSR and hydration checks pass. The final unit coverage and full browser gates pass; see the catalog report. |
| Evidence | JSON and images are preserved. Focused passes do not establish complete catalog acceptance or complete upstream prop parity. |

| Completed command (package cwd) | Result | Time |
| --- | --- | ---: |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/catalog-chart-focused.json bunx playwright test tests/integration/catalog-chart.spec.ts --max-failures=1` | 12 source tests passed before later hydration correction | 17.3 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/catalog-questionnaire-focused.json bunx playwright test tests/integration/catalog-questionnaire.spec.ts --max-failures=1` | 15 source tests passed | 22.9 s |
| `THEME_PORT=4403 RESULTS_FILE=docs/evidence/catalog-chart-questionnaire-hydration.json bun run test:hydration --grep 'hydrates Chart\|hydrates Questionnaire' --max-failures=1` | 6 passed, including all-harness node reuse assertions | 12.2 s |
| `THEME_PORT=4403 THEME_PRODUCTION=1 RESULTS_FILE=docs/evidence/catalog-chart-questionnaire-built.json bunx playwright test tests/e2e/catalog-chart.spec.ts tests/e2e/catalog-questionnaire.spec.ts tests/e2e/visual.spec.ts --grep 'Chart\|Questionnaire\|chart gallery\|questionnaire gallery' --update-snapshots=all --max-failures=1` | 33 passed, including six screenshots | 33.7 s |

A combined source checkpoint also passed all 27 cases in 33.1 seconds;
its results are in `evidence/catalog-chart-questionnaire-source.json`. These
are runner durations.
Measured whole-command times for current package
checks are recorded in [remaining catalog status](REMAINING-CATALOG-STATUS.md).
Initial Chart hydration exposed an absent ref snapshot, then a delayed legend
registration; both were corrected and the six hydration journeys passed.

[Chart units](../tests/unit/catalog-chart.test.tsx), [Chart browser assertions](../tests/catalog-chart.ts),
[Questionnaire units](../tests/unit/catalog-questionnaire.test.tsx),
[Questionnaire browser assertions](../tests/catalog-questionnaire.ts).
