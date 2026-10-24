"use client";
import Link from "next/link";
import { Slot, formatINR, useRiptide } from "@riptide/core";
import products from "@/data/products.json";

export default function Home() {
  const { base } = useRiptide();
  return (
    <main data-riptide-step="home" className="mx-auto max-w-6xl px-4 py-8">
      <Slot id="home.promo.banner" className="mb-4" />
      <Slot id="home.hero.title" as="h1" className="font-heading text-4xl font-bold">Everything, delivered right.</Slot>
      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {products.map((p) => (
          <li key={p.id} className="rounded-[var(--rt-radius)] border border-line bg-surface p-4">
            <Link href={`${base}/product/${p.id}`} className="font-semibold hover:underline">{p.title}</Link>
            <p className="mt-2">{formatINR(p.price)}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
