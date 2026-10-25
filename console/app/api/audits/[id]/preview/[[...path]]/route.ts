import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { DATA } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * Serves an audit's live preview (engine/audit/preview.ts). The upload's code runs only in the viewer's browser and
 * is isolated from the console: `sandbox allow-scripts` gives the document an opaque origin (no console cookies,
 * storage or same-origin API access, even when opened directly), and the CSP blocks all network access.
 */
// frame-ancestors is added per request: the sandboxed document's origin is opaque, so 'self' never matches the console.
const CSP = [
  "sandbox allow-scripts allow-forms",
  "default-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' data:",
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
].join("; ");

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".ico": "image/x-icon",
  ".woff": "font/woff", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8",
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string; path?: string[] }> }) {
  const { id, path: parts = [] } = await params;
  if (!/^a_[a-z0-9]{8}$/.test(id)) return new Response("not found", { status: 404 });
  const root = path.join(DATA, "audits", id, "preview");
  const rel = parts.length ? parts.join("/") : "index.html";
  const file = path.resolve(root, rel);
  if (!file.startsWith(root + path.sep)) return new Response("not found", { status: 404 });
  let target = file;
  try { if (statSync(target).isDirectory()) target = path.join(target, "index.html"); } catch { return new Response("not found", { status: 404 }); }
  let body: Buffer;
  try { body = readFileSync(target); } catch { return new Response("not found", { status: 404 }); }
  return new Response(new Uint8Array(body), {
    headers: {
      "content-type": TYPES[path.extname(target).toLowerCase()] ?? "application/octet-stream",
      "content-security-policy": `${CSP}; frame-ancestors ${new URL(req.url).protocol}//${req.headers.get("host")}`,
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      "cache-control": "no-store",
    },
  });
}
