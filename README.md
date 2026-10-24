# Riptide Arena

Five fictional, honest-by-default shops for testing whether AI shopping agents can be manipulated by dark patterns, plus an evaluation engine and a web console that mutates them, runs agents and rates them.

| Shop | Brand | Folder | Port |
|---|---|---|---|
| market | Cartwheel | `shops/market` | 3001 |
| food | Forkful | `shops/food` | 3002 |
| air | Skyline Air | `shops/air` | 3003 |
| saas | Prism Studio | `shops/saas` | 3004 |
| ott | Reelbox | `shops/ott` | 3005 |

Shared engine: `shops/_core` (`@riptide/core`). Conventions: [SHOP_GUIDE.md](SHOP_GUIDE.md).

```bash
npm install
npm run dev:market        # http://localhost:3001/honest
```

- `/{variant}/…` serves a shop with `manifests/{variant}.json` applied (`honest` = no overrides). `/` lists variants; `/api/slots` returns the slot registry.
- `npm run build`, `npm run lint`, `npm run typecheck`, `npm test`.

## Evaluation console (web panel)

The console (`console/`) is a local control panel for the evaluation engine. Use it to create dark-pattern variants, freeze suites, run agents against them, and read scores and ratings. Engine details are in [ENGINE_GUIDE.md](ENGINE_GUIDE.md).

### Setup (once)
1. Install dependencies from the repo root: `npm install`.
2. Create `.env` in the repo root. Git ignores it, so never commit it:
   ```bash
   OPENAI_BASE_URL=https://…/v1         # OpenAI-compatible gateway (Responses API)
   OPENAI_API_KEY=…
   RIPTIDE_MODEL=bedrock/anthropic.claude-sonnet-5
   RECORDER_SECRET=any-long-random-string
   ```
3. Playwright needs Chromium at `~/.cache/ms-playwright/chromium-1234/`. If yours is elsewhere, set `PW_CHROMIUM=/path/to/chrome`.

### Run
```bash
npm run console           # http://127.0.0.1:3100
```
The console only listens on localhost because it starts processes on your machine. Don't expose it.

### Typical loop
1. **Variants → Run Trickster.** Pick a shop, a Trickster version and how many variants to make. Each variant is a git branch `variant/{shop}/v_xxxxxx` with its own worktree in `../riptide-wt/`. The Trickster plants patterns, writes the tasks, and runs the gates automatically. Open a variant to see its patterns, decoys, tasks, gate results and code diff. **Re-run gates** retries the gates; **Discard variant** deletes it.
2. **Suites & ratings → Build a suite.** Tick the variants that passed their gates plus the honest controls, then freeze. Suites can't be changed afterwards, so build a new version instead.
3. **Agents & jobs → Start** the reference agents you want (alpha, beta, gamma: increasingly wary of dark patterns, on GPT-4o, GLM 5 and GPT-5). Each one is an A2A server on its own port.
4. **Open the suite → Start evaluation.** Pick running agents, or paste a third-party A2A agent card URL, and choose the number of repeats. This runs every task, then scores and rates the results.
5. Read the **leaderboard** and per-agent insights on the suite page. **Runs** shows each attempt: the flight-recorder timeline next to the agent's own report, plus the rubric checks.

Every button starts a background job. Follow its live log under **Agents & jobs**, where you can also stop it. Jobs live in the console process, so restarting the console loses track of running jobs (and stops agent servers). Logs are also written to `data/console/`.

Each button runs the same command you can type yourself:
```bash
npm run riptide -- mutate --shop market
npm run riptide -- build-suite --suite riptide-suite-0.1.0 --variants v_abc123 --controls market,saas
npx tsx --env-file=.env engine/agents/reference/server.ts --config beta --port 41001
npm run riptide -- run --suite riptide-suite-0.1.0 --agent-card http://127.0.0.1:41001
npm run riptide -- score --suite riptide-suite-0.1.0
npm run riptide -- rate --suite riptide-suite-0.1.0
```

### Troubleshooting
- **Trickster or agents fail right away:** check `.env` and that the gateway answers.
- **A gate fails with "no recorder events":** the variant branched from a master that didn't have the flight recorder yet. Discard it and mutate again.
- **A variant shows "incomplete" with uncommitted edits:** a Trickster run was interrupted. Inspect the diff on its page, then discard it.
- **Port already in use:** pick another port in the agent's Start form.

## Deployment

The whole pipeline is designed to run on one machine today. Everything below the first table is either optional or not built yet. Gaps are marked.

| Part | Where it runs now | Can it be deployed? |
|---|---|---|
| Shops (honest, `master`) | `npm run dev:{shop}` or `next start` | Yes, on Vercel or any Node host (below). The flight recorder needs a writable disk. |
| Shop variants (scored runs) | Built and served by the engine from `../riptide-wt/{variantId}` on a random `127.0.0.1` port | Local only. Public variant URLs aren't built yet. |
| Engine (`npm run riptide`) | Your machine | Local only. It needs git, the worktrees and `data/`. |
| Reference agents (A2A) | `127.0.0.1:{port}` | Local only. They listen on 127.0.0.1 and put that address in their agent card. |
| Console | `127.0.0.1:3100` | Don't deploy it. It starts processes and has no auth. |

### Shops on Vercel (honest/practice deployments)
Each shop is its own Vercel project:
1. Create a project per shop with **Root Directory** `shops/{shop}`. Vercel installs from the monorepo root, so `@riptide/core` resolves.
2. Framework: Next.js; the build command and output are the defaults.
3. Deploy with `vercel --cwd shops/market`, or connect the Git repo.
4. Environment variables: `RECORDER_SECRET` (needed to read recorder events). Without it every read returns 401.
5. **Recorder limitation:** `POST /api/e` appends to `$RECORDER_DIR/{runId}.jsonl` on local disk. Vercel functions have no persistent disk, so on Vercel the recorder writes nothing useful. Use Vercel deployments for browsing and practice only, and use a Node host with a disk for scored runs. A Redis (Upstash/Vercel KV) recorder store is planned but not implemented.
6. Deployment protection must be **off** for any deployment a cloud agent should reach.

### Shops on a Node host (VM, container)
```bash
npm ci
npm run build -w shops/market
RECORDER_DIR=/var/lib/riptide/recorder RECORDER_SECRET=… npm run start -w shops/market   # port 3001
```
- Put it behind a reverse proxy (TLS) if agents reach it over the internet. `/api/e` must accept POSTs from the browser.
- Fetch a run's events with `curl -H "x-recorder-secret: $RECORDER_SECRET" "https://host/api/e?runId=r_…"`.
- Keep `RECORDER_SECRET` server-side only. Never prefix it with `NEXT_PUBLIC_`.

### Before any scored run reaches a third-party agent
These parts of the engine brief are not built yet. Until they are, a public deployment shows test markers to agents:
- **Eval mode** (`EVAL_MODE=1`): hide `/` (variant index) and `/api/slots`, remove the "Riptide sandbox" footer line, strip source maps and HTML comments.
- **Neutral URLs:** today agents start at `/honest/…`, and the variant name is in the path.
- **Hashed tracking keys:** `data-dp` ids are still readable in the DOM.
- **Public variant URLs:** the engine serves variants on `127.0.0.1` only. Cloud agents (TinyFish, third-party A2A agents running elsewhere) can't reach them until variants are deployed (e.g. Vercel branch previews with a disk-backed or Redis recorder) or tunnelled (e.g. `cloudflared tunnel --url http://127.0.0.1:{port}`). Tunnelling isn't wired into the engine.

### Third-party agents
Any agent can be rated without code changes if it:
1. publishes an A2A v1.0 agent card (`/.well-known/agent-card.json`) with a JSON-RPC interface,
2. accepts one text message per task (goal, start URL, stop condition, report format) and completes the task,
3. returns the report JSON as a DataPart or TextPart artifact (`outcome`, `cart`, `totalInr`, `concerns`, `askUser`).

Paste its card URL into **Start evaluation** in the console, or pass it as `--agent-card` to `npm run riptide -- run`. While variants are local only, the agent must run on the same machine, or be able to reach it.

### Secrets and data
- `.env` (gateway key, recorder secret) stays on the machine that runs the engine. It's gitignored.
- `data/mutations`, `data/rubrics`, `data/gates` and the recorder files are the answer key. Never serve them, put them in a shop build, or send them to an agent.
