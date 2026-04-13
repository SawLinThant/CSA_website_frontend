import { notFound } from "next/navigation";
import { getCachedFarmerProfile } from "@/features/farmer/infrastructure/farmerApi";
import { handleFarmerBackendFailure } from "@/features/farmer/infrastructure/handleFarmerBackendFailure";
import { requireFarmerAuth } from "@/features/farmer/infrastructure/requireFarmerAuth";
import FarmerProfileForm from "@/features/farmer/ui/profile/FarmerProfileForm";
import FarmerLogoutButton from "@/features/farmer/ui/profile/FarmerLogoutButton";
import { getMessages } from "@/i18n/messages";
import { isLocale, type Locale } from "@/i18n/config";

export default async function FarmerProfilePage({
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
  const t = getMessages(locale).farmer;

  let profileData: Awaited<ReturnType<typeof getCachedFarmerProfile>>;
  try {
    profileData = await getCachedFarmerProfile();
  } catch (e) {
    handleFarmerBackendFailure(e, locale);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-12 pt-2">
      <section className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t.profileTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.profileSubtitle}</p>
          </div>
          <FarmerLogoutButton locale={locale} />
        </div>
      </section>
      <section className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-6">
        <FarmerProfileForm locale={locale} data={profileData} messages={t} />
      </section>
    </div>
  );
}
