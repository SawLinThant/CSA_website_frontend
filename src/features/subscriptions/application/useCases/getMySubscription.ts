import type { Subscription } from "../../domain/schemas";
import { subscriptionsApi } from "../../infrastructure/backend/subscriptionsApi";

export async function getMySubscriptionUseCase(subscriptionId: string): Promise<Subscription> {
  return subscriptionsApi.getMySubscription(subscriptionId);
}

