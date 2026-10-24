"use client";
import { useCallback, useSyncExternalStore } from "react";

/**
 * Per-shop, per-variant session store persisted to sessionStorage under `riptide:{shop}:{variant}`.
 * Server render and hydration use the initial state; the stored state takes over right after.
 */
type Store = { get: () => object; set: (s: object) => void; subscribe: (l: () => void) => () => void; reset: () => void };
const stores = new Map<string, Store>();

export function sessionKey(shop: string, variant: string) {
  return `riptide:${shop}:${variant}`;
}

export function getStore(key: string, initial: object): Store {
  let store = stores.get(key);
  if (store) return store;
  let state: object | undefined;
  const listeners = new Set<() => void>();
  const read = () => {
    if (state) return state;
    try {
      const raw = sessionStorage.getItem(key);
      state = raw ? { ...initial, ...JSON.parse(raw) } : initial;
    } catch {
      state = initial;
    }
    return state!;
  };
  store = {
    get: read,
    set: (s) => {
      state = s;
      try { sessionStorage.setItem(key, JSON.stringify(s)); } catch { /* storage unavailable: keep in memory */ }
      listeners.forEach((l) => l());
    },
    subscribe: (l) => { listeners.add(l); return () => listeners.delete(l); },
    reset: () => {
      try { sessionStorage.removeItem(key); } catch { /* ignore */ }
      state = initial;
      listeners.forEach((l) => l());
    },
  };
  stores.set(key, store);
  return store;
}

export type SetSession<S> = (patch: Partial<S> | ((s: S) => Partial<S>)) => void;

export function useStore<S extends object>(key: string, initial: S): [S, SetSession<S>, () => void] {
  const store = getStore(key, initial);
  const state = useSyncExternalStore(store.subscribe, store.get, () => initial) as S;
  const set = useCallback<SetSession<S>>(
    (patch) => {
      const cur = store.get() as S;
      store.set({ ...cur, ...(typeof patch === "function" ? patch(cur) : patch) });
    },
    [store],
  );
  return [state, set, store.reset];
}

const noop = () => () => {};
/** false during SSR and hydration, true after. Use to avoid flashing empty-cart UI. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
