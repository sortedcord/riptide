"use client";
import { Children, isValidElement, useEffect, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from "react";
import type { Variant } from "./contracts";
import { useOverrides, useRiptide } from "./RiptideProvider";
import { RenderBlock } from "./Blocks";

type SlotProps<T extends ElementType> = {
  id: string;
  as?: T;
  /** Honest visual weight; exposed as data-variant for the shop's CSS. */
  variant?: Variant;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "id" | "children">;

const childId = (c: ReactNode): string | undefined =>
  isValidElement(c) ? ((c.props as { id?: string; "data-dp"?: string }).id ?? (c.props as { "data-dp"?: string })["data-dp"]) : undefined;

/** Reorder direct children whose Slot id (or data-dp) is listed; others keep their positions. */
function reorder(children: ReactNode, order: string[]): ReactNode[] {
  const arr = Children.toArray(children);
  const slots = arr.map((c, i) => ({ c, i, id: childId(c) })).filter((x) => x.id && order.includes(x.id));
  const sorted = [...slots].sort((a, b) => order.indexOf(a.id!) - order.indexOf(b.id!));
  slots.forEach((s, k) => (arr[s.i] = sorted[k].c));
  return arr;
}

/**
 * Wraps every mutable element. Renders `as` (default div) with data-dp={id} and applies
 * setText / setVariant / setAttr / hide / reorder / insertBlock overrides for that id.
 * setText replaces all children, so keep text slots' children plain text.
 */
export function Slot<T extends ElementType = "div">({ id, as, variant, children, ...rest }: SlotProps<T>) {
  const o = useOverrides(id);
  const { registryIds } = useRiptide();
  useEffect(() => {
    if (!registryIds.has(id)) console.error(`[riptide] <Slot id="${id}"> is not in this shop's slots.ts registry`);
  }, [id, registryIds]);
  if (o.hidden) return null;
  const Tag = (as ?? "div") as ElementType;
  let content: ReactNode = o.text ?? children;
  if (o.order && o.text === undefined) content = reorder(children, o.order);
  return (
    <>
      {o.before.map((b) => <RenderBlock key={b.id} block={b} />)}
      <Tag data-dp={id} data-variant={o.variant ?? variant} {...rest} {...o.attrs}>
        {content}
        {o.inside.map((b) => <RenderBlock key={b.id} block={b} />)}
      </Tag>
      {o.after.map((b) => <RenderBlock key={b.id} block={b} />)}
    </>
  );
}

/** A brand-styled button slot (`.rt-btn[data-variant]`). Pairs of accept/decline must share a variant. */
export function SlotButton<T extends ElementType = "button">({ className, variant = "secondary", ...p }: SlotProps<T> & { className?: string }) {
  const props = { as: "button", type: p.as && p.as !== "button" ? undefined : "button", ...p, variant, className: `rt-btn ${className ?? ""}`.trim() };
  return <Slot {...(props as SlotProps<ElementType>)} />;
}
