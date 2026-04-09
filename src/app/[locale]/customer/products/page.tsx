import { notFound } from "next/navigation";
import { publicListProductsQuerySchema } from "@/features/products/domain/schemas";
import { publicListProductsUseCase } from "@/features/products/application/useCases/publicListProducts";
import { CustomerProductList } from "@/components/customer/CustomerProductList";
import { isLocale, type Locale } from "@/i18n/config";

export const dynamic = "force-dynamic";

export default async function CustomerProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  const locale = loc as Locale;

  const sp = await searchParams;
  const normalized = {
    page: Array.isArray(sp.page) ? sp.page[0] : sp.page,
    limit: Array.isArray(sp.limit) ? sp.limit[0] : sp.limit,
    name: Array.isArray(sp.name) ? sp.name[0] : sp.name,
    categoryId: Array.isArray(sp.categoryId) ? sp.categoryId[0] : sp.categoryId,
    isActive: Array.isArray(sp.isActive) ? sp.isActive[0] : sp.isActive,
  };

  const query = publicListProductsQuerySchema.parse(normalized);
  const result = await publicListProductsUseCase(query);

  return (
    <main>
      <h1 className="text-2xl font-semibold">Products</h1>
      <p className="mt-1 text-sm opacity-70">Browse available products.</p>
      <div className="mt-4">
        <CustomerProductList locale={locale} products={result.items} />
      </div>
    </main>
  );
}

