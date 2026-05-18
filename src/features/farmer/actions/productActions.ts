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

function logServerFormData(label: string, formData: FormData): void {
  if (process.env.NODE_ENV !== "development") return;
  const entries = Array.from(formData.entries()).map(([key, value]) =>
    value instanceof File
      ? {
          key,
          type: "file",
          name: value.name,
          size: value.size,
          mime: value.type,
        }
      : {
          key,
          type: "text",
          value,
        },
  );
  console.log(`[productActions] ${label}`, entries);
}

type MultipartSnapshotPart =
  | { key: string; kind: "text"; value: string }
  | {
      key: string;
      kind: "file";
      bytes: Uint8Array;
      name: string;
      mime: string;
    };

async function snapshotMultipart(formData: FormData): Promise<MultipartSnapshotPart[]> {
  const parts: MultipartSnapshotPart[] = [];
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      const bytes = new Uint8Array(await value.arrayBuffer());
      parts.push({
        key,
        kind: "file",
        bytes,
        name: value.name,
        mime: value.type,
      });
    } else {
      parts.push({
        key,
        kind: "text",
        value,
      });
    }
  }
  return parts;
}

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

  logServerFormData("raw server action formData", formData);

  const rawParts = await snapshotMultipart(formData);
  const normalizedParts = rawParts
    .filter((part) => !part.key.startsWith("_") && !part.key.startsWith("$ACTION_") && !/^\d+$/.test(part.key))
    .map((part) => ({ ...part, key: part.key.replace(/^\d+_/, "") }))
    .filter((part) => part.key.length > 0);

  const build = () => {
    const fd = new FormData();
    for (const part of normalizedParts) {
      if (part.kind === "file") {
        fd.append(part.key, new File([part.bytes], part.name, { type: part.mime }));
      } else {
        fd.append(part.key, part.value);
      }
    }
    logServerFormData("normalized multipart formData", fd);
    return fd;
  };

  const url = `${env.API_BASE_URL}${path}`;
  let res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    body: build(),
  });
  console.log("[productActions] upload response", { path, status: res.status, retried: false });

  if (res.status === 401) {
    const refreshed = await forceRefreshAccessToken();
    if (!refreshed) return { ok: false, error: "Unauthorized" };
    token = refreshed;
    res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: build(),
    });
    console.log("[productActions] upload response", { path, status: res.status, retried: true });
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
