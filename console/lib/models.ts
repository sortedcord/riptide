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

/** Default auditor model (engine/audit/run.ts AUDIT_MODEL). */
export const AUDITOR_DEFAULT = "anthropic/claude-sonnet-5-5";

/** Anthropic models the auditor's key can use (GET api.anthropic.com/v1/models), as `anthropic/<id>`. Empty list on failure. */
export async function listAuditorModels(): Promise<{ models: Model[]; error?: string }> {
  let file: Record<string, string | undefined> = {};
  try { file = parseEnv(readFileSync(path.join(ROOT, ".env"), "utf8")); } catch { /* no .env */ }
  const key = process.env.ANTHROPIC_API_KEY ?? file.ANTHROPIC_API_KEY;
  if (!key) return { models: [], error: "ANTHROPIC_API_KEY is not set in .env." };
  try {
    const r = await fetch("https://api.anthropic.com/v1/models?limit=100", {
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01" }, next: { revalidate: 3600 }, signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) return { models: [], error: `Anthropic answered ${r.status}.` };
    const body = (await r.json()) as { data?: { id: string; display_name?: string }[] };
    return { models: (body.data ?? []).map((m) => ({ id: `anthropic/${m.id}`, name: m.display_name || m.id })) };
  } catch (e) {
    return { models: [], error: `Could not reach Anthropic (${(e as Error).message}).` };
  }
}
