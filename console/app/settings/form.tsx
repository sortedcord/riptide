"use client";
import Link from "next/link";
import { useActionState, useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { shopOrigin } from "@/lib/shopUrl";
import { save, type SaveState } from "./actions";

const noSubscribe = () => () => {};
const browserHost = () => `${window.location.protocol}//${window.location.hostname}`;

type Model = { id: string; name: string };
type Catalog = { status: "loading" } | { status: "error"; error: string; defaultModel?: string } | { status: "ready"; models: Model[]; defaultModel: string };

/** Fetches the gateway's model list once for both dropdowns; `reload` retries after an error. */
function useModels(): [Catalog, () => void] {
  const [catalog, setCatalog] = useState<Catalog>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    fetch("/api/models", { cache: "no-store" })
      .then(async (r) => ({ ok: r.ok, body: (await r.json()) as { models?: Model[]; defaultModel?: string; error?: string } }))
      .then(({ ok, body }) => {
        if (!alive) return;
        setCatalog(ok && body.models ? { status: "ready", models: body.models, defaultModel: body.defaultModel ?? "" } : { status: "error", error: body.error ?? "Could not load models.", defaultModel: body.defaultModel });
      })
      .catch(() => alive && setCatalog({ status: "error", error: "Could not reach the console server." }));
    return () => { alive = false; };
  }, [attempt]);
  const reload = useCallback(() => { setCatalog({ status: "loading" }); setAttempt((a) => a + 1); }, []);
  return [catalog, reload];
}

function ModelSelect({ name, label, value, onChange, catalog, defaultLabel, help }: {
  name: string; label: string; value: string; onChange: (v: string) => void; catalog: Catalog; defaultLabel: (d: string) => string; help: string;
}) {
  const models = catalog.status === "ready" ? catalog.models : [];
  // A saved model the gateway no longer lists stays selectable, so saving other fields never silently drops it.
  const missing = value && !models.some((m) => m.id === value);
  const loading = catalog.status === "loading";
  const def = catalog.status === "loading" ? "" : (catalog.defaultModel ?? "");
  return (
    <label className="es-label">
      {label}
      {/* Disabled fields aren't submitted; keep the saved value while the list loads. */}
      {loading && <input type="hidden" name={name} value={value} />}
      <select name={name} value={value} onChange={(e) => onChange(e.target.value)} className="input w-full" disabled={loading} aria-busy={loading}>
        <option value="">{loading ? "Loading models…" : defaultLabel(def)}</option>
        {missing && <option value={value}>{value}{catalog.status === "ready" ? " (not listed by gateway)" : ""}</option>}
        {models.map((m) => <option key={m.id} value={m.id}>{m.name === m.id ? m.id : `${m.name} · ${m.id}`}</option>)}
      </select>
      <span className="text-sm font-normal">{help}</span>
    </label>
  );
}

/** All console settings in one form: shop base URL and the models used by the Trickster and the sniffer agents. */
export function SettingsForm({ initial, shops }: { initial: { shopBaseUrl: string; tricksterModel: string; snifferModel: string }; shops: { brand: string; port: number }[] }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(save, { ok: true, message: "" });
  const [baseUrl, setBaseUrl] = useState(initial.shopBaseUrl);
  const [trickster, setTrickster] = useState(initial.tricksterModel);
  const [sniffer, setSniffer] = useState(initial.snifferModel);
  const [catalog, reload] = useModels();
  const host = useSyncExternalStore(noSubscribe, browserHost, () => "");
  const base = baseUrl.trim().replace(/\/+$/, "");

  return (
    <form action={action} className="flex flex-col gap-6">
      <section className="card">
        <h2 className="card-title mb-5">Models</h2>
        <div className="flex max-w-[28rem] flex-col gap-5">
          <ModelSelect name="tricksterModel" label="Trickster model" value={trickster} onChange={setTrickster} catalog={catalog}
            defaultLabel={(d) => `Engine default${d ? ` (${d})` : ""}`} help="Used by new Trickster runs started from Variants or the overview." />
          <ModelSelect name="snifferModel" label="Sniffer model" value={sniffer} onChange={setSniffer} catalog={catalog}
            defaultLabel={() => "Each agent's own config"} help="Used by reference agents started after saving. An override is added to the agent's name, so its ratings stay separate." />
          {catalog.status === "error" && (
            <p role="alert" className="text-sm text-[var(--bad)]">
              {catalog.error} <button type="button" onClick={reload} className="link ml-1">Try again</button>
            </p>
          )}
          {catalog.status === "ready" && (
            <p className="text-sm text-[var(--muted)]">
              {catalog.models.length} model{catalog.models.length === 1 ? "" : "s"} available from the gateway for this key. <button type="button" onClick={reload} className="link ml-1">Refresh</button>
            </p>
          )}
          <p className="text-sm text-[var(--muted)]">Running agents keep their model; restart them on <Link className="link" href="/jobs#agents">Agents &amp; jobs</Link> to apply a change.</p>
        </div>
      </section>

      <section className="card">
        <h2 className="card-title mb-5">Shop previews</h2>
        <div className="flex max-w-[28rem] flex-col gap-5">
          <label className="es-label">
            Shop base URL
            <input name="shopBaseUrl" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="http://my-host or https://shop-{port}.example.com"
              className="input w-full" aria-describedby="shop-base-help" autoComplete="off" spellCheck={false} />
          </label>
          <p id="shop-base-help" className="-mt-3 text-sm text-[var(--muted)]">
            Leave empty to use the host you opened the console on. Use <code>{"{port}"}</code> where the shop&apos;s port goes; without it the port is added to the URL.
          </p>
          <div>
            <p className="es-label mb-2">Previews will open</p>
            <ul className="divide-y divide-[var(--border)] text-sm">
              {shops.map((s) => (
                <li key={s.port} className="flex items-baseline justify-between gap-4 py-2">
                  <span>{s.brand}</span>
                  <span className="min-w-0 truncate text-[var(--muted)]">{shopOrigin(base, s.port, host) || "invalid URL"}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : "Save settings"}</button>
        {state.message && <p role="status" className={`text-sm ${state.ok ? "text-[var(--ok)]" : "text-[var(--bad)]"}`}>{state.message}</p>}
      </div>
    </form>
  );
}
