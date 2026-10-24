import { readFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import express from "express";
import { AGENT_CARD_PATH, TaskState, Role, type AgentCard, type Message, type Part, type TaskStatusUpdateEvent } from "@a2a-js/sdk";
import { AgentEvent, DefaultRequestHandler, InMemoryTaskStore, type AgentExecutor, type ExecutionEventBus } from "@a2a-js/sdk/server";
import { agentCardHandler, jsonRpcHandler, UserBuilder } from "@a2a-js/sdk/server/express";
import { z } from "zod";
import { AgentReport } from "../../contracts/index.ts";
import { structured, toolLoop } from "../../llm.ts";
import { browserTools, launchBrowser } from "./browser-tools.ts";

/** A reference agent under test: `tsx --env-file=.env engine/agents/reference/server.ts --config careful --port 41001`. */
const { values } = parseArgs({ options: { config: { type: "string", default: "careful" }, port: { type: "string", default: "41001" } } });
const Config = z.object({ id: z.string(), name: z.string(), model: z.string(), systemPrompt: z.string(), maxSteps: z.number().int().positive() });
const cfg = Config.parse(JSON.parse(readFileSync(path.join(import.meta.dirname, "configs", `${values.config}.json`), "utf8")));
const port = Number(values.port);
const url = `http://127.0.0.1:${port}`;

const browser = await launchBrowser();

const textPart = (value: string): Part => ({ content: { $case: "text", value }, mediaType: "text/plain", filename: "", metadata: {} });
const agentMessage = (taskId: string, contextId: string, parts: Part[]): Message => ({
  messageId: crypto.randomUUID(), taskId, contextId, role: Role.ROLE_AGENT, parts, metadata: {}, extensions: [], referenceTaskIds: [],
});
const status = (taskId: string, contextId: string, state: TaskState, text?: string): TaskStatusUpdateEvent => ({
  taskId, contextId, metadata: {},
  status: { state, timestamp: new Date().toISOString(), message: text ? agentMessage(taskId, contextId, [textPart(text)]) : undefined },
});

/** The model's final answer as an AgentReport: parse, else one coercion call, else gave_up. */
async function toReport(text: string, log: string[]): Promise<AgentReport> {
  try { return AgentReport.parse(JSON.parse(text.replace(/^[^{]*/, "").replace(/[^}]*$/, ""))); } catch { console.log(`[${cfg.id}] final answer is not a valid report; coercing`); }
  try {
    return await structured({
      model: cfg.model, schema: AgentReport, name: "agent_report",
      instructions: "Turn this shopping agent's final answer and action log into the report format. Use only facts from the input.",
      input: `Final answer:\n${text || "(none: the agent ran out of steps)"}\n\nAction log (last entries):\n${log.slice(-15).join("\n")}`,
    });
  } catch {
    return { outcome: "gave_up", cart: [], totalInr: 0, concerns: [] };
  }
}

const running = new Map<string, { ac: AbortController; contextId: string }>();

const executor: AgentExecutor = {
  async execute(ctx, bus) {
    const { taskId, contextId } = ctx;
    const ac = new AbortController();
    running.set(taskId, { ac, contextId });
    bus.publish(AgentEvent.task({ id: taskId, contextId, status: { state: TaskState.TASK_STATE_SUBMITTED, message: undefined, timestamp: new Date().toISOString() }, artifacts: [], history: [ctx.userMessage], metadata: {} }));
    bus.publish(AgentEvent.statusUpdate(status(taskId, contextId, TaskState.TASK_STATE_WORKING)));
    const input = ctx.userMessage.parts.map((p) => (p.content?.$case === "text" ? p.content.value : "")).join("\n");
    const startUrl = input.match(/https?:\/\/\S+/)?.[0];
    const browserCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const log: string[] = [];
    try {
      if (!startUrl) throw new Error("no start URL in the request");
      const page = await browserCtx.newPage();
      page.setDefaultTimeout(8000);
      await page.goto(startUrl);
      // A client may lower the step budget via message metadata; it can never raise it.
      const maxSteps = Math.min(cfg.maxSteps, Number(ctx.userMessage.metadata?.maxSteps) || Infinity);
      const { tools, steps } = browserTools(page, { startUrl, maxSteps });
      const t0 = Date.now();
      // +3 model turns past the tool budget so a model that hits the limit can still write its report.
      const r = await toolLoop({
        model: cfg.model, instructions: cfg.systemPrompt, input, tools, maxSteps: maxSteps + 3, signal: ac.signal,
        onStep: (name, args, out) => { log.push(`${name} ${args} -> ${out.slice(0, 300).replace(/\n/g, " ")}`); console.log(`[${cfg.id}] ${taskId.slice(0, 8)} #${log.length} ${name} ${args} -> ${out.slice(0, 120).replace(/\n/g, " ")}`); },
      });
      const report = await toReport(r.text, log);
      console.log(`[${cfg.id}] ${taskId.slice(0, 8)} done: ${steps()} steps, ${Math.round((Date.now() - t0) / 1000)}s, ${report.outcome} ₹${report.totalInr}`);
      if (ac.signal.aborted) return;
      bus.publish(AgentEvent.artifactUpdate({
        taskId, contextId, append: false, lastChunk: true, metadata: {},
        artifact: {
          artifactId: crypto.randomUUID(), name: "agent_report", description: "AgentReport", metadata: { steps: steps() }, extensions: [],
          parts: [{ content: { $case: "data", value: report }, mediaType: "application/json", filename: "", metadata: {} }, textPart(JSON.stringify(report))],
        },
      }));
      bus.publish(AgentEvent.statusUpdate(status(taskId, contextId, TaskState.TASK_STATE_COMPLETED)));
    } catch (e) {
      if (ac.signal.aborted) return; // cancelTask already published CANCELED
      console.error(`[${cfg.id}] ${taskId.slice(0, 8)} failed:`, e);
      bus.publish(AgentEvent.statusUpdate(status(taskId, contextId, TaskState.TASK_STATE_FAILED, (e as Error).message)));
    } finally {
      running.delete(taskId);
      await browserCtx.close().catch(() => {});
      bus.finished();
    }
  },
  async cancelTask(taskId: string, bus: ExecutionEventBus) {
    const r = running.get(taskId);
    r?.ac.abort();
    bus.publish(AgentEvent.statusUpdate(status(taskId, r?.contextId ?? "", TaskState.TASK_STATE_CANCELED, "canceled")));
    bus.finished();
  },
};

const card: AgentCard = {
  name: cfg.name,
  description: "Shops on a website for you and stops at the payment page. Replies with a JSON report of the cart and any concerns.",
  supportedInterfaces: [{ url, protocolBinding: "JSONRPC", tenant: "", protocolVersion: "1.0" }],
  provider: undefined, version: "1.0.0",
  capabilities: { streaming: true, pushNotifications: false, extensions: [] },
  securitySchemes: {}, securityRequirements: [],
  defaultInputModes: ["text/plain"], defaultOutputModes: ["application/json", "text/plain"],
  skills: [{ id: "shop", name: "Shop", description: "Complete a shopping request on a given site, up to the payment page.", tags: ["shopping", "browser"], examples: [], inputModes: [], outputModes: [], securityRequirements: [] }],
  signatures: [],
};

const handler = new DefaultRequestHandler(card, new InMemoryTaskStore(), executor);
const app = express();
app.use(`/${AGENT_CARD_PATH}`, agentCardHandler({ agentCardProvider: handler }));
app.use(jsonRpcHandler({ requestHandler: handler, userBuilder: UserBuilder.noAuthentication }));
const server = app.listen(port, "127.0.0.1", () => console.log(`[${cfg.id}] ${cfg.model} A2A agent on ${url}`));
const stop = async () => { server.close(); await browser.close(); process.exit(0); };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
