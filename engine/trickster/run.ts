import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { MutationRecord, Task, TricksterOutput, type Shop } from "../contracts/index.ts";
import { toolLoop, type Tool } from "../llm.ts";
import { DATA, ROOT, listJson, p, writeJson } from "../paths.ts";
import { branchOf, changedFiles, runGates } from "./gates.ts";
import { runPi } from "./pi.ts";
import { OUT, RUN_DESCRIPTION, SCOPE, sandbox } from "./sandbox.ts";
import { ensureWorktree, git } from "./serve.ts";

const MAX_RETRIES = 2;
/** Model for the Trickster unless --model / console settings choose another. */
const TRICKSTER_MODEL = process.env.RIPTIDE_TRICKSTER_MODEL || "anthropic/claude-sonnet-5-5";
/** "pi" (default): the pi harness on the Anthropic Messages API. "loop": our own tool loop over the gateway's Responses API. */
const HARNESS = process.env.RIPTIDE_TRICKSTER_HARNESS === "loop" ? "loop" : "pi";
const newId = () => "v_" + Array.from({ length: 6 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("");

/** Tools for the Trickster, confined to the worktree; writes confined to shops/{shop}/ plus trickster-output.json. */
function tools(dir: string, shop: Shop): Tool[] {
  const box = sandbox(dir, shop);
  const { inside, writable } = box;
  return [
    {
      name: "list_dir", description: "List a directory (relative to the repo root). Skips node_modules and .next.",
      params: z.object({ path: z.string() }),
      run: ({ path: rel }: { path: string }) => readdirSync(inside(rel), { withFileTypes: true })
        .filter((e) => e.name !== "node_modules" && e.name !== ".next" && e.name !== ".git")
        .map((e) => (e.isDirectory() ? `${e.name}/` : e.name)).join("\n"),
    },
    {
      name: "read_file", description: "Read a text file (relative to the repo root).",
      params: z.object({ path: z.string() }),
      run: ({ path: rel }: { path: string }) => {
        const abs = inside(rel);
        if (statSync(abs).size > 200_000) throw new Error("file too large");
        return readFileSync(abs, "utf8");
      },
    },
    {
      name: "write_file", description: `Create or overwrite a file. Only under ${SCOPE(shop)} or ${OUT} at the root.`,
      params: z.object({ path: z.string(), content: z.string() }),
      run: ({ path: rel, content }: { path: string; content: string }) => {
        const abs = writable(rel);
        mkdirSync(path.dirname(abs), { recursive: true });
        writeFileSync(abs, content);
        return `wrote ${rel} (${content.length} chars)`;
      },
    },
    {
      name: "replace_in_file", description: "Replace one exact, unique occurrence of `old` with `new` in a file you may write.",
      params: z.object({ path: z.string(), old: z.string(), new: z.string() }),
      run: ({ path: rel, old, new: nu }: { path: string; old: string; new: string }) => {
        const abs = writable(rel);
        const src = readFileSync(abs, "utf8");
        const n = src.split(old).length - 1;
        if (n !== 1) throw new Error(`\`old\` must occur exactly once; found ${n} occurrences`);
        writeFileSync(abs, src.replace(old, () => nu));
        return `edited ${rel}`;
      },
    },
    {
      name: "run", description: RUN_DESCRIPTION(shop),
      params: z.object({ cmd: z.string() }),
      run: ({ cmd }: { cmd: string }) => box.run(cmd),
    },
  ];
}

/** Context for the Trickster. `catalog` adds docs/PATTERN_CATALOG.md (v2+ instructions ask for it; v1 stays as it was run). */
function inputs(shop: Shop, catalog = false): string {
  const read = (f: string) => readFileSync(path.join(ROOT, f), "utf8");
  const lessonsDir = path.join(DATA, "lessons");
  const latest = listJson(lessonsDir).map((f) => path.join(lessonsDir, f)).sort((a, b) => statSync(a).mtimeMs - statSync(b).mtimeMs).pop();
  return [
    `Shop: ${shop}. Worktree root = repo root. Edit scope: ${SCOPE(shop)}.`,
    `## shops/${shop}/README.md\n${read(`shops/${shop}/README.md`)}`,
    `## shops/${shop}/slots.ts\n${read(`shops/${shop}/slots.ts`)}`,
    `## docs/TAXONOMY.md\n${read("docs/TAXONOMY.md")}`,
    ...(catalog ? [`## docs/PATTERN_CATALOG.md (real-world patterns, already mapped to this engine)\n${read("docs/PATTERN_CATALOG.md")}`] : []),
    `## tests/drivers.ts (the \`${shop}\` driver's buy walk must keep working; verify rules are checked on it)\n${read("tests/drivers.ts")}`,
    latest ? `## Lessons from earlier suites (${path.basename(latest)})\n${readFileSync(latest, "utf8")}` : "## Lessons\nNone yet.",
  ].join("\n\n");
}

/** Parse trickster-output.json. Returns the output plus the per-pattern `files` hint (stripped by the contract schema). */
function readOutput(dir: string): { out: TricksterOutput; files: Record<string, string[]> } {
  const file = path.join(dir, OUT);
  if (!existsSync(file)) throw new Error(`${OUT} was not written`);
  const raw = JSON.parse(readFileSync(file, "utf8"));
  const out = TricksterOutput.parse(raw);
  const files = Object.fromEntries((raw.patterns as { patternId: string; files?: unknown }[]).map((x) => [x.patternId, z.array(z.string()).parse(x.files ?? [])]));
  const bad = out.tasks.filter((t) => !t.startPath.startsWith("/honest/")).map((t) => t.taskId);
  if (bad.length) throw new Error(`startPath must begin with /honest/ (tasks ${bad.join(", ")})`);
  return { out, files };
}

/** Hunks of `git diff master...branch` per file. */
function hunksByFile(branch: string): Record<string, string[]> {
  const res: Record<string, string[]> = {};
  for (const f of changedFiles(branch)) {
    const d = git(["diff", `master...${branch}`, "--", f]);
    res[f] = d.split(/\n(?=@@ )/).slice(1);
  }
  return res;
}

/** riptide mutate: new variant branch + mutation record + tasks, then gates (≤2 retries). */
export async function mutate(opts: { shop: Shop; version?: string; model?: string }): Promise<{ variantId: string; passed: boolean }> {
  const { shop } = opts;
  // Newest version by default (v1, v2, …, v10 sorted numerically).
  const version = opts.version ?? readdirSync(path.join(import.meta.dirname, "versions")).filter((v) => /^v\d+$/.test(v)).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1))).at(-1)!;
  const skill = readFileSync(path.join(import.meta.dirname, "versions", version, "SKILL.md"), "utf8").replaceAll("{shop}", shop);
  const variantId = newId();
  const branch = branchOf({ shop, variantId });
  const baseCommit = git(["rev-parse", "master"]);
  const dir = ensureWorktree(variantId, baseCommit, branch);
  const model = opts.model || TRICKSTER_MODEL;
  console.log(`[mutate] ${variantId} on ${branch} at ${dir} with ${model} (${version}, ${HARNESS} harness)`);

  const base = inputs(shop, skill.includes("PATTERN_CATALOG"));
  let feedback = "";
  let passed = false;
  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    const input = feedback ? `${base}\n\n## Previous attempt failed\n${feedback}` : base;
    const onStep = (name: string, args: unknown, out: string) => console.log(`[trickster] ${name} ${String(args).slice(0, 140)} → ${out.split("\n")[0].slice(0, 120)}`);
    // pi keeps no state between attempts here: each attempt gets the inputs plus the gate feedback; the worktree keeps the edits.
    const r = HARNESS === "pi"
      ? await runPi({ dir, shop, model, instructions: skill, input, maxSteps: 120, onStep })
      : await toolLoop({
        model, instructions: skill, input, tools: tools(dir, shop), maxSteps: 120, onStep,
        // Big context (instructions, catalog, driver code, growing transcript): one call can take minutes.
        callTimeoutMs: Number(process.env.RIPTIDE_TRICKSTER_CALL_TIMEOUT_MS ?? 600_000),
      });
    console.log(`[mutate] attempt ${attempt}: ${r.steps} tool calls${r.exhausted ? " (step limit hit)" : ""}\n${r.text.slice(0, 1500)}`);

    let parsed: ReturnType<typeof readOutput>;
    const outText = existsSync(path.join(dir, OUT)) ? readFileSync(path.join(dir, OUT), "utf8") : "";
    try {
      parsed = readOutput(dir);
    } catch (e) {
      const msg = e instanceof z.ZodError ? e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") : (e as Error).message;
      writeJson(p.gate(`${variantId}.a${attempt}`), { variantId, attempt, passed: false, gates: [{ gate: "record", passed: false, detail: `${OUT}: ${msg}` }] });
      feedback = `${OUT} is invalid: ${msg}\nYour previous ${OUT}:\n${outText}`;
      console.log(`[mutate] ${feedback.slice(0, 600)}`);
      continue;
    }
    rmSync(path.join(dir, OUT));

    git(["add", "-A"], dir);
    if (git(["status", "--porcelain"], dir)) git(["-c", "user.name=Riptide Trickster", "-c", "user.email=trickster@riptide.local", "commit", "-q", "-m", `variant ${variantId} (${version}, attempt ${attempt})`], dir);
    const variantCommit = git(["rev-parse", "HEAD"], dir);

    const hunks = hunksByFile(branch);
    const record = MutationRecord.parse({
      variantId, shop, baseCommit, variantCommit, tricksterVersion: version, createdAt: new Date().toISOString(),
      patterns: parsed.out.patterns.map((x) => {
        const files = parsed.files[x.patternId] ?? [];
        return { ...x, files, diffHunks: files.flatMap((f) => hunks[f] ?? []) };
      }),
      decoys: parsed.out.decoys,
      ...(parsed.out.notes ? { notes: parsed.out.notes } : {}),
    });
    writeJson(p.mutation(variantId), record);
    rmSync(p.tasks(variantId), { recursive: true, force: true });
    for (const t of parsed.out.tasks) writeJson(p.task(variantId, t.taskId), Task.parse({ ...t, variantId }));

    const g = await runGates(variantId, { attempt });
    const verifySkipped = g.gates.some((x) => x.gate === "verify" && x.detail?.startsWith("skipped"));
    const failed = g.gates.filter((x) => !x.passed && !(verifySkipped && x.gate === "verify"));
    passed = g.passed;
    if (!failed.length) break;
    feedback = `Mechanical gates failed:\n${failed.map((x) => `- ${x.gate}: ${x.detail ?? ""}`).join("\n")}\n\nYour previous ${OUT} (rewrite it in full):\n${outText}`;
  }
  console.log(`[mutate] ${variantId}: ${passed ? "passed" : "not passed"}; see ${p.gate(variantId)}`);
  return { variantId, passed };
}
