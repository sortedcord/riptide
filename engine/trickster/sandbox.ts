import { execFileSync } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import path from "node:path";

/** What the Trickster may touch in a variant worktree. Shared by both harnesses (our tool loop and pi). */
export const OUT = "trickster-output.json";
export const SCOPE = (shop: string) => `shops/${shop}/`;
const NPM_OK = new Set(["typecheck", "build", "lint"]);

export const clip = (s: string, n = 12000) => (s.length > n ? `${s.slice(0, n)}\n… [${s.length - n} more chars truncated]` : s);

export function sandbox(dir: string, shop: string) {
  /** Absolute path for `rel` (relative or absolute), refusing anything outside the worktree, symlinks included. */
  const inside = (rel: string) => {
    if (rel.startsWith("~")) throw new Error(`path outside the worktree: ${rel}`);
    const abs = path.resolve(dir, rel);
    if (abs !== dir && !abs.startsWith(dir + path.sep)) throw new Error(`path outside the worktree: ${rel}`);
    if (existsSync(abs)) {
      const real = realpathSync(abs);
      if (real !== dir && !real.startsWith(dir + path.sep)) throw new Error(`path resolves outside the worktree: ${rel}`);
    }
    return abs;
  };
  /** Writes only under shops/{shop}/ (never node_modules/.next) or trickster-output.json at the root. */
  const writable = (rel: string) => {
    const abs = inside(rel);
    const r = path.relative(dir, abs);
    if (r !== OUT && !r.startsWith(SCOPE(shop))) throw new Error(`you may only write under ${SCOPE(shop)} (or ${OUT})`);
    if (/(^|\/)(node_modules|\.next)(\/|$)/.test(r)) throw new Error("not writable");
    return abs;
  };
  /** No shell: `npm run typecheck|build|lint -w shops/{shop}`, `grep`, `ls`, `git diff|status`, relative paths only. */
  const run = (cmd: string) => {
    const argv = (cmd.match(/"[^"]*"|'[^']*'|\S+/g) ?? []).map((a) => a.replace(/^(["'])(.*)\1$/, "$2"));
    const [bin, ...args] = argv;
    const okNpm = bin === "npm" && args.length === 4 && args[0] === "run" && NPM_OK.has(args[1]) && args[2] === "-w" && args[3] === `shops/${shop}`;
    const okGit = bin === "git" && ["diff", "status"].includes(args[0]) && !args.some((a) => /^--(output|ext-diff)|^-o/.test(a));
    if (!okNpm && !okGit && !(bin === "grep" || bin === "ls")) throw new Error("command not allowed");
    if (args.some((a) => a.startsWith("/") || a.startsWith("~") || a.split("/").includes(".."))) throw new Error("relative paths inside the repo only");
    try {
      return clip(execFileSync(bin, args, { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 300_000, maxBuffer: 32 << 20 }) || "(no output, exit 0)", 8000);
    } catch (e) {
      const err = e as { status?: number; stdout?: string; stderr?: string; message: string };
      return `exit ${err.status ?? "?"}\n${clip(`${err.stdout ?? ""}${err.stderr ?? ""}` || err.message, 8000)}`;
    }
  };
  return { inside, writable, run };
}

export const RUN_DESCRIPTION = (shop: string) =>
  `Run a command in the repo root (no shell, no pipes). Allowed: \`npm run typecheck|build|lint -w shops/${shop}\`, \`grep …\`, \`ls …\`, \`git diff|status …\`. Relative paths only.`;
