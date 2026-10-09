# Captured admin import contract

These files contain only design-system import/re-export declarations captured
from the React admin at restaurant-management commit `603d56d`. They preserve the
parity audit without depending on that checkout or copying application behavior.
`bun run parity:admin` checks these declarations against actual Solid exports.
For a current application, run `bun run parity:admin --app-root /path/to/app/src`.
This checks module and symbol availability, not React-to-Solid compatibility.
