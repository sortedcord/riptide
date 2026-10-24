import "server-only";
import { appendFile, mkdir, readFile, readdir } from "node:fs/promises";
import { timingSafeEqual } from "node:crypto";
import path from "node:path";
import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { z } from "zod";
import { RUN_ID_RE, RecorderEventBodySchema, type AnyShopConfig, type Manifest } from "./contracts";
import { validateManifest, validateRegistry } from "./overrides";
import { hashString } from "./util";

const VARIANT_RE = /^[a-z0-9_-]+$/;
const manifestsDir = () => path.join(process.cwd(), "manifests");

/**
 * Load + validate manifests/{variant}.json for this shop. Unknown variant → 404.
 * Invalid manifest or unknown target → throws (Next error page) and logs a clear console error.
 */
export const loadManifest = cache(async (config: AnyShopConfig, variant: string): Promise<Manifest> => {
  if (!VARIANT_RE.test(variant)) notFound();
  let raw: string;
  try {
    raw = await readFile(path.join(manifestsDir(), `${variant}.json`), "utf8");
  } catch {
    if (variant === "honest") return { shopType: config.shop, variant, author: "riptide", overrides: [] };
    notFound();
  }
  try {
    validateRegistry(config.registry);
    let json: unknown;
    try { json = JSON.parse(raw); } catch (e) { throw new Error(`[riptide] manifests/${variant}.json is not valid JSON: ${(e as Error).message}`); }
    return validateManifest(json, { shop: config.shop, variant, registry: config.registry, flows: config.flows, steps: config.steps });
  } catch (e) {
    console.error(String((e as Error).message));
    throw e;
  }
});

export async function listVariants(): Promise<string[]> {
  const files = await readdir(manifestsDir()).catch(() => [] as string[]);
  const v = files.filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).filter((f) => VARIANT_RE.test(f));
  return ["honest", ...v.filter((x) => x !== "honest").sort()];
}

/** Base metadata for every shop page (noindex) plus manifest setHead meta. */
export function headMetadata(manifest: Manifest | null, base: Metadata = {}): Metadata {
  const meta: Record<string, string> = {};
  for (const o of manifest?.overrides ?? []) if (o.op === "setHead" && o.meta) Object.assign(meta, o.meta);
  return { ...base, robots: { index: false, follow: false }, other: { ...(base.other as Record<string, string>), ...meta } };
}

/** JSON-LD objects from setHead overrides, for <script type="application/ld+json">. */
export function headJsonLd(manifest: Manifest): object[] {
  return manifest.overrides.flatMap((o) => (o.op === "setHead" && o.jsonLd ? [o.jsonLd] : []));
}

/** GET /api/slots */
export function slotsResponse(config: AnyShopConfig): Response {
  validateRegistry(config.registry);
  return Response.json({ shopType: config.shop, steps: config.steps, flows: config.flows, slots: config.registry });
}

const PayBody = z.object({
  shop: z.string(),
  variant: z.string(),
  total: z.number(),
  lines: z.array(z.object({ key: z.string(), label: z.string(), amount: z.number() })),
});

/** POST /api/pay — mock processor. Accepts only the order summary, stores nothing, returns a deterministic reference. */
export async function payResponse(req: Request): Promise<Response> {
  const parsed = PayBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid order" }, { status: 400 });
  const o = parsed.data;
  const ref = hashString(JSON.stringify(o)).toString(36).toUpperCase().padStart(7, "0");
  return Response.json({ orderId: `RT-${o.shop.toUpperCase()}-${ref}`, status: "sandbox-complete", charged: 0 });
}

// ------------------------------------------------------------------ flight recorder

const MAX_BODY = 64 * 1024;
// `next start` runs in shops/{shop}, so the repo (or worktree) root is two levels up. The engine sets RECORDER_DIR.
const recorderDir = () => process.env.RECORDER_DIR ?? path.join(process.cwd(), "..", "..", "data", "recorder");
const runFile = (runId: string) => path.join(recorderDir(), `${runId}.jsonl`);

/** POST /api/e — append one event to {runId}.jsonl with a server timestamp. Write-only: returns no data. */
export async function recorderPOST(req: Request): Promise<Response> {
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY) return new Response(null, { status: 413 });
  const buf = await req.arrayBuffer().catch(() => null);
  if (!buf || buf.byteLength > MAX_BODY) return new Response(null, { status: buf ? 413 : 400 });
  let json: unknown;
  try { json = JSON.parse(new TextDecoder().decode(buf)); } catch { return new Response(null, { status: 400 }); }
  const runId = (json as { runId?: unknown } | null)?.runId;
  const ev = RecorderEventBodySchema.safeParse(json);
  if (typeof runId !== "string" || !RUN_ID_RE.test(runId) || !ev.success) return new Response(null, { status: 400 });
  await mkdir(recorderDir(), { recursive: true });
  await appendFile(runFile(runId), JSON.stringify({ ...ev.data, runId, t: Date.now() }) + "\n");
  return new Response(null, { status: 204 });
}

/** GET /api/e?runId= — all events of a run. Needs `x-recorder-secret: $RECORDER_SECRET`; unset secret → always 401. */
export async function recorderGET(req: Request): Promise<Response> {
  const secret = process.env.RECORDER_SECRET;
  const given = req.headers.get("x-recorder-secret") ?? "";
  if (!secret || given.length !== secret.length || !timingSafeEqual(Buffer.from(given), Buffer.from(secret))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const runId = new URL(req.url).searchParams.get("runId") ?? "";
  if (!RUN_ID_RE.test(runId)) return Response.json({ error: "invalid runId" }, { status: 400 });
  const raw = await readFile(runFile(runId), "utf8").catch(() => "");
  return Response.json(raw.split("\n").filter(Boolean).map((l) => JSON.parse(l)), { headers: { "cache-control": "no-store" } });
}
