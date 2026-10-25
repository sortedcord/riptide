#!/usr/bin/env -S npx tsx
import { parseArgs } from "node:util";

// A parent like `next dev` (the console) leaks NODE_ENV=development, which makes every `next build` of a shop fail.
// Shop builds and `next start` set their own NODE_ENV.
delete process.env.NODE_ENV;

/**
 * riptide <command>. Stages run in order: mutate → build-suite → run → score → rate (→ learn, pass 2).
 * Each command is a thin wrapper; the work lives in the stage modules.
 */
const USAGE = `riptide <command> [options]
  mutate       --shop <shop> [--version v1] [--model <id>]   Trickster: new variant branch + mutation record + tasks, then gates
  gates        --variant <id>                         re-run the mechanical gates for a variant
  build-suite  --suite <riptide-suite-x.y.z|next> --variants <id,id,…|fresh> [--controls market,saas|all]
  run          --suite <id> --agent-card <url[,url…]> [--agent <id>] [--repeats 1] [--only <variantId>] [--concurrency 4]
  score        --suite <id> [--agent <id>] [--no-judge] [--rejudge]   recorder checks + LLM judge (awareness, escalation)
  rate         --suite <id> [--agent <id>]`;

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    shop: { type: "string" }, version: { type: "string" }, variant: { type: "string" }, variants: { type: "string" },
    controls: { type: "string" }, suite: { type: "string" }, "agent-card": { type: "string" }, agent: { type: "string" },
    repeats: { type: "string" }, only: { type: "string" }, model: { type: "string" }, concurrency: { type: "string" }, "no-judge": { type: "boolean" }, rejudge: { type: "boolean" },
  },
});

const need = (k: keyof typeof values) => {
  const v = values[k];
  if (typeof v !== "string") { console.error(`missing --${k}\n\n${USAGE}`); process.exit(2); }
  return v;
};
const list = (s?: string) => (s ? s.split(",").map((x) => x.trim()).filter(Boolean) : []);

switch (positionals[0]) {
  case "mutate": {
    const { mutate } = await import("./trickster/run.ts");
    await mutate({ shop: need("shop") as never, version: values.version, model: values.model });
    break;
  }
  case "gates": {
    const { runGates } = await import("./trickster/gates.ts");
    const r = await runGates(need("variant"));
    process.exitCode = r.passed ? 0 : 1;
    break;
  }
  case "build-suite": {
    const { buildSuite, resolveSuiteArgs } = await import("./suite/build.ts");
    await buildSuite(resolveSuiteArgs(need("suite"), list(values.variants), list(values.controls)));
    break;
  }
  case "run": {
    const { runSuite } = await import("./agents/run.ts");
    await runSuite({
      suiteId: need("suite"), agentCardUrls: list(need("agent-card")), agentId: values.agent, repeats: Number(values.repeats ?? 1), only: values.only,
      concurrency: values.concurrency ? Number(values.concurrency) : undefined,
    });
    break;
  }
  case "score": {
    const { scoreSuite } = await import("./scorer/score.ts");
    await scoreSuite({ suiteId: need("suite"), agentId: values.agent, ...(values["no-judge"] ? { judge: false } : {}), rejudge: !!values.rejudge });
    break;
  }
  case "rate": {
    const { rateSuite } = await import("./scorer/rate.ts");
    await rateSuite({ suiteId: need("suite"), agentId: values.agent });
    break;
  }
  default:
    console.log(USAGE);
    process.exitCode = positionals[0] ? 2 : 0;
}
