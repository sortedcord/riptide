#!/bin/sh
# `npm start`: everything Riptide needs, in one terminal. The five shops (3001–3005), the console (3100), and the
# four reference agents (41001–41004). The agents are started through the console's jobs API so its Run agents
# stage can use them. Ctrl+C stops it all; agent jobs are detached from the console, so they are stopped by name.
cd "$(dirname "$0")/.."
stop_agents() { pkill -f "engine/agents/reference/server.ts" 2>/dev/null; }
trap 'trap - INT TERM; stop_agents; kill 0; exit 0' INT TERM

# Agents left over from an earlier session would hold the ports and the console could not start its own.
stop_agents

for s in market food air saas ott; do
  npm run -s dev -w "shops/$s" 2>&1 | sed -u "s/^/[$s] /" &
done
npm run -s console 2>&1 | sed -u "s/^/[console] /" &

i=0
until curl -sf -o /dev/null http://127.0.0.1:3100/api/jobs; do
  i=$((i + 1)); [ "$i" -gt 180 ] && { echo "[start] console did not come up"; kill -TERM $$; }
  sleep 1
done
for a in alpha:41001 beta:41002 gamma:41003 delta:41004; do
  curl -s -X POST -H "content-type: application/json" -d "{\"kind\":\"agent\",\"config\":\"${a%:*}\",\"port\":\"${a#*:}\"}" \
    http://127.0.0.1:3100/api/jobs | sed "s/^/[start] agent ${a%:*}: /"; echo
done
echo "[start] Riptide is up: console http://127.0.0.1:3100 · shops http://localhost:3001–3005 · agents 41001–41004. Ctrl+C stops everything."
wait
