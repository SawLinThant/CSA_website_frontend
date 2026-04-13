import { redirect } from "next/navigation";
import { isLocale, withLocalePath } from "@/i18n/config";

export default async function FarmerPortalLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    redirect("/en/farmer/login");
  }
  redirect(withLocalePath(locale, "/farmer/login"));
}
