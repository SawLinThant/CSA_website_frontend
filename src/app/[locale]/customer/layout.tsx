import type { ReactNode } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Bell } from "lucide-react";
import { isLocale, type Locale } from "@/i18n/config";
import { getShellAuthState } from "@/lib/server/getShellAuthState";
import CustomerBottomNav from "@/components/customer/CustomerBottomNav";

export default async function CustomerLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  const locale = loc as Locale;

  const auth = await getShellAuthState();
  const role = auth.status === "authenticated" ? auth.user.role : "guest";

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

