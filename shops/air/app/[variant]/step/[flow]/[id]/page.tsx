"use client";
import { InterstitialPage } from "@riptide/core";
import { use } from "react";

export default function Page({ params }: { params: Promise<{ flow: string; id: string }> }) {
  const { flow, id } = use(params);
  return <InterstitialPage flow={flow} id={id} />;
}
