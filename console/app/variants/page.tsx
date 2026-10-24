import Link from "next/link";
import { listVariants } from "@/lib/data";
import { Badge, Card, Empty, Page, ago } from "@/components/ui";
import { MutateForm } from "./forms";

export const dynamic = "force-dynamic";

export default async function Variants({ searchParams }: { searchParams: Promise<{ shop?: string; status?: string }> }) {
  const { shop, status } = await searchParams;
  const all = listVariants();
  const rows = all.filter((v) => (!shop || v.shop === shop) && (!status || v.status === status));
  const shops = [...new Set(all.map((v) => v.shop))].sort();
  const chip = (label: string, q: Record<string, string | undefined>, on: boolean) => (
    <Link key={label} href={{ pathname: "/variants", query: Object.fromEntries(Object.entries(q).filter(([, v]) => v)) }}
      className={`badge ${on ? "badge-info" : "badge-muted"}`}>{label}</Link>
  );

  return (
    <Page title="Variants" sub="Trickster-mutated shop branches, their answer keys and gate results. Private: never shown to agents.">
      <Card title="New variants"><MutateForm /></Card>
      <Card
        title={`${rows.length} variant${rows.length === 1 ? "" : "s"}`}
        actions={
          <div className="flex flex-wrap gap-1.5">
            {chip("all shops", { status }, !shop)}
            {shops.map((s) => chip(s, { shop: s, status }, shop === s))}
            <span className="mx-1 text-[var(--border)]">|</span>
            {chip("any status", { shop }, !status)}
            {["passed", "failed", "pending", "incomplete"].map((s) => chip(s, { shop, status: s }, status === s))}
          </div>
        }
      >
        {rows.length ? (
          <div className="scroll-x">
            <table className="t">
              <thead><tr><th>Variant</th><th>Shop</th><th>Patterns</th><th>Decoys</th><th>Tasks</th><th>Trickster</th><th>Gates</th><th>Created</th></tr></thead>
              <tbody>
                {rows.map((v) => (
                  <tr key={v.variantId}>
                    <td><Link className="link font-mono" href={`/variants/${v.variantId}`}>{v.variantId}</Link></td>
                    <td>{v.shop}</td>
                    <td>
                      {v.record ? (
                        <div className="flex flex-wrap gap-1">{v.record.patterns.map((p) => <Badge key={p.patternId} tone="muted">{p.category.replaceAll("_", " ")}</Badge>)}</div>
                      ) : <span className="text-[var(--muted)]">{v.dirty ? "edits in progress / interrupted" : "no mutation record"}</span>}
                    </td>
                    <td className="tabular-nums">{v.record?.decoys.length ?? "—"}</td>
                    <td className="tabular-nums">{v.tasks.length}</td>
                    <td>{v.record?.tricksterVersion ?? "—"}</td>
                    <td>
                      <Badge>{v.status}</Badge>
                      {v.gate && !v.gate.passed && (
                        <div className="mt-1 text-xs text-[var(--bad)]">{v.gate.gates.filter((g) => !g.passed).map((g) => g.gate).join(", ")}</div>
                      )}
                    </td>
                    <td className="text-[var(--muted)]">{ago(v.record?.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>No variants match.</Empty>}
      </Card>
    </Page>
  );
}
