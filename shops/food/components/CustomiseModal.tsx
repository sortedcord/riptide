"use client";
import { useEffect, useRef, useState } from "react";
import { Slot, SlotButton, formatINR, useSession, useSlotDefault } from "@riptide/core";
import { restaurantById, type MenuItem, type Restaurant } from "@/data/restaurants";
import { SPICE_LEVELS, lineUid, unitPrice, type FoodState } from "@/shop.config";
import { FoodArt } from "./FoodArt";
import { Icon, QtyStepper, VegMark } from "./ui";

/** Size / add-ons / spice dialog. Native <dialog>: Escape closes it; so does the visible Close button. */
export function CustomiseModal({ item, restaurant, onClose, onAdded }: {
  item: MenuItem; restaurant: Restaurant; onClose: () => void; onAdded: (msg: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [s, set] = useSession<FoodState>();
  const sizeDefault = useSlotDefault<string>("restaurant.customise.size", item.sizes[0].id);
  const spiceDefault = useSlotDefault<string>("restaurant.customise.spice", "Medium");
  const [size, setSize] = useState(item.sizes.find((x) => x.id === sizeDefault || x.label === sizeDefault)?.id ?? item.sizes[0].id);
  const [spice, setSpice] = useState<string | null>(item.spice ? ((SPICE_LEVELS as readonly string[]).includes(spiceDefault) ? spiceDefault : "Medium") : null);
  const [addons, setAddons] = useState<string[]>([]);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  const unit = unitPrice(item, size, addons);
  const other = s.cart.length > 0 && s.restaurantId !== restaurant.id ? restaurantById(s.restaurantId) : undefined;
  const close = () => ref.current?.close();

  const add = () => {
    const uid = lineUid(item.id, size, addons, spice);
    set((st) => {
      const cart = st.restaurantId === restaurant.id ? st.cart : [];
      const has = cart.find((l) => l.uid === uid);
      return {
        restaurantId: restaurant.id,
        coupon: st.restaurantId === restaurant.id ? st.coupon : null,
        cart: has ? cart.map((l) => (l.uid === uid ? { ...l, qty: l.qty + qty } : l)) : [...cart, { uid, itemId: item.id, size, addons, spice, qty }],
      };
    });
    onAdded(`Added ${qty} × ${item.name} to your cart`);
    close();
  };

  const titleId = `ff-cust-${item.id}`;
  return (
    <dialog ref={ref} className="rt-modal ff-modal" aria-labelledby={titleId} onClose={onClose}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <Slot id="restaurant.customise.modal" className="ff-modal__inner">
        <div className="ff-modal__head">
          <FoodArt art={item.art} seed={item.id} className="ff-modal__art" />
          <div className="ff-modal__title">
            <div className="flex items-center gap-2"><VegMark veg={item.veg} /><span className="ff-muted text-sm">{restaurant.name}</span></div>
            <h2 id={titleId} className="ff-h2">{item.name}</h2>
            <p className="ff-muted text-sm">{item.description}</p>
          </div>
          <SlotButton id="restaurant.customise.close" variant="ghost" className="ff-modal__close" onClick={close} aria-label="Close customisation">
            <Icon name="close" size={18} /> Close
          </SlotButton>
        </div>

        <div className="ff-modal__body">
          <Slot id="restaurant.customise.size" as="fieldset" className="ff-opt">
            <legend>Size <span className="ff-req">Choose 1</span></legend>
            {item.sizes.map((o) => (
              <label key={o.id} className="ff-opt__row">
                <input type="radio" name={`${titleId}-size`} checked={size === o.id} onChange={() => setSize(o.id)} />
                <span>{o.label}</span>
                <span className="ff-opt__price">{o.price ? `+ ${formatINR(o.price)}` : formatINR(item.price)}</span>
              </label>
            ))}
          </Slot>

          <Slot id="restaurant.customise.addons" as="fieldset" className="ff-opt">
            <legend>Add-ons <span className="ff-req ff-req--opt">Optional</span></legend>
            {item.addons.map((o) => (
              <label key={o.id} className="ff-opt__row">
                <input type="checkbox" checked={addons.includes(o.id)}
                  onChange={(e) => setAddons(e.target.checked ? [...addons, o.id] : addons.filter((x) => x !== o.id))} />
                <span>{o.label}</span>
                <span className="ff-opt__price">{o.price ? `+ ${formatINR(o.price)}` : "Free"}</span>
              </label>
            ))}
          </Slot>

          {item.spice && (
            <Slot id="restaurant.customise.spice" as="fieldset" className="ff-opt">
              <legend>Spice level <span className="ff-req">Choose 1</span></legend>
              <div className="ff-spice">
                {SPICE_LEVELS.map((lv, i) => (
                  <label key={lv} className="ff-spice__opt">
                    <input type="radio" name={`${titleId}-spice`} checked={spice === lv} onChange={() => setSpice(lv)} />
                    <span>{lv}<small aria-hidden className="ff-spice__dots">{"●".repeat(i + 1)}</small></span>
                  </label>
                ))}
              </div>
            </Slot>
          )}

          {other && (
            <p className="rt-banner rt-banner--warning">
              Your cart has items from {other.name}. Adding this item will replace them, because one order comes from one kitchen.
            </p>
          )}
        </div>

        <div className="ff-modal__foot">
          <QtyStepper qty={qty} label={item.name} onChange={(q) => setQty(Math.max(1, Math.min(20, q)))} />
          <SlotButton id="restaurant.customise.add" variant="primary" className="ff-modal__add" onClick={add}>
            {other ? "Replace cart and add" : "Add item"} · <Slot id="restaurant.customise.price" as="span">{formatINR(unit * qty)}</Slot>
          </SlotButton>
        </div>
      </Slot>
    </dialog>
  );
}
