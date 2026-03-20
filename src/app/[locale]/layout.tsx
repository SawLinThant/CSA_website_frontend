import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Header from "@/components/site/header";
import Footer from "@/components/site/footer";
import { isLocale } from "@/i18n/config";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center">
      <Header />
      <main className="container flex-1 px-4">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}

