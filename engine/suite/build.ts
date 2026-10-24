import type { Shop, Suite } from "../contracts/index.ts";

/** Freeze passing variants (+ honest controls) with their tasks and derived rubrics. OWNER: trickster subagent. */
export async function buildSuite(_opts: { suiteId: string; variantIds: string[]; controls: Shop[] }): Promise<Suite> {
  throw new Error("not implemented");
}
