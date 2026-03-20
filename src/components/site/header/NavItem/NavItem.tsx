"use client";

import Image from "next/image";
import Link from "next/link";
import type { NavItemDef } from "@/components/site/header/navItems";
import { isNavItemActive } from "@/components/site/header/navUtils";
import type { AppMessages } from "@/i18n/messages";

export default function NavItem({
  item,
  pathname,
  href,
  messages,
}: {
  item: NavItemDef;
  pathname: string;
  href: string;
  messages: AppMessages;
}) {
  const active = isNavItemActive(pathname, item.href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="relative inline-flex flex-col items-center justify-center px-3 py-3"
    >
      {active ? (
        <span className="pointer-events-none absolute bottom-0 left-1/2 h-4 w-20 -translate-x-1/2">
          <Image
            src="/images/freshroot.png"
            alt=""
            fill
            sizes="80px"
            style={{ objectFit: "contain" }}
            priority={false}
          />
        </span>
      ) : null}

      <span className={`relative text-sm font-medium ${active ? "text-primary" : "text-black/70"}`}>
        {messages.nav[item.key]}
      </span>
    </Link>
  );
}

