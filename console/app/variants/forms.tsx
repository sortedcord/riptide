import { SHOPS, tricksterVersions } from "@/lib/data";
import { Field, LaunchForm } from "@/components/client";

/** Start one or more Trickster runs for a shop. */
export function MutateForm() {
  const versions = tricksterVersions();
  return (
    <LaunchForm kind="mutate" submit="Run Trickster">
      <Field label="Shop">
        <select name="shop" className="input" defaultValue="market">{SHOPS.map((s) => <option key={s}>{s}</option>)}</select>
      </Field>
      <Field label="Trickster version">
        <select name="version" className="input" defaultValue={versions.at(-1)}>{versions.map((v) => <option key={v}>{v}</option>)}</select>
      </Field>
      <Field label="Variants">
        <input name="count" type="number" min={1} max={5} defaultValue={1} className="input w-20" />
      </Field>
    </LaunchForm>
  );
}
