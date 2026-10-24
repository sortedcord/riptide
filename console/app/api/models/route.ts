import { defaultModel, listModels } from "@/lib/models";

export const dynamic = "force-dynamic";

/** GET: the gateway's models for the settings dropdowns (the API key stays on the server). */
export async function GET() {
  try {
    return Response.json({ models: await listModels(), defaultModel: defaultModel() });
  } catch (e) {
    return Response.json({ error: (e as Error).message, defaultModel: defaultModel() }, { status: 502 });
  }
}
