import type { Shop } from "../contracts/index.ts";

/** riptide mutate: new variant branch + mutation record + tasks, then gates (≤2 retries). OWNER: trickster subagent. */
export async function mutate(_opts: { shop: Shop; version?: string }): Promise<{ variantId: string; passed: boolean }> {
  throw new Error("not implemented");
}
