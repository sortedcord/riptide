import { readFileSync } from "node:fs";
import { framePath } from "@/lib/traces";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string; file: string }> }) {
  const { id, file } = await params;
  const f = framePath(id, file);
  try {
    // Frames are written once and never change.
    return new Response(readFileSync(f!), { headers: { "content-type": "image/jpeg", "cache-control": "private, max-age=31536000, immutable" } });
  } catch {
    return new Response(null, { status: 404 });
  }
}
