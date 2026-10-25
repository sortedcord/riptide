import "../styles/app.css";
import type { ComponentType } from "react";
import { Header } from "../components/Header";

/** Shared shell for every page: global styles and the site header. */
export default function FairBasketApp({ Component, pageProps }: { Component: ComponentType<any>; pageProps: Record<string, unknown> }) {
  return (
    <>
      <Header />
      <Component {...pageProps} />
    </>
  );
}
