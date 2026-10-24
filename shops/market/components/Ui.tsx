import Link from "next/link";
import { formatINR } from "@riptide/core";
import { artColor, discountPct, DELIVERY_LABEL, type Product } from "@/data/catalog";
import { Art } from "./Art";
import { Icon } from "./Icons";

/** Product tile. Hook-free so server pages can render it. */
export function ProductCard({ p, base, "data-dp": dp }: { p: Product; base: string; "data-dp"?: string }) {
  const off = discountPct(p.price, p.mrp);
  return (
    <article data-dp={dp} className="cw-pcard">
      <Link href={`${base}/product/${p.id}`} className="flex h-full flex-col no-underline">
        <Art kind={p.art} color={artColor(p)} accent={p.colors[1]} className="cw-pcard__img" label={p.title} />
        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{p.brand}</p>
          <h3 className="cw-pcard__title font-body text-[0.92rem]" style={{ fontFamily: "var(--rt-font-body)", letterSpacing: 0 }}>{p.title}</h3>
          <Rating value={p.rating} count={p.reviewCount} />
          <p className="mt-auto flex flex-wrap items-baseline gap-x-2">
            <span className="cw-price text-lg">{formatINR(p.price)}</span>
            {off > 0 && <><span className="cw-mrp text-sm">{formatINR(p.mrp)}</span><span className="cw-off text-sm">{off}% off</span></>}
          </p>
          <p className="text-xs text-muted">{p.delivery === "nextday" ? "Next-day delivery available" : DELIVERY_LABEL[p.delivery]}</p>
        </div>
      </Link>
    </article>
  );
}

export function Rating({ value, count }: { value: number; count?: number }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted">
      <span className="cw-rating" aria-label={`Rated ${value} out of 5`}>{value.toFixed(1)}<Icon name="star" size={11} fill="currentColor" strokeWidth={0} /></span>
      {count !== undefined && <span>({count.toLocaleString("en-IN")})</span>}
    </span>
  );
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex text-saffron" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name="star" size={size} fill={i <= Math.round(value) ? "currentColor" : "none"} strokeWidth={1.4} />
      ))}
    </span>
  );
}

export function Crumbs({ items }: { items: [string, string?][] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="cw-crumbs">
        {items.map(([label, href], i) => <li key={i}>{href ? <Link href={href}>{label}</Link> : <span aria-current="page">{label}</span>}</li>)}
      </ol>
    </nav>
  );
}

const STEPS = ["Cart", "Address & delivery", "Review", "Payment"];
export function CheckoutSteps({ current }: { current: number }) {
  return (
    <ol className="cw-steps" aria-label="Checkout progress">
      {STEPS.map((s, i) => (
        <li key={s} aria-current={i === current ? "step" : undefined} className={i < current ? "done" : undefined}>
          <span className="n">{i < current ? <Icon name="check" size={12} strokeWidth={3} /> : i + 1}</span>{s}
        </li>
      ))}
    </ol>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={`cw-skel ${className ?? ""}`} aria-hidden />;
}
