import { defineConfig } from "@playwright/test";

/** Run: (cd shops/air && npx next start -p 3003) then `npx playwright test -c shops/air/tests` from the repo root. */
export default defineConfig({
  testDir: ".",
  timeout: 90_000,
  use: { baseURL: process.env.AIR_URL ?? "http://localhost:3003", viewport: { width: 1440, height: 900 },
    // Set PW_CHROMIUM to a local Chromium if the bundled revision is not downloaded.
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {} },
  reporter: "list",
});
