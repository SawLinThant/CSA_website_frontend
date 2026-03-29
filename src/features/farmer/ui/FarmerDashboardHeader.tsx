"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LayoutGrid, RotateCcw, Settings, Sprout, X } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { withLocalePath } from "@/i18n/config";
import FarmerProfileForm from "@/features/farmer/ui/profile/FarmerProfileForm";
import type { FarmerProfileResponse } from "@/features/farmer/domain/schemas";
import type { AppMessages } from "@/i18n/messages";

export default function FarmerDashboardHeader({
  locale,
  userName,
  brandTitle,
  profileData,
  farmerMessages,
}: {
  locale: Locale;
  userName: string;
  brandTitle: string;
  profileData: FarmerProfileResponse;
  farmerMessages: AppMessages["farmer"];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, startLogoutTransition] = useTransition();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSettingsClosing, setIsSettingsClosing] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initial = userName.trim().charAt(0).toUpperCase() || "?";
  const userImageUrl = profileData.user.imageUrl?.trim() || null;
  const farmerRoot = withLocalePath(locale, "/farmer");
  const navItems = useMemo(
    () => [
      { key: "products", label: "Products", href: `${farmerRoot}#my-products`, icon: LayoutGrid },
      { key: "harvests", label: "Harvests", href: `${farmerRoot}#recent-harvests`, icon: RotateCcw },
      { key: "settings", label: "Settings", href: farmerRoot, icon: Settings },
    ],
    [farmerRoot],
  );
  const onFarmerPage = pathname === farmerRoot;

  function openSettings() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsSettingsClosing(false);
    setIsSettingsOpen(true);
  }

  function closeSettings() {
    if (!isSettingsOpen || isSettingsClosing) return;
    setIsSettingsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setIsSettingsOpen(false);
      setIsSettingsClosing(false);
      closeTimerRef.current = null;
    }, 200);
  }

  useEffect(() => {
    if (!isSettingsOpen) return;
    const onEsc = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") closeSettings();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [isSettingsOpen, isSettingsClosing]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    },
    [],
  );

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
          <span className="truncate text-[27px] font-semibold leading-none text-primary">{brandTitle}</span>
        </div>

        <nav className="hidden items-center rounded-xl border border-border/60 bg-muted/30 p-1 md:flex">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = onFarmerPage && item.key === "products";
            return (
              <div key={item.key} className="flex items-center">
                {item.key === "settings" ? (
                  <button
                    type="button"
                    onClick={openSettings}
                    className={[
                      "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                      isSettingsOpen
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/80 hover:bg-muted hover:text-foreground",
                    ].join(" ")}
                  >
                    <Icon className="size-4" aria-hidden />
                    {item.label}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={[
                      "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/80 hover:bg-muted hover:text-foreground",
                    ].join(" ")}
                  >
                    <Icon className="size-4" aria-hidden />
                    {item.label}
                  </Link>
                )}
                {idx < navItems.length - 1 ? <span className="mx-1 h-5 w-px bg-border/80" /> : null}
              </div>
            );
          })}
        </nav>

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
      {isSettingsOpen ? (
        <div
          className={[
            "fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-8",
            isSettingsClosing ? "animate-out fade-out duration-200" : "animate-in fade-in duration-200",
          ].join(" ")}
          onClick={closeSettings}
        >
          <div
            className={[
              "w-full max-w-3xl rounded-2xl border border-border bg-background shadow-2xl",
              isSettingsClosing
                ? "animate-out fade-out zoom-out-95 duration-200"
                : "animate-in fade-in zoom-in-95 duration-200",
            ].join(" ")}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{farmerMessages.profileTitle}</h2>
                <p className="text-sm text-muted-foreground">{farmerMessages.profileSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={closeSettings}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close profile settings"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto p-5">
              <FarmerProfileForm locale={locale} data={profileData} messages={farmerMessages} />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
