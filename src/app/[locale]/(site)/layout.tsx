import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Header from "@/components/site/header";
import Footer from "@/components/site/footer";
import { getShellAuthState } from "@/lib/server/getShellAuthState";
import { isLocale, type Locale } from "@/i18n/config";

export default async function SiteShellLayout({
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
  const auth = await getShellAuthState();

  return (
    <div className="flex min-h-full flex-col items-center justify-center">
      <Header auth={auth} />
      <main className="container flex-1 px-4">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
