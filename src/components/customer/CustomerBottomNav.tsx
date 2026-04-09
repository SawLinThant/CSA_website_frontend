"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getLocaleFromPathname, stripLocaleFromPathname, withLocalePath } from "@/i18n/config";

type Item = {
  key: string;
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
};

function isActive(barePath: string, href: string) {
  return barePath === href || barePath.startsWith(`${href}/`);
}

function IconWrap({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={[
        "inline-flex size-9 items-center justify-center rounded-xl",
        active ? "bg-primary/10 text-primary" : "text-foreground/70",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function BoxesIcon(active: boolean) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M4 7.5 12 12l8-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M12 12v9" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    </IconWrap>
  );
}

function MyBoxesIcon(active: boolean) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M7 3h10v18H7V3Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M9 7h6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M9 11h6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M9 15h4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    </IconWrap>
  );
}

function OrdersIcon(active: boolean) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M7 3h10v18l-5-3-5 3V3Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    </IconWrap>
  );
}

function ProfileIcon(active: boolean) {
  return (
    <IconWrap active={active}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20 21a8 8 0 1 0-16 0"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    </IconWrap>
  );
}

export default function CustomerBottomNav() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const barePath = stripLocaleFromPathname(pathname);

  const items: Item[] = [
    { key: "boxes", href: "/customer/subscriptions", label: "Boxes", icon: BoxesIcon },
    { key: "my_boxes", href: "/customer/my-subscriptions", label: "My Boxes", icon: MyBoxesIcon },
    { key: "orders", href: "/customer/orders", label: "Orders", icon: OrdersIcon },
    { key: "profile", href: "/customer/profile", label: "Profile", icon: ProfileIcon },
  ];

  return (
    <nav
      aria-label="Customer bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80"
    >
      <div className="mx-auto w-full max-w-3xl px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-2">
        <div className="grid grid-cols-4 gap-1">
          {items.map((item) => {
            const active = isActive(barePath, item.href);
            return (
              <Link
                key={item.key}
                href={withLocalePath(locale, item.href)}
                aria-current={active ? "page" : undefined}
                className="flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5"
              >
                {item.icon(active)}
                <span className={active ? "text-[11px] font-semibold text-primary" : "text-[11px] font-medium text-foreground/70"}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

