import { defineConfig } from "@playwright/test";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

// Use the installed Chromium if the expected headless shell isn't there.
const cache = path.join(homedir(), ".cache/ms-playwright");
const dir = existsSync(cache) ? readdirSync(cache).find((d) => /^chromium-\d+$/.test(d)) : undefined;
const exe = dir ? path.join(cache, dir, "chrome-linux64/chrome") : undefined;

export default defineConfig({
  testDir: ".",
  timeout: 60_000,
  use: { baseURL: "http://localhost:3002", viewport: { width: 1440, height: 900 }, launchOptions: exe && existsSync(exe) ? { executablePath: exe } : {} },
});
