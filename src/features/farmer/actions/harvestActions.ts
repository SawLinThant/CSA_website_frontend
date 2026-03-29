"use server";

import { revalidatePath } from "next/cache";
import { createHarvest, updateHarvest, type CreateHarvestBody, type UpdateHarvestBody } from "../infrastructure/farmerApi";

export type MutateState = { ok: boolean; error?: string };

export async function createHarvestAction(locale: string, body: CreateHarvestBody): Promise<MutateState> {
  try {
    await createHarvest(body);
    revalidatePath(`/${locale}/farmer`);
    revalidatePath(`/${locale}/farmer/harvests`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function updateHarvestAction(
  locale: string,
  harvestId: string,
  body: UpdateHarvestBody,
): Promise<MutateState> {
  try {
    await updateHarvest(harvestId, body);
    revalidatePath(`/${locale}/farmer`);
    revalidatePath(`/${locale}/farmer/harvests`);
    revalidatePath(`/${locale}/farmer/harvests/${harvestId}/edit`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}
