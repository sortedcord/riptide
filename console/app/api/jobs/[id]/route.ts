import { get, stop } from "@/lib/jobs";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const job = get((await params).id);
  return job ? Response.json(job) : Response.json({ error: "no such job" }, { status: 404 });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  stop((await params).id);
  return new Response(null, { status: 204 });
}
