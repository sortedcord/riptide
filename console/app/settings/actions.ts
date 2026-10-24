"use server";
import { revalidatePath } from "next/cache";
import { saveSettings } from "@/lib/settings";

export type SaveState = { ok: boolean; message: string };

export async function save(_: SaveState, form: FormData): Promise<SaveState> {
  try {
    saveSettings({ shopBaseUrl: String(form.get("shopBaseUrl") ?? "") });
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "Saved." };
}
