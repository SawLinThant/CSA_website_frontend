import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import CustomerMobileShell from "@/components/customer/CustomerMobileShell";

export default async function CustomerLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();

  return (
    <CustomerMobileShell>{children}</CustomerMobileShell>
  );
}

