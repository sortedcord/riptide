import Link from "next/link";
import { notFound } from "next/navigation";
import { listRuns, ratings, suite, task } from "@/lib/data";
import { Badge, Bar, Card, Empty, Json, Page, Stars, ago, inr } from "@/components/ui";
import { AgentPicker, Field, LaunchForm } from "@/components/client";

export const dynamic = "force-dynamic";

const SUBS = [["avoidance", "Avoidance"], ["completion", "Completion"], ["awareness", "Awareness"], ["falsePositiveControl", "False-positive control"], ["escalation", "Escalation"]] as const;

export default async function SuitePage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const s = suite(id);
  if (!s) notFound();
  const { leaderboard, ratings: rs } = ratings(id);
  const runs = listRuns({ suiteId: id });

  return (
    <Page
      title={<span className="font-mono">{s.suiteId}</span>}
      sub={`Frozen ${ago(s.createdAt)} · ${s.items.length} items · ${runs.length} runs`}
      actions={
        <div className="flex gap-2">
          <LaunchForm kind="score" submit="Re-score" tone="plain"><input type="hidden" name="suite" value={id} /></LaunchForm>
          <LaunchForm kind="rate" submit="Re-rate" tone="plain"><input type="hidden" name="suite" value={id} /></LaunchForm>
        </div>
      }
    >
      <Card title="Evaluate agents (run → score → rate)">
        <LaunchForm kind="evaluate" submit="Start evaluation" className="items-start">
          <input type="hidden" name="suite" value={id} />
          <AgentPicker />
          <Field label="Repeats per task">
            <input name="repeats" type="number" min={1} max={5} defaultValue={1} className="input w-20" />
          </Field>
          <Field label="Parallel runs">
            <input name="concurrency" type="number" min={1} max={16} defaultValue={4} className="input w-20" />
          </Field>
          <Field label="Only one item (optional)">
            <select name="only" className="input" defaultValue="">
              <option value="">all items</option>
              {s.items.map((i) => <option key={i.variantId}>{i.variantId}</option>)}
            </select>
          </Field>
        </LaunchForm>
      </Card>

      <Card title="Leaderboard">
        {leaderboard.length ? (
          <div className="scroll-x">
            <table className="t">
              <thead><tr><th>#</th><th>Agent</th><th>Overall</th>{SUBS.map(([k, l]) => <th key={k}>{l}</th>)}<th>Range</th></tr></thead>
              <tbody>
                {[...leaderboard].sort((a, b) => b.overall - a.overall).map((r, i) => (
                  <tr key={r.agentId}>
                    <td className="tabular-nums text-[var(--muted)]">{i + 1}</td>
                    <td><a className="link" href={`#${r.agentId}`}>{r.agentId}</a><div><Stars n={r.stars} /></div></td>
                    <td className="text-lg font-semibold tabular-nums">{r.overall}</td>
                    {SUBS.map(([k]) => <td key={k}><Bar value={r.subScores[k]} /></td>)}
                    <td className="tabular-nums text-xs text-[var(--muted)]">{r.range.min}–{r.range.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>No ratings yet.</Empty>}
      </Card>

      {rs.map((r) => (
        <Card key={r.agentId} title={<span id={r.agentId}>{r.agentId} · {r.overall} <Stars n={r.stars} /></span>}>
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <h3 className="mb-2 text-sm font-medium text-[var(--muted)]">Weaknesses</h3>
              <ul className="list-disc space-y-1 pl-4 text-sm">{r.insights.weaknesses.map((w) => <li key={w}>{w}</li>)}{!r.insights.weaknesses.length && <li className="list-none text-[var(--muted)]">none</li>}</ul>
              <h3 className="mt-4 mb-2 text-sm font-medium text-[var(--muted)]">Reliably caught</h3>
              <ul className="list-disc space-y-1 pl-4 text-sm">{r.insights.reliablyCaught.map((w) => <li key={w}>{w}</li>)}{!r.insights.reliablyCaught.length && <li className="list-none text-[var(--muted)]">none</li>}</ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-[var(--muted)]">By category (caught / total)</h3>
              <ul className="space-y-1 text-sm">
                {Object.entries({ ...r.byCategory, ...r.experimental }).map(([c, v]) => (
                  <li key={c} className="flex justify-between gap-2"><span>{c.replaceAll("_", " ")}{c.startsWith("exp_") && <Badge tone="warn">exp</Badge>}</span><span className="tabular-nums">{v.caught}/{v.total}</span></li>
                ))}
                {!Object.keys(r.byCategory).length && <li className="text-[var(--muted)]">no patterns scored</li>}
              </ul>
            </div>
            <div className="text-sm">
              <p>Avg overpayment <b>{inr(r.avgOverpaymentInr)}</b></p>
              <p className="mt-1 text-[var(--muted)]">Weights applied: {Object.entries(r.weights).map(([k, w]) => `${k} ${Math.round(w * 10) / 10}`).join(" · ")}</p>
              {r.insights.flips.length > 0 && <><h3 className="mt-3 mb-1 text-sm font-medium text-[var(--warn)]">Flips across repeats</h3><ul className="list-disc pl-4">{r.insights.flips.map((f) => <li key={f}>{f}</li>)}</ul></>}
              {(r.notes ?? []).map((n) => <p key={n} className="mt-2 text-xs text-[var(--muted)]">{n}</p>)}
            </div>
          </div>
          <div className="mt-4"><Json value={r} summary="Rating JSON" /></div>
        </Card>
      ))}

      <Card title="Items">
        <div className="scroll-x">
          <table className="t">
            <thead><tr><th>Item</th><th>Shop</th><th>Commit</th><th>Tasks</th></tr></thead>
            <tbody>
              {s.items.map((i) => (
                <tr key={i.variantId}>
                  <td>{i.variantId.startsWith("v_") ? <Link className="link font-mono" href={`/variants/${i.variantId}`}>{i.variantId}</Link> : <span className="font-mono">{i.variantId}</span>}</td>
                  <td>{i.shop}</td>
                  <td className="font-mono text-xs">{i.commit.slice(0, 9)}</td>
                  <td>
                    <ul className="space-y-1">
                      {i.taskIds.map((t) => <li key={t} className="text-sm"><span className="font-mono text-xs text-[var(--muted)]">{t}</span> {task(i.variantId, t)?.goal}</li>)}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-sm"><Link className="link" href={`/runs?suite=${id}`}>All runs of this suite →</Link></p>
    </Page>
  );
}
