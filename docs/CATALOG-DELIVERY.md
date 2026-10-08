# Remaining catalog implementation

Started 2026-10-08 under the owner's request to implement **all remaining
components**. This is the full task ledger, not permission to stop after a batch.
The baseline has 24 delivered families out of the 65-entry catalog.

| Group | Families | Status and evidence |
| --- | --- | --- |
| Native compositions (16) | Alert, Aspect Ratio, Attachment, Breadcrumb, Bubble, Button Group, Empty, Field, Input Group, Item, Kbd, Marker, Message, Native Select, Spinner, Table | Delivered; all required gates passed. [Native delivery](NATIVE-CATALOG-DELIVERY.md) |
| Display and navigation (4) | Avatar, Pagination, Typography, Direction | Pending |
| Modal layouts (3) | Dialog, Sheet, Drawer | Pending; earlier Kobalte diagnostics are evaluation evidence, not shipped components |
| Menus and command (5) | Dropdown Menu, Context Menu, Menubar, Navigation Menu, Command | Pending |
| Dates and entry (3) | Calendar, Date Picker, Input OTP | Pending |
| Layout engines (4) | Resizable, Scroll Area, Carousel, Message Scroller | Pending |
| Data and application compositions (6) | Chart, Data Table, Sidebar, Questionnaire, Toast, Sonner | Pending |

No corvu dependency is justified yet. Evaluate the matching pinned Kobalte
primitive before choosing each implementation; a successful import does not
prove browser behavior or hydration. Keep per-family acceptance gaps visible in
[TEST-MATRIX.md](TEST-MATRIX.md).
