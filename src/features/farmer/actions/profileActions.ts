"use server";

import { revalidatePath } from "next/cache";
import { patchFarmerProfile, type UpdateFarmerProfileBody } from "../infrastructure/farmerApi";
import { env } from "@/lib/server/env";
import { forceRefreshAccessToken, getAccessToken } from "@/lib/server/authSession";

export type FormActionState = { ok: boolean; error?: string };

function optStr(fd: FormData, key: string): string | undefined {
  const v = String(fd.get(key) ?? "").trim();
  return v || undefined;
}

function optStrNullable(fd: FormData, key: string): string | null | undefined {
  const v = String(fd.get(key) ?? "").trim();
  if (v === "") return null;
  return v;
}

export async function updateFarmerProfileAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const locale = String(formData.get("_locale") ?? "en");
  const image = formData.get("image");
  const hasUpload = image instanceof File && image.size > 0;

  if (hasUpload) {
    const result = await updateFarmerProfileUploadAction(locale, formData);
    if (result.ok) {
      revalidatePath(`/${locale}/farmer`, "layout");
    }
    return result;
  }

  const emailRaw = String(formData.get("email") ?? "").trim();
  const body: UpdateFarmerProfileBody = {
    name: optStr(formData, "name"),
    phone: optStr(formData, "phone"),
    email: emailRaw === "" ? null : emailRaw,
    imageUrl: optStrNullable(formData, "imageUrl"),
    farmName: optStr(formData, "farmName"),
    farmLocation: optStr(formData, "farmLocation"),
    farmDescription: optStrNullable(formData, "farmDescription"),
  };

  try {
    await patchFarmerProfile(body);
    revalidatePath(`/${locale}/farmer`, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

async function updateFarmerProfileUploadAction(locale: string, formData: FormData): Promise<FormActionState> {
  let token = await getAccessToken();
  if (!token) return { ok: false, error: "Unauthorized" };

  const build = () => {
    const fd = new FormData();
    for (const [k, v] of formData.entries()) {
      if (k.startsWith("_")) continue;
      fd.append(k, v);
    }
    return fd;
  };

  const url = `${env.API_BASE_URL}/auth/farmer/profile/upload`;
  let res = await fetch(url, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: build(),
  });

  if (res.status === 401) {
    const refreshed = await forceRefreshAccessToken();
    if (!refreshed) return { ok: false, error: "Unauthorized" };
    token = refreshed;
    res = await fetch(url, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: build(),
    });
  }

  if (!res.ok) {
    let err = `Request failed (${res.status})`;
    try {
      const j = (await res.json()) as { error?: string };
      if (j.error) err = j.error;
    } catch {
      /* ignore */
    }
    return { ok: false, error: err };
  }

  return { ok: true };
}
