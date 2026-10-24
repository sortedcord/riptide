"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useRiptide } from "@riptide/core";
import { APPS } from "@/catalog";
import { AppIcon } from "@/components/Art";
import { Skeleton } from "@/components/ui";

export default function SearchPage() {
  return (
    <main data-riptide-step="search" className="ps-wrap py-8">
      <Suspense fallback={<Skeleton h={240} />}><Results /></Suspense>
    </main>
  );
}

function Results() {
  const { base } = useRiptide();
  const q = (useSearchParams().get("q") ?? "").trim();
  const t = q.toLowerCase();
  const hits = APPS.filter((a) => !t || [a.name, a.category, a.kind, a.tagline, ...a.features].join(" ").toLowerCase().includes(t));
  return (
    <>
      <form role="search" action={`${base}/search`} className="flex max-w-xl gap-2">
        <label htmlFor="ps-q" className="sr-only">Search apps</label>
        <input id="ps-q" name="q" defaultValue={q} placeholder="Search apps, e.g. PDF, captions, fonts" className="rt-input" />
        <button className="rt-btn" data-variant="primary">Search</button>
      </form>
      <h1 className="mt-6 text-2xl font-bold">{q ? `${hits.length} result${hits.length === 1 ? "" : "s"} for “${q}”` : "All apps"}</h1>
      {hits.length ? (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {hits.map((a) => (
            <li key={a.id}>
              <Link href={`${base}/apps/${a.id}`} className="ps-panel flex items-center gap-4 p-4">
                <AppIcon id={a.id} size={48} />
                <span><b>Prism {a.name}</b> <span className="text-sm text-muted">· {a.category}</span><br /><span className="text-sm">{a.tagline}</span></span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-muted">No apps match that. Try “photo”, “vector”, “video”, “layout”, “PDF” or “fonts”, or <Link className="rt-link" href={`${base}/pricing`}>see all plans</Link>.</p>
      )}
    </>
  );
}
