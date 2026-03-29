import { Leaf, Package, Search, Sprout } from "lucide-react";
import { listCategoriesForForms, listMyHarvests, listMyProducts } from "@/features/farmer/infrastructure/farmerApi";
import { handleFarmerBackendFailure } from "@/features/farmer/infrastructure/handleFarmerBackendFailure";
import FarmerProductsTable from "@/features/farmer/ui/products/FarmerProductsTable";
import FarmerHarvestsTable from "@/features/farmer/ui/harvests/FarmerHarvestsTable";
import FarmerPagination from "@/features/farmer/ui/FarmerPagination";
import FarmerDashboardSection from "@/features/farmer/ui/FarmerDashboardSection";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";

const PAGE_SIZE = 10;

export default async function FarmerDashboardPage({
  locale,
  productsPage,
  harvestsPage,
}: {
  locale: Locale;
  productsPage: number;
  harvestsPage: number;
}) {
  const messages = getMessages(locale);
  const t = messages.farmer;

  let productsData: Awaited<ReturnType<typeof listMyProducts>>;
  let harvestsData: Awaited<ReturnType<typeof listMyHarvests>>;
  let categoriesData: Awaited<ReturnType<typeof listCategoriesForForms>>;
  let productNames: Record<string, string> = {};
  try {
    [productsData, harvestsData, categoriesData] = await Promise.all([
      listMyProducts({ page: productsPage, limit: PAGE_SIZE }),
      listMyHarvests({ page: harvestsPage, limit: PAGE_SIZE }),
      listCategoriesForForms(),
    ]);
    const forNames = await listMyProducts({ page: 1, limit: 200 });
    productNames = Object.fromEntries(forNames.items.map((p) => [p.id, p.name]));
  } catch (e) {
    handleFarmerBackendFailure(e, locale);
  }

  const productsTotalPages = Math.max(1, Math.ceil(productsData.total / PAGE_SIZE));
  const harvestsTotalPages = Math.max(1, Math.ceil(harvestsData.total / PAGE_SIZE));

  const productsHrefFor = (p: number) => {
    const q = new URLSearchParams();
    if (p > 1) q.set("productsPage", String(p));
    if (harvestsPage > 1) q.set("harvestsPage", String(harvestsPage));
    const s = q.toString();
    return `/${locale}/farmer${s ? `?${s}` : ""}`;
  };

  const harvestsHrefFor = (p: number) => {
    const q = new URLSearchParams();
    if (productsPage > 1) q.set("productsPage", String(productsPage));
    if (p > 1) q.set("harvestsPage", String(p));
    const s = q.toString();
    return `/${locale}/farmer${s ? `?${s}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-16 pt-6 sm:space-y-12 sm:pt-8">
      <section className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-[#f2f5ef] px-6 py-6 shadow-sm sm:px-8 sm:py-9">
        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium leading-none text-emerald-800">
          Dashboard Overview
        </span>
        <div className="mt-3 max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-[44px] sm:leading-[1.05]">
            Manage your <span className="italic text-emerald-700">fresh</span> catalogue.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-foreground/75 sm:text-base">
            Review current inventory, update market pricing, and log your latest yields for the Salinas Valley
            community.
          </p>
          {/* <div className="mt-5 flex max-w-md items-center gap-2 rounded-xl border border-border/60 bg-white px-3 py-2.5 shadow-sm">
            <Search className="size-4 text-muted-foreground" aria-hidden />
            <input
              type="search"
              placeholder="Search products or harvests..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div> */}
        </div>
        <Leaf className="pointer-events-none absolute right-10 top-8 hidden size-24 text-foreground/15 sm:block" />
      </section>

      <FarmerDashboardSection
        id="my-products"
        icon={Package}
        title={t.productsTitle}
        subtitle={t.productsSubtitle}
      >
        <FarmerProductsTable locale={locale} messages={t} items={productsData.items} categories={categoriesData.items} />
        <FarmerPagination
          locale={locale}
          pathWithoutLocale="/farmer"
          page={productsPage}
          totalPages={productsTotalPages}
          prevLabel={t.prev}
          nextLabel={t.next}
          summary={`${t.page} ${productsPage} ${t.of} ${productsTotalPages}`}
          hrefForPage={productsHrefFor}
        />
      </FarmerDashboardSection>

      <FarmerDashboardSection
        id="recent-harvests"
        icon={Sprout}
        title={t.harvestsSectionTitle}
        subtitle={t.harvestsSubtitle}
      >
        <FarmerHarvestsTable
          locale={locale}
          messages={t}
          items={harvestsData.items}
          products={Object.entries(productNames).map(([id, name]) => ({ id, name }))}
          productNames={productNames}
          statusLabels={{
            approved: t.harvestStatusApproved,
            pending: t.harvestStatusPending,
            rejected: t.harvestStatusRejected,
          }}
        />
        <FarmerPagination
          locale={locale}
          pathWithoutLocale="/farmer"
          page={harvestsPage}
          totalPages={harvestsTotalPages}
          prevLabel={t.prev}
          nextLabel={t.next}
          summary={`${t.page} ${harvestsPage} ${t.of} ${harvestsTotalPages}`}
          hrefForPage={harvestsHrefFor}
        />
      </FarmerDashboardSection>
    </div>
  );
}
