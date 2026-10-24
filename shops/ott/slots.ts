import { paymentSlots, type SlotDef } from "@riptide/core";

/** Every mutable element in Reelbox. GET /api/slots serves this. */
export const registry: SlotDef[] = [
  ...paymentSlots,
];
