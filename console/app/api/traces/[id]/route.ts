import { traceEvents } from "@/lib/traces";

export const dynamic = "force-dynamic";

/** `?from=N` returns only events after the first N lines, so a live view can poll cheaply. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const from = Math.max(0, Number(new URL(req.url).searchParams.get("from")) || 0);
  const t = traceEvents((await params).id, from);
  return t ? Response.json(t) : Response.json({ error: "no such trace" }, { status: 404 });
}
