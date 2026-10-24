import { SHOP_INFO, shopStatus } from "@/lib/data";
import { Badge, Card, Page } from "@/components/ui";
import { ShopFrame } from "@/components/ShopFrame";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function Shops() {
  const shops = await Promise.all(SHOP_INFO.map(async (s) => ({ ...s, ...(await shopStatus(s.port)) })));
  const down = shops.filter((s) => !s.up);
  const { shopBaseUrl } = getSettings();

  return (
    <Page title="Shops" sub="Live previews of the local shop dev servers (honest master code and its manifest variants). Trickster variants are served by the engine on their own ports during runs.">
      <div className="flex flex-wrap gap-2">
        {shops.map((s) => <Badge key={s.shop} tone={s.up ? "ok" : "muted"}>{s.brand} :{s.port} {s.up ? "up" : "down"}</Badge>)}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {shops.filter((s) => s.up).map((s) => (
          <ShopFrame key={s.shop} brand={s.brand} shop={s.shop} port={s.port} base={shopBaseUrl} variants={s.variants} />
        ))}
      </div>
      {down.length > 0 && (
        <Card title="Not running">
          <p className="text-sm text-[var(--muted)]">Start them from the repo root to see a preview:</p>
          <pre className="code mt-2">{down.map((s) => `npm run dev:${s.shop}`).join("\n")}</pre>
        </Card>
      )}
    </Page>
  );
}
