import { notFound } from "next/navigation";
import ProductEditorForm from "@/features/farmer/ui/products/ProductEditorForm";
import { getMyProduct, listCategoriesForForms } from "@/features/farmer/infrastructure/farmerApi";
import { handleFarmerBackendFailure } from "@/features/farmer/infrastructure/handleFarmerBackendFailure";
import { requireFarmerAuth } from "@/features/farmer/infrastructure/requireFarmerAuth";
import { getMessages } from "@/i18n/messages";
import { isLocale, type Locale } from "@/i18n/config";

export default async function FarmerEditProductPage({
  params,
}: {
  params: Promise<{ locale: string; productId: string }>;
}) {
  const { locale: loc, productId } = await params;
  if (!isLocale(loc)) {
    notFound();
  }
  const locale = loc as Locale;
  await requireFarmerAuth(locale);
  const messages = getMessages(locale).farmer;

  let product;
  try {
    product = await getMyProduct(productId);
  } catch {
    notFound();
  }

  let categories: Awaited<ReturnType<typeof listCategoriesForForms>>;
  try {
    categories = await listCategoriesForForms();
  } catch (e) {
    handleFarmerBackendFailure(e, locale);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{messages.editProduct}</h1>
      <div className="mt-8">
        <ProductEditorForm
          locale={locale}
          messages={messages}
          categories={categories.items}
          mode="edit"
          product={product}
        />
      </div>
    </div>
  );
}
