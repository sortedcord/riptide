import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";
import { ROOT } from "./data";

export type Model = { id: string; name: string };

/** The engine's gateway settings: the console's own env first, then the repo .env the engine jobs load. */
function gateway(): { base: string; key: string; defaultModel: string } {
  let file: Record<string, string | undefined> = {};
  try { file = parseEnv(readFileSync(path.join(ROOT, ".env"), "utf8")); } catch { /* no .env */ }
  const get = (k: string) => process.env[k] ?? file[k] ?? "";
  return { base: get("OPENAI_BASE_URL").replace(/\/+$/, ""), key: get("OPENAI_API_KEY"), defaultModel: get("RIPTIDE_MODEL") || "bedrock/anthropic.claude-sonnet-5" };
}

export const defaultModel = () => gateway().defaultModel;

/** Models the gateway offers this key (OpenAI-compatible GET /models). Throws a readable message on failure. */
export async function listModels(): Promise<Model[]> {
  const { base, key } = gateway();
  if (!base) throw new Error("OPENAI_BASE_URL is not set in .env.");
  let r: Response;
  try {
    r = await fetch(`${base}/models`, { headers: key ? { authorization: `Bearer ${key}` } : {}, cache: "no-store", signal: AbortSignal.timeout(10_000) });
  } catch (e) {
    throw new Error(`Could not reach the model gateway (${(e as Error).message}).`);
  }
  if (!r.ok) throw new Error(`The model gateway answered ${r.status}.`);
  const body = (await r.json()) as { data?: { id?: string; name?: string }[] };
  return (body.data ?? []).filter((m): m is { id: string; name?: string } => typeof m.id === "string")
    .map((m) => ({ id: m.id, name: m.name || m.id }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
