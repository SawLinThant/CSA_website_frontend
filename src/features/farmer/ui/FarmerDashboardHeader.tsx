"use client";

import Image from "next/image";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, Sprout } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { withLocalePath } from "@/i18n/config";
import type { FarmerProfileResponse } from "@/features/farmer/domain/schemas";

export default function FarmerDashboardHeader({
  locale,
  userName,
  brandTitle,
  profileData,
}: {
  locale: Locale;
  userName: string;
  brandTitle: string;
  profileData: FarmerProfileResponse;
}) {
  const router = useRouter();
  const [loggingOut, startLogoutTransition] = useTransition();
  const initial = userName.trim().charAt(0).toUpperCase() || "?";
  const userImageUrl = profileData.user.imageUrl?.trim() || null;

  function handleLogout() {
    startLogoutTransition(async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
        // Ignore network errors here; still route user out.
      }
      router.push(withLocalePath(locale, "/"));
      router.refresh();
    });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Sprout className="size-4.5" aria-hidden />
          </span>
          <span className="truncate text-xl font-semibold leading-none text-primary sm:text-[27px]">{brandTitle}</span>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="hidden rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
          <button
            type="button"
            className="rounded-full p-2 text-foreground/70 hover:bg-muted hover:text-foreground"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="size-[18px]" />
          </button>

          <div className="flex items-center gap-2 border-l border-border/80 pl-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight text-foreground">{userName}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Premium Seller</p>
            </div>

            <div className="relative">
              <span className="relative flex size-8 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold text-foreground" title={userName}>
                {userImageUrl ? (
                  <Image src={userImageUrl} alt={userName} fill sizes="32px" className="object-cover" unoptimized />
                ) : (
                  initial
                )}
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-emerald-500" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
