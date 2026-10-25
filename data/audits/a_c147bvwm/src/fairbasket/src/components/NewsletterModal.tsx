import { useEffect, useState } from "react";

/** Newsletter sign-up prompt. */
export function NewsletterModal() {
  const [open, setOpen] = useState(false);
  // Opens on every page view; closing only hides it until the next navigation.
  useEffect(() => { const t = setTimeout(() => setOpen(true), 1500); return () => clearTimeout(t); }, []);
  if (!open) return null;
  return (
    <dialog open>
      <h2>Get weekly deals in your inbox</h2>
      <input type="email" placeholder="you@example.com" />
      <button>Subscribe</button>
      <button aria-label="Close" onClick={() => setOpen(false)}>×</button>
    </dialog>
  );
}
