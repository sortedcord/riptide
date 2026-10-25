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
  /** Gateway model id for Trickster runs. Empty: the engine default (RIPTIDE_MODEL). */
  tricksterModel: string;
  /** Gateway model id for reference agents started from the console. Empty: each agent config's own model. */
  snifferModel: string;
  /** Anthropic model for platform audits (pi, Messages API), as `anthropic/<id>`. Empty: the engine default. */
  auditorModel: string;
};

/** Model ids are passed to the engine as process arguments, so keep them to a safe character set. */
export const MODEL_ID = /^[A-Za-z0-9._:/@-]{1,200}$/;

const FILE = path.join(DATA, "console", "settings.json");
const DEFAULTS: Settings = { shopBaseUrl: "", tricksterModel: "", snifferModel: "", auditorModel: "" };

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
  const tricksterModel = next.tricksterModel.trim(), snifferModel = next.snifferModel.trim(), auditorModel = next.auditorModel.trim();
  for (const m of [tricksterModel, snifferModel, auditorModel]) if (m && !MODEL_ID.test(m)) throw new Error(`"${m}" is not a valid model id.`);
  if (auditorModel && !auditorModel.startsWith("anthropic/")) throw new Error("The auditor runs on the Anthropic API: pick an anthropic/… model.");
  mkdirSync(path.dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify({ shopBaseUrl: base, tricksterModel, snifferModel, auditorModel }, null, 2) + "\n");
}
