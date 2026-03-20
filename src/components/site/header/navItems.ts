export type NavItemDef = {
  key: "home" | "products" | "about" | "contact";
  href: string;
};

export const navItems: NavItemDef[] = [
  { key: "home", href: "/" },
  { key: "products", href: "/products" },
  { key: "about", href: "/about-us" },
  { key: "contact", href: "/contact-us" },
];

