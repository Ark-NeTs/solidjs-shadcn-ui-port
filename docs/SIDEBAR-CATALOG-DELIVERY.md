# Sidebar delivery

Sidebar is accepted within the documented contracts. See [final full-suite gates](REMAINING-CATALOG-STATUS.md).

## Primitive selection

Kobalte has no Sidebar family. Its pinned Dialog and Tooltip evaluations already
failed the diagnostic gate; this composition reuses the accepted native modal
and preview lifecycles. No second framework runtime or corvu dependency is added.

The desktop shell is an aside landmark. On mobile it becomes a native dialog;
the inner content is owned outside that changing shell and moves intact, retaining
uncontrolled input values and DOM identity. Controlled desktop and mobile open
states are separate. There is no cookie or persistence side effect.

## DELIVERY dispositions

| Criterion | Evidence and limits |
| --- | --- |
| Ownership | Accessor-based provider; open/defaultOpen/onOpenChange and separate mobile counterparts. Controlled rejection is tested. |
| Usable states | Expanded, icon, offcanvas, none; left/right, sidebar/floating/inset, mobile closed/open and loading placeholders. |
| Recovery | Rejected/canceled toggles preserve state; drafts survive responsive shell replacement; unmount/remount releases owners. |
| Async consistency | No transport; media events only change responsive layout. |
| Platform boundaries | No IPC/AppApi/desktop APIs, cookies or router dependency. |
| Cleanup | Media/shortcut listeners dispose; accepted modal and hint owners release focus guards, scroll locks and positioning. |
| Keyboard/access | Ctrl/Cmd+B outside editable fields, disabled navigation, current page, collapsed hints, modal Tab containment, Escape/outside close and focus return. Desktop/mobile axe passes. |
| Customization | Sibling semantic classes, inherited light/dark tokens, widths via CSS variables, caller native attributes. Three reviewed images. |
| Structure/performance | One inner navigation subtree across breakpoints. No virtualized navigation or animation performance claims. |
| Tests | Package reached 333 units with 100% measured coverage; 21 server tests; 18 focused source tests; 3 hydration tests; final combined Sidebar/notification built run 45 passed. |
| Evidence | Results in docs/evidence. These are focused checkpoints, not a full-suite acceptance report. |

## API boundaries

All sibling Sidebar export names are provided. useSidebar exposes accessors rather
than copied React context values. SidebarMenuButton supports as="a" and href for
navigation, or a native button; native children replace asChild cloning. Tooltip
accepts a text description. SidebarMenuSubButton is a native anchor. Each provider
owns one sidebar and its stable controls ID. Default breakpoint is 768 CSS pixels;
SSR emits desktop structure and CSS hides it at mobile widths before hydration.
The closed mobile content stays mounted; the browser owns modal interaction.

SidebarProvider defaults to 16rem desktop width, 18rem mobile width and 3rem icon
width through CSS variables. No cookie storage, persisted preference, drag-to-resize
rail, router integration or full React prop compatibility is claimed. The rail
is an optional pointer toggle; the named trigger remains keyboard reachable.
Skeleton widths are deterministic (70% default), avoiding random hydration markup.

| Completed runner command | Result | Time |
| --- | --- | ---: |
| `bun run test:coverage` (Sidebar checkpoint) | 333 passed; 100% statements/branches/functions/lines | 6.68 s |
| `bun run test:server` | 21 passed | 1.55 s |
| `bunx playwright test tests/integration/catalog-sidebar.spec.ts --max-failures=1` | 18 passed | 24.9 s |
| `bun run test:hydration --grep 'hydrates sidebar navigation' --max-failures=1` | 3 passed | 8.9 s |
| Built Sidebar/notification checks and six visuals, after final fixes | 45 passed | 55.9 s |

Times above are runner-reported durations. Final whole-command wall times are recorded in the linked full acceptance gates. Hydration initially exposed a fixture
layout collision: the fixed sidebar covered the harness button. A containing
block now isolates that fixture; application Sidebar behavior was unchanged.

[Source](../src/components/ui/sidebar.tsx), [units](../tests/unit/catalog-sidebar.test.tsx),
[browser tests](../tests/catalog-sidebar.ts),
[light](screenshots/catalog-sidebar-light.png), [dark](screenshots/catalog-sidebar-dark.png),
[mobile](screenshots/catalog-sidebar-mobile.png).
