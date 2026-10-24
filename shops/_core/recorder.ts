"use client";
import { useEffect, useRef, useState } from "react";
import { RUN_ID_RE, type AnyShopConfig, type Manifest, type RecorderEventBody } from "./contracts";
import { computePrice, type PricedLine } from "./pricing";

/**
 * Flight recorder, client side. A run id arrives once as `?s=` on any page and lives in sessionStorage `rt:s`.
 * No run id → every function here is a no-op (no listeners, no network).
 * Beacons carry element keys, steps, paths and priced lines only — never text typed into a field.
 */
const RUN_KEY = "rt:s";
const CART_KEY = "rt:c";

function get(key: string): string | null {
  try { return sessionStorage.getItem(key); } catch { return null; }
}

// The server orders events by arrival (`t`), and parallel beacons can overtake each other, so sends are chained.
// ponytail: an event still queued when the page unloads is lost; add a client `seq` to the contract if that bites.
let chain: Promise<unknown> = Promise.resolve();
const post = (data: string) =>
  fetch("/api/e", { method: "POST", headers: { "content-type": "application/json" }, body: data, keepalive: true }).catch(() => {});

export function beacon(body: RecorderEventBody): void {
  const runId = get(RUN_KEY);
  if (!runId) return;
  const data = JSON.stringify({ ...body, runId });
  if (document.visibilityState === "hidden") {
    // Unloading: sendBeacon is the only send guaranteed to leave.
    try { if (navigator.sendBeacon?.("/api/e", new Blob([data], { type: "application/json" }))) return; } catch { /* fall through */ }
  }
  chain = chain.then(() => post(data));
}

export const wireLines = (lines: PricedLine[]) => lines.map(({ key, label, amount, kind, selected }) => ({ key, label, amount, kind, selected }));

/** Paid order → subscription started, when it contains a membership or plan line. */
export function recordPaid(lines: PricedLine[]): void {
  if (lines.some((l) => l.kind === "membership" || l.key === "plan")) beacon({ type: "subscription", state: "active" });
}

/** Mounted once in RiptideProvider: page views, clicks, toggles, cancel-confirm screens and cart changes. */
export function useRecorder(config: AnyShopConfig, manifest: Manifest, state: object, hydrated: boolean, pathname: string): void {
  const [step, setStep] = useState<string | null>(null);
  const scanRef = useRef<() => void>(undefined);

  useEffect(() => {
    try {
      const s = new URLSearchParams(window.location.search).get("s");
      if (s && RUN_ID_RE.test(s) && s !== get(RUN_KEY)) {
        sessionStorage.setItem(RUN_KEY, s);
        sessionStorage.removeItem(CART_KEY);
      }
    } catch { /* storage unavailable: no recording */ }
    if (!get(RUN_KEY)) return;

    let seen = "";
    let confirmShown = false;
    const scan = () => {
      const st = document.querySelector("[data-riptide-step]")?.getAttribute("data-riptide-step");
      if (!st) return;
      const path = window.location.pathname;
      if (`${st} ${path}` !== seen) {
        seen = `${st} ${path}`;
        setStep(st);
        beacon({ type: "page_view", step: st, path });
      }
      const shown = !!document.querySelector('[data-dp="account.cancel.confirm"]');
      if (shown && !confirmShown) beacon({ type: "cancel_confirm_reached", step: st });
      confirmShown = shown;
    };
    const click = (e: MouseEvent) => {
      const t = e.target as Element | null;
      const el = t?.closest?.("[data-dp]");
      if (!el) return;
      // A click on a <label> is re-dispatched to its control; count only that one.
      const label = t!.closest("label");
      if (label?.control && label.control !== t) return;
      const key = el.getAttribute("data-dp")!;
      beacon({ type: "click", key });
      if (key === "account.cancel.confirm") beacon({ type: "subscription", state: "cancelled" });
    };
    const change = (e: Event) => {
      const t = e.target;
      const el = (t as Element | null)?.closest?.("[data-dp]");
      if (!el) return;
      let value: boolean | string;
      if (t instanceof HTMLInputElement && t.type === "checkbox") value = t.checked;
      else if (t instanceof HTMLInputElement && t.type === "radio") value = t.value;
      else if (t instanceof HTMLSelectElement) value = t.value;
      else return; // text fields: never recorded
      beacon({ type: "toggle", key: el.getAttribute("data-dp")!, value });
    };

    scanRef.current = scan;
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-riptide-step"] });
    document.addEventListener("click", click, true);
    document.addEventListener("change", change, true);
    scan();
    return () => {
      scanRef.current = undefined;
      mo.disconnect();
      document.removeEventListener("click", click, true);
      document.removeEventListener("change", change, true);
    };
  }, []);

  // Client navigation can change the URL without a DOM mutation after it.
  useEffect(() => scanRef.current?.(), [pathname]);

  // cart_change: priced lines as visible at the current purchase-flow step, when lines/total actually change.
  useEffect(() => {
    if (!hydrated || !step || !config.flows.purchase?.some((s) => s.step === step) || !get(RUN_KEY)) return;
    const p = computePrice(config, state, manifest.overrides, step);
    const lines = wireLines(p.lines);
    const sig = JSON.stringify([lines, p.total]);
    if (sig === (get(CART_KEY) ?? JSON.stringify([[], 0]))) return;
    try { sessionStorage.setItem(CART_KEY, sig); } catch { /* ignore */ }
    beacon({ type: "cart_change", step, lines, total: p.total });
  }, [config, manifest, state, hydrated, step]);
}
