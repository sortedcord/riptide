import { auditDetail } from "@/lib/audits";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const d = auditDetail((await params).id);
  return d ? Response.json({ ...d, events: d.events.slice(-300) }) : Response.json({ error: "no such audit" }, { status: 404 });
}
