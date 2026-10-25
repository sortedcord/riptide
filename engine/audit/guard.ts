import { existsSync, realpathSync } from "node:fs";
import path from "node:path";

/**
 * pi extension loaded into the auditor (`pi -e guard.ts`). The uploaded code is untrusted: it may contain text that
 * tries to steer the model. Whatever the model asks for, only read-only tools run, and only on paths inside the upload
 * (the process cwd), symlinks resolved. Anything else is blocked before it executes.
 */
const READ_ONLY = new Set(["read", "grep", "find", "ls"]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- loaded by pi at runtime; its types are not needed here
export default function guard(pi: any) {
  const root = realpathSync(process.cwd());
  pi.on("tool_call", (event: { toolName: string; input?: { path?: unknown } }) => {
    if (!READ_ONLY.has(event.toolName)) return { block: true, reason: `${event.toolName} is not available in an audit` };
    const p = event.input?.path ?? ".";
    if (typeof p !== "string" || p.startsWith("~")) return { block: true, reason: "only files inside the uploaded platform can be read" };
    const abs = path.resolve(root, p);
    let real = abs;
    try { if (existsSync(abs)) real = realpathSync(abs); } catch { /* keep abs */ }
    if (real !== root && !real.startsWith(root + path.sep)) return { block: true, reason: "only files inside the uploaded platform can be read" };
    return undefined;
  });
}
