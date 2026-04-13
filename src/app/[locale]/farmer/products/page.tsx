import { notFound } from "next/navigation";
import { listCategoriesForForms, listMyProducts } from "@/features/farmer/infrastructure/farmerApi";
import { handleFarmerBackendFailure } from "@/features/farmer/infrastructure/handleFarmerBackendFailure";
import { requireFarmerAuth } from "@/features/farmer/infrastructure/requireFarmerAuth";
import FarmerProductsTable from "@/features/farmer/ui/products/FarmerProductsTable";
import FarmerPagination from "@/features/farmer/ui/FarmerPagination";
import { getMessages } from "@/i18n/messages";
import { isLocale, type Locale } from "@/i18n/config";

const PAGE_SIZE = 10;

export default async function FarmerProductsPage({
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

  let productsData: Awaited<ReturnType<typeof listMyProducts>>;
  let categoriesData: Awaited<ReturnType<typeof listCategoriesForForms>>;
  try {
    [productsData, categoriesData] = await Promise.all([
      listMyProducts({ page, limit: PAGE_SIZE }),
      listCategoriesForForms(),
    ]);
  } catch (e) {
    handleFarmerBackendFailure(e, locale);
  }
  const totalPages = Math.max(1, Math.ceil(productsData.total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12 pt-2">
      <section className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t.productsTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.productsSubtitle}</p>
      </section>
      <section className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-6">
        <FarmerProductsTable locale={locale} messages={t} items={productsData.items} categories={categoriesData.items} />
        <FarmerPagination
          locale={locale}
          pathWithoutLocale="/farmer/products"
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
