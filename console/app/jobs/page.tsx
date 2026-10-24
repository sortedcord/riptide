import { referenceConfigs } from "@/lib/data";
import { agentServers } from "@/lib/jobs";
import { Badge, Card, Page } from "@/components/ui";
import { Field, JobsLive, LaunchForm } from "@/components/client";

export const dynamic = "force-dynamic";

export default async function Jobs({ searchParams }: { searchParams: Promise<{ job?: string }> }) {
  const { job } = await searchParams;
  const configs = referenceConfigs();
  const running = agentServers();
  const usedPorts = new Set(running.map((j) => Number(j.url?.split(":").pop())));
  const portFor = (i: number) => { let p = 41001 + i; while (usedPorts.has(p)) p += 10; return p; };

  return (
    <Page title="Agents & jobs" sub="Reference agents are A2A servers; third-party agents only need their agent card URL.">
      <Card title="Reference agents">
        <div id="agents" className="grid gap-3 md:grid-cols-3">
          {configs.map((c, i) => {
            const live = running.find((j) => j.title.startsWith(`Agent ${c.id} `));
            return (
              <div key={c.id} className="rounded-[10px] border border-[var(--border)] p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-medium">{c.id}</h3>
                  {live ? <Badge>running</Badge> : <Badge tone="muted">stopped</Badge>}
                </div>
                <p className="mt-1 font-mono text-xs text-[var(--muted)]">{c.model} · ≤{c.maxSteps} steps</p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-[var(--muted)]">System prompt</summary>
                  <p className="mt-1 whitespace-pre-wrap text-xs">{c.systemPrompt}</p>
                </details>
                <div className="mt-3">
                  {live ? (
                    <p className="text-xs">Card: <a className="link" href={`${live.url}/.well-known/agent-card.json`} target="_blank">{live.url}</a></p>
                  ) : (
                    <LaunchForm kind="agent" submit="Start" stay>
                      <input type="hidden" name="config" value={c.id} />
                      <Field label="Port"><input name="port" type="number" defaultValue={portFor(i)} className="input w-24" /></Field>
                    </LaunchForm>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <JobsLive initial={job} />
    </Page>
  );
}
