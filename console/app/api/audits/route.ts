import { createAudit, listAudits } from "@/lib/audits";

export const dynamic = "force-dynamic";
const MAX = 50 << 20;

export function GET() {
  return Response.json(listAudits());
}

/** multipart/form-data: file (.zip, ≤ 50 MB), name. */
export async function POST(req: Request) {
  if (Number(req.headers.get("content-length") ?? 0) > MAX + 1024 * 1024) return Response.json({ error: "zip is larger than 50 MB" }, { status: 413 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "attach a .zip file" }, { status: 400 });
  if (!/\.zip$/i.test(file.name)) return Response.json({ error: "only .zip files" }, { status: 400 });
  if (file.size > MAX) return Response.json({ error: "zip is larger than 50 MB" }, { status: 413 });
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.readUInt32LE(0) !== 0x04034b50) return Response.json({ error: "that file is not a zip" }, { status: 400 });
  const name = String(form?.get("name") ?? "").trim() || file.name.replace(/\.zip$/i, "");
  return Response.json({ id: createAudit(name, buf, "upload") });
}
