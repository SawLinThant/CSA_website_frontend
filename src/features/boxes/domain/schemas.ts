import { z } from "zod";

export const boxSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string().min(1).optional(),
});

export type Box = z.infer<typeof boxSchema>;

export const boxListResponseSchema = z.object({
  items: z.array(boxSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
});

export type BoxListResponse = z.infer<typeof boxListResponseSchema>;

export const publicListBoxesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  name: z.string().min(1).optional(),
});

export type PublicListBoxesQuery = z.infer<typeof publicListBoxesQuerySchema>;

export const boxDetailPlanSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number(),
  deliveryFrequency: z.enum(["weekly", "monthly"]),
  deliveriesPerCycle: z.number().int().nonnegative(),
});

export const boxDetailVersionSchema = z.object({
  id: z.string().min(1),
  versionName: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().nullable(),
});

export const boxDetailItemSchema = z.object({
  id: z.string().min(1),
  quantity: z.number().int().positive(),
  optional: z.boolean(),
  product: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    unit: z.string().min(1),
    imageUrl: z.string().nullable(),
  }),
  farmer: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    farmName: z.string().min(1),
  }),
});

export const boxDetailResponseSchema = z.object({
  box: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().nullable(),
    imageUrl: z.string().nullable(),
  }),
  activePlan: boxDetailPlanSchema.nullable(),
  activeVersion: boxDetailVersionSchema.nullable(),
  sampleItems: z.array(boxDetailItemSchema),
  meta: z.object({
    referenceDate: z.string().min(1),
    disclaimer: z.string().min(1),
  }),
});

export type BoxDetailResponse = z.infer<typeof boxDetailResponseSchema>;

