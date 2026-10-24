import { SHOP_INFO } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { Page } from "@/components/ui";
import { SettingsForm } from "./form";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <Page title="Settings" sub="Models the agents run on and where the console points your browser. Saved on this machine in data/console/settings.json.">
      <SettingsForm initial={getSettings()} shops={SHOP_INFO.map(({ brand, port }) => ({ brand, port }))} />
    </Page>
  );
}
