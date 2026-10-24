import type { GateResult } from "../contracts/index.ts";

/** Mechanical gates for a variant; writes data/gates/{variantId}.json. OWNER: trickster subagent. */
export async function runGates(_variantId: string): Promise<GateResult> {
  throw new Error("not implemented");
}
