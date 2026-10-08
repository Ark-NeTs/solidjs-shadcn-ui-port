#!/bin/sh
# Enable native Tab navigation only for this WebKit process; D19/D90.
# Preserve Playwright's headless/headed, transport, profile and proxy arguments.
exec "$THEME_WEBKIT_EXECUTABLE" "$@" -AppleKeyboardUIMode 2
