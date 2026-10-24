"use client";
import Link from "next/link";
import { SANDBOX_NOTICE, useRiptide } from "@riptide/core";
import { brand } from "@/brand";

export function Header() {
  return <header><Link href={useRiptide().base}>{brand.name}</Link></header>;
}

export function Footer() {
  return <footer><p>{SANDBOX_NOTICE}</p></footer>;
}
