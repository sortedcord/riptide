import { spawn, execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { createServer } from "node:net";
import path from "node:path";
import { ROOT, WORKTREES, DATA } from "../paths.ts";
import type { Shop } from "../contracts/index.ts";

export const git = (args: string[], cwd = ROOT) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

/**
 * A git worktree at WORKTREES/{name} on `ref` (created with `newBranch` if given).
 * node_modules is a hardlinked copy of the main checkout's: Turbopack refuses symlinks that leave the
 * worktree root, and the relative @riptide/* workspace links then resolve inside the worktree.
 */
export function ensureWorktree(name: string, ref: string, newBranch?: string): string {
  const dir = path.join(WORKTREES, name);
  if (!existsSync(dir)) {
    mkdirSync(WORKTREES, { recursive: true });
    git(["worktree", "add", "-q", ...(newBranch ? ["-b", newBranch, dir, ref] : ["--detach", dir, ref])]);
  } else if (!newBranch && git(["rev-parse", "HEAD"], dir) !== git(["rev-parse", `${ref}^{commit}`])) {
    // Only check out when the worktree is elsewhere: a needless checkout takes the index lock and fails if
    // anything else (an editor's git status, a parallel job) holds it at that moment.
    git(["checkout", "-q", "--detach", ref], dir);
  }
  if (!existsSync(path.join(dir, "node_modules"))) execFileSync("cp", ["-al", path.join(ROOT, "node_modules"), path.join(dir, "node_modules")]);
  return dir;
}

/** The honest build: a detached worktree on master, so the main checkout is never built into. */
export const controlWorktree = () => ensureWorktree("control", git(["rev-parse", "master"]));

export function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const s = createServer().listen(0, "127.0.0.1", () => {
      const { port } = s.address() as { port: number };
      s.close(() => resolve(port));
    }).on("error", reject);
  });
}

/** Shell out and throw with the tail of the output on failure. */
export function sh(cmd: string, args: string[], cwd: string, env: NodeJS.ProcessEnv = {}): string {
  try {
    return execFileSync(cmd, args, { cwd, encoding: "utf8", env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 << 20 });
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; message: string };
    throw new Error(`${cmd} ${args.join(" ")} failed:\n${`${err.stdout ?? ""}${err.stderr ?? ""}`.slice(-4000) || err.message}`);
  }
}

export const buildShop = (dir: string, shop: Shop) => sh("npm", ["run", "build", "-w", `shops/${shop}`], dir);

export type Served = { origin: string; stop: () => void };

/** `next start` the shop in `dir` on a free port, recorder writing to data/recorder. Builds first unless `build: false`. */
export async function serveShop(dir: string, shop: Shop, { build = true } = {}): Promise<Served> {
  if (build) buildShop(dir, shop);
  const port = await freePort();
  const child = spawn("npx", ["next", "start", "-p", String(port), "-H", "127.0.0.1"], {
    cwd: path.join(dir, "shops", shop),
    env: { ...process.env, RECORDER_DIR: path.join(DATA, "recorder"), RECORDER_SECRET: process.env.RECORDER_SECRET ?? "local-dev-secret" },
    stdio: ["ignore", "ignore", "inherit"],
    detached: true,
  });
  const origin = `http://127.0.0.1:${port}`;
  const stop = () => { try { process.kill(-child.pid!, "SIGTERM"); } catch { /* already gone */ } };
  for (let i = 0; i < 120; i++) {
    if (child.exitCode !== null) throw new Error(`next start for ${shop} exited with ${child.exitCode}`);
    try { if ((await fetch(`${origin}/api/slots`)).ok) return { origin, stop }; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  stop();
  throw new Error(`next start for ${shop} did not come up on ${origin}`);
}
