import { notFound } from "next/navigation";
import { listMyHarvests, listMyProducts } from "@/features/farmer/infrastructure/farmerApi";
import { handleFarmerBackendFailure } from "@/features/farmer/infrastructure/handleFarmerBackendFailure";
import { requireFarmerAuth } from "@/features/farmer/infrastructure/requireFarmerAuth";
import FarmerHarvestsTable from "@/features/farmer/ui/harvests/FarmerHarvestsTable";
import FarmerPagination from "@/features/farmer/ui/FarmerPagination";
import { getMessages } from "@/i18n/messages";
import { isLocale, type Locale } from "@/i18n/config";

const PAGE_SIZE = 10;

export default async function FarmerHarvestsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale: loc } = await params;
  if (!isLocale(loc)) {
    notFound();
  }
  const locale = loc as Locale;
  await requireFarmerAuth(locale);
  const page = Math.max(1, parseInt((await searchParams).page ?? "1", 10) || 1);
  const t = getMessages(locale).farmer;

  let harvestsData: Awaited<ReturnType<typeof listMyHarvests>>;
  let productsData: Awaited<ReturnType<typeof listMyProducts>>;
  let productNames: Record<string, string> = {};
  try {
    [harvestsData, productsData] = await Promise.all([
      listMyHarvests({ page, limit: PAGE_SIZE }),
      listMyProducts({ page: 1, limit: 200 }),
    ]);
    productNames = Object.fromEntries(productsData.items.map((p) => [p.id, p.name]));
  } catch (e) {
    handleFarmerBackendFailure(e, locale);
  }
  const totalPages = Math.max(1, Math.ceil(harvestsData.total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12 pt-2">
      <section className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t.harvestsSectionTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.harvestsSubtitle}</p>
      </section>
      <section className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-6">
        <FarmerHarvestsTable
          locale={locale}
          messages={t}
          items={harvestsData.items}
          products={productsData.items.map((p) => ({ id: p.id, name: p.name }))}
          productNames={productNames}
          statusLabels={{
            approved: t.harvestStatusApproved,
            pending: t.harvestStatusPending,
            rejected: t.harvestStatusRejected,
          }}
        />
        <FarmerPagination
          locale={locale}
          pathWithoutLocale="/farmer/harvests"
          page={page}
          totalPages={totalPages}
          prevLabel={t.prev}
          nextLabel={t.next}
          summary={`${t.page} ${page} ${t.of} ${totalPages}`}
        />
      </section>
    </div>
  );
}
