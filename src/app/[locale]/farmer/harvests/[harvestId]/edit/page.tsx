import { notFound } from "next/navigation";
import HarvestEditorForm from "@/features/farmer/ui/harvests/HarvestEditorForm";
import { getMyHarvest, listMyProducts } from "@/features/farmer/infrastructure/farmerApi";
import { handleFarmerBackendFailure } from "@/features/farmer/infrastructure/handleFarmerBackendFailure";
import { getMessages } from "@/i18n/messages";
import { isLocale, type Locale } from "@/i18n/config";

export default async function FarmerEditHarvestPage({
  params,
}: {
  params: Promise<{ locale: string; harvestId: string }>;
}) {
  const { locale: loc, harvestId } = await params;
  if (!isLocale(loc)) {
    notFound();
  }
  const locale = loc as Locale;
  const messages = getMessages(locale).farmer;

  let harvest;
  try {
    harvest = await getMyHarvest(harvestId);
  } catch {
    notFound();
  }

  let productsData: Awaited<ReturnType<typeof listMyProducts>>;
  try {
    productsData = await listMyProducts({ page: 1, limit: 100 });
  } catch (e) {
    handleFarmerBackendFailure(e, locale);
  }
  const products = productsData.items.map((p) => ({ id: p.id, name: p.name }));

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{messages.editHarvest}</h1>
      <div className="mt-8">
        <HarvestEditorForm locale={locale} messages={messages} products={products} mode="edit" harvest={harvest} />
      </div>
    </div>
  );
}
