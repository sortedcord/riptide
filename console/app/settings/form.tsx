"use client";
import { useActionState, useState, useSyncExternalStore } from "react";
import { shopOrigin } from "@/lib/shopUrl";
import { save, type SaveState } from "./actions";

const noSubscribe = () => () => {};
const browserHost = () => `${window.location.protocol}//${window.location.hostname}`;

/** Shop base URL field with a live preview of the URLs it produces. */
export function SettingsForm({ shopBaseUrl, shops }: { shopBaseUrl: string; shops: { brand: string; port: number }[] }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(save, { ok: true, message: "" });
  const [value, setValue] = useState(shopBaseUrl);
  const host = useSyncExternalStore(noSubscribe, browserHost, () => "");
  const base = value.trim().replace(/\/+$/, "");

  return (
    <form action={action} className="flex max-w-[28rem] flex-col gap-5">
      <label className="es-label">
        Shop base URL
        <input name="shopBaseUrl" value={value} onChange={(e) => setValue(e.target.value)} placeholder="http://my-host or https://shop-{port}.example.com"
          className="input w-full" aria-invalid={!state.ok} aria-describedby="shop-base-help" autoComplete="off" spellCheck={false} />
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

      <div className="flex items-center gap-4">
        <button className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : "Save settings"}</button>
        {state.message && <p role="status" className={`text-sm ${state.ok ? "text-[var(--ok)]" : "text-[var(--bad)]"}`}>{state.message}</p>}
      </div>
    </form>
  );
}
