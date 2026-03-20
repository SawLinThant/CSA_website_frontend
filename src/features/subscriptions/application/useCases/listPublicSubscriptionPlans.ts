import type { PublicListSubscriptionPlansQuery, SubscriptionPlansListResponse } from "../../domain/schemas";
import { subscriptionsApi } from "../../infrastructure/backend/subscriptionsApi";

export async function listPublicSubscriptionPlansUseCase(
  query: PublicListSubscriptionPlansQuery,
): Promise<SubscriptionPlansListResponse> {
  return subscriptionsApi.listPublicSubscriptionPlans(query);
}

