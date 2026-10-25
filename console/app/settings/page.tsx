import { SHOP_INFO } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { AUDITOR_DEFAULT, listAuditorModels } from "@/lib/models";
import { Page } from "@/components/ui";
import { SettingsForm } from "./form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const auditor = await listAuditorModels();
  return (
    <Page title="Settings" sub="Models the agents run on and where the console points your browser. Saved on this machine in data/console/settings.json.">
      <SettingsForm initial={getSettings()} shops={SHOP_INFO.map(({ brand, port }) => ({ brand, port }))} auditor={{ ...auditor, defaultModel: AUDITOR_DEFAULT }} />
    </Page>
  );
}
