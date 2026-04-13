import { NextResponse } from "next/server";
import { z } from "zod";
import { publicListBoxesQuerySchema } from "@/features/boxes/domain/schemas";
import { listPublicBoxesUseCase } from "@/features/boxes/application/useCases/listPublicBoxes";
import { publicListSubscriptionPlansQuerySchema } from "@/features/subscriptions/domain/schemas";
import { listPublicSubscriptionPlansUseCase } from "@/features/subscriptions/application/useCases/listPublicSubscriptionPlans";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    page: url.searchParams.get("page") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const { page, limit } = parsed.data;

  const boxesResult = await listPublicBoxesUseCase(
    publicListBoxesQuerySchema.parse({ page, limit }),
  );
  const plansResult = await listPublicSubscriptionPlansUseCase(
    publicListSubscriptionPlansQuerySchema.parse({ page: 1, limit: 100, active: true }),
  );

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
        isNew: idx < 1 && page === 1,
      };
    })
    .filter((x) => x.minPrice != null);

  const hasMore = page * limit < boxesResult.total;

  return NextResponse.json({
    items,
    total: boxesResult.total,
    page: boxesResult.page,
    limit: boxesResult.limit,
    hasMore,
  });
}

