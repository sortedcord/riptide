import Link from "next/link";
import { notFound } from "next/navigation";
import { AGENT_COLORS, agentColor, agentConfig, agentHistory, listRuns } from "@/lib/data";
import { Badge, Card, Empty, Kv, Page, Stars, ago, inr } from "@/components/ui";
import { LineChart } from "@/components/Charts";

export const dynamic = "force-dynamic";

const SUBS = [["avoidance", "Avoidance"], ["completion", "Completion"], ["awareness", "Awareness"], ["falsePositiveControl", "False-positive control"], ["escalation", "Escalation"]] as const;

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const history = agentHistory(id);
  if (!history.length) notFound();
  const cfg = agentConfig(id);
  const color = agentColor(id);
  const last = history.at(-1)!;
  const runs = listRuns({ agentId: id });
  const x = history.map((h) => ({ label: h.suiteId.replace("riptide-suite-", ""), sub: h.tricksterVersions.length ? `Trickster ${h.tricksterVersions.join(", ")}` : "controls only" }));

  return (
    <Page
      title={<><span className="viz-swatch mr-3 align-middle" style={{ background: color, width: 16, height: 16 }} />{id}</>}
      sub={cfg ? <>Reference sniffer · <span className="font-mono">{cfg.model}</span> · ≤{cfg.maxSteps} steps</> : "Third-party agent (rated through its A2A card)"}
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card title="Overall rating by suite">
          <LineChart label={`${id} overall rating by suite`} x={x} series={[{ name: "Overall", color, values: history.map((h) => h.rating.overall), strong: true }]} />
        </Card>
        <Card title={`Latest · ${last.suiteId}`}>
          <p className="text-4xl font-medium tabular-nums">{last.rating.overall}</p>
          <p className="mt-1"><Stars n={last.rating.stars} /></p>
          <div className="mt-4">
            <Kv rows={[
              ["Range across repeats", `${last.rating.range.min}–${last.rating.range.max}`],
              ["Avg overpaid", inr(last.rating.avgOverpaymentInr)],
              ["Suites rated", String(history.length)],
              ["Runs", String(runs.length)],
            ]} />
          </div>
        </Card>
      </div>

      <Card title="Sub-scores by suite">
        <LineChart label={`${id} sub-scores by suite`} x={x}
          series={SUBS.map(([k, name], i) => ({ name, color: AGENT_COLORS[i], values: history.map((h) => h.rating.subScores[k]) }))} />
      </Card>

      <Card title="Per suite">
        <div className="scroll-x">
          <table className="t">
            <thead><tr><th>Suite</th><th>Trickster</th><th>Overall</th>{SUBS.map(([, n]) => <th key={n}>{n}</th>)}<th>Avg overpaid</th></tr></thead>
            <tbody>
              {[...history].reverse().map((h) => (
                <tr key={h.suiteId}>
                  <td><Link className="link font-mono" href={`/suites/${h.suiteId}#${id}`}>{h.suiteId}</Link><div className="text-xs text-[var(--muted)]">{ago(h.createdAt)}</div></td>
                  <td>{h.tricksterVersions.join(", ") || "—"}</td>
                  <td><b className="tabular-nums">{h.rating.overall}</b> <Stars n={h.rating.stars} /></td>
                  {SUBS.map(([k]) => <td key={k} className="tabular-nums">{h.rating.subScores[k] ?? "—"}</td>)}
                  <td className="tabular-nums">{inr(h.rating.avgOverpaymentInr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <Card title="Weaknesses (latest suite)">
          {last.rating.insights.weaknesses.length ? <ul className="list-disc space-y-1 pl-4 text-sm">{last.rating.insights.weaknesses.map((w) => <li key={w}>{w}</li>)}</ul> : <Empty>None.</Empty>}
          {last.rating.insights.flips.length > 0 && <><h3 className="mt-4 mb-1 text-xs uppercase tracking-wider text-[var(--muted)]">Flips across repeats</h3><ul className="list-disc pl-4 text-sm">{last.rating.insights.flips.map((f) => <li key={f}>{f}</li>)}</ul></>}
        </Card>
        <Card title="Reliably caught (latest suite)">
          {last.rating.insights.reliablyCaught.length ? <ul className="list-disc space-y-1 pl-4 text-sm">{last.rating.insights.reliablyCaught.map((w) => <li key={w}>{w}</li>)}</ul> : <Empty>Nothing caught every time.</Empty>}
        </Card>
      </div>

      <Card title={`Runs (${runs.length})`}>
        {runs.length ? (
          <div className="scroll-x">
            <table className="t">
              <thead><tr><th>Run</th><th>Suite</th><th>Variant / task</th><th>Status</th><th>Completed</th><th>Paid</th><th>Overpaid</th><th>When</th></tr></thead>
              <tbody>
                {runs.slice(0, 40).map((r) => (
                  <tr key={r.runId}>
                    <td><Link className="link font-mono" href={`/runs/${r.runId}`}>{r.runId}</Link></td>
                    <td className="font-mono text-xs">{r.suiteId}</td>
                    <td className="font-mono text-xs">{r.variantId}/{r.taskId}</td>
                    <td><Badge>{r.status}</Badge></td>
                    <td>{r.score ? <Badge tone={r.score.completed ? "ok" : "bad"}>{r.score.completed ? "yes" : "no"}</Badge> : "—"}</td>
                    <td className="tabular-nums">{inr(r.score?.finalTotalInr)}</td>
                    <td className="tabular-nums">{inr(r.score?.overpaymentInr)}</td>
                    <td className="text-[var(--muted)]">{ago(r.startedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>No runs.</Empty>}
      </Card>

      {cfg && (
        <Card title="System prompt">
          <p className="whitespace-pre-wrap text-sm text-[var(--muted)]">{cfg.systemPrompt}</p>
        </Card>
      )}
    </Page>
  );
}
