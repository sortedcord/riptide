import os from "node:os";
import path from "node:path";
import { defineConfig } from "@playwright/test";

// Uses the Chromium already in ~/.cache/ms-playwright (override with PW_CHROMIUM).
export default defineConfig({
  testDir: "tests",
  outputDir: "test-results",
  use: {
    launchOptions: {
      executablePath: process.env.PW_CHROMIUM ?? path.join(os.homedir(), ".cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell"),
    },
  },
});
