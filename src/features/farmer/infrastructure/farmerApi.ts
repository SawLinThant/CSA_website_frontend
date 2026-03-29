import { cache } from "react";
import {
  backendDeleteNoContent,
  backendGetJson,
  backendPatchJson,
  backendPostJson,
} from "@/lib/server/backendClient";
import {
  categoryListResponseSchema,
  farmerProfileResponseSchema,
  harvestSchema,
  myHarvestListResponseSchema,
  myProductListResponseSchema,
  type FarmerProfileResponse,
  type MyHarvestListResponse,
  type MyProductListResponse,
} from "../domain/schemas";
import { productSchema, type Product } from "@/features/products/domain/schemas";

export async function getFarmerProfile(): Promise<FarmerProfileResponse> {
  const data = await backendGetJson<unknown>("/auth/farmer/profile", undefined, { requiresAuth: true });
  return farmerProfileResponseSchema.parse(data);
}

/** Dedupes profile fetch when layout and dashboard page both need it in one request. */
export const getCachedFarmerProfile = cache(getFarmerProfile);

export async function listMyProducts(query: {
  page?: number;
  limit?: number;
  name?: string;
  categoryId?: string;
  isActive?: boolean;
}): Promise<MyProductListResponse> {
  const data = await backendGetJson<unknown>("/auth/farmer/products", query, { requiresAuth: true });
  return myProductListResponseSchema.parse(data);
}

export async function getMyProduct(productId: string): Promise<Product> {
  const data = await backendGetJson<unknown>(`/auth/farmer/products/${productId}`, undefined, {
    requiresAuth: true,
  });
  return productSchema.parse(data);
}

export async function listCategoriesForForms(): Promise<ReturnType<typeof categoryListResponseSchema.parse>> {
  const data = await backendGetJson<unknown>("/api/categories", { page: 1, limit: 100 }, { requiresAuth: false });
  return categoryListResponseSchema.parse(data);
}

export async function listMyHarvests(query: {
  page?: number;
  limit?: number;
  productId?: string;
  status?: "pending" | "approved" | "rejected";
}): Promise<MyHarvestListResponse> {
  const data = await backendGetJson<unknown>("/auth/farmer/harvests", query, { requiresAuth: true });
  return myHarvestListResponseSchema.parse(data);
}

export async function getMyHarvest(harvestId: string) {
  const data = await backendGetJson<unknown>(`/auth/farmer/harvests/${harvestId}`, undefined, {
    requiresAuth: true,
  });
  return harvestSchema.parse(data);
}

export type UpdateFarmerProfileBody = {
  name?: string;
  phone?: string;
  email?: string | null;
  imageUrl?: string | null;
  farmName?: string;
  farmLocation?: string;
  farmDescription?: string | null;
};

export async function patchFarmerProfile(body: UpdateFarmerProfileBody): Promise<FarmerProfileResponse> {
  const data = await backendPatchJson<UpdateFarmerProfileBody, unknown>("/auth/farmer/profile", body, {
    requiresAuth: true,
  });
  return farmerProfileResponseSchema.parse(data);
}

export type CreateProductBody = {
  name: string;
  description?: string | null;
  categoryId: string;
  unit: string;
  basePrice: number;
  images?: { imageUrl: string; isPrimary?: boolean; sortOrder?: number }[];
};

export async function createProductJson(body: CreateProductBody): Promise<Product> {
  const data = await backendPostJson<CreateProductBody, unknown>("/auth/farmer/products", body, {
    requiresAuth: true,
  });
  return productSchema.parse(data);
}

export type UpdateProductBody = {
  name?: string;
  description?: string | null;
  categoryId?: string;
  unit?: string;
  basePrice?: number;
  isActive?: boolean;
  images?: { imageUrl: string; isPrimary?: boolean; sortOrder?: number }[];
};

export async function updateProductJson(productId: string, body: UpdateProductBody): Promise<Product> {
  const data = await backendPatchJson<UpdateProductBody, unknown>(
    `/auth/farmer/products/${productId}`,
    body,
    { requiresAuth: true },
  );
  return productSchema.parse(data);
}

export async function deleteProduct(productId: string): Promise<void> {
  await backendDeleteNoContent(`/auth/farmer/products/${productId}`, { requiresAuth: true });
}

export type CreateHarvestBody = {
  productId: string;
  quantityAvailable: number;
  unitPrice: number;
  harvestDate: string;
  availableUntil: string;
};

export async function createHarvest(body: CreateHarvestBody) {
  const data = await backendPostJson<CreateHarvestBody, unknown>("/auth/farmer/harvests", body, {
    requiresAuth: true,
  });
  return harvestSchema.parse(data);
}

export type UpdateHarvestBody = {
  quantityAvailable?: number;
  unitPrice?: number;
  harvestDate?: string;
  availableUntil?: string;
};

export async function updateHarvest(harvestId: string, body: UpdateHarvestBody) {
  const data = await backendPatchJson<UpdateHarvestBody, unknown>(`/auth/farmer/harvests/${harvestId}`, body, {
    requiresAuth: true,
  });
  return harvestSchema.parse(data);
}
