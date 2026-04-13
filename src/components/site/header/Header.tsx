"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { navItems } from "@/components/site/header/navItems";
import NavItem from "@/components/site/header/NavItem";
import MobileNav from "@/components/site/header/MobileNav";
import { AuthModal } from "@/components/site/auth";
import { getLocaleFromPathname, stripLocaleFromPathname, withLocalePath } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import type { ShellAuthState } from "@/lib/server/getShellAuthState";

export default function Header({ auth }: { auth: ShellAuthState }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const barePath = stripLocaleFromPathname(pathname);
  const messages = getMessages(locale);
  const [authOpen, setAuthOpen] = useState(false);
  const [authInitial, setAuthInitial] = useState<"login" | "register">("login");

  const isLoggedIn = auth.status === "authenticated";
  const isFarmer = isLoggedIn && auth.user.role === "farmer";
  const isCustomer = isLoggedIn && auth.user.role === "customer";

  const openAuth = (mode: "login" | "register") => {
    setAuthInitial(mode);
    setAuthOpen(true);
  };

  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) {
        toast.error(messages.auth.errorGeneric);
        return;
      }
      toast.success(messages.auth.toastLogoutSuccess);
      router.push(withLocalePath(locale, "/"));
      router.refresh();
    } catch {
      toast.error(messages.auth.errorGeneric);
    }
  }

  return (
    <header className="bg-background container">
      <div className=" flex flex-row justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href={withLocalePath(locale, "/")} aria-label="FreshRoot home" className="relative h-20 w-20">
            <Image
              height={100}
              width={100}
              src="/images/logo.png"
              alt="FreshRoot"
              style={{ objectFit: "contain" }}
              priority
            />
          </Link>
        </div>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              pathname={barePath}
              href={withLocalePath(locale, item.href)}
              messages={messages}
            />
          ))}
          <div className="ml-4 hidden items-center gap-2 md:flex">
            {isLoggedIn ? (
              <>
              {isCustomer ? (
                <Link
                  href={withLocalePath(locale, "/orders")}
                  className="rounded-[10px] px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
                >
                  Orders
                </Link>
              ) : null}
              <Link
                href={withLocalePath(locale, "/profile")}
                className="rounded-[10px] px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="rounded-[10px] border border-primary/40 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
              >
                {messages.auth.logout}
              </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className="rounded-[10px] px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
                >
                  {messages.auth.login}
                </button>
                <button
                  type="button"
                  onClick={() => openAuth("register")}
                  className="rounded-[10px] bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary/95"
                >
                  {messages.auth.register}
                </button>
              </>
            )}
          </div>
          <div className="ml-2 flex items-center gap-2 text-xs">
            <Link
              href={withLocalePath("en", barePath)}
              className={locale === "en" ? "text-primary" : "text-black/60"}
            >
              {messages.language.en}
            </Link>
            <span className="text-black/30">|</span>
            <Link
              href={withLocalePath("my", barePath)}
              className={locale === "my" ? "text-primary" : "text-black/60"}
            >
              {messages.language.my}
            </Link>
          </div>
        </nav>

        <MobileNav
          messages={messages}
          isLoggedIn={isLoggedIn}
          isFarmer={isFarmer}
          isCustomer={isCustomer}
          onOpenAuth={openAuth}
          onLogout={() => void handleLogout()}
        />
      </div>
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authInitial}
        messages={messages.auth}
      />
    </header>
  );
}
