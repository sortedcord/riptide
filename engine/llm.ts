import OpenAI from "openai";
import type { ResponseInputItem, FunctionTool } from "openai/resources/responses/responses";
import { z } from "zod";

/** The only LLM entry point. OpenAI Responses API against OPENAI_BASE_URL (the gateway). */
// The SDK default (10 min per call, 2 retries) lets one hung gateway call freeze an agent for 30 minutes.
// Created on first use, so modules that import this (scorer, tests) load without an API key.
let client: OpenAI | undefined;
export const openai = () => (client ??= new OpenAI({ timeout: Number(process.env.RIPTIDE_LLM_TIMEOUT_MS ?? 120_000), maxRetries: 2 }));
export const DEFAULT_MODEL = process.env.RIPTIDE_MODEL ?? "bedrock/anthropic.claude-sonnet-5";

/** One structured call: zod schema in, validated object out. */
export async function structured<T extends z.ZodType>(opts: { model?: string; instructions: string; input: string; schema: T; name: string }): Promise<z.infer<T>> {
  const r = await openai().responses.create({
    model: opts.model ?? DEFAULT_MODEL,
    instructions: opts.instructions,
    input: opts.input,
    text: { format: { type: "json_schema", name: opts.name, strict: false, schema: z.toJSONSchema(opts.schema) as Record<string, unknown> } },
  });
  return opts.schema.parse(JSON.parse(r.output_text));
}

export type Tool = {
  name: string;
  description: string;
  params: z.ZodObject;
  run: (args: never) => Promise<string> | string;
};

/**
 * Minimal agent loop: the model calls tools until it answers with plain text or `maxSteps` runs out.
 * Returns the final text and the number of tool calls made.
 */
export async function toolLoop(opts: {
  model?: string; instructions: string; input: string; tools: Tool[]; maxSteps: number; signal?: AbortSignal;
  /** Per LLM call; defaults to the client timeout (RIPTIDE_LLM_TIMEOUT_MS). Long-context loops like the Trickster need more. */
  callTimeoutMs?: number;
  onStep?: (name: string, args: unknown, result: string) => void;
}): Promise<{ text: string; steps: number; exhausted: boolean }> {
  const defs: FunctionTool[] = opts.tools.map((t) => ({
    type: "function", name: t.name, description: t.description, strict: false,
    parameters: z.toJSONSchema(t.params) as Record<string, unknown>,
  }));
  const input: ResponseInputItem[] = [{ role: "user", content: opts.input }];
  let steps = 0;
  for (;;) {
    const r = await openai().responses.create({ model: opts.model ?? DEFAULT_MODEL, instructions: opts.instructions, input, tools: defs }, { signal: opts.signal, ...(opts.callTimeoutMs ? { timeout: opts.callTimeoutMs } : {}) });
    const calls = r.output.filter((o) => o.type === "function_call");
    if (!calls.length) return { text: r.output_text, steps, exhausted: false };
    input.push(...(r.output as ResponseInputItem[]));
    for (const c of calls) {
      const tool = opts.tools.find((t) => t.name === c.name);
      let out: string;
      try {
        if (!tool) throw new Error(`unknown tool ${c.name}`);
        const args = tool.params.parse(JSON.parse(c.arguments || "{}"));
        out = await tool.run(args as never);
      } catch (e) {
        out = `ERROR: ${(e as Error).message}`;
      }
      opts.onStep?.(c.name, c.arguments, out);
      input.push({ type: "function_call_output", call_id: c.call_id, output: out });
      steps++;
    }
    if (steps >= opts.maxSteps) return { text: "", steps, exhausted: true };
  }
}
