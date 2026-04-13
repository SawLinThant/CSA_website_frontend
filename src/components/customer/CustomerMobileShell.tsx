"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import CustomerBottomNav from "@/components/customer/CustomerBottomNav";

const AUTH_ROUTES = new Set(["/customer/login", "/customer/register"]);

function stripLocale(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 2) return pathname;
  return `/${parts.slice(1).join("/")}`;
}

export default function CustomerMobileShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const barePath = stripLocale(pathname);
  const isAuthPage = AUTH_ROUTES.has(barePath);

  if (isAuthPage) {
    return <div className="min-h-screen bg-muted/20 px-4 py-5">{children}</div>;
  }

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-5">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/45">
              Customer Portal
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="relative h-7 w-7 overflow-hidden rounded-lg bg-[#E8F3E6]">
                <Image src="/images/logo.png" alt="FreshRoot" fill sizes="28px" style={{ objectFit: "contain" }} />
              </div>
              <div className="text-lg font-bold text-[#2F6B2F]">FreshRoot</div>
            </div>
          </div>

          <button
            type="button"
            className="relative inline-flex size-10 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-sm"
            aria-label="Notifications"
          >
            <Bell className="size-5 text-foreground/70" />
            <span className="absolute right-3 top-3 size-2 rounded-full bg-red-500" aria-hidden="true" />
          </button>
        </header>

        {children}
      </div>

      <CustomerBottomNav />
    </div>
  );
}
