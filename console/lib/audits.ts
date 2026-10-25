import "server-only";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { crc32 } from "node:zlib";
import type { AuditMeta, AuditReport, UiMock } from "../../engine/contracts/index.ts";
import { DATA, ROOT } from "./data";
import { cli, start } from "./jobs";
import { getSettings } from "./settings";

export type { AuditMeta, AuditReport, UiMock };

/** Platform auditing: uploads live in data/audits/{id}/; the engine's `riptide audit` does the work (pi in RPC mode). */
const DIR = path.join(DATA, "audits");
const DEMO_DIR = path.join(ROOT, "engine", "audit", "demos");
const ID = /^a_[a-z0-9]{8}$/;

const json = <T,>(file: string): T | null => { try { return JSON.parse(readFileSync(file, "utf8")) as T; } catch { return null; } };

/** Bundled demo platforms (engine/audit/demos/{slug}/ with a demo.json: {name, tagline, expect}). */
export function demos(): { slug: string; name: string; tagline: string; expect: string }[] {
  if (!existsSync(DEMO_DIR)) return [];
  return readdirSync(DEMO_DIR).filter((d) => existsSync(path.join(DEMO_DIR, d, "demo.json")))
    .map((slug) => ({ slug, ...(json<{ name: string; tagline: string; expect: string }>(path.join(DEMO_DIR, slug, "demo.json"))!) }));
}

export type AuditRow = AuditMeta & { score?: number; violations?: number };

export function listAudits(): AuditRow[] {
  if (!existsSync(DIR)) return [];
  return readdirSync(DIR).filter((d) => ID.test(d)).flatMap((id): AuditRow[] => {
    const meta = json<AuditMeta>(path.join(DIR, id, "meta.json"));
    const rep = json<AuditReport>(path.join(DIR, id, "report.json"));
    return meta ? [{ ...meta, score: rep?.score, violations: rep?.counts.violation }] : [];
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function auditDetail(id: string) {
  if (!ID.test(id)) return null;
  const meta = json<AuditMeta>(path.join(DIR, id, "meta.json"));
  if (!meta) return null;
  const evFile = path.join(DIR, id, "events.jsonl");
  const events = existsSync(evFile) ? readFileSync(evFile, "utf8").split("\n").filter(Boolean).flatMap((l) => { try { return [JSON.parse(l) as Record<string, unknown> & { t: number; type: string }]; } catch { return []; } }) : [];
  return { meta, events, report: json<AuditReport>(path.join(DIR, id, "report.json")) };
}

/** Store the zip, write meta, start the audit job. */
export function createAudit(name: string, zip: Buffer, source: "upload" | "demo"): string {
  const id = `a_${Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36]).join("")}`;
  const dir = path.join(DIR, id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "upload.zip"), zip);
  const meta: AuditMeta = { auditId: id, name: name.slice(0, 80) || "Untitled platform", source, createdAt: new Date().toISOString(), status: "queued" };
  writeFileSync(path.join(dir, "meta.json"), JSON.stringify(meta, null, 2) + "\n");
  const model = getSettings().auditorModel;
  start("audit", `Audit ${meta.name}`, [cli("audit", "--id", id, ...(model ? ["--model", model] : []))]);
  return id;
}

/** A demo folder as a zip (stored, no compression), so a demo goes through exactly the same path as a real upload. */
export function demoZip(slug: string): { name: string; zip: Buffer } {
  const d = demos().find((x) => x.slug === slug);
  if (!d) throw new Error("unknown demo");
  const root = path.join(DEMO_DIR, slug, "app");
  const files: string[] = [];
  const walk = (dir: string) => { for (const f of readdirSync(dir)) { const p = path.join(dir, f); if (statSync(p).isDirectory()) walk(p); else files.push(p); } };
  walk(root);
  const local: Buffer[] = [], central: Buffer[] = [];
  let offset = 0;
  for (const file of files.sort()) {
    const name = Buffer.from(`${slug}/${path.relative(root, file).split(path.sep).join("/")}`);
    const data = readFileSync(file);
    const crc = crc32(data) >>> 0;
    const h = Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(0x0800, 6); h.writeUInt16LE(0, 8);
    h.writeUInt32LE(crc, 14); h.writeUInt32LE(data.length, 18); h.writeUInt32LE(data.length, 22); h.writeUInt16LE(name.length, 26);
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(0x0800, 8); c.writeUInt16LE(0, 10);
    c.writeUInt32LE(crc, 16); c.writeUInt32LE(data.length, 20); c.writeUInt32LE(data.length, 24); c.writeUInt16LE(name.length, 28);
    c.writeUInt32LE(offset, 42);
    local.push(h, name, data);
    central.push(c, name);
    offset += h.length + name.length + data.length;
  }
  const cd = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return { name: d.name, zip: Buffer.concat([...local, cd, end]) };
}
