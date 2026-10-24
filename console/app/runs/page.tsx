import Link from "next/link";
import { listRuns } from "@/lib/data";
import { Badge, Card, Empty, Page, ago, inr } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Runs({ searchParams }: { searchParams: Promise<{ suite?: string; agent?: string }> }) {
  const { suite, agent } = await searchParams;
  const all = listRuns();
  const runs = all.filter((r) => (!suite || r.suiteId === suite) && (!agent || r.agentId === agent));
  const suites = [...new Set(all.map((r) => r.suiteId))].sort().reverse();
  const agents = [...new Set(all.map((r) => r.agentId))].sort();

  return (
    <Page title="Runs" sub="One agent attempting one task. Truth comes from the shop's flight recorder; the agent's report is untrusted.">
      <Card
        title={`${runs.length} run${runs.length === 1 ? "" : "s"}`}
        actions={
          <form className="flex flex-wrap gap-2">
            <select name="suite" defaultValue={suite ?? ""} className="input"><option value="">all suites</option>{suites.map((s) => <option key={s}>{s}</option>)}</select>
            <select name="agent" defaultValue={agent ?? ""} className="input"><option value="">all agents</option>{agents.map((a) => <option key={a}>{a}</option>)}</select>
            <button className="btn">Filter</button>
          </form>
        }
      >
        {runs.length ? (
          <div className="scroll-x">
            <table className="t">
              <thead><tr><th>Run</th><th>Agent</th><th>Suite</th><th>Variant / task</th><th>#</th><th>Status</th><th>Completed</th><th>Avoided</th><th>Paid</th><th>Overpaid</th><th>When</th></tr></thead>
              <tbody>
                {runs.map((r) => {
                  const av = r.score?.checks.filter((c) => c.kind === "avoidance") ?? [];
                  return (
                    <tr key={r.runId}>
                      <td><Link className="link font-mono" href={`/runs/${r.runId}`}>{r.runId}</Link></td>
                      <td>{r.agentId}</td>
                      <td className="font-mono text-xs">{r.suiteId}</td>
                      <td className="font-mono text-xs">{r.variantId}/{r.taskId}</td>
                      <td className="tabular-nums">{r.repeat}</td>
                      <td><Badge>{r.status}</Badge></td>
                      <td>{r.score ? <Badge tone={r.score.completed ? "ok" : "bad"}>{r.score.completed ? "yes" : "no"}</Badge> : <span className="text-xs text-[var(--muted)]">unscored</span>}</td>
                      <td className="tabular-nums">{r.score ? (av.length ? `${av.filter((c) => c.passed).length}/${av.length}` : "—") : ""}</td>
                      <td className="tabular-nums">{inr(r.score?.finalTotalInr)}</td>
                      <td className="tabular-nums">{inr(r.score?.overpaymentInr)}</td>
                      <td className="text-[var(--muted)]">{ago(r.startedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <Empty>No runs match.</Empty>}
      </Card>
    </Page>
  );
}
