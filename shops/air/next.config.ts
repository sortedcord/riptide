import path from "node:path";
import type { NextConfig } from "next";

// cwd, not __dirname: when the native SWC binary is blocked, Next compiles this file as ESM.
const root = path.join(process.cwd(), "../..");

const config: NextConfig = {
  transpilePackages: ["@riptide/core"],
  turbopack: { root },
  outputFileTracingRoot: root,
  // Manifests are read from disk at request time.
  outputFileTracingIncludes: { "/**": ["./manifests/**/*.json"] },
};
export default config;
