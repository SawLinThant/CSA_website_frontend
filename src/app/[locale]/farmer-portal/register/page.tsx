import { redirect } from "next/navigation";
import { isLocale, withLocalePath } from "@/i18n/config";

export default async function FarmerPortalRegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    redirect("/en/farmer/register");
  }
  redirect(withLocalePath(locale, "/farmer/register"));
}
