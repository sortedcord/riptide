import Link from "next/link";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { demos, listAudits } from "@/lib/audits";
import { ROOT } from "@/lib/data";
import { Badge, Card, Empty, Page, ago } from "@/components/ui";
import { AuditStart } from "@/components/AuditView";

export const dynamic = "force-dynamic";

type Rule = { id: string; title: string; source: string; category: string; severity: string; binding: string };

export default function Audits() {
  const audits = listAudits();
  const file = path.join(ROOT, "docs", "india-guidelines.json");
  const rules: Rule[] = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : [];
  return (
    <Page title="Platform auditing" sub="Upload a platform's source code. A pi agent reads it (read-only, sandboxed) and checks it against India's dark-pattern rules: CCPA 2023 guidelines, Consumer Protection Act and E-Commerce Rules, DPDP Act, RBI e-mandates, ASCI.">
      <AuditStart demos={demos()} />
      <Card title={`Audits (${audits.length})`}>
        {audits.length ? (
          <div className="scroll-x">
            <table className="t">
              <thead><tr><th>Platform</th><th>Source</th><th>Status</th><th>Compliance</th><th>Violations</th><th>When</th></tr></thead>
              <tbody>
                {audits.map((a) => (
                  <tr key={a.auditId}>
                    <td><Link className="link" href={`/audits/${a.auditId}`}>{a.name}</Link><div className="font-mono text-xs text-[var(--muted)]">{a.auditId}</div></td>
                    <td>{a.source}</td>
                    <td><Badge tone={a.status === "done" ? "ok" : a.status === "failed" ? "bad" : "info"}>{a.status}</Badge></td>
                    <td className="tabular-nums font-semibold">{a.score != null ? `${a.score}%` : "—"}</td>
                    <td className="tabular-nums">{a.violations ?? "—"}</td>
                    <td className="text-[var(--muted)]">{ago(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>No audits yet. Upload a zip or try a demo platform.</Empty>}
      </Card>
      <Card title={`The rules (${rules.length})`}>
        <div id="rules" className="scroll-x">
          {rules.length ? (
            <table className="t">
              <thead><tr><th>Id</th><th>Rule</th><th>Source</th><th>Severity</th><th>Binding</th></tr></thead>
              <tbody>{rules.map((r) => <tr key={r.id}><td className="font-mono text-xs">{r.id}</td><td>{r.title}</td><td className="text-xs text-[var(--muted)]">{r.source}</td><td>{r.severity}</td><td className="text-xs">{r.binding}</td></tr>)}</tbody>
            </table>
          ) : <Empty>The checklist (docs/india-guidelines.json) is not there yet.</Empty>}
        </div>
      </Card>
    </Page>
  );
}
