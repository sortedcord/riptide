"use client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useFlow, useSession } from "./RiptideProvider";

/** Renders a manifest-inserted step. Mount at app/[variant]/step/[flow]/[id]/page.tsx inside the shop's chrome. */
export function InterstitialPage({ flow, id }: { flow: string; id: string }) {
  const f = useFlow(flow);
  const [state, set] = useSession<{ interstitial?: Record<string, Record<string, string | boolean>> }>();
  const s = f.steps.find((x) => x.interstitial?.id === id)?.interstitial;
  if (!s) notFound();
  const answers = state.interstitial?.[id] ?? {};
  const save = (k: string, v: string | boolean) =>
    set((st) => ({ interstitial: { ...st.interstitial, [id]: { ...st.interstitial?.[id], [k]: v } } }));
  const next = f.next(id);
  return (
    <main data-riptide-step={id} className="rt-interstitial">
      <h1 className="rt-interstitial__title">{s.title}</h1>
      {s.body && <p className="rt-interstitial__body">{s.body}</p>}
      <form className="rt-interstitial__form" onSubmit={(e) => e.preventDefault()}>
        {s.fields.map((fl) => {
          const fid = `rt-${id}-${fl.id}`;
          if (fl.type === "checkbox")
            return (
              <label key={fl.id} className="rt-check" htmlFor={fid}>
                <input id={fid} type="checkbox" checked={answers[fl.id] === true} onChange={(e) => save(fl.id, e.target.checked)} />
                <span>{fl.label}</span>
              </label>
            );
          const Tag = fl.type === "textarea" ? "textarea" : "input";
          return (
            <div key={fl.id} className="rt-field">
              <label htmlFor={fid}>{fl.label}</label>
              <Tag id={fid} className="rt-input" value={String(answers[fl.id] ?? "")} onChange={(e) => save(fl.id, e.target.value)} />
            </div>
          );
        })}
        <div className="rt-interstitial__actions">
          <Link href={next} className="rt-btn" data-variant="primary">{s.continueText}</Link>
          {s.skipText && <Link href={next} className="rt-btn" data-variant="primary">{s.skipText}</Link>}
        </div>
      </form>
    </main>
  );
}
