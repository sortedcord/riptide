"use client";
import { SandboxComplete, useRiptide } from "@riptide/core";

export default function Page() {
  return <SandboxComplete homeHref={useRiptide().base} />;
}
