import type { Locale } from "@/i18n/config";

export function formatMoneyAmount(amount: number, locale: Locale): string {
  const loc = locale === "my" ? "my-MM" : "en-US";
  return new Intl.NumberFormat(loc, {
    style: "currency",
    currency: "MMK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
