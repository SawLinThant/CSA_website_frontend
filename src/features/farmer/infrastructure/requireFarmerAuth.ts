import { redirect } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { withLocalePath } from "@/i18n/config";
import { getShellAuthState } from "@/lib/server/getShellAuthState";

export async function requireFarmerAuth(locale: Locale) {
  const auth = await getShellAuthState();
  if (auth.status !== "authenticated") {
    redirect(withLocalePath(locale, "/farmer/login"));
  }
  if (auth.user.role !== "farmer") {
    redirect(withLocalePath(locale, "/"));
  }
}
