import { Role, SendMessageRequest, StreamResponse, Task as A2ATask, TaskState, type Artifact } from "@a2a-js/sdk";
import { ClientFactory } from "@a2a-js/sdk/client";
import { AgentReport } from "../contracts/index.ts";

const TERMINAL = [TaskState.TASK_STATE_COMPLETED, TaskState.TASK_STATE_FAILED, TaskState.TASK_STATE_CANCELED, TaskState.TASK_STATE_REJECTED,
  TaskState.TASK_STATE_INPUT_REQUIRED, TaskState.TASK_STATE_AUTH_REQUIRED];

export type SendResult = { status: "completed" | "timeout" | "error"; error?: string; report: AgentReport | null; transcript: unknown[] };

/** Untrusted: the first artifact part that parses as an AgentReport (DataPart, else JSON in a TextPart). */
function findReport(artifacts: Artifact[]): AgentReport | null {
  for (const a of artifacts) for (const p of a.parts) {
    let v: unknown = p.content?.$case === "data" ? p.content.value : undefined;
    if (p.content?.$case === "text") try { v = JSON.parse(p.content.value); } catch { continue; }
    const r = AgentReport.safeParse(v);
    if (r.success) return r.data;
  }
  return null;
}

/** One Riptide task to one A2A agent: discover, send, stream (poll as fallback) until terminal or timeout. */
export async function sendTask(opts: { agentCardUrl: string; text: string; timeoutMs: number; maxSteps: number }): Promise<SendResult> {
  const transcript: unknown[] = [];
  const log = (kind: string, body: unknown) => transcript.push({ t: new Date().toISOString(), kind, body });
  const artifacts: Artifact[] = [];
  let taskId = "";
  let state: TaskState | undefined;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), opts.timeoutMs);
  const finish = (status: SendResult["status"], error?: string): SendResult => {
    clearTimeout(timer);
    return { status, error, report: status === "completed" ? findReport(artifacts) : null, transcript };
  };

  try {
    const client = opts.agentCardUrl.endsWith(".json")
      ? await new ClientFactory().createFromUrl(opts.agentCardUrl, "")
      : await new ClientFactory().createFromUrl(opts.agentCardUrl);
    log("agent_card", await client.getAgentCard());
    const request = {
      tenant: "", metadata: {}, configuration: undefined,
      message: { messageId: crypto.randomUUID(), contextId: "", taskId: "", role: Role.ROLE_USER, parts: [{ content: { $case: "text" as const, value: opts.text }, mediaType: "text/plain", filename: "", metadata: {} }], metadata: { maxSteps: opts.maxSteps }, extensions: [], referenceTaskIds: [] },
    };
    log("request:sendMessageStream", SendMessageRequest.toJSON(request));
    const onTask = (t: A2ATask) => { taskId = t.id; state = t.status?.state; artifacts.splice(0, artifacts.length, ...t.artifacts); };
    try {
      // A quiet stream never notices the abort signal, so race every read against it.
      const aborted = new Promise<never>((_, reject) => ac.signal.addEventListener("abort", () => reject(new Error("timeout")), { once: true }));
      aborted.catch(() => {});
      const it = client.sendMessageStream(request, { signal: ac.signal })[Symbol.asyncIterator]();
      for (;;) {
        const next = await Promise.race([it.next(), aborted]);
        if (next.done) break;
        const ev = next.value;
        log("event", StreamResponse.toJSON(ev));
        const p = ev.payload;
        if (p?.$case === "task") onTask(p.value);
        else if (p?.$case === "statusUpdate") { taskId = p.value.taskId; state = p.value.status?.state; }
        else if (p?.$case === "artifactUpdate" && p.value.artifact) artifacts.push(p.value.artifact);
        else if (p?.$case === "message") return finish("error", "agent replied with a message, not a task");
      }
    } catch (e) {
      if (!ac.signal.aborted) log("stream_error", String(e)); // fall through to polling
    }
    // Stream ended without a terminal state (dropped connection): poll.
    while (!(state !== undefined && TERMINAL.includes(state)) && taskId && !ac.signal.aborted) {
      await new Promise((r) => setTimeout(r, 2000));
      const t = await client.getTask({ tenant: "", id: taskId }, { signal: ac.signal }).catch(() => null);
      log("response:getTask", t && A2ATask.toJSON(t));
      if (t) onTask(t);
    }
    if (ac.signal.aborted) {
      if (taskId) {
        log("request:cancelTask", { id: taskId });
        const t = await client.cancelTask({ tenant: "", id: taskId, metadata: {} }, { signal: AbortSignal.timeout(10_000) }).catch((e) => String(e));
        log("response:cancelTask", typeof t === "string" ? t : A2ATask.toJSON(t));
      }
      return finish("timeout");
    }
    return state === TaskState.TASK_STATE_COMPLETED ? finish("completed") : finish("error", `task ended in state ${state ?? "unknown"}`);
  } catch (e) {
    log("error", String(e));
    return finish(ac.signal.aborted ? "timeout" : "error", String(e));
  }
}
