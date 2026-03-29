"use server";

import { revalidatePath } from "next/cache";
import { env } from "@/lib/server/env";
import { forceRefreshAccessToken, getAccessToken } from "@/lib/server/authSession";
import {
  createCustomerAddress,
  deleteCustomerAddress,
  patchCustomerProfile,
  updateCustomerAddress,
} from "../infrastructure/customerProfileApi";
import type { SaveCustomerAddressBody, UpdateCustomerProfileBody } from "../domain/schemas";

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

function toBool(fd: FormData, key: string): boolean {
  return String(fd.get(key) ?? "").toLowerCase() === "true";
}

export async function updateCustomerProfileAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const locale = String(formData.get("_locale") ?? "en");
  const image = formData.get("image");
  const hasUpload = image instanceof File && image.size > 0;

  if (hasUpload) {
    const result = await updateCustomerProfileUploadAction(locale, formData);
    if (result.ok) revalidatePath(`/${locale}/profile`);
    return result;
  }

  const emailRaw = String(formData.get("email") ?? "").trim();
  const body: UpdateCustomerProfileBody = {
    name: optStr(formData, "name"),
    phone: optStr(formData, "phone"),
    email: emailRaw === "" ? null : emailRaw,
    imageUrl: optStrNullable(formData, "imageUrl"),
  };
  try {
    await patchCustomerProfile(body);
    revalidatePath(`/${locale}/profile`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function saveCustomerAddressAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const locale = String(formData.get("_locale") ?? "en");
  const id = String(formData.get("id") ?? "").trim();
  const body: SaveCustomerAddressBody = {
    addressLine: String(formData.get("addressLine") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim(),
    postalCode: String(formData.get("postalCode") ?? "").trim(),
    country: String(formData.get("country") ?? "").trim(),
    isDefault: toBool(formData, "isDefault"),
  };
  try {
    if (id) {
      await updateCustomerAddress(id, body);
    } else {
      await createCustomerAddress(body);
    }
    revalidatePath(`/${locale}/profile`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function deleteCustomerAddressAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const locale = String(formData.get("_locale") ?? "en");
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Address id is required" };
  try {
    await deleteCustomerAddress(id);
    revalidatePath(`/${locale}/profile`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function setDefaultCustomerAddressAction(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const locale = String(formData.get("_locale") ?? "en");
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Address id is required" };
  try {
    await updateCustomerAddress(id, { isDefault: true });
    revalidatePath(`/${locale}/profile`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

async function updateCustomerProfileUploadAction(locale: string, formData: FormData): Promise<FormActionState> {
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

  const url = `${env.API_BASE_URL}/auth/customer/profile/upload`;
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
      // ignore parse error
    }
    return { ok: false, error: err };
  }

  revalidatePath(`/${locale}/profile`);
  return { ok: true };
}
