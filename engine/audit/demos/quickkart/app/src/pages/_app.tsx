import type { ComponentType } from "react";
import { Header } from "../components/Header";
import "../styles/app.css";

/** App shell: global styles and the site header around every page. */
export default function QuickKartApp({ Component, pageProps }: { Component: ComponentType<any>; pageProps: Record<string, unknown> }) {
  return (
    <>
      <Header />
      <Component {...pageProps} />
    </>
  );
}
