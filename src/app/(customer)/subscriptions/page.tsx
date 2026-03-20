import { redirect } from "next/navigation";
import {
  listMySubscriptionsQuerySchema,
  type ListMySubscriptionsQuery,
} from "@/features/subscriptions/domain/schemas";
import { listMySubscriptionsUseCase } from "@/features/subscriptions/application/useCases/listMySubscriptions";
import { SubscriptionList } from "@/features/subscriptions/ui/SubscriptionList";

function normalizeSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const pick = (key: string) =>
    Array.isArray(searchParams[key]) ? searchParams[key]?.[0] : searchParams[key];

  return {
    page: pick("page"),
    limit: pick("limit"),
    status: pick("status"),
  };
}

export default async function CustomerSubscriptionsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const normalized = normalizeSearchParams(searchParams);
  let query: ListMySubscriptionsQuery;
  try {
    query = listMySubscriptionsQuerySchema.parse(normalized);
  } catch {
    query = listMySubscriptionsQuerySchema.parse({});
  }

  let result: Awaited<ReturnType<typeof listMySubscriptionsUseCase>>;
  try {
    result = await listMySubscriptionsUseCase(query);
  } catch {
    // Auth likely missing/expired.
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">My Subscriptions</h1>
      <p className="mt-2 text-sm opacity-70">
        Showing your current subscription(s). You can add pause/cancel flows later.
      </p>
      <div className="mt-6">
        <SubscriptionList subscriptions={result.items} />
      </div>
    </main>
  );
}

