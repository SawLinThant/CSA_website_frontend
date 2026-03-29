import FarmersSection from "@/components/site/farmers";
import HeroSection from "@/components/site/hero";
import HowItWorksSection from "@/components/site/howItWorks";
import OfferSection from "@/components/site/offer";
import SubscriptionPlansSection from "@/components/site/subscriptionPlans";
import WhyChooseSection from "@/components/site/whyChoose";
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
      <HowItWorksSection locale={locale} />
      <SubscriptionPlansSection locale={locale} />
      <FarmersSection locale={locale} />
      <WhyChooseSection locale={locale} />
    </>
  );
}

