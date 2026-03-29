import { z } from "zod";
import { userRoleSchema } from "@/features/auth/domain/schemas";
import { productSchema } from "@/features/products/domain/schemas";

export const farmerProfileResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().nullable(),
    phone: z.string(),
    imageUrl: z.string().nullable(),
    role: userRoleSchema,
  }),
  farmer: z.object({
    id: z.string(),
    farmName: z.string(),
    farmLocation: z.string(),
    farmDescription: z.string().nullable(),
    approved: z.boolean(),
  }),
});

export type FarmerProfileResponse = z.infer<typeof farmerProfileResponseSchema>;

export const myProductListResponseSchema = z.object({
  items: z.array(productSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type MyProductListResponse = z.infer<typeof myProductListResponseSchema>;

export const harvestSchema = z.object({
  id: z.string(),
  farmerId: z.string(),
  productId: z.string(),
  quantityAvailable: z.number(),
  unitPrice: z.number(),
  harvestDate: z.string(),
  availableUntil: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
  approvedBy: z.string().nullable(),
  approvedAt: z.string().nullable(),
  createdAt: z.string(),
});

export type Harvest = z.infer<typeof harvestSchema>;

export const myHarvestListResponseSchema = z.object({
  items: z.array(harvestSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type MyHarvestListResponse = z.infer<typeof myHarvestListResponseSchema>;

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
});

export const categoryListResponseSchema = z.object({
  items: z.array(categorySchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type Category = z.infer<typeof categorySchema>;
