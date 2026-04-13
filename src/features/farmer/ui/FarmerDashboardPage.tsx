import Link from "next/link";
import { BarChart3, Leaf, LineChart, Package } from "lucide-react";
import { listMyProducts } from "@/features/farmer/infrastructure/farmerApi";
import { handleFarmerBackendFailure } from "@/features/farmer/infrastructure/handleFarmerBackendFailure";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";
import { withLocalePath } from "@/i18n/config";

export default async function FarmerDashboardPage({
  locale,
}: {
  locale: Locale;
}) {
  const messages = getMessages(locale);
  const t = messages.farmer;

  let productsData: Awaited<ReturnType<typeof listMyProducts>>;
  try {
    productsData = await listMyProducts({ page: 1, limit: 5 });
  } catch (e) {
    handleFarmerBackendFailure(e, locale);
  }

  const monthlySales = [12, 18, 14, 22, 27, 25, 31];
  const harvestVolume = [8, 11, 9, 14, 12, 16, 15];
  const maxSales = Math.max(...monthlySales);
  const maxVolume = Math.max(...harvestVolume);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16 pt-2 sm:space-y-8 sm:pt-6">
      <section className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-[#f2f5ef] px-4 py-5 shadow-sm sm:px-8 sm:py-9">
        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium leading-none text-emerald-800">
          Dashboard Overview
        </span>
        <div className="mt-3 max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[44px] sm:leading-[1.05]">
            Manage your <span className="italic text-emerald-700">fresh</span> catalogue.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-foreground/75 sm:text-base">
            Review current inventory, update market pricing, and log your latest yields for the Salinas Valley
            community.
          </p>
        </div>
        <Leaf className="pointer-events-none absolute right-10 top-8 hidden size-24 text-foreground/15 sm:block" />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-lg bg-primary/10 p-1.5 text-primary">
              <LineChart className="size-4" />
            </span>
            <h2 className="text-sm font-semibold text-foreground">Monthly Sales (Mock)</h2>
          </div>
          <div className="flex h-36 items-end gap-2 rounded-lg border border-border/70 bg-muted/20 p-2">
            {monthlySales.map((value, idx) => (
              <div key={`sales-${idx}`} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-[#54b531]/80"
                  style={{ height: `${Math.max(22, (value / maxSales) * 120)}px` }}
                />
                <span className="text-[10px] text-muted-foreground">W{idx + 1}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-lg bg-primary/10 p-1.5 text-primary">
              <BarChart3 className="size-4" />
            </span>
            <h2 className="text-sm font-semibold text-foreground">Harvest Volume (Mock)</h2>
          </div>
          <div className="flex h-36 items-end gap-2 rounded-lg border border-border/70 bg-muted/20 p-2">
            {harvestVolume.map((value, idx) => (
              <div key={`volume-${idx}`} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-[#2f7a1f]/80"
                  style={{ height: `${Math.max(22, (value / maxVolume) * 120)}px` }}
                />
                <span className="text-[10px] text-muted-foreground">W{idx + 1}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-primary/10 p-1.5 text-primary">
              <Package className="size-4" />
            </span>
            <h2 className="text-base font-semibold text-foreground">Top 5 Products</h2>
          </div>
          <Link
            href={withLocalePath(locale, "/farmer/products")}
            className="text-sm font-semibold text-primary hover:underline"
          >
            See more
          </Link>
        </div>
        <div className="mt-4 space-y-2">
          {productsData.items.map((item) => (
            <article key={item.id} className="flex items-center justify-between rounded-xl border border-border/70 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.unit}</p>
              </div>
              <span className="rounded-full bg-[#E8F3E6] px-2.5 py-1 text-xs font-semibold text-[#2F6B2F]">
                {item.isActive ? t.active : t.inactive}
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
