"use client";
import { useEffect, useRef, useState } from "react";

/** One live shop embed with variant, path and device controls. */
export function ShopFrame({ brand, shop, port, variants }: { brand: string; shop: string; port: number; variants: string[] }) {
  // The shops run on the same host as the console, so use whatever host the browser used to reach it.
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(`${window.location.protocol}//${window.location.hostname}:${port}`), [port]);
  const [variant, setVariant] = useState(variants.includes("honest") ? "honest" : variants[0]);
  const [path, setPath] = useState("");
  const [mobile, setMobile] = useState(false);
  const [key, setKey] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const url = `${origin}/${variant}${path ? `/${path.replace(/^\/+/, "")}` : ""}`;

  return (
    <section className="card flex flex-col gap-3">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold">{brand} <span className="text-sm font-normal text-[var(--muted)]">{shop}</span></h2>
          <a href={url} target="_blank" rel="noreferrer" className="link font-mono text-xs">{url}</a>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select aria-label={`${brand} variant`} className="input" value={variant} onChange={(e) => setVariant(e.target.value)}>
            {variants.map((v) => <option key={v}>{v}</option>)}
          </select>
          <form onSubmit={(e) => { e.preventDefault(); setPath(input.current?.value ?? ""); setKey((k) => k + 1); }} className="flex gap-1">
            <input ref={input} aria-label={`${brand} path`} placeholder="path, e.g. cart" className="input w-36" />
            <button className="btn">Go</button>
          </form>
          <button className="btn" aria-pressed={mobile} onClick={() => setMobile((m) => !m)}>{mobile ? "Mobile" : "Desktop"}</button>
          <button className="btn" onClick={() => setKey((k) => k + 1)}>Reload</button>
          <a className="btn" href={url} target="_blank" rel="noreferrer">Open ↗</a>
        </div>
      </header>
      <div className="flex justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
        {origin && <iframe key={`${key}-${url}`} src={url} title={`${brand} live preview`} loading="lazy"
          className="h-[620px] bg-white" style={{ width: mobile ? 390 : "100%" }} />}
      </div>
    </section>
  );
}
