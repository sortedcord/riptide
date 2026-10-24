import { SHOP_INFO } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { Card, Page } from "@/components/ui";
import { SettingsForm } from "./form";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const { shopBaseUrl } = getSettings();
  return (
    <Page title="Settings" sub="Where the console points your browser. Saved on this machine in data/console/settings.json.">
      <Card title="Shop previews">
        <SettingsForm shopBaseUrl={shopBaseUrl} shops={SHOP_INFO.map(({ brand, port }) => ({ brand, port }))} />
      </Card>
    </Page>
  );
}
