"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { stripLocaleFromPathname } from "@/i18n/config";
import FarmerBottomNav from "@/components/farmer/FarmerBottomNav";

const AUTH_ROUTES = new Set(["/farmer/login", "/farmer/register"]);

export default function FarmerMobileShell({ header, children }: { header: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const barePath = stripLocaleFromPathname(pathname);
  const isAuthPage = AUTH_ROUTES.has(barePath);

  if (isAuthPage) {
    return <div className="min-h-screen bg-muted/20 px-4 py-5">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {header}
      <div className="px-4 pb-24 pt-4 sm:pt-6">{children}</div>
      <FarmerBottomNav />
    </div>
  );
}
