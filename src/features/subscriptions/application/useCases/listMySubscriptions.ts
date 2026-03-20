import type { CustomerSubscriptionListResponse, ListMySubscriptionsQuery } from "../../domain/schemas";
import { subscriptionsApi } from "../../infrastructure/backend/subscriptionsApi";

export async function listMySubscriptionsUseCase(
  query: ListMySubscriptionsQuery,
): Promise<CustomerSubscriptionListResponse> {
  return subscriptionsApi.listMySubscriptions(query);
}

