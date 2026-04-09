"use client";

import Link from "next/link";
import { formatMoneyAmount } from "@/lib/format/money";
import type { Locale } from "@/i18n/config";

type Product = {
  id: string;
  name: string;
  unit: string;
  basePrice: number;
};

export function CustomerProductList({
  locale,
  products,
}: {
  locale: Locale;
  products: Product[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {products.map((p) => (
        <div key={p.id} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <Link href={`/${locale}/customer/products/${p.id}`} className="block">
            <div className="text-base font-semibold">{p.name}</div>
            <div className="mt-0.5 text-sm opacity-70">{p.unit}</div>
            <div className="mt-2 font-semibold text-[#2F6B2F]">
              {formatMoneyAmount(p.basePrice, locale)}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}

