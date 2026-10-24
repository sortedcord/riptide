import type { ShopConfig } from "@riptide/core";
import { registry } from "./slots";

export type ShopState = { selected?: Record<string, boolean> };

export const config: ShopConfig<ShopState> = {
  shop: "saas",
  steps: ["home", "payment"],
  flows: { purchase: [{ step: "home", path: "" }, { step: "payment", path: "payment" }] },
  registry,
  initialState: {},
  buildLines: () => [],
};
