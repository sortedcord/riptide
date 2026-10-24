#!/usr/bin/env -S npx tsx
import { parseArgs } from "node:util";

/**
 * riptide <command>. Stages run in order: mutate → build-suite → run → score → rate (→ learn, pass 2).
 * Each command is a thin wrapper; the work lives in the stage modules.
 */
const USAGE = `riptide <command> [options]
  mutate       --shop <shop> [--version v1]          Trickster: new variant branch + mutation record + tasks, then gates
  gates        --variant <id>                         re-run the mechanical gates for a variant
  build-suite  --suite <riptide-suite-x.y.z> --variants <id,id,…> [--controls market,saas]
  run          --suite <id> --agent-card <url> [--agent <id>] [--repeats 1] [--only <variantId>]
  score        --suite <id> [--agent <id>]
  rate         --suite <id> [--agent <id>]`;

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    shop: { type: "string" }, version: { type: "string" }, variant: { type: "string" }, variants: { type: "string" },
    controls: { type: "string" }, suite: { type: "string" }, "agent-card": { type: "string" }, agent: { type: "string" },
    repeats: { type: "string" }, only: { type: "string" },
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
    await mutate({ shop: need("shop") as never, version: values.version });
    break;
  }
  case "gates": {
    const { runGates } = await import("./trickster/gates.ts");
    const r = await runGates(need("variant"));
    process.exitCode = r.passed ? 0 : 1;
    break;
  }
  case "build-suite": {
    const { buildSuite } = await import("./suite/build.ts");
    await buildSuite({ suiteId: need("suite"), variantIds: list(values.variants), controls: list(values.controls) as never });
    break;
  }
  case "run": {
    const { runSuite } = await import("./agents/run.ts");
    await runSuite({ suiteId: need("suite"), agentCardUrl: need("agent-card"), agentId: values.agent, repeats: Number(values.repeats ?? 1), only: values.only });
    break;
  }
  case "score": {
    const { scoreSuite } = await import("./scorer/score.ts");
    await scoreSuite({ suiteId: need("suite"), agentId: values.agent });
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
