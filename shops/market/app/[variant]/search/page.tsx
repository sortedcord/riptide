import Link from "next/link";
import type { Metadata } from "next";
import { Slot } from "@riptide/core";
import { brands as allBrands, categories, categoryBySlug, discountPct, products, type Product } from "@/data/catalog";
import { Crumbs, ProductCard } from "@/components/Ui";

type SP = Record<string, string | string[] | undefined>;
type P = { params: Promise<{ variant: string }>; searchParams: Promise<SP> };

const PER_PAGE = 12;
const SORTS = [
  ["relevance", "Relevance"], ["price-asc", "Price: low to high"], ["price-desc", "Price: high to low"], ["rating", "Customer rating"], ["discount", "Discount"],
] as const;
const SPEEDS = [["nextday", "Next-day"], ["express", "2 days or faster"]] as const;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const many = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);

export async function generateMetadata({ searchParams }: P): Promise<Metadata> {
  const sp = await searchParams;
  const q = one(sp.q), cat = categoryBySlug(one(sp.cat));
  return { title: q ? `Results for "${q}"` : cat ? cat.name : "All products" };
}

function filter(sp: SP) {
  const q = one(sp.q).trim().toLowerCase();
  const cat = one(sp.cat);
  const brands = many(sp.brand);
  const min = Number(one(sp.min)) || 0;
  const max = Number(one(sp.max)) || 0;
  const rating = Number(one(sp.rating)) || 0;
  const speed = one(sp.speed);
  const tokens = q.split(/\s+/).filter(Boolean);
  const matchQ = (p: Product) => {
    const hay = `${p.title} ${p.brand} ${categoryBySlug(p.category)?.name} ${p.specs.map((s) => s[1]).join(" ")}`.toLowerCase();
    return tokens.every((t) => hay.includes(t));
  };
  // Facets are counted on the query + category only, so options don't vanish as you filter.
  const scope = products.filter((p) => (!cat || p.category === cat) && matchQ(p));
  const list = scope.filter((p) =>
    (!brands.length || brands.includes(p.brand)) &&
    (!min || p.price >= min) && (!max || p.price <= max) &&
    (!rating || p.rating >= rating) &&
    (!speed || (speed === "nextday" ? p.delivery === "nextday" : p.delivery !== "standard")));
  return { q, cat, brands, min, max, rating, speed, scope, list };
}

export default async function Search({ params, searchParams }: P) {
  const { variant } = await params;
  const sp = await searchParams;
  const base = `/${variant}`;
  const f = filter(sp);
  const sort = SORTS.some(([k]) => k === one(sp.sort)) ? one(sp.sort) : "relevance";
  const sorted = [...f.list].sort((a, b) => {
    switch (sort) {
      case "price-asc": return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "rating": return b.rating - a.rating || b.reviewCount - a.reviewCount;
      case "discount": return discountPct(b.price, b.mrp) - discountPct(a.price, a.mrp);
      default: return 0;
    }
  });
  const pages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number(one(sp.page)) || 1));
  const shown = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const cat = categoryBySlug(f.cat);
  const scopeBrands = allBrands.filter((b) => f.scope.some((p) => p.brand === b));

  const href = (patch: Record<string, string | null>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) for (const x of many(v)) u.append(k, x);
    for (const [k, v] of Object.entries(patch)) { u.delete(k); if (v) u.set(k, v); }
    const s = u.toString();
    return `${base}/search${s ? `?${s}` : ""}`;
  };
  const heading = f.q ? `Results for “${one(sp.q)}”` : cat ? cat.name : "All products";

  return (
    <main data-riptide-step="search" className="cw-wrap pt-5">
      <Crumbs items={[["Home", base], ...(cat ? [[cat.name, f.q ? href({ q: null, page: null }) : undefined] as [string, string?]] : []), ...(f.q ? [[`“${one(sp.q)}”`] as [string]] : !cat ? [["All products"] as [string]] : [])]} />
      <Slot id="search.promo.banner" className="mt-4 empty:hidden" />
      <div className="mt-4 grid gap-6 lg:grid-cols-[260px_1fr]">
        <Slot id="search.filters.panel" as="aside" className="cw-panel-flat h-fit p-4" aria-label="Filters">
          <form action={`${base}/search`} method="get" className="flex flex-col gap-5">
            {f.q && <input type="hidden" name="q" value={one(sp.q)} />}
            {sort !== "relevance" && <input type="hidden" name="sort" value={sort} />}
            <div className="flex items-center justify-between"><h2 className="text-base font-semibold" style={{ fontFamily: "var(--rt-font-body)" }}>Filters</h2><Link href={`${base}/search${f.q ? `?q=${encodeURIComponent(one(sp.q))}` : ""}`} className="rt-link text-sm">Clear all</Link></div>
            <fieldset>
              <legend className="cw-eyebrow mb-2">Category</legend>
              <div className="flex flex-col gap-1.5">
                <label className="rt-check"><input type="radio" name="cat" value="" defaultChecked={!f.cat} /> <span>All categories</span></label>
                {categories.map((c) => <label key={c.slug} className="rt-check"><input type="radio" name="cat" value={c.slug} defaultChecked={f.cat === c.slug} /> <span>{c.name}</span></label>)}
              </div>
            </fieldset>
            <fieldset>
              <legend className="cw-eyebrow mb-2">Price (₹)</legend>
              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor="f-min">Minimum price</label>
                <input id="f-min" name="min" inputMode="numeric" placeholder="Min" defaultValue={f.min || ""} className="rt-input !min-h-10" />
                <span className="text-muted">to</span>
                <label className="sr-only" htmlFor="f-max">Maximum price</label>
                <input id="f-max" name="max" inputMode="numeric" placeholder="Max" defaultValue={f.max || ""} className="rt-input !min-h-10" />
              </div>
            </fieldset>
            {scopeBrands.length > 0 && (
              <fieldset>
                <legend className="cw-eyebrow mb-2">Brand</legend>
                <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto">
                  {scopeBrands.map((b) => (
                    <label key={b} className="rt-check"><input type="checkbox" name="brand" value={b} defaultChecked={f.brands.includes(b)} /> <span>{b} <span className="text-muted">({f.scope.filter((p) => p.brand === b).length})</span></span></label>
                  ))}
                </div>
              </fieldset>
            )}
            <fieldset>
              <legend className="cw-eyebrow mb-2">Customer rating</legend>
              <div className="flex flex-col gap-1.5">
                {[["", "Any rating"], ["4", "4★ & above"], ["3", "3★ & above"]].map(([v, l]) => (
                  <label key={v} className="rt-check"><input type="radio" name="rating" value={v} defaultChecked={String(f.rating || "") === v} /> <span>{l}</span></label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="cw-eyebrow mb-2">Delivery speed</legend>
              <div className="flex flex-col gap-1.5">
                <label className="rt-check"><input type="radio" name="speed" value="" defaultChecked={!f.speed} /> <span>Any</span></label>
                {SPEEDS.map(([v, l]) => <label key={v} className="rt-check"><input type="radio" name="speed" value={v} defaultChecked={f.speed === v} /> <span>{l}</span></label>)}
              </div>
            </fieldset>
            <button type="submit" className="rt-btn" data-variant="primary">Apply filters</button>
          </form>
        </Slot>

        <section aria-label="Results">
          <div className="flex flex-col gap-3 border-b border-line pb-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">{heading}</h1>
              <Slot id="search.results.count" as="p" className="mt-1 text-sm text-muted">
                {sorted.length ? `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, sorted.length)} of ${sorted.length} results` : "0 results"}
              </Slot>
            </div>
            <Slot id="search.sort.selector" as="nav" aria-label="Sort by" className="flex flex-wrap items-center gap-x-1 gap-y-2 text-sm">
              <span className="mr-1 text-muted">Sort by</span>
              {SORTS.map(([k, l]) => (
                <Link key={k} href={href({ sort: k === "relevance" ? null : k, page: null })} aria-current={sort === k ? "true" : undefined}
                  className={`rounded-full px-3 py-1.5 no-underline ${sort === k ? "bg-ink font-semibold text-white" : "hover:bg-surface-2"}`}>{l}</Link>
              ))}
            </Slot>
          </div>

          {shown.length ? (
            <Slot id="search.results.list" as="ul" className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {shown.map((p) => <li key={p.id} data-dp={`search.results.item.${p.id}`}><ProductCard p={p} base={base} /></li>)}
            </Slot>
          ) : (
            <Slot id="search.results.list" className="cw-panel-flat mt-5 flex flex-col items-center gap-3 p-10 text-center">
              <h2 className="cw-h2">No products match</h2>
              <p className="max-w-md text-muted">Try fewer words, check the spelling, or clear some filters.</p>
              <Link href={`${base}/search`} className="rt-btn" data-variant="secondary">See all products</Link>
            </Slot>
          )}

          {(
            <Slot id="search.pagination.nav" as="nav" aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2">
              {page > 1 ? <Link href={href({ page: String(page - 1) })} className="rt-btn" data-variant="secondary">Previous</Link> : <span className="rt-btn opacity-40" data-variant="secondary" aria-disabled>Previous</span>}
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link key={n} href={href({ page: n === 1 ? null : String(n) })} aria-current={n === page ? "page" : undefined} aria-label={`Page ${n}`}
                  className={`flex h-11 w-11 items-center justify-center rounded-full no-underline ${n === page ? "bg-ink font-bold text-white" : "border border-line bg-surface"}`}>{n}</Link>
              ))}
              {page < pages ? <Link href={href({ page: String(page + 1) })} className="rt-btn" data-variant="secondary">Next</Link> : <span className="rt-btn opacity-40" data-variant="secondary" aria-disabled>Next</span>}
            </Slot>
          )}
        </section>
      </div>
    </main>
  );
}
