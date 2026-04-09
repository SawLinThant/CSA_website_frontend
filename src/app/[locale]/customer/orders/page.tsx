import { redirect } from "next/navigation";
import { getShellAuthState } from "@/lib/server/getShellAuthState";
import { isLocale, type Locale, withLocalePath } from "@/i18n/config";
import CustomerOrdersPageClient from "@/features/orders/ui/CustomerOrdersPageClient";

export default async function CustomerOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: loc } = await params;
  if (!isLocale(loc)) redirect("/en/customer/subscriptions");
  const locale = loc as Locale;

  const auth = await getShellAuthState();
  if (auth.status !== "authenticated") {
    redirect(withLocalePath(locale, "/customer/login"));
  }
  if (auth.user.role !== "customer") {
    redirect(withLocalePath(locale, "/customer/subscriptions"));
  }

  return <CustomerOrdersPageClient locale={locale} />;
}

