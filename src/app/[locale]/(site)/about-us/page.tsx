import type { Metadata } from "next";
import {
  AboutFaqSection,
  AboutHeroSection,
  AboutNewsletterSection,
  AboutProcessSection,
  ImpactStatsSection,
  MissionValuesSection,
} from "@/components/site/about";
import type { Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const m = getMessages(locale).aboutUs.meta;
  return {
    title: m.title,
    description: m.description,
  };
}

export default async function AboutUsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <div className="w-full max-w-none py-6 md:py-8">
      <AboutHeroSection locale={locale} />
      <MissionValuesSection locale={locale} />
      <ImpactStatsSection locale={locale} />
      <AboutProcessSection locale={locale} />
      <AboutFaqSection locale={locale} />
      <AboutNewsletterSection locale={locale} />
    </div>
  );
}
