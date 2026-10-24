# Shared requests (ott)

1. **Export a quote helper from core.** Plan cards need "price of plan X" without changing the session. I call `computePrice(config, { ...state, plan }, manifest.overrides, "plans")` from `useRiptide()` in `components/ui.tsx` `usePlanQuote`. Proposed: `useQuote(step, patch)` in `RiptideProvider` that returns the `PriceResult` for `{ ...session, ...patch }`, so saas and ott don't each re-implement it.
2. **Playwright browser version.** `@playwright/test` 1.64.1 expects `chromium_headless_shell-1248`, but `~/.cache/ms-playwright` has `chromium-1234`. My `tests/playwright.config.ts` falls back to that binary via `launchOptions.executablePath`. A root config (or `npx playwright install chromium`) would fix this for everyone.
3. **No favicon in the shell.** Without `app/icon.*`, every page logs a `/favicon.ico` 404 console error, which the QA "no console errors" check counts. I added `app/icon.svg`; other shops probably need one too.
