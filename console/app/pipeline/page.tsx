import { Pipeline } from "@/components/Pipeline";
import { Card, Page } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function PipelinePage() {
  return (
    <Page title="Pipeline" sub="Live view of the loop. Boxes and arrows light up while a job is working on that stage.">
      <Card><Pipeline /></Card>
    </Page>
  );
}
