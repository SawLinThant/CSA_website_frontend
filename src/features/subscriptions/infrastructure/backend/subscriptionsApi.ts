import { backendGetJson } from "@/lib/server/backendClient";
import {
  type CustomerSubscriptionListResponse,
  listMySubscriptionsQuerySchema,
  type ListMySubscriptionsQuery,
  publicSubscriptionListResponseSchema,
  subscriptionSchema,
  type Subscription,
  publicListSubscriptionPlansQuerySchema,
  subscriptionPlansListResponseSchema,
  type PublicListSubscriptionPlansQuery,
  type SubscriptionPlansListResponse,
  subscriptionPlanSchema,
  type SubscriptionPlan,
} from "../../domain/schemas";

export const subscriptionsApi = {
  async listMySubscriptions(query: ListMySubscriptionsQuery): Promise<CustomerSubscriptionListResponse> {
    const data = await backendGetJson<unknown>("/customer/subscriptions", query as Record<string, string | number | boolean | undefined>, {
      requiresAuth: true,
    });
    return publicSubscriptionListResponseSchema.parse(data);
  },

  async getMySubscription(id: string): Promise<Subscription> {
    const data = await backendGetJson<unknown>(`/customer/subscriptions/${id}`, undefined, { requiresAuth: true });
    return subscriptionSchema.parse(data);
  },

  async listPublicSubscriptionPlans(query: PublicListSubscriptionPlansQuery): Promise<SubscriptionPlansListResponse> {
    const data = await backendGetJson<unknown>("/subscription-plans", query as Record<string, string | number | boolean | undefined>, {
      requiresAuth: false,
      revalidate: 60,
    });
    return subscriptionPlansListResponseSchema.parse(data);
  },

  async getPublicSubscriptionPlan(id: string): Promise<SubscriptionPlan> {
    const data = await backendGetJson<unknown>(`/subscription-plans/${id}`, undefined, {
      requiresAuth: false,
      revalidate: 60,
    });
    return subscriptionPlanSchema.parse(data);
  },
};

export function parseListMySubscriptionsQuery(input: unknown): ListMySubscriptionsQuery {
  return listMySubscriptionsQuerySchema.parse(input);
}

export function parsePublicListSubscriptionPlansQuery(input: unknown): PublicListSubscriptionPlansQuery {
  return publicListSubscriptionPlansQuerySchema.parse(input);
}

