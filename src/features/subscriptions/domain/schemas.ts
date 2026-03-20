import { z } from "zod";

export const subscriptionStatusSchema = z.enum(["active", "paused", "cancelled"]);

export const subscriptionSchema = z.object({
  id: z.string().min(1),
  customerId: z.string().min(1),
  planId: z.string().min(1),
  status: subscriptionStatusSchema,
  startDate: z.string().min(1),
  nextDeliveryDate: z.string().min(1),
  pauseUntil: z.string().min(1).nullable(),
  createdAt: z.string().min(1),
});

export type Subscription = z.infer<typeof subscriptionSchema>;

export const publicSubscriptionListResponseSchema = z.object({
  items: z.array(subscriptionSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
});

export type CustomerSubscriptionListResponse = z.infer<typeof publicSubscriptionListResponseSchema>;

// Matches backend: listMySubscriptionsQuerySchema
export const listMySubscriptionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: subscriptionStatusSchema.optional(),
});

export type ListMySubscriptionsQuery = z.infer<typeof listMySubscriptionsQuerySchema>;

export const deliveryFrequencySchema = z.enum(["weekly", "monthly"]);

export const subscriptionPlanSchema = z.object({
  id: z.string().min(1),
  boxId: z.string().min(1),
  name: z.string().min(1),
  price: z.number(),
  deliveryFrequency: deliveryFrequencySchema,
  deliveriesPerCycle: z.number().int().nonnegative(),
  active: z.boolean(),
  createdAt: z.string().min(1),
});

export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;

export const subscriptionPlansListResponseSchema = z.object({
  items: z.array(subscriptionPlanSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
});

export type SubscriptionPlansListResponse = z.infer<typeof subscriptionPlansListResponseSchema>;

export const publicListSubscriptionPlansQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  boxId: z.string().min(1).optional(),
  active: z.coerce.boolean().optional(),
});

export type PublicListSubscriptionPlansQuery = z.infer<typeof publicListSubscriptionPlansQuerySchema>;

