import path from "node:path";
import type { NextConfig } from "next";

// cwd, not __dirname: when the native SWC binary is blocked, Next compiles this file as ESM (same root as lib/data.ts).
const root = path.join(process.cwd(), "..");

const config: NextConfig = { turbopack: { root }, outputFileTracingRoot: root };
export default config;
