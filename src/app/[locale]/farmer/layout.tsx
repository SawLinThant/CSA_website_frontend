import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import FarmerDashboardHeader from "@/features/farmer/ui/FarmerDashboardHeader";
import { getCachedFarmerProfile } from "@/features/farmer/infrastructure/farmerApi";
import { handleFarmerBackendFailure } from "@/features/farmer/infrastructure/handleFarmerBackendFailure";
import { getShellAuthState } from "@/lib/server/getShellAuthState";
import { getMessages } from "@/i18n/messages";
import { isLocale, type Locale } from "@/i18n/config";

export default async function FarmerLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: loc } = await params;
  if (!isLocale(loc)) {
    notFound();
  }
  const locale = loc as Locale;
  const messages = getMessages(locale);

  const auth = await getShellAuthState();
  if (auth.status !== "authenticated") {
    redirect(`/${locale}/farmer-portal/login`);
  }
  if (auth.user.role !== "farmer") {
    redirect(`/${locale}`);
  }

  let profileData;
  try {
    profileData = await getCachedFarmerProfile();
  } catch (e) {
    handleFarmerBackendFailure(e, locale);
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <FarmerDashboardHeader
        locale={locale}
        userName={profileData.user.name}
        brandTitle={messages.farmer.dashboardBrand}
        profileData={profileData}
        farmerMessages={messages.farmer}
      />
      <div className="px-4 pb-12 pt-4 sm:pt-6">{children}</div>
    </div>
  );
}
