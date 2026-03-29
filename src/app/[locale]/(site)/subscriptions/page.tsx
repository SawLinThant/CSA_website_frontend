import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpDown, CalendarDays, Search, SlidersHorizontal } from "lucide-react";
import { publicListBoxesQuerySchema } from "@/features/boxes/domain/schemas";
import { listPublicBoxesUseCase } from "@/features/boxes/application/useCases/listPublicBoxes";
import SubscribeNowButton from "@/features/boxes/ui/SubscribeNowButton";
import { publicListSubscriptionPlansQuerySchema } from "@/features/subscriptions/domain/schemas";
import { listPublicSubscriptionPlansUseCase } from "@/features/subscriptions/application/useCases/listPublicSubscriptionPlans";
import { formatMoneyAmount } from "@/lib/format/money";
import { getShellAuthState } from "@/lib/server/getShellAuthState";
import { isLocale, type Locale, withLocalePath } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

type FrequencyFilter = "all" | "weekly" | "monthly";
type PriceRangeFilter = "all" | "under25000" | "25000to40000" | "over40000";
type SortFilter = "featured" | "priceAsc" | "priceDesc" | "nameAsc";

function normalizeSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const pick = (key: string) =>
    Array.isArray(searchParams[key]) ? searchParams[key]?.[0] : searchParams[key];

  return {
    q: pick("q") ?? "",
    frequency: (pick("frequency") ?? "all") as FrequencyFilter,
    priceRange: (pick("priceRange") ?? "all") as PriceRangeFilter,
    sortBy: (pick("sortBy") ?? "featured") as SortFilter,
  };
}

export default async function SubscriptionBoxesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  const locale = loc as Locale;
  const messages = getMessages(locale);

  const sp = normalizeSearchParams(await searchParams);
  const auth = await getShellAuthState();
  const authRole = auth.status === "authenticated" ? auth.user.role : "guest";

  const boxQuery = publicListBoxesQuerySchema.parse({
    page: 1,
    limit: 100,
    name: sp.q.trim() || undefined,
  });
  const planQuery = publicListSubscriptionPlansQuerySchema.parse({
    page: 1,
    limit: 100,
    active: true,
    deliveryFrequency: sp.frequency === "all" ? undefined : sp.frequency,
    minPrice:
      sp.priceRange === "25000to40000"
          ? 25000
          : sp.priceRange === "over40000"
            ? 40000
            : undefined,
    maxPrice:
      sp.priceRange === "under25000"
        ? 24999
        : sp.priceRange === "25000to40000"
          ? 40000
          : undefined,
    sortBy:
      sp.sortBy === "featured"
        ? "newest"
        : sp.sortBy,
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

  const enriched = boxesResult.items
    .map((box, idx) => {
      const plans = plansByBox.get(box.id) ?? [];
      const filteredPlans = plans;
      const minPrice =
        filteredPlans.length > 0
          ? Math.min(...filteredPlans.map((p) => p.price))
          : null;

      return {
        box,
        plans,
        subscribePlanId:
          filteredPlans
            .slice()
            .sort((a, b) => a.price - b.price)[0]?.id ?? null,
        minPrice,
        frequencyBadge:
          sp.frequency === "all"
            ? (plans[0]?.deliveryFrequency ?? null)
            : sp.frequency,
        isNew: idx < 1,
      };
    })
    .filter((item) => item.plans.length > 0)
    .filter((item) => item.minPrice != null);

  const sorted = [...enriched];
  if (sp.sortBy === "nameAsc") {
    sorted.sort((a, b) => a.box.name.localeCompare(b.box.name));
  } else if (sp.sortBy === "priceAsc") {
    sorted.sort((a, b) => (a.minPrice ?? Number.MAX_SAFE_INTEGER) - (b.minPrice ?? Number.MAX_SAFE_INTEGER));
  } else if (sp.sortBy === "priceDesc") {
    sorted.sort((a, b) => (b.minPrice ?? 0) - (a.minPrice ?? 0));
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 md:pt-10">
      <section className="text-center">
        <span className="inline-flex rounded-full bg-[#E8F3E6] px-4 py-1 text-xs font-semibold text-[#2F6B2F]">
          Fresh From Our Fields to Your Door
        </span>
        <h1 className="mx-auto mt-5 max-w-2xl text-balance text-4xl font-extrabold leading-tight text-[#1D1D1D] md:text-6xl">
          Curated boxes of <span className="italic text-[#2F6B2F]">seasonal</span> goodness.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-[#5A5A5A] md:text-lg">
          Choose from our expertly crafted subscription boxes, designed to bring the peak of every season directly to your kitchen. No commitments, skip anytime.
        </p>
      </section>

      <section className="mt-8 rounded-2xl border border-black/10 bg-white p-3 shadow-sm md:p-4">
        <form className="grid gap-2 md:grid-cols-[1.7fr_auto_auto_auto_1fr] md:items-center md:gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/40" />
            <input
              name="q"
              defaultValue={sp.q}
              placeholder="Search for a specific box..."
              className="h-11 w-full rounded-xl border border-black/10 bg-[#FCFCFC] pl-9 pr-3 text-sm outline-none ring-primary/30 transition focus:ring-2"
            />
          </div>

          <label className="inline-flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-[#FCFCFC] px-3 text-sm">
            <CalendarDays className="size-4 text-[#2F6B2F]" />
            <select name="frequency" defaultValue={sp.frequency} className="bg-transparent outline-none">
              <option value="all">Frequency</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>

          {/* <label className="inline-flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-[#FCFCFC] px-3 text-sm">
            <Wallet className="size-4 text-[#2F6B2F]" />
            <select name="priceRange" defaultValue={sp.priceRange} className="bg-transparent outline-none">
              <option value="all">Price Range</option>
              <option value="under25000">Under 25,000 MMK</option>
              <option value="25000to40000">25,000 - 40,000 MMK</option>
              <option value="over40000">Over 40,000 MMK</option>
            </select>
          </label> */}

          <label className="inline-flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-[#FCFCFC] px-3 text-sm">
            <ArrowUpDown className="size-4 text-[#2F6B2F]" />
            <select name="sortBy" defaultValue={sp.sortBy} className="bg-transparent outline-none">
              <option value="featured">Sort By</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="nameAsc">Name: A-Z</option>
            </select>
          </label>

          <div className="flex items-center justify-between md:justify-end md:gap-3">
            <button
              type="submit"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-sm font-medium hover:bg-black/2"
            >
              <SlidersHorizontal className="size-4" />
              Apply
            </button>
            <span className="text-xs font-semibold tracking-[0.12em] text-black/55">
              SHOWING {sorted.length} BOXES
            </span>
          </div>
        </form>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map(({ box, minPrice, frequencyBadge, isNew, subscribePlanId }) => (
          <article key={box.id} className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
            <div className="relative h-44 w-full bg-[#F5F5F5]">
              <Image
                src={box.imageUrl || "/images/subscriptions/organic-vegetables.svg"}
                alt={box.name}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
              <div className="absolute left-3 top-3 flex flex-col gap-1">
                {frequencyBadge ? (
                  <span className="rounded-full bg-[#2F6B2F] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                    {frequencyBadge}
                  </span>
                ) : null}
                {isNew ? (
                  <span className="rounded-full bg-[#E9B949] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
                    New
                  </span>
                ) : null}
              </div>
            </div>

            <div className="p-4">
              <h2 className="line-clamp-1 text-2xl font-semibold text-[#212121]">{box.name}</h2>
              <p className="mt-1 min-h-10 text-sm text-black/60">
                {box.description?.trim() || "Fresh seasonal produce curated from our trusted local farms."}
              </p>

              <div className="mt-3 border-t border-black/10 pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/50">Starting from</p>
                <p className="mt-1 text-3xl font-extrabold leading-none text-[#2F6B2F]">
                  {minPrice != null ? formatMoneyAmount(minPrice, locale) : "-"}
                </p>
              </div>

              <Link
                href={withLocalePath(locale, `/boxes/${box.id}`)}
                className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl border border-[#2F6B2F]/30 bg-[#f6fbf2] text-sm font-semibold text-[#2F6B2F] transition hover:bg-[#edf7e5]"
              >
                View Detail
              </Link>

              <SubscribeNowButton
                authRole={authRole}
                messages={messages.auth}
                planId={subscribePlanId ?? undefined}
              />
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

