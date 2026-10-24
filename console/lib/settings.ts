import "server-only";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DATA } from "./data";

/** Console preferences, kept beside the job logs in data/console/ (git-ignored). */
export type Settings = {
  /**
   * Base URL the browser uses to reach the shops. Empty: the host the console was opened on, at each shop's port.
   * `{port}` is replaced by the shop's port; without it the shop's port is set on the URL.
   */
  shopBaseUrl: string;
};

const FILE = path.join(DATA, "console", "settings.json");
const DEFAULTS: Settings = { shopBaseUrl: "" };

export function getSettings(): Settings {
  try { return { ...DEFAULTS, ...(JSON.parse(readFileSync(FILE, "utf8")) as Partial<Settings>) }; } catch { return DEFAULTS; }
}

/** Throws a readable message when a value is invalid. */
export function saveSettings(next: Settings) {
  const base = next.shopBaseUrl.trim().replace(/\/+$/, "");
  if (base) {
    let u: URL;
    try { u = new URL(base.replaceAll("{port}", "3001")); } catch { throw new Error("Enter a full URL, like http://my-host or https://shop-{port}.example.com."); }
    if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("The URL must start with http:// or https://.");
  }
  mkdirSync(path.dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify({ ...next, shopBaseUrl: base }, null, 2) + "\n");
}
