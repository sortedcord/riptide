# Shared requests from air

1. **`PaymentPage` renders `data-riptide-step` on a `<div>`, not `<main>`.** The guide says each page's root `<main>` carries the step. air wraps it in `<main className="sk-page">` with the progress bar, so there are nested landmarks with the step on the inner div. Proposed fix: add an `as` prop, or let the shop's `<main>` take the step attribute.
2. **Playwright browser revision.** The root `@playwright/test@1.64.1` wants `chromium_headless_shell-1248`, but only `-1234` is installed. air's config reads `PW_CHROMIUM` as a workaround. Proposed fix: run `npx playwright install chromium` once at the root, or set a shared `executablePath`.
3. **`InterstitialPage` buttons.** The continue and skip buttons are both `primary`. That's fine, but the page has no progress indicator hook, so inserted steps show no booking stepper in air. Low priority.
