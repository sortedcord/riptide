# Shared requests from saas

1. **InterstitialPage skip button weight** (`_core/Interstitial.tsx`): `skipText` renders with `data-variant="primary"`, same as continue. Fine for equal weight, but both being primary looks odd; consider `secondary` for both, or make them Slots so a manifest can target them.
2. **PaymentPage root element**: it renders `<div data-riptide-step="payment">`, not `<main>`. Saas wraps it in `<main>` (with a progress bar). Consider rendering `<main>` in core, or documenting the wrapper.
3. **Playwright browsers**: `@playwright/test` 1.64.1 expects Chromium build 1248, but `~/.cache/ms-playwright` has 1234. Saas works around it with `executablePath` in `shops/saas/playwright.config.ts`. A root config (or `npx playwright install`) would fix this for everyone.
4. **Hypothetical quotes**: saas prices plan cards and account invoices with `computePrice(config, hypotheticalState, manifest.overrides, step)` (`components/ui.tsx#useQuote`). A core `useQuote(statePatch, step)` hook would make this pattern shared.
