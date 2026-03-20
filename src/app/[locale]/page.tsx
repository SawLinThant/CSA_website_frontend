import HeroSection from "@/components/site/hero";
import OfferSection from "@/components/site/offer";
import type { Locale } from "@/i18n/config";

export default async function LocalizedHomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <>
      <HeroSection />
      <OfferSection locale={locale} />
    </>
  );
}

