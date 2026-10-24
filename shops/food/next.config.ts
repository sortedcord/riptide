import path from "node:path";
import type { NextConfig } from "next";

const root = path.join(__dirname, "../..");

const config: NextConfig = {
  transpilePackages: ["@riptide/core"],
  turbopack: { root },
  outputFileTracingRoot: root,
  // Manifests are read from disk at request time.
  outputFileTracingIncludes: { "/**": ["./manifests/**/*.json"] },
};
export default config;
