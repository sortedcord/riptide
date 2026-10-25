import { STAGES, stageStates, startStage, stopStage, type StageId } from "@/lib/pipeline";

export const dynamic = "force-dynamic";

/** GET: the stage bar's state. POST {stage, action: "start" | "stop"}. */
export function GET() {
  return Response.json(stageStates());
}

export async function POST(req: Request) {
  const { stage, action } = (await req.json().catch(() => ({}))) as { stage?: string; action?: string };
  if (!STAGES.some((s) => s.id === stage)) return Response.json({ error: "unknown stage" }, { status: 400 });
  try {
    if (action === "stop") { stopStage(stage as StageId); return Response.json({ ok: true }); }
    if (action === "start") return Response.json({ id: startStage(stage as StageId).id });
    return Response.json({ error: "action must be start or stop" }, { status: 400 });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 409 });
  }
}
