import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { withLocalePath } from "@/i18n/config";

export default async function FarmerProfileRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: loc } = await params;
  if (!isLocale(loc)) {
    redirect("/en/farmer");
  }
  const locale = loc as Locale;
  redirect(withLocalePath(locale, "/farmer"));
}
