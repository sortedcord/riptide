import { mkdirSync } from "node:fs";
import path from "node:path";
import {
  createAgentSession, DefaultResourceLoader, ModelRuntime, SessionManager, SettingsManager,
  type ExtensionFactory, type ToolDefinition,
} from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { WORKTREES } from "../paths.ts";
import { RUN_DESCRIPTION, sandbox } from "./sandbox.ts";

/**
 * The Trickster on the pi harness (@earendil-works/pi-coding-agent, Anthropic Messages API).
 * pi owns the agent loop, context compaction and retries; we own the sandbox:
 * - pi's file tools (read, write, edit, grep, find, ls) are path-checked by a `tool_call` hook against the variant worktree,
 * - pi's bash is not enabled; a custom `run` tool allows only the same commands as our own loop,
 * - no ~/.pi settings, skills, extensions or session files: isolated agent dir, in-memory session, the SKILL is the whole system prompt.
 * Same contract as `toolLoop()` in engine/llm.ts.
 */
const FILE_TOOLS = ["read", "write", "edit", "grep", "find", "ls"] as const;
const WRITE_TOOLS = new Set(["write", "edit"]);

export async function runPi(opts: {
  dir: string; shop: string; model: string; instructions: string; input: string; maxSteps: number;
  onStep?: (name: string, args: unknown, result: string) => void;
}): Promise<{ text: string; steps: number; exhausted: boolean }> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set (.env); the pi Trickster calls the Anthropic Messages API");
  // Model ids look like "anthropic/claude-sonnet-5-5" (same spelling as the gateway); pi wants (provider, id).
  const [provider, ...rest] = opts.model.split("/");
  const agentDir = path.join(WORKTREES, ".pi-agent");
  mkdirSync(agentDir, { recursive: true });

  const runtime = await ModelRuntime.create({ authPath: path.join(agentDir, "auth.json"), modelsPath: path.join(agentDir, "models.json") });
  await runtime.setRuntimeApiKey(provider, key);
  const model = runtime.getModel(provider, rest.join("/"));
  if (!model) throw new Error(`pi does not know the model ${opts.model} (expected e.g. anthropic/claude-sonnet-5-5)`);

  const box = sandbox(opts.dir, opts.shop);
  const guard: ExtensionFactory = (pi) => {
    pi.on("tool_call", (event) => {
      const name = event.toolName as string;
      if (name === "run") return undefined;
      if (!(FILE_TOOLS as readonly string[]).includes(name)) return { block: true, reason: `${name} is not available here` };
      const p = (event.input as { path?: string }).path ?? ".";
      try {
        if (WRITE_TOOLS.has(name)) box.writable(p);
        else box.inside(p);
        return undefined;
      } catch (e) {
        return { block: true, reason: (e as Error).message };
      }
    });
  };

  const runTool: ToolDefinition = {
    name: "run",
    label: "run",
    description: RUN_DESCRIPTION(opts.shop),
    promptSnippet: "Run an allowed command (typecheck/build/lint of this shop, grep, ls, git diff/status)",
    parameters: Type.Object({ cmd: Type.String() }),
    async execute(_id, params) {
      let text: string;
      try { text = box.run((params as { cmd: string }).cmd); } catch (e) { text = `ERROR: ${(e as Error).message}`; }
      return { content: [{ type: "text", text }], details: undefined };
    },
  };

  const resourceLoader = new DefaultResourceLoader({
    cwd: opts.dir, agentDir,
    systemPromptOverride: () => opts.instructions,
    appendSystemPromptOverride: () => [],
    extensionFactories: [guard],
  });
  await resourceLoader.reload();

  const { session } = await createAgentSession({
    cwd: opts.dir, agentDir, model, thinkingLevel: "medium", modelRuntime: runtime, resourceLoader,
    tools: [...FILE_TOOLS, "run"], customTools: [runTool],
    sessionManager: SessionManager.inMemory(opts.dir),
    settingsManager: SettingsManager.inMemory({ compaction: { enabled: true }, retry: { enabled: true, maxRetries: 3 } }),
  });

  let steps = 0, exhausted = false;
  const argsOf = new Map<string, unknown>();
  const unsubscribe = session.subscribe((event) => {
    if (event.type === "tool_execution_start") { argsOf.set(event.toolCallId, event.args); return; }
    if (event.type !== "tool_execution_end") return;
    steps++;
    const result = event.result as { content?: { type: string; text?: string }[] } | undefined;
    const text = (result?.content ?? []).map((c) => c.text ?? "").join("\n");
    opts.onStep?.(event.toolName, JSON.stringify(argsOf.get(event.toolCallId) ?? {}), event.isError ? `ERROR: ${text}` : text);
    if (steps >= opts.maxSteps && !exhausted) { exhausted = true; void session.abort(); }
  });
  try {
    await session.prompt(opts.input);
    return { text: session.getLastAssistantText() ?? "", steps, exhausted };
  } finally {
    unsubscribe();
    session.dispose();
  }
}
