import Link from "next/link";
import { notFound } from "next/navigation";
import { variant, variantDiff } from "@/lib/data";
import { Badge, Card, Diff, Empty, Json, Kv, Page, Pass, ago, inr } from "@/components/ui";
import { LaunchForm } from "@/components/client";

export const dynamic = "force-dynamic";

const rule = (r: Record<string, unknown>) => `${r.rule}(${Object.entries(r).filter(([k]) => k !== "rule").map(([, v]) => JSON.stringify(v)).join(", ")})`;

export default async function VariantPage({ params }: { params: Promise<{ id: string }> }) {
  const v = variant((await params).id);
  if (!v) notFound();
  const rec = v.record;
  const diff = variantDiff(v);

  return (
    <Page
      title={<span className="font-mono">{v.variantId}</span>}
      sub={<>{v.shop} · <span className="font-mono">{v.branch || "no branch"}</span>{rec && <> · Trickster {rec.tricksterVersion} · {ago(rec.createdAt)}</>}</>}
      actions={
        <div className="flex flex-wrap gap-2">
          {rec && <LaunchForm kind="gates" submit="Re-run gates" tone="plain"><input type="hidden" name="variant" value={v.variantId} /></LaunchForm>}
          <LaunchForm kind="discard" submit="Discard variant" tone="danger" confirm={`Delete ${v.variantId}: its branch, worktree, mutation record, tasks, rubrics and gate results? Suites that already include it keep their copy of the ids only.`}>
            <input type="hidden" name="variant" value={v.variantId} />
          </LaunchForm>
        </div>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card title={rec ? `Patterns (${rec.patterns.length})` : "Patterns"}>
          {rec ? (
            <ol className="space-y-4">
              {rec.patterns.map((p) => (
                <li key={p.patternId} className="rounded-[10px] border border-[var(--border)] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-[var(--muted)]">{p.patternId}</span>
                    <Badge tone={p.category.startsWith("exp_") ? "warn" : "info"}>{p.category.replaceAll("_", " ")}</Badge>
                    {p.subtype && <Badge tone="muted">{p.subtype}</Badge>}
                    <span className="text-xs text-[var(--muted)]">at <b>{p.step}</b></span>
                  </div>
                  <p className="mt-2 text-sm">{p.description}</p>
                  <div className="mt-3">
                    <Kv rows={[
                      ["Visible evidence", p.visibleEvidence],
                      ["Harm", <>{p.expectedHarm.kind.replaceAll("_", " ")}{p.expectedHarm.amountInr != null && <> · {inr(p.expectedHarm.amountInr)}</>}{p.expectedHarm.lineKey && <> · line <code>{p.expectedHarm.lineKey}</code></>}</>],
                      ["Elements", <span key="e" className="font-mono text-xs">{p.elementKeys.join(", ") || "—"}</span>],
                      ["Verify", <span key="v" className="font-mono text-xs">{p.verify.map(rule).join(" ∧ ")}</span>],
                      ["Files", <span key="f" className="font-mono text-xs">{p.files.join(", ") || "—"}</span>],
                    ]} />
                  </div>
                  {p.diffHunks.length > 0 && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs text-[var(--muted)] hover:text-[var(--fg)]">Code for this pattern ({p.diffHunks.length} hunk{p.diffHunks.length === 1 ? "" : "s"})</summary>
                      <div className="mt-2"><Diff text={p.diffHunks.join("\n")} /></div>
                    </details>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <Empty>
              No mutation record. {v.dirty ? "The worktree has uncommitted edits: a Trickster run is in progress or was interrupted. Discard it or inspect the diff below." : "The Trickster run did not finish."}
            </Empty>
          )}
        </Card>

        <div className="space-y-5">
          <Card title="Gates" actions={<Badge>{v.status}</Badge>}>
            {v.gate ? (
              <ul className="space-y-2 text-sm">
                {v.gate.gates.map((g) => (
                  <li key={g.gate}>
                    <div className="flex items-center justify-between"><span>{g.gate}</span><Pass ok={g.passed} /></div>
                    {g.detail && <p className={`mt-0.5 break-words text-xs ${g.passed ? "text-[var(--muted)]" : "text-[var(--bad)]"}`}>{g.detail}</p>}
                  </li>
                ))}
              </ul>
            ) : <Empty>Not gated yet.</Empty>}
            {v.attempts.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-[var(--muted)]">{v.attempts.length} earlier failed attempt(s)</summary>
                <ul className="mt-2 space-y-1 text-xs">
                  {v.attempts.map((a) => <li key={a.attempt}>#{a.attempt}: {a.gates.filter((g) => !g.passed).map((g) => `${g.gate}${g.detail ? ` (${g.detail.slice(0, 120)})` : ""}`).join("; ")}</li>)}
                </ul>
              </details>
            )}
          </Card>

          <Card title={`Decoys (${rec?.decoys.length ?? 0})`}>
            {rec?.decoys.length ? (
              <ul className="space-y-2 text-sm">
                {rec.decoys.map((d) => <li key={d.decoyId}><span className="font-mono text-xs text-[var(--muted)]">{d.decoyId}</span> {d.description}</li>)}
              </ul>
            ) : <Empty>None.</Empty>}
          </Card>

          <Card title={`Tasks (${v.tasks.length})`}>
            {v.tasks.length ? (
              <ul className="space-y-3 text-sm">
                {v.tasks.map((t) => (
                  <li key={t.taskId}>
                    <div className="flex items-center gap-2"><span className="font-mono text-xs">{t.taskId}</span><Badge tone="muted">{t.stopCondition.replaceAll("_", " ")}</Badge></div>
                    <p className="mt-1">{t.goal}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      starts <code>{t.startPath}</code>
                      {t.constraints.budgetInr != null && <> · budget {inr(t.constraints.budgetInr)}</>}
                      {t.constraints.wantsAddOns?.length ? <> · wants {t.constraints.wantsAddOns.join(", ")}</> : null}
                    </p>
                  </li>
                ))}
              </ul>
            ) : <Empty>No tasks.</Empty>}
          </Card>
        </div>
      </div>

      <Card title="Code change vs master" actions={v.worktree && <span className="text-xs text-[var(--muted)]">worktree ../riptide-wt/{v.variantId}</span>}>
        <Diff text={diff} />
      </Card>

      {rec && <Card><Json value={rec} summary="Mutation record JSON" /></Card>}
      <p className="text-sm"><Link className="link" href="/variants">← All variants</Link></p>
    </Page>
  );
}
