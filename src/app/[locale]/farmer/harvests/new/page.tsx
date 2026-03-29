import Link from "next/link";
import { notFound } from "next/navigation";
import HarvestEditorForm from "@/features/farmer/ui/harvests/HarvestEditorForm";
import { listMyProducts } from "@/features/farmer/infrastructure/farmerApi";
import { handleFarmerBackendFailure } from "@/features/farmer/infrastructure/handleFarmerBackendFailure";
import { getMessages } from "@/i18n/messages";
import { isLocale, type Locale } from "@/i18n/config";
import { withLocalePath } from "@/i18n/config";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default async function FarmerNewHarvestPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: loc } = await params;
  if (!isLocale(loc)) {
    notFound();
  }
  const locale = loc as Locale;
  const messages = getMessages(locale).farmer;
  let productsData: Awaited<ReturnType<typeof listMyProducts>>;
  try {
    productsData = await listMyProducts({ page: 1, limit: 100 });
  } catch (e) {
    handleFarmerBackendFailure(e, locale);
  }
  const products = productsData.items.map((p) => ({ id: p.id, name: p.name }));

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{messages.createHarvest}</h1>
      {products.length === 0 ? (
        <div className="mt-8 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <p>{messages.noProducts}</p>
          <Link href={withLocalePath(locale, "/farmer/products/new")} className={cn(buttonVariants(), "mt-4 inline-flex")}>
            {messages.createProduct}
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <HarvestEditorForm locale={locale} messages={messages} products={products} mode="create" />
        </div>
      )}
    </div>
  );
}
