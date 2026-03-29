import { notFound } from "next/navigation";
import FarmerDashboardPage from "@/features/farmer/ui/FarmerDashboardPage";
import { isLocale, type Locale } from "@/i18n/config";

export default async function FarmerHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ productsPage?: string; harvestsPage?: string }>;
}) {
  const { locale: loc } = await params;
  if (!isLocale(loc)) {
    notFound();
  }
  const locale = loc as Locale;
  const sp = await searchParams;
  const productsPage = Math.max(1, parseInt(sp.productsPage ?? "1", 10) || 1);
  const harvestsPage = Math.max(1, parseInt(sp.harvestsPage ?? "1", 10) || 1);

  return (
    <FarmerDashboardPage
      locale={locale}
      productsPage={productsPage}
      harvestsPage={harvestsPage}
    />
  );
}
