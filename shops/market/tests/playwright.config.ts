import { defineConfig } from "@playwright/test";
import os from "node:os";

/** Run: npx playwright test -c shops/market/tests/playwright.config.ts (with `next start -p 3001` running). */
export default defineConfig({
  testDir: ".",
  timeout: 60_000,
  workers: 1,
  outputDir: `${os.tmpdir()}/cartwheel-test-results`,
  use: {
    baseURL: process.env.MARKET_URL ?? "http://localhost:3001",
    launchOptions: { executablePath: process.env.CHROMIUM_PATH ?? `${os.homedir()}/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome` },
  },
});
