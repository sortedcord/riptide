import { listTraces } from "@/lib/traces";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(listTraces());
}
