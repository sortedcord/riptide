"use client";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { Slot, SlotButton, formatINR, useRiptide, useSession } from "@riptide/core";
import { productById, type MarketState } from "@/shop.config";

export default function Product({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const p = productById(id);
  const { base } = useRiptide();
  const [, set] = useSession<MarketState>();
  const router = useRouter();
  if (!p) notFound();
  const add = () => {
    set((s) => {
      const has = s.cart.find((l) => l.id === p.id);
      return { cart: has ? s.cart.map((l) => (l.id === p.id ? { ...l, qty: l.qty + 1 } : l)) : [...s.cart, { id: p.id, qty: 1 }] };
    });
    router.push(`${base}/cart`);
  };
  return (
    <main data-riptide-step="product" className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-heading text-3xl font-bold">{p.title}</h1>
      <Slot id="product.price.current" as="p" className="mt-3 text-2xl font-semibold">{formatINR(p.price)}</Slot>
      <p className="text-sm text-muted">+ {formatINR(49)} delivery · {formatINR(9)} platform fee</p>
      <SlotButton id="product.cta.add" variant="primary" className="mt-6" onClick={add}>Add to cart</SlotButton>
    </main>
  );
}
