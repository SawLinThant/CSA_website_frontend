import Link from "next/link";
import { redirect } from "next/navigation";
import { listMySubscriptionsQuerySchema, type ListMySubscriptionsQuery } from "@/features/subscriptions/domain/schemas";
import { listMySubscriptionsUseCase } from "@/features/subscriptions/application/useCases/listMySubscriptions";
import { listPublicSubscriptionPlansUseCase } from "@/features/subscriptions/application/useCases/listPublicSubscriptionPlans";
import { SubscriptionList } from "@/features/subscriptions/ui/SubscriptionList";
import { isLocale, type Locale, withLocalePath } from "@/i18n/config";
import { isBackendRequestError } from "@/lib/server/backendClient";

function normalizeSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const pick = (key: string) => (Array.isArray(searchParams[key]) ? searchParams[key]?.[0] : searchParams[key]);

  return {
    page: pick("page"),
    limit: pick("limit"),
    status: pick("status"),
  };
}

export default async function CustomerMySubscriptionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { locale: loc } = await params;
  if (!isLocale(loc)) redirect("/en/customer/subscriptions");
  const locale = loc as Locale;

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
  } catch (error) {
    if (isBackendRequestError(error) && (error.status === 401 || error.status === 403)) {
      redirect(withLocalePath(locale, "/customer/login"));
    }
    throw error;
  }
  const plans = await listPublicSubscriptionPlansUseCase({ page: 1, limit: 100, active: true }).catch(() => null);
  const planNamesById = Object.fromEntries((plans?.items ?? []).map((plan) => [plan.id, plan.name]));

  return (
    <main className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">My Subscriptions</h1>
          <p className="mt-2 text-sm opacity-70">Your active subscription(s).</p>
        </div>
        <Link href={withLocalePath(locale, "/customer/subscriptions")} className="text-sm font-semibold text-primary hover:underline">
          Browse boxes
        </Link>
      </div>

      <div className="mt-5">
        <SubscriptionList subscriptions={result.items} planNamesById={planNamesById} />
      </div>
    </main>
  );
}

