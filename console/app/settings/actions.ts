"use server";
import { revalidatePath } from "next/cache";
import { saveSettings } from "@/lib/settings";

export type SaveState = { ok: boolean; message: string };

export async function save(_: SaveState, form: FormData): Promise<SaveState> {
  try {
    const field = (k: string) => String(form.get(k) ?? "");
    saveSettings({ shopBaseUrl: field("shopBaseUrl"), tricksterModel: field("tricksterModel"), snifferModel: field("snifferModel"), auditorModel: field("auditorModel") });
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "Saved." };
}
