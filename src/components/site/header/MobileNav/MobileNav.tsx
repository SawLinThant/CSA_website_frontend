"use client";

import { useMemo, useState } from "react";
import type { NavItemDef } from "@/components/site/header/navItems";
import { navItems } from "@/components/site/header/navItems";
import { isNavItemActive } from "@/components/site/header/navUtils";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getLocaleFromPathname, stripLocaleFromPathname, withLocalePath } from "@/i18n/config";
import type { AppMessages } from "@/i18n/messages";

export default function MobileNav({
  messages,
  isLoggedIn,
  isFarmer,
  isCustomer,
  onOpenAuth,
  onLogout,
}: {
  messages: AppMessages;
  isLoggedIn: boolean;
  isFarmer: boolean;
  isCustomer: boolean;
  onOpenAuth: (mode: "login" | "register") => void;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const barePath = stripLocaleFromPathname(pathname);
  const [open, setOpen] = useState(false);

  const items: NavItemDef[] = useMemo(() => navItems, []);

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation menu"
        className={[
          "relative z-50 inline-flex items-center justify-center rounded-md p-2 text-black/80 hover:bg-black/5 md:hidden",
          open ? "invisible pointer-events-none" : "",
        ].join(" ")}
        onClick={() => setOpen(true)}
      >
        <span className="sr-only">Menu</span>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6.5H18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M4 11H18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M4 15.5H18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div className="absolute right-0 top-0 h-full w-72 bg-background p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold">Menu</div>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-black/80 hover:bg-black/5"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {isFarmer ? (
                <Link
                  href={withLocalePath(locale, "/farmer")}
                  onClick={() => setOpen(false)}
                  className="w-full rounded-[10px] border border-primary/30 py-2.5 text-center text-sm font-medium text-primary"
                >
                  {messages.farmer.navDashboard}
                </Link>
              ) : (
                <></>
                // <Link
                //   href={withLocalePath(locale, "/farmer-portal/login")}
                //   onClick={() => setOpen(false)}
                //   className="w-full rounded-[10px] border border-primary/30 py-2.5 text-center text-sm font-medium text-primary"
                // >
                //   {messages.farmer.navDashboard}
                // </Link>
              )}
              {isLoggedIn ? (
                <>
                  {isCustomer ? (
                    <Link
                      href={withLocalePath(locale, "/orders")}
                      onClick={() => setOpen(false)}
                      className="w-full rounded-[10px] border border-primary/30 py-2.5 text-center text-sm font-medium text-primary"
                    >
                      Orders
                    </Link>
                  ) : null}
                  <Link
                    href={withLocalePath(locale, "/profile")}
                    onClick={() => setOpen(false)}
                    className="w-full rounded-[10px] border border-primary/30 py-2.5 text-center text-sm font-medium text-primary"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setOpen(false);
                    }}
                    className="w-full rounded-[10px] border border-primary/40 py-2.5 text-sm font-semibold text-primary"
                  >
                    {messages.auth.logout}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAuth("login");
                      setOpen(false);
                    }}
                    className="w-full rounded-[10px] border border-primary/30 py-2.5 text-sm font-medium text-primary"
                  >
                    {messages.auth.login}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAuth("register");
                      setOpen(false);
                    }}
                    className="w-full rounded-[10px] bg-primary py-2.5 text-sm font-semibold text-white"
                  >
                    {messages.auth.register}
                  </button>
                </>
              )}
            </div>

            <nav className="mt-6 space-y-2">
              {items.map((item) => {
                const active = isNavItemActive(barePath, item.href);
                const href = withLocalePath(locale, item.href);
                return (
                  <Link
                    key={item.href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className="relative flex items-center justify-between rounded-md px-2 py-2"
                  >
                    <span className={`text-sm font-medium ${active ? "text-primary" : "text-black/70"}`}>
                      {messages.nav[item.key]}
                    </span>
                    {active ? (
                      <span className="relative h-5 w-24">
                        <Image
                          src="/images/highlight_text.png"
                          alt=""
                          fill
                          sizes="96px"
                          style={{ objectFit: "contain" }}
                        />
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}

