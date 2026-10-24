# Shared requests from food (Forkful)

1. **Dialog centring under Tailwind v4 preflight.** Preflight sets `margin: 0` on every element, which pins native `<dialog>` (core `.rt-modal`) to the top-left corner. Proposed: add `margin: auto;` to `.rt-modal` in `_core/riptide.css`. Worked around locally in `app/globals.css`.
2. **Favicon in the shell template.** Shells had no icon, so every page logged a `/favicon.ico` 404. Food ships its own `app/icon.svg`. Proposed: add a placeholder icon to the shell template for future shops.
