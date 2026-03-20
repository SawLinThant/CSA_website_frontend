import { publicListProductsQuerySchema } from "@/features/products/domain/schemas";
import { publicListProductsUseCase } from "@/features/products/application/useCases/publicListProducts";
import { ProductList } from "@/features/products/ui/ProductList";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const normalized = {
    page: Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page,
    limit: Array.isArray(searchParams.limit) ? searchParams.limit[0] : searchParams.limit,
    name: Array.isArray(searchParams.name) ? searchParams.name[0] : searchParams.name,
    categoryId: Array.isArray(searchParams.categoryId)
      ? searchParams.categoryId[0]
      : searchParams.categoryId,
    isActive: Array.isArray(searchParams.isActive) ? searchParams.isActive[0] : searchParams.isActive,
  };

  const query = publicListProductsQuerySchema.parse(normalized);
  const result = await publicListProductsUseCase(query);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold">Products</h1>
      <div className="mt-4">
        <ProductList products={result.items} />
      </div>
    </main>
  );
}

