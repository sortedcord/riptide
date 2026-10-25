import Link from "next/link";
import { agentColor, agentConfig, agentHistory, allRatedAgents } from "@/lib/data";
import { Card, Empty, Page, Stars } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function Agents() {
  const ids = allRatedAgents();
  const rows = ids.map((id) => {
    const h = agentHistory(id);
    const last = h.at(-1);
    return { id, color: agentColor(id, ids), cfg: agentConfig(id), suites: h.length, last, prev: h.at(-2) };
  }).sort((a, b) => (b.last?.rating.overall ?? -1) - (a.last?.rating.overall ?? -1));

  return (
    <Page title="Agents" sub="Every agent that has been rated, with its latest score. Open one for its history across suites and Trickster versions.">
      <Card title={`${rows.length} rated agent${rows.length === 1 ? "" : "s"}`}>
        {rows.length ? (
          <div className="scroll-x">
            <table className="t">
              <thead><tr><th>Agent</th><th>Model</th><th>Latest</th><th>Change</th><th>Suites rated</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td><span className="viz-swatch mr-2 align-middle" style={{ background: r.color }} /><Link className="link" href={`/agents/${r.id}`}>{r.id}</Link></td>
                    <td className="font-mono text-xs">{r.cfg?.model ?? "third-party"}</td>
                    <td>{r.last ? <><b className="tabular-nums">{r.last.rating.overall}</b> <Stars n={r.last.rating.stars} /><div className="text-xs text-[var(--muted)]">{r.last.suiteId}</div></> : "—"}</td>
                    <td className="tabular-nums">{r.last && r.prev ? `${r.last.rating.overall - r.prev.rating.overall >= 0 ? "+" : ""}${Math.round((r.last.rating.overall - r.prev.rating.overall) * 10) / 10}` : "—"}</td>
                    <td className="tabular-nums">{r.suites}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>No ratings yet.</Empty>}
      </Card>
    </Page>
  );
}
