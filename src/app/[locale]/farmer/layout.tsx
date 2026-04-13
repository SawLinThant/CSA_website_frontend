import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import FarmerDashboardHeader from "@/features/farmer/ui/FarmerDashboardHeader";
import { getCachedFarmerProfile } from "@/features/farmer/infrastructure/farmerApi";
import { getShellAuthState } from "@/lib/server/getShellAuthState";
import { getMessages } from "@/i18n/messages";
import { isLocale, type Locale } from "@/i18n/config";
import FarmerMobileShell from "@/components/farmer/FarmerMobileShell";

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
  let profileData: Awaited<ReturnType<typeof getCachedFarmerProfile>> | null = null;
  if (auth.status === "authenticated" && auth.user.role === "farmer") {
    try {
      profileData = await getCachedFarmerProfile();
    } catch {
      profileData = null;
    }
  }

  const header = profileData ? (
    <FarmerDashboardHeader
      locale={locale}
      userName={profileData.user.name}
      brandTitle={messages.farmer.dashboardBrand}
      profileData={profileData}
    />
  ) : null;

  return (
    <FarmerMobileShell header={header}>{children}</FarmerMobileShell>
  );
}
