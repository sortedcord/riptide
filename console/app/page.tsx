import Link from "next/link";
import { listRuns, listSuites, listVariants, ratings } from "@/lib/data";
import { list as jobs } from "@/lib/jobs";
import { Badge, Bar, Blades, Card, Empty, Page, Stars, Stat, Stats, ago, inr } from "@/components/ui";
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
  const top = [...board].sort((a, b) => b.overall - a.overall)[0];
  const busy = running.filter((j) => !j.service);

  return (
    <Page title={<>Watch the<br />tricksters work</>} sub="Mutate, gate, freeze a suite, run agents, score and rate. Every stage of the loop, live.">
      <Stats>
        <Stat label="Variants passed" value={count("passed")} href="/variants" />
        <Stat label="Failed / incomplete" value={`${count("failed")} / ${count("incomplete") + count("pending")}`} href="/variants" />
        <Stat label="Suites" value={suites.length} href="/suites" />
        <Stat label="Runs" value={runs.length} href="/runs" />
        <Stat label="Jobs running" value={running.length} href="/jobs" />
      </Stats>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="es-panel es-panel--cream flex min-h-[12rem] md:min-h-[16rem] flex-col">
          <h2 className="card-title">Top rated</h2>
          {top ? (
            <>
              <p className="mt-auto text-[clamp(2.75rem,5vw,4rem)] leading-none font-medium tabular-nums">{top.overall}</p>
              <p className="mt-3 break-words text-lg">{top.agentId}</p>
              <p className="es-dim mt-1 text-sm">{top.stars} of 5 stars on <Link href={`/suites/${latest!.suiteId}`}>{latest!.suiteId}</Link></p>
            </>
          ) : <p className="es-dim mt-auto">No ratings yet. Freeze a suite and evaluate an agent.</p>}
        </section>
        <section className="es-panel es-panel--mesh flex min-h-[16rem] flex-col sm:pr-48">
          <h2 className="card-title">{busy.length ? <>{busy.length} job{busy.length === 1 ? "" : "s"} running</> : "Quiet right now"}</h2>
          <p className="es-dim mt-2 text-sm">{busy.length ? busy.map((j) => j.title).join(" · ") : "Start a Trickster run below or an agent from jobs."}</p>
          <div className="mt-auto pt-6"><Link href="/jobs" className="btn">Open jobs</Link></div>
          <Blades className="h-40" />
        </section>
      </div>

      <Card title="Pipeline" actions={<Link className="btn" href="/pipeline">Full size</Link>}>
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

        <Card title="Recent variants" actions={<Link className="btn" href="/variants">All variants</Link>}>
          {variants.length ? (
            <ul className="divide-y divide-[var(--border)]">
              {variants.slice(0, 6).map((v) => (
                <li key={v.variantId} className="flex items-center justify-between gap-3 py-3">
                  <Link className="link font-mono" href={`/variants/${v.variantId}`}>{v.variantId}</Link>
                  <span className="flex-1 truncate text-sm text-[var(--muted)]">{v.shop} · {v.record ? v.record.patterns.map((p) => p.category).join(", ") : v.dirty ? "edits in progress" : "no record"}</span>
                  <Badge>{v.status}</Badge>
                </li>
              ))}
            </ul>
          ) : <Empty>No variants yet.</Empty>}
        </Card>
      </div>

      <Card title="Recent runs" actions={<Link className="btn" href="/runs">All runs</Link>}>
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
