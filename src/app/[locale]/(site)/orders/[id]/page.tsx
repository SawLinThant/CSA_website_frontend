import { redirect } from "next/navigation";
import { getShellAuthState } from "@/lib/server/getShellAuthState";
import { isLocale, type Locale, withLocalePath } from "@/i18n/config";
import CustomerOrderDetailClient from "@/features/orders/ui/CustomerOrderDetailClient";

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: loc, id } = await params;
  if (!isLocale(loc)) redirect("/en");
  const locale = loc as Locale;

  const auth = await getShellAuthState();
  if (auth.status !== "authenticated") {
    redirect(withLocalePath(locale, "/login"));
  }
  if (auth.user.role !== "customer") {
    redirect(withLocalePath(locale, "/"));
  }

  return <CustomerOrderDetailClient locale={locale} orderId={id} />;
}
