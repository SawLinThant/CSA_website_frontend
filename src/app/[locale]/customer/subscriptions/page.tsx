import { notFound } from "next/navigation";
import { publicListBoxesQuerySchema } from "@/features/boxes/domain/schemas";
import { listPublicBoxesUseCase } from "@/features/boxes/application/useCases/listPublicBoxes";
import { publicListSubscriptionPlansQuerySchema } from "@/features/subscriptions/domain/schemas";
import { listPublicSubscriptionPlansUseCase } from "@/features/subscriptions/application/useCases/listPublicSubscriptionPlans";
import { isLocale } from "@/i18n/config";
import CustomerSubscriptionsClient from "./CustomerSubscriptionsClient";

export default async function CustomerSubscriptionBoxesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();

  const boxQuery = publicListBoxesQuerySchema.parse({
    page: 1,
    limit: 10,
  });
  const planQuery = publicListSubscriptionPlansQuerySchema.parse({
    page: 1,
    limit: 100,
    active: true,
  });

  const [boxesResult, plansResult] = await Promise.all([
    listPublicBoxesUseCase(boxQuery),
    listPublicSubscriptionPlansUseCase(planQuery),
  ]);

  const plansByBox = new Map<string, typeof plansResult.items>();
  for (const plan of plansResult.items) {
    const arr = plansByBox.get(plan.boxId) ?? [];
    arr.push(plan);
    plansByBox.set(plan.boxId, arr);
  }

  const items = boxesResult.items
    .map((box, idx) => {
      const plans = plansByBox.get(box.id) ?? [];
      const minPrice = plans.length > 0 ? Math.min(...plans.map((p) => p.price)) : null;
      const cheapest = plans.slice().sort((a, b) => a.price - b.price)[0] ?? null;

      return {
        box,
        minPrice,
        frequencyBadge: cheapest?.deliveryFrequency ?? null,
        isNew: idx < 1,
      };
    })
    .filter((x) => x.minPrice != null) as Array<{
    box: (typeof boxesResult.items)[number];
    minPrice: number;
    frequencyBadge: "weekly" | "monthly" | null;
    isNew: boolean;
  }>;

  const hasMore = boxQuery.page * boxQuery.limit < boxesResult.total;

  return (
    <CustomerSubscriptionsClient
      initial={{
        items,
        total: boxesResult.total,
        page: boxesResult.page,
        limit: boxesResult.limit,
        hasMore,
      }}
    />
  );
}

