import { createAudit, demoZip } from "@/lib/audits";

export const dynamic = "force-dynamic";

/** {demo: slug}: "upload" a bundled demo platform; the audit itself is real. */
export async function POST(req: Request) {
  const { demo } = (await req.json().catch(() => ({}))) as { demo?: string };
  try {
    const { name, zip } = demoZip(String(demo ?? ""));
    return Response.json({ id: createAudit(name, zip, "demo") });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
