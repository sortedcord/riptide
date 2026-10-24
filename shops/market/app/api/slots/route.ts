import { slotsResponse } from "@riptide/core/server";
import { config } from "@/shop.config";

export const GET = () => slotsResponse(config);
