import { notFound } from "next/navigation";
import FarmerDashboardPage from "@/features/farmer/ui/FarmerDashboardPage";
import { isLocale, type Locale } from "@/i18n/config";
import { requireFarmerAuth } from "@/features/farmer/infrastructure/requireFarmerAuth";

export default async function FarmerHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: loc } = await params;
  if (!isLocale(loc)) {
    notFound();
  }
  const locale = loc as Locale;
  await requireFarmerAuth(locale);

  return <FarmerDashboardPage locale={locale} />;
}
