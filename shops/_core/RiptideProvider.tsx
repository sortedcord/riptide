"use client";
import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import type { AnyShopConfig, FlowStep, InterstitialStep, Manifest } from "./contracts";
import { indexOverrides, type OverrideIndex, type SlotOverrides } from "./overrides";
import { computePrice, type PriceResult } from "./pricing";
import { sessionKey, useHydrated, useStore, type SetSession } from "./session";
import { useRecorder } from "./recorder";
import { usePathname } from "next/navigation";

type Ctx = {
  config: AnyShopConfig;
  variant: string;
  manifest: Manifest;
  index: OverrideIndex;
  registryIds: Set<string>;
  /** `/{variant}` — prefix every in-shop href with this. */
  base: string;
};
const RiptideContext = createContext<Ctx | null>(null);

export function RiptideProvider({ config, manifest, variant, children }: {
  config: AnyShopConfig; manifest: Manifest; variant: string; children: ReactNode;
}) {
  const value = useMemo<Ctx>(() => ({
    config, variant, manifest,
    index: indexOverrides(manifest.overrides),
    registryIds: new Set(config.registry.map((d) => d.id)),
    base: `/${variant}`,
  }), [config, manifest, variant]);
  const [state, , reset] = useStore(sessionKey(config.shop, variant), config.initialState);
  useRecorder(config, manifest, state, useHydrated(), usePathname());

  // ?reset=1 on any page clears this shop+variant session.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("reset") === "1") {
      reset();
      url.searchParams.delete("reset");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
  }, [reset]);

  return <RiptideContext.Provider value={value}>{children}</RiptideContext.Provider>;
}

export function useRiptide(): Ctx {
  const c = useContext(RiptideContext);
  if (!c) throw new Error("[riptide] useRiptide() outside <RiptideProvider>");
  return c;
}

const NONE: SlotOverrides = { attrs: {}, hidden: false, before: [], after: [], inside: [] };
export function useOverrides(id: string): SlotOverrides {
  return useRiptide().index[id] ?? NONE;
}

/** Initial value of a control: manifest setDefault, else the honest default you pass. */
export function useSlotDefault<T extends boolean | string | number>(id: string, honest: T): T {
  const v = useOverrides(id).defaultValue;
  return (v === undefined ? honest : v) as T;
}

/** The shop's session state for this variant. */
export function useSession<S extends object>(): [S, SetSession<S>, () => void] {
  const { config, variant } = useRiptide();
  return useStore<S>(sessionKey(config.shop, variant), config.initialState as S);
}

/** Priced lines + total as visible at `step`. Every displayed amount must come from here. */
export function usePrice(step: string): PriceResult {
  const { config, manifest } = useRiptide();
  const [state] = useSession();
  return useMemo(() => computePrice(config, state, manifest.overrides, step), [config, state, manifest, step]);
}

/** Price a hypothetical selection (e.g. "plan X") without touching the session: `{ ...session, ...patch }` at `step`. */
export function useQuote<S extends object>(step: string, patch: Partial<S>): PriceResult {
  const { config, manifest } = useRiptide();
  const [state] = useSession<S>();
  const key = JSON.stringify(patch);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- patch is compared by value via key
  return useMemo(() => computePrice(config, { ...state, ...patch }, manifest.overrides, step), [config, state, manifest, step, key]);
}

/** Toggle an optional pricing line on/off in the session. */
export function useLineToggle(key: string): [boolean, (on: boolean) => void] {
  const [state, set] = useSession<{ selected?: Record<string, boolean> }>();
  const price = usePrice("payment");
  const on = price.lines.find((l) => l.key === key)?.selected ?? state.selected?.[key] ?? false;
  return [on, (v) => set((s) => ({ selected: { ...s.selected, [key]: v } }))];
}

export type ExpandedStep = FlowStep & { interstitial?: InterstitialStep };

/** A flow with any manifest `insertStep`s spliced in. Navigate with `next()` so inserted steps are honoured. */
export function useFlow(flow: string) {
  const { config, manifest, base } = useRiptide();
  return useMemo(() => {
    const steps = config.flows[flow];
    if (!steps) throw new Error(`[riptide] unknown flow "${flow}"`);
    const out: ExpandedStep[] = [];
    for (const s of steps) {
      out.push(s);
      for (const o of manifest.overrides) {
        if (o.op === "insertStep" && o.flow === flow && o.after === s.step) {
          out.push({ step: o.step.id, path: `step/${flow}/${o.step.id}`, interstitial: o.step });
        }
      }
    }
    const href = (path: string) => `${base}/${path}`.replace(/\/+$/, "") || base;
    return {
      steps: out,
      href,
      /** Href of the step after `current` (a step name in this flow). */
      next(current: string): string {
        const i = out.findIndex((s) => s.step === current);
        if (i < 0) throw new Error(`[riptide] step "${current}" not in flow "${flow}"`);
        const n = out[i + 1];
        if (!n) throw new Error(`[riptide] step "${current}" is the last step of flow "${flow}"`);
        return href(n.path);
      },
    };
  }, [config, manifest, base, flow]);
}
