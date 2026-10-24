import { defineConfig } from "@playwright/test";
import { mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * One project per shop. Run all: `npm test`. One shop: `npm test -- --project=market`.
 * Browser: PW_CHROMIUM, else the cached Chromium 1234 (1.64.1 wants headless_shell-1248, which isn't installed).
 */
export const SHOPS = { market: 3001, food: 3002, air: 3003, saas: 3004, ott: 3005 } as const;
// QA_PORT_OFFSET=1000 serves the shops on 4001–4005 instead, so the suite can't attach to someone else's server on 300x.
const offset = Number(process.env.QA_PORT_OFFSET ?? 0);
const port = (s: string) => SHOPS[s as keyof typeof SHOPS] + offset;
export const LOG_DIR = path.join(os.tmpdir(), "riptide-qa-logs");
mkdirSync(LOG_DIR, { recursive: true });

const executablePath = process.env.PW_CHROMIUM ?? path.join(os.homedir(), ".cache/ms-playwright/chromium-1234/chrome-linux64/chrome");

// Playwright has no per-project webServer, so only start the servers for the projects asked for on the CLI.
const argv = process.argv.join(" ");
const picked = Object.keys(SHOPS).filter((s) => new RegExp(`--project[= ]${s}\\b`).test(argv));
const wanted = picked.length ? picked : Object.keys(SHOPS);

export default defineConfig({
  testDir: "tests",
  outputDir: "test-results",
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 5,
  reporter: [["list"]],
  use: {
    viewport: { width: 1440, height: 900 },
    launchOptions: { executablePath },
  },
  projects: Object.keys(SHOPS).map((name) => ({ name, use: { baseURL: `http://localhost:${port(name)}` } })),
  // Server output goes to LOG_DIR so the engine test can find the "[riptide]" validation error (prod builds redact it from the page).
  webServer: wanted.map((s) => ({
    command: `npm run build -w shops/${s} && npm run start -w shops/${s}${offset ? ` -- -p ${port(s)}` : ""} > ${LOG_DIR}/${s}.log 2>&1`,
    url: `http://localhost:${port(s)}/api/slots`,
    reuseExistingServer: true,
    timeout: 600_000,
  })),
});
