import Link from "next/link";
import { z } from "zod";
import { notFound } from "next/navigation";
import { publicGetProductUseCase } from "@/features/products/application/useCases/publicGetProduct";
import { formatMoneyAmount } from "@/lib/format/money";
import { isLocale, type Locale, withLocalePath } from "@/i18n/config";

export const dynamic = "force-dynamic";

export default async function CustomerProductDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; productId: string }>;
}) {
  const { locale: loc, productId: rawId } = await params;
  if (!isLocale(loc)) notFound();
  const locale = loc as Locale;
  const productId = z.string().min(1).parse(rawId);

  let product: Awaited<ReturnType<typeof publicGetProductUseCase>>;
  try {
    product = await publicGetProductUseCase(productId);
  } catch {
    return (
      <main className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <div className="mt-4">
          <Link
            href={withLocalePath(locale, "/customer/products")}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Back to products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <Link
        href={withLocalePath(locale, "/customer/products")}
        className="text-sm font-semibold text-primary hover:underline"
      >
        Back to products
      </Link>

      <h1 className="mt-4 text-2xl font-semibold">{product.name}</h1>
      <p className="mt-2 text-sm opacity-70">Unit: {product.unit}</p>

      <p className="mt-3 text-xl font-semibold text-[#2F6B2F]">
        {formatMoneyAmount(product.basePrice, locale)}
      </p>

      <p className="mt-4 text-sm opacity-70">{product.description ?? "No description"}</p>

      {product.images?.length ? (
        <div className="mt-6 space-y-2">
          {product.images.map((img) => (
            <div key={img.imageUrl} className="rounded-xl border border-black/10 p-3">
              <div className="text-sm opacity-70">Primary: {img.isPrimary ? "Yes" : "No"}</div>
              <div className="break-all text-sm">{img.imageUrl}</div>
            </div>
          ))}
        </div>
      ) : null}
    </main>
  );
}

