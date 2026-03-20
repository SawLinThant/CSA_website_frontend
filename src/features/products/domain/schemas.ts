import { z } from "zod";

export const productImageSchema = z.object({
  imageUrl: z.string().min(1),
  isPrimary: z.boolean(),
  sortOrder: z.number().int(),
});

export const productSchema = z.object({
  id: z.string().min(1),
  farmerId: z.string().min(1),
  categoryId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  unit: z.string().min(1),
  basePrice: z.number(),
  isActive: z.boolean(),
  createdAt: z.string().min(1),
  images: productImageSchema.array().optional(),
});

export type Product = z.infer<typeof productSchema>;
export type ProductImage = z.infer<typeof productImageSchema>;

export const publicProductListResponseSchema = z.object({
  items: z.array(productSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
});

export type PublicProductListResponse = z.infer<typeof publicProductListResponseSchema>;

// Matches backend: listPublicProductsQuerySchema (defaults to active-only).
export const publicListProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  name: z.string().min(1).optional(),
  categoryId: z.string().min(1).optional(),
  isActive: z.coerce.boolean().optional().default(true),
});

export type PublicListProductsQuery = z.infer<typeof publicListProductsQuerySchema>;

