import Link from "next/link";
import { notFound } from "next/navigation";
import { auditDetail } from "@/lib/audits";
import { Page, ago } from "@/components/ui";
import { AuditLive } from "@/components/AuditView";

export const dynamic = "force-dynamic";

export default async function AuditPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const d = auditDetail(id);
  if (!d) notFound();
  return (
    <Page title={d.meta.name} sub={<>{d.meta.source === "demo" ? "Demo platform" : "Uploaded"} · <span className="font-mono">{d.meta.auditId}</span> · {ago(d.meta.createdAt)} · <Link className="link" href="/audits">All audits</Link></>}>
      <AuditLive id={id} initial={{ ...d, events: d.events.slice(-300) }} />
    </Page>
  );
}
