import Link from "next/link";
import { listRuns, listSuites, listVariants, ratings } from "@/lib/data";
import { list as jobs } from "@/lib/jobs";
import { Badge, Bar, Card, Empty, Page, Stars, Stat, ago, inr } from "@/components/ui";
import { MutateForm } from "./variants/forms";
import { Pipeline } from "@/components/Pipeline";

export const dynamic = "force-dynamic";

export default function Overview() {
  const variants = listVariants();
  const suites = listSuites();
  const runs = listRuns();
  const running = jobs().filter((j) => j.status === "running");
  const latest = suites[0];
  const board = latest ? ratings(latest.suiteId).leaderboard : [];
  const count = (s: string) => variants.filter((v) => v.status === s).length;

  return (
    <Page title="Overview" sub="mutate → gates → build-suite → run → score → rate">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Variants passed" value={count("passed")} href="/variants" />
        <Stat label="Failed / incomplete" value={`${count("failed")} / ${count("incomplete") + count("pending")}`} href="/variants" />
        <Stat label="Suites" value={suites.length} href="/suites" />
        <Stat label="Runs" value={runs.length} href="/runs" />
        <Stat label="Jobs running" value={running.length} href="/jobs" />
      </div>

      <Card title="Pipeline" actions={<Link className="link text-sm" href="/pipeline">Full size</Link>}>
        <Pipeline />
      </Card>

      <Card title="New variants">
        <MutateForm />
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title={latest ? <>Leaderboard · <Link className="link" href={`/suites/${latest.suiteId}`}>{latest.suiteId}</Link></> : "Leaderboard"}>
          {board.length ? (
            <table className="t">
              <thead><tr><th>Agent</th><th>Overall</th><th>Avoidance</th><th>Range</th></tr></thead>
              <tbody>
                {[...board].sort((a, b) => b.overall - a.overall).map((r) => (
                  <tr key={r.agentId}>
                    <td>{r.agentId}<div><Stars n={r.stars} /></div></td>
                    <td className="tabular-nums font-semibold">{r.overall}</td>
                    <td><Bar value={r.subScores.avoidance} /></td>
                    <td className="tabular-nums text-xs text-[var(--muted)]">{r.range.min}–{r.range.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <Empty>No ratings yet. Build a suite, start agents, then evaluate.</Empty>}
        </Card>

        <Card title="Recent variants" actions={<Link className="link text-sm" href="/variants">All</Link>}>
          {variants.length ? (
            <ul className="divide-y divide-[var(--border)] text-sm">
              {variants.slice(0, 6).map((v) => (
                <li key={v.variantId} className="flex items-center justify-between gap-3 py-2">
                  <Link className="link font-mono" href={`/variants/${v.variantId}`}>{v.variantId}</Link>
                  <span className="truncate text-[var(--muted)]">{v.shop} · {v.record ? v.record.patterns.map((p) => p.category).join(", ") : v.dirty ? "edits in progress" : "no record"}</span>
                  <Badge>{v.status}</Badge>
                </li>
              ))}
            </ul>
          ) : <Empty>No variants yet.</Empty>}
        </Card>
      </div>

      <Card title="Recent runs" actions={<Link className="link text-sm" href="/runs">All</Link>}>
        {runs.length ? (
          <div className="scroll-x">
            <table className="t">
              <thead><tr><th>Run</th><th>Agent</th><th>Variant / task</th><th>Status</th><th>Paid</th><th>Overpaid</th><th>When</th></tr></thead>
              <tbody>
                {runs.slice(0, 8).map((r) => (
                  <tr key={r.runId}>
                    <td><Link className="link font-mono" href={`/runs/${r.runId}`}>{r.runId}</Link></td>
                    <td>{r.agentId}</td>
                    <td className="font-mono text-xs">{r.variantId}/{r.taskId}</td>
                    <td><Badge>{r.status}</Badge></td>
                    <td className="tabular-nums">{inr(r.score?.finalTotalInr)}</td>
                    <td className="tabular-nums">{inr(r.score?.overpaymentInr)}</td>
                    <td className="text-[var(--muted)]">{ago(r.startedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>No runs yet.</Empty>}
      </Card>
    </Page>
  );
}
