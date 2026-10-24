import Link from "next/link";
import { listVariants } from "@riptide/core/server";
import { brand } from "@/brand";

export const dynamic = "force-dynamic";
export const metadata = { title: `${brand.name} · variants`, robots: { index: false, follow: false } };

/** Internal index of this shop's variants. */
export default async function Index() {
  const variants = await listVariants();
  return (
    <main style={{ maxWidth: 640, margin: "3rem auto", padding: "0 16px", fontFamily: "var(--rt-font-body)" }}>
      <h1>{brand.name} — Riptide variants</h1>
      <ul>
        {variants.map((v) => <li key={v}><Link href={`/${v}`}>/{v}</Link></li>)}
      </ul>
      <p><Link href="/api/slots">Slot registry (JSON)</Link></p>
    </main>
  );
}
