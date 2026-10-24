import Link from "next/link";
import { notFound } from "next/navigation";
import { runDetail, type RecorderEvent } from "@/lib/data";
import { Badge, Card, Empty, Json, Kv, Page, Pass, inr } from "@/components/ui";

export const dynamic = "force-dynamic";

const TYPE_TONE: Record<string, string> = { page_view: "info", click: "muted", toggle: "warn", cart_change: "muted", payment_reached: "ok", cancel_confirm_reached: "ok", subscription: "warn", form_submit: "muted" };

function describe(e: RecorderEvent, harmKeys: Set<string>) {
  switch (e.type) {
    case "page_view": return <><b>{e.step}</b> <span className="text-[var(--muted)]">{e.path}</span></>;
    case "click": return <span className="font-mono text-xs">{e.key}</span>;
    case "toggle": return <><span className="font-mono text-xs">{e.key}</span> → <b>{String(e.value)}</b></>;
    case "cart_change": return <>{e.step}: {inr(e.total)} <span className="text-xs text-[var(--muted)]">({e.lines.filter((l) => l.selected !== false).map((l) => l.key).join(", ")})</span></>;
    case "payment_reached": return (
      <>
        total <b>{inr(e.total)}</b>{" "}
        <span className="text-xs">{e.lines.map((l) => <span key={l.key} className={harmKeys.has(l.key) ? "font-semibold text-[var(--bad)]" : "text-[var(--muted)]"}>{l.key} {inr(l.amount)} · </span>)}</span>
      </>
    );
    case "cancel_confirm_reached": return <>reached cancel confirm on <b>{e.step}</b></>;
    case "subscription": return <>subscription <b>{e.state}</b></>;
    case "form_submit": return <>{e.step}: {e.fields.join(", ")}</>;
  }
}

export default async function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const d = runDetail((await params).id);
  if (!d) notFound();
  const { run, score, events, task, record, rubric } = d;
  const harmKeys = new Set((record?.patterns ?? []).map((p) => p.expectedHarm.lineKey).filter((k): k is string => !!k && !(task?.constraints.wantsAddOns ?? []).includes(k)));
  const t0 = events[0]?.t ?? 0;
  const pay = [...events].reverse().find((e) => e.type === "payment_reached");
  const report = run.report;

  return (
    <Page
      title={<span className="font-mono">{run.runId}</span>}
      sub={<>{run.agentId} · <Link className="link" href={`/suites/${run.suiteId}`}>{run.suiteId}</Link> · {run.variantId.startsWith("v_") ? <Link className="link font-mono" href={`/variants/${run.variantId}`}>{run.variantId}</Link> : run.variantId} / {run.taskId} · repeat {run.repeat}</>}
      actions={<Badge>{run.status}</Badge>}
    >
      <Card title="Task (what the agent was asked)">
        <p className="text-sm">{task?.goal ?? "—"}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">{task?.persona} · stop: {task?.stopCondition.replaceAll("_", " ")} · <a className="link" href={run.startUrl}>{run.startUrl}</a></p>
        {run.error && <p className="mt-2 text-sm text-[var(--bad)]">{run.error}</p>}
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="What really happened (flight recorder)">
          {pay && pay.type === "payment_reached" ? (
            <Kv rows={[
              ["Final total", <b key="t">{inr(pay.total)}</b>],
              ["Lines", <ul key="l" className="space-y-0.5">{pay.lines.map((l) => <li key={l.key} className={harmKeys.has(l.key) ? "text-[var(--bad)]" : ""}>{l.label} <span className="text-[var(--muted)]">({l.key})</span> · {inr(l.amount)}{harmKeys.has(l.key) && " · planted"}</li>)}</ul>],
              ["Overpaid", inr(score?.overpaymentInr)],
            ]} />
          ) : <Empty>Never reached the payment page.</Empty>}
        </Card>

        <Card title="What the agent claims (untrusted report)">
          {report ? (
            <div className="space-y-3 text-sm">
              <Kv rows={[
                ["Outcome", <Badge key="o">{report.outcome}</Badge>],
                ["Total", <>{inr(report.totalInr)}{pay && pay.type === "payment_reached" && pay.total !== report.totalInr && <Badge tone="bad">≠ recorder</Badge>}</>],
                ["Cart", report.cart.map((c) => `${c.item} ${inr(c.priceInr)}`).join(" · ") || "—"],
              ]} />
              <div>
                <h3 className="mb-1 text-sm font-medium text-[var(--muted)]">Concerns ({report.concerns.length})</h3>
                <ul className="space-y-1.5">
                  {report.concerns.map((c, i) => <li key={i}><Badge>{c.action}</Badge> <b>{c.where}</b>: {c.what}</li>)}
                </ul>
              </div>
              {report.askUser?.length ? <div><h3 className="mb-1 text-sm font-medium text-[var(--muted)]">Would ask the user</h3><ul className="list-disc pl-4">{report.askUser.map((q) => <li key={q}>{q}</li>)}</ul></div> : null}
            </div>
          ) : <Empty>No valid report.</Empty>}
        </Card>
      </div>

      <Card title="Score" actions={score && <Badge tone={score.completed ? "ok" : "bad"}>{score.completed ? "completed" : "not completed"}</Badge>}>
        {score ? (
          <table className="t">
            <thead><tr><th>Check</th><th>Kind</th><th>What</th><th>Result</th><th>Detail</th></tr></thead>
            <tbody>
              {score.checks.map((c) => (
                <tr key={c.checkId}>
                  <td className="font-mono text-xs">{c.checkId}</td>
                  <td>{c.kind}{c.category && <div className="text-xs text-[var(--muted)]">{c.category.replaceAll("_", " ")}</div>}</td>
                  <td className="text-sm">{rubric?.checks.find((r) => r.checkId === c.checkId)?.description}</td>
                  <td><Pass ok={c.passed} /></td>
                  <td className="text-xs text-[var(--muted)]">{c.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <Empty>Not scored yet.</Empty>}
      </Card>

      <Card title={`Timeline (${events.length} events)`}>
        {events.length ? (
          <ol className="space-y-1 text-sm">
            {events.map((e, i) => (
              <li key={i} className="grid grid-cols-[64px_150px_1fr] items-baseline gap-2">
                <span className="tabular-nums text-xs text-[var(--muted)]">+{((e.t - t0) / 1000).toFixed(1)}s</span>
                <span><Badge tone={TYPE_TONE[e.type]}>{e.type}</Badge></span>
                <span className="min-w-0 break-words">{describe(e, harmKeys)}</span>
              </li>
            ))}
          </ol>
        ) : <Empty>No recorder events for this run.</Empty>}
      </Card>

      <Card title="A2A transcript"><Json value={d.a2a} summary="Show full transcript" /></Card>
    </Page>
  );
}
