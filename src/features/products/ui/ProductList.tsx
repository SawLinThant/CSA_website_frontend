import type { Product } from "../domain/schemas";
import Link from "next/link";
import { formatMoneyAmount } from "@/lib/format/money";

export function ProductList({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {products.map((p) => (
        <div key={p.id} className="rounded-lg border border-black/10 p-4">
          <Link href={`/products/${p.id}`} className="block">
            <div className="font-semibold">{p.name}</div>
            <div className="text-sm opacity-70">{p.unit}</div>
            <div className="mt-2 font-medium">
              {formatMoneyAmount(p.basePrice, "en")}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}

