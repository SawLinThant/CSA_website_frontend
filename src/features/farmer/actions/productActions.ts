"use server";

import { revalidatePath } from "next/cache";
import { forceRefreshAccessToken, getAccessToken } from "@/lib/server/authSession";
import { env } from "@/lib/server/env";
import {
  createProductJson,
  deleteProduct,
  updateProductJson,
  type CreateProductBody,
  type UpdateProductBody,
} from "../infrastructure/farmerApi";

export type MutateState = { ok: boolean; error?: string };

export async function deleteProductAction(productId: string, locale: string): Promise<MutateState> {
  try {
    await deleteProduct(productId);
    revalidatePath(`/${locale}/farmer`);
    revalidatePath(`/${locale}/farmer/products`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function createProductJsonAction(locale: string, body: CreateProductBody): Promise<MutateState> {
  try {
    await createProductJson(body);
    revalidatePath(`/${locale}/farmer`);
    revalidatePath(`/${locale}/farmer/products`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function updateProductJsonAction(
  locale: string,
  productId: string,
  body: UpdateProductBody,
): Promise<MutateState> {
  try {
    await updateProductJson(productId, body);
    revalidatePath(`/${locale}/farmer`);
    revalidatePath(`/${locale}/farmer/products`);
    revalidatePath(`/${locale}/farmer/products/${productId}/edit`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

async function forwardMultipart(
  path: string,
  method: "POST" | "PATCH",
  formData: FormData,
): Promise<MutateState> {
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

  const url = `${env.API_BASE_URL}${path}`;
  let res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    body: build(),
  });

  if (res.status === 401) {
    const refreshed = await forceRefreshAccessToken();
    if (!refreshed) return { ok: false, error: "Unauthorized" };
    token = refreshed;
    res = await fetch(url, {
      method,
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

export async function createProductUploadAction(locale: string, formData: FormData): Promise<MutateState> {
  const result = await forwardMultipart("/auth/farmer/products/upload", "POST", formData);
  if (result.ok) {
    revalidatePath(`/${locale}/farmer`);
    revalidatePath(`/${locale}/farmer/products`);
  }
  return result;
}

export async function updateProductUploadAction(
  locale: string,
  productId: string,
  formData: FormData,
): Promise<MutateState> {
  const result = await forwardMultipart(`/auth/farmer/products/${productId}/upload`, "PATCH", formData);
  if (result.ok) {
    revalidatePath(`/${locale}/farmer`);
    revalidatePath(`/${locale}/farmer/products`);
    revalidatePath(`/${locale}/farmer/products/${productId}/edit`);
  }
  return result;
}
