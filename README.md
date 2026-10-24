# Riptide Arena sandbox shops

Five fictional, honest-by-default shops for testing whether AI shopping agents can be manipulated by dark patterns. A JSON manifest layer lets tricksters mutate them later without code changes.

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

## Deploying (later)
Each shop is its own Vercel project with Root Directory `shops/{shop}` (Vercel installs from the monorepo root). Example: `vercel --cwd shops/market`.
