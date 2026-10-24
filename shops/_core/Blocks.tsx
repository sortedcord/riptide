"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Block } from "./contracts";
import { useLineToggle } from "./RiptideProvider";

/** Generic insertable UI, styled by the shop's --rt-* tokens so it looks native. */
export function RenderBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "banner":
      return <div data-dp={block.id} role="status" className={`rt-block rt-banner rt-banner--${block.tone}`}>{block.text}</div>;
    case "badge":
      return <span data-dp={block.id} className="rt-block rt-badge">{block.text}</span>;
    case "text":
      return <p data-dp={block.id} className={`rt-block rt-text rt-text--${block.size}`}>{block.text}</p>;
    case "countdown":
      return <Countdown {...block} />;
    case "checkbox":
      return block.lineKey ? <LineCheckbox {...block} lineKey={block.lineKey} /> : <PlainCheckbox {...block} />;
    case "card":
      return <Card {...block} />;
    case "modal":
      return <Modal {...block} />;
  }
}

function PlainCheckbox({ id, label, defaultChecked }: { id: string; label: string; defaultChecked: boolean }) {
  return (
    <label data-dp={id} className="rt-block rt-check">
      <input type="checkbox" defaultChecked={defaultChecked} /> <span>{label}</span>
    </label>
  );
}

function LineCheckbox({ id, label, lineKey }: { id: string; label: string; lineKey: string }) {
  const [on, set] = useLineToggle(lineKey);
  return (
    <label data-dp={id} className="rt-block rt-check">
      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} /> <span>{label}</span>
    </label>
  );
}

function Card({ id, title, body, ctaText, declineText, lineKey }: Extract<Block, { type: "card" }>) {
  const [on, set] = useLineToggle(lineKey ?? `${id}:noop`);
  const [dismissed, setDismissed] = useState(false);
  if (dismissed && !on) return null;
  return (
    <section data-dp={id} className="rt-block rt-card" aria-label={title}>
      <h3 className="rt-card__title">{title}</h3>
      <p className="rt-card__body">{body}</p>
      <div className="rt-card__actions">
        <button type="button" className="rt-btn" data-variant="secondary" aria-pressed={lineKey ? on : undefined}
          onClick={() => (lineKey ? set(true) : setDismissed(true))}>{on ? `✓ ${ctaText}` : ctaText}</button>
        {declineText && (
          <button type="button" className="rt-btn" data-variant="secondary"
            onClick={() => { if (lineKey) set(false); setDismissed(true); }}>{declineText}</button>
        )}
      </div>
    </section>
  );
}

function Modal({ id, title, body, acceptText, declineText, trigger }: Extract<Block, { type: "modal" }>) {
  const [open, setOpen] = useState(trigger !== "onExit");
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (trigger !== "onExit") return;
    const onOut = (e: MouseEvent) => { if (!e.relatedTarget && e.clientY <= 0) setOpen(true); };
    document.addEventListener("mouseout", onOut);
    return () => document.removeEventListener("mouseout", onOut);
  }, [trigger]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  // <dialog> closes on Escape natively; onClose keeps state in sync.
  return (
    <dialog ref={ref} data-dp={id} className="rt-modal" aria-labelledby={`${id}-title`} onClose={() => setOpen(false)}>
      <button type="button" className="rt-modal__close" aria-label="Close" onClick={() => setOpen(false)}>×</button>
      <h2 id={`${id}-title`} className="rt-modal__title">{title}</h2>
      <p className="rt-modal__body">{body}</p>
      <div className="rt-modal__actions">
        <button type="button" className="rt-btn" data-variant="secondary" onClick={() => setOpen(false)}>{acceptText}</button>
        <button type="button" className="rt-btn" data-variant="secondary" onClick={() => setOpen(false)}>{declineText}</button>
      </div>
    </dialog>
  );
}

function Countdown({ id, label, endsAt, durationSec, persist }: Extract<Block, { type: "countdown" }>) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    let end = endsAt ? Date.parse(endsAt) : NaN;
    if (Number.isNaN(end)) {
      const k = `riptide:countdown:${id}`;
      const saved = persist ? Number(sessionStorage.getItem(k)) : 0;
      end = saved || Date.now() + (durationSec ?? 600) * 1000;
      if (persist) sessionStorage.setItem(k, String(end));
    }
    const tick = () => setLeft(Math.max(0, Math.round((end - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [id, endsAt, durationSec, persist]);
  return (
    <div data-dp={id} className="rt-block rt-countdown" role="timer">
      <span>{label}</span> <strong>{left === null ? "--:--" : fmt(left)}</strong>
    </div>
  );
}

const fmt = (s: number): ReactNode => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${p(m)}:${p(sec)}` : `${p(m)}:${p(sec)}`;
};
