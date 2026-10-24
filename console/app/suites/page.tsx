import Link from "next/link";
import { controlIds, listRuns, listSuites, listVariants } from "@/lib/data";
import { Badge, Card, Empty, Page, ago } from "@/components/ui";
import { Field, LaunchForm } from "@/components/client";

export const dynamic = "force-dynamic";

/** Next free patch version after the newest suite. */
function nextSuiteId(ids: string[]) {
  const vs = ids.map((s) => s.replace("riptide-suite-", "").split(".").map(Number)).sort((a, b) => b[0] - a[0] || b[1] - a[1] || b[2] - a[2]);
  const [M, m, p] = vs[0] ?? [0, 0, -1];
  return `riptide-suite-${M}.${m}.${p + 1}`;
}

export default function Suites() {
  const suites = listSuites();
  const passed = listVariants().filter((v) => v.status === "passed");
  const used = new Set(suites.flatMap((s) => s.items.map((i) => i.variantId)));
  const controls = controlIds().map((c) => c.replace("control-", ""));
  const runs = listRuns();

  return (
    <Page title="Suites & ratings" sub="A suite freezes variants + tasks + rubrics. Ratings are only comparable within one suite version.">
      <Card title="Build a suite">
        <LaunchForm kind="build-suite" submit="Freeze suite" className="items-start">
          <Field label="Suite id">
            <input name="suite" defaultValue={nextSuiteId(suites.map((s) => s.suiteId))} pattern="riptide-suite-\d+\.\d+\.\d+" required className="input w-56 font-mono" />
          </Field>
          <fieldset className="flex flex-col gap-1 text-xs text-[var(--muted)]">
            <legend className="mb-1">Passed variants</legend>
            {passed.map((v) => (
              <label key={v.variantId} className="flex items-center gap-2 text-sm text-[var(--fg)]">
                <input type="checkbox" name="variants" value={v.variantId} defaultChecked={!used.has(v.variantId)} />
                <span className="font-mono">{v.variantId}</span>
                <span className="text-xs text-[var(--muted)]">{v.shop} · {v.record?.patterns.length} patterns{used.has(v.variantId) ? " · in a suite already" : ""}</span>
              </label>
            ))}
            {!passed.length && <span>No variant has passed its gates yet.</span>}
          </fieldset>
          <fieldset className="flex flex-col gap-1 text-xs text-[var(--muted)]">
            <legend className="mb-1">Honest controls</legend>
            {controls.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm text-[var(--fg)]">
                <input type="checkbox" name="controls" value={c} defaultChecked /> control-{c}
              </label>
            ))}
            {!controls.length && <span>No control tasks in data/tasks/control-*.</span>}
          </fieldset>
        </LaunchForm>
      </Card>

      <Card title={`${suites.length} suite${suites.length === 1 ? "" : "s"}`}>
        {suites.length ? (
          <table className="t">
            <thead><tr><th>Suite</th><th>Items</th><th>Tasks</th><th>Runs</th><th>Created</th></tr></thead>
            <tbody>
              {suites.map((s) => (
                <tr key={s.suiteId}>
                  <td><Link className="link font-mono" href={`/suites/${s.suiteId}`}>{s.suiteId}</Link></td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {s.items.map((i) => <Badge key={i.variantId} tone={i.variantId.startsWith("control") ? "muted" : "info"}>{i.variantId}</Badge>)}
                    </div>
                  </td>
                  <td className="tabular-nums">{s.items.reduce((n, i) => n + i.taskIds.length, 0)}</td>
                  <td className="tabular-nums">{runs.filter((r) => r.suiteId === s.suiteId).length}</td>
                  <td className="text-[var(--muted)]">{ago(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <Empty>No suites yet.</Empty>}
      </Card>
    </Page>
  );
}
