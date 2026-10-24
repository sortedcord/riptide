import { launch, list, type Launch } from "@/lib/jobs";

export const dynamic = "force-dynamic";

/** GET: every job without its log. POST: launch one (body = Launch). */
export function GET() {
  return Response.json(list().map(({ log, ...j }) => ({ ...j, tail: log.slice(-300) })));
}

export async function POST(req: Request) {
  try {
    const job = launch((await req.json()) as Launch);
    return Response.json({ id: job.id });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
