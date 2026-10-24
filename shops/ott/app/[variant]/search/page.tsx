"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Slot } from "@riptide/core";
import { Icon, TitleCard } from "@/components/ui";
import { GENRES, TITLES, genreName } from "@/lib/catalogue";

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const q = params.get("q") ?? "";
  const genre = params.get("genre") ?? "";
  const kind = params.get("kind") ?? "";
  const update = (k: string, v: string) => {
    const p = new URLSearchParams(params.toString());
    if (v) p.set(k, v); else p.delete(k);
    router.replace(`${path}${p.size ? `?${p}` : ""}`, { scroll: false });
  };
  const needle = q.trim().toLowerCase();
  const results = TITLES.filter((t) =>
    (!genre || t.genre === genre) && (!kind || t.kind === kind) &&
    (!needle || [t.title, t.logline, genreName(t.genre), t.language, ...t.cast].some((x) => x.toLowerCase().includes(needle))));

  return (
    <main data-riptide-step="search" className="rb-wrap rb-page">
      <h1 className="rb-h1">Search</h1>
      <form role="search" className="rb-search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="s-q" className="sr-only">Search by title, cast, genre or language</label>
        <Icon name="search" />
        <input id="s-q" type="search" className="rb-search__input" placeholder="Search by title, cast, genre or language" value={q}
          onChange={(e) => update("q", e.target.value)} autoComplete="off" />
      </form>
      <div className="rb-filters" role="group" aria-label="Filter by genre">
        <button type="button" className="rb-chipbtn" aria-pressed={!genre} onClick={() => update("genre", "")}>All genres</button>
        {GENRES.map((g) => (
          <button key={g.id} type="button" className="rb-chipbtn" aria-pressed={genre === g.id} onClick={() => update("genre", g.id)}>{g.name}</button>
        ))}
      </div>
      <div className="rb-filters" role="group" aria-label="Filter by type">
        {[["", "Films and series"], ["film", "Films"], ["series", "Series"]].map(([v, l]) => (
          <button key={v} type="button" className="rb-chipbtn" aria-pressed={kind === v} onClick={() => update("kind", v)}>{l}</button>
        ))}
      </div>
      <Slot id="search.results.count" as="p" className="rb-muted" aria-live="polite">
        {`${results.length} title${results.length === 1 ? "" : "s"}${q ? ` for “${q}”` : ""}`}
      </Slot>
      {results.length ? (
        <div className="rb-grid">{results.map((t) => <TitleCard key={t.id} t={t} />)}</div>
      ) : (
        <div className="rb-empty">
          <h2 className="rb-h3">No matches</h2>
          <p className="rb-muted">Try a different spelling, a cast member&apos;s name, or clear the filters.</p>
          <button type="button" className="rt-btn" data-variant="secondary" onClick={() => router.replace(path)}>Clear search</button>
        </div>
      )}
    </main>
  );
}

export default function Search() {
  return (
    <Suspense fallback={<main data-riptide-step="search" className="rb-wrap rb-page"><div className="rb-skel" style={{ height: 320 }} /></main>}>
      <SearchInner />
    </Suspense>
  );
}
