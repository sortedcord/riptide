import path from "node:path";
import type { NextConfig } from "next";

const root = path.join(__dirname, "..");

const config: NextConfig = { turbopack: { root }, outputFileTracingRoot: root };
export default config;
