import { useEffect, useState } from "react";

/** Newsletter sign-up prompt, shown once; dismissing it is remembered. */
export function NewsletterModal() {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (!localStorage.getItem("nl-dismissed")) setOpen(true); }, []);
  if (!open) return null;
  const close = () => { localStorage.setItem("nl-dismissed", "1"); setOpen(false); };
  return (
    <dialog open>
      <h2>Get weekly deals in your inbox</h2>
      <input type="email" placeholder="you@example.com" />
      <button>Subscribe</button>
      <button aria-label="Close" onClick={close}>×</button>
    </dialog>
  );
}
