export type NavItemDef = {
  key: "home" | "boxes" | "about" | "contact";
  href: string;
};

export const navItems: NavItemDef[] = [
  { key: "home", href: "/" },
  { key: "boxes", href: "/subscriptions" },
  { key: "about", href: "/about-us" },
  { key: "contact", href: "/contact-us" },
];

