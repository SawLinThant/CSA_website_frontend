import { z } from "zod";
import { publicGetProductUseCase } from "@/features/products/application/useCases/publicGetProduct";

export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({
  params,
}: {
  params: { productId: string };
}) {
  const productId = z.string().min(1).parse(params.productId);

  let product: Awaited<ReturnType<typeof publicGetProductUseCase>>;
  try {
    product = await publicGetProductUseCase(productId);
  } catch {
    // Keep it simple for now; a 404 page can be added later.
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-semibold">Product not found</h1>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">{product.name}</h1>
      <p className="mt-2 text-sm opacity-70">
        Category: {product.categoryId} | Unit: {product.unit}
      </p>
      <p className="mt-3 text-base font-medium">
        {new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(product.basePrice)}
      </p>
      <p className="mt-4 text-sm opacity-70">
        {product.description ?? "No description"}
      </p>

      {product.images?.length ? (
        <div className="mt-6 space-y-2">
          {product.images.map((img) => (
            <div key={img.imageUrl} className="rounded-md border border-black/10 p-3">
              <div className="text-sm opacity-70">Primary: {img.isPrimary ? "Yes" : "No"}</div>
              <div className="text-sm break-all">{img.imageUrl}</div>
            </div>
          ))}
        </div>
      ) : null}
    </main>
  );
}

