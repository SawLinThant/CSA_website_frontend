import type { Product } from "../domain/schemas";
import Link from "next/link";

export function ProductList({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {products.map((p) => (
        <div key={p.id} className="rounded-lg border border-black/10 p-4">
          <Link href={`/products/${p.id}`} className="block">
            <div className="font-semibold">{p.name}</div>
            <div className="text-sm opacity-70">{p.unit}</div>
            <div className="mt-2 font-medium">
              {new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "USD",
              }).format(p.basePrice)}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}

