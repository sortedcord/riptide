import os from "node:os";
import path from "node:path";
import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

// Use the locally installed Chromium if Playwright's expected build isn't downloaded.
const local = path.join(os.homedir(), ".cache/ms-playwright/chromium-1234/chrome-linux64/chrome");

/** Run: npx playwright test -c shops/ott/tests (with `npm run start -w shops/ott` running). */
export default defineConfig({
  testDir: ".",
  timeout: 60_000,
  workers: 2,
  outputDir: path.join(os.tmpdir(), "riptide-ott-test-results"),
  use: {
    baseURL: process.env.OTT_URL ?? "http://localhost:3005",
    browserName: "chromium",
    viewport: { width: 1440, height: 900 },
    launchOptions: existsSync(local) ? { executablePath: local } : {},
  },
});
