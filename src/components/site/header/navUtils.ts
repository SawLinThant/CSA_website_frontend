export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";

  if (href === "/products") {
    return pathname === "/products" || pathname.startsWith("/products/");
  }

  return pathname === href;
}

