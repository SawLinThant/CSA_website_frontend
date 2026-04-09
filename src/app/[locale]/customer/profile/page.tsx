import { redirect } from "next/navigation";
import { getShellAuthState } from "@/lib/server/getShellAuthState";
import { isLocale, type Locale, withLocalePath } from "@/i18n/config";
import { getCustomerProfile, listCustomerAddresses } from "@/features/customerProfile/infrastructure/customerProfileApi";
import CustomerProfilePageClient from "@/features/customerProfile/ui/CustomerProfilePageClient";
import { isBackendRequestError } from "@/lib/server/backendClient";

export default async function CustomerProfilePage({
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

  try {
    const [profile, addresses] = await Promise.all([getCustomerProfile(), listCustomerAddresses()]);
    return <CustomerProfilePageClient locale={locale} profile={profile} addresses={addresses} />;
  } catch (e) {
    if (isBackendRequestError(e) && e.status === 401) {
      redirect(withLocalePath(locale, "/customer/login"));
    }
    throw e;
  }
}

