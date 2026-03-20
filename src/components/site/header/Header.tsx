"use client";

import Image from "next/image";
import Link from "next/link";
import { navItems } from "@/components/site/header/navItems";
import { usePathname } from "next/navigation";
import NavItem from "@/components/site/header/NavItem";
import MobileNav from "@/components/site/header/MobileNav";
import { getLocaleFromPathname, stripLocaleFromPathname, withLocalePath } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

export default function Header() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const barePath = stripLocaleFromPathname(pathname);
  const messages = getMessages(locale);

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

        <MobileNav messages={messages} />
      </div>
    </header>
  );
}

