import os from "node:os";
import path from "node:path";
import { chromium, type Browser } from "playwright";

const LOCAL_CHROMIUM = process.env.PW_CHROMIUM ?? path.join(os.homedir(), ".cache/ms-playwright/chromium-1234/chrome-linux64/chrome");

/**
 * Open a TinyFish remote browser session (https://docs.tinyfish.ai/browser-api) and return its CDP url.
 * The session ends by itself after TINYFISH_TIMEOUT_S of inactivity; the API has no delete call.
 */
export async function tinyfishSession(): Promise<string> {
  const res = await fetch(process.env.TINYFISH_BROWSER_URL ?? "https://api.browser.tinyfish.ai/", {
    method: "POST",
    headers: { "X-API-Key": process.env.TINYFISH_API_KEY!, "Content-Type": "application/json" },
    body: JSON.stringify({
      timeout_seconds: Number(process.env.TINYFISH_TIMEOUT_S ?? 900),
      proxy_config: { enabled: process.env.TINYFISH_PROXY === "1" },
    }),
  });
  if (!res.ok) throw new Error(`TinyFish session: ${res.status} ${await res.text()}`);
  return ((await res.json()) as { cdp_url: string }).cdp_url;
}

/**
 * The browser for agents and gates. With TINYFISH_API_KEY set, a TinyFish remote browser over CDP;
 * BROWSER_CDP_URL drives any other CDP browser; otherwise local headless Chromium.
 * ponytail: a remote browser cannot reach 127.0.0.1, so shops must be served on a public origin when TinyFish is on.
 */
export async function launchBrowser(): Promise<Browser> {
  if (process.env.TINYFISH_API_KEY) return chromium.connectOverCDP(await tinyfishSession());
  if (process.env.BROWSER_CDP_URL) return chromium.connectOverCDP(process.env.BROWSER_CDP_URL);
  return chromium.launch({ headless: true, executablePath: LOCAL_CHROMIUM });
}
