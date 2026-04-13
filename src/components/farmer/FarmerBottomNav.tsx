"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Package, Sprout, User } from "lucide-react";
import { getLocaleFromPathname, stripLocaleFromPathname, withLocalePath } from "@/i18n/config";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function FarmerBottomNav() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const barePath = stripLocaleFromPathname(pathname);

  const items = [
    { key: "dashboard", label: "Dashboard", href: "/farmer", icon: LayoutGrid },
    { key: "products", label: "Products", href: "/farmer/products", icon: Package },
    { key: "harvests", label: "Harvests", href: "/farmer/harvests", icon: Sprout },
    { key: "profile", label: "Profile", href: "/farmer/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/10 bg-background/95 md:hidden">
      <div className="mx-auto grid max-w-4xl grid-cols-4 px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-2">
        {items.map((item) => {
          const active = isActive(barePath, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={withLocalePath(locale, item.href)}
              className="flex flex-col items-center gap-1 rounded-xl py-1.5"
              aria-current={active ? "page" : undefined}
            >
              <span className={active ? "text-primary" : "text-foreground/70"}>
                <Icon className="size-5" />
              </span>
              <span className={active ? "text-[11px] font-semibold text-primary" : "text-[11px] text-foreground/70"}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
