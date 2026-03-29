"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Box,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  MapPin,
  Package,
  Printer,
  Settings,
  Shield,
  Truck,
  User,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import { withLocalePath } from "@/i18n/config";
import { formatMoneyAmount } from "@/lib/format/money";
import {
  customerOrderDetailSchema,
  type CustomerOrderDetail,
} from "@/features/orders/domain/schemas";
import {
  cycleMonthCycleLabel,
  dateLabel,
  deliveredTimestampLabel,
  deliveryProgressPercent,
  deliveryStatusLabel,
  formatOrderRefCsa,
  formatSubRef,
  placedOnDateTime,
  statusLabel,
} from "@/features/orders/lib/orderDisplay";

function versionSlug(boxVersionId: string) {
  return `v-${boxVersionId.slice(-6).toLowerCase()}`;
}

type Props = {
  locale: Locale;
  orderId: string;
};

export default function CustomerOrderDetailClient({ locale, orderId }: Props) {
  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/customer/orders/${encodeURIComponent(orderId)}`, {
        method: "GET",
        credentials: "include",
      });
      const json = (await res.json()) as unknown;
      if (!res.ok) {
        const err = json as { error?: string };
        throw new Error(err.error ?? "Failed to load order");
      }
      const parsed = customerOrderDetailSchema.parse(json);
      setOrder(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load order");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  const ordersPath = withLocalePath(locale, "/orders");
  const subscriptionHref = order?.subscription
    ? withLocalePath(locale, `/subscriptions/${order.subscription.id}`)
    : null;

  const exportJson = () => {
    if (!order) return;
    const blob = new Blob([JSON.stringify(order, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formatOrderRefCsa(order.id).replace(/[^a-z0-9-]/gi, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scrollToDelivery = () => {
    document.getElementById("delivery-information")?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading && !order) {
    return (
      <div className="mx-auto max-w-6xl py-16 text-center text-sm text-muted-foreground">Loading order…</div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <p className="text-sm text-destructive">{error ?? "Order not found."}</p>
        <Link
          href={ordersPath}
          className="mt-6 inline-block text-sm font-medium text-[#2F6B2F] underline"
        >
          Back to orders
        </Link>
      </div>
    );
  }

  const uniqueProducts = new Set(order.items.map((i) => i.product.id)).size;
  const progress = deliveryProgressPercent(order.delivery?.deliveryStatus);
  const deliveryComplete = order.delivery?.deliveryStatus === "delivered";

  return (
    <div className="mx-auto w-full max-w-6xl py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={ordersPath}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2F6B2F] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {formatOrderRefCsa(order.id)}
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              {statusLabel(order.status)}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Placed on {placedOnDateTime(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportJson}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/60 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
          <button
            type="button"
            onClick={scrollToDelivery}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2F6B2F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#275A27]"
          >
            <Package className="h-4 w-4" />
            Track Dispatch
          </button>
        </div>
      </div>

      {/* Main product summary */}
      <section className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="relative w-full shrink-0 overflow-hidden rounded-xl bg-muted lg:max-w-md lg:flex-1">
            {order.box.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- box images may be on any CDN
              <img
                src={order.box.imageUrl}
                alt=""
                className="aspect-4/3 w-full object-cover lg:aspect-auto lg:min-h-[280px]"
              />
            ) : (
              <div className="flex aspect-4/3 items-center justify-center lg:min-h-[280px]">
                <Package className="h-16 w-16 text-muted-foreground/40" />
              </div>
            )}
            <span className="absolute left-3 top-3 rounded-full bg-[#2F6B2F] px-3 py-1 text-xs font-semibold text-white shadow">
              {order.boxVersion.versionName}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <h2 className="text-xl font-bold text-foreground md:text-2xl">{order.box.name}</h2>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Total paid
                </p>
                <p className="text-2xl font-bold text-[#2F6B2F] md:text-3xl">
                  {formatMoneyAmount(order.totalPrice, locale)}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {order.box.description?.trim() ||
                "Fresh seasonal produce sourced from partner farms in the CSA network. Contents may vary based on harvest availability."}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3 rounded-xl border border-border/80 bg-muted/30 p-3">
                <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-[#2F6B2F]" aria-hidden />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Box cycle
                  </p>
                  <p className="mt-0.5 font-medium text-foreground">{cycleMonthCycleLabel(order.cycleDate)}</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border border-border/80 bg-muted/30 p-3">
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-[#2F6B2F]" aria-hidden />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Subscription
                  </p>
                  <p className="mt-0.5 font-medium text-foreground">
                    {order.subscription?.plan.name ?? "—"}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {subscriptionHref ? (
                <Link
                  href={subscriptionHref}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2F6B2F] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#275A27]"
                >
                  <Settings className="h-4 w-4" />
                  Manage Subscription
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/60 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                <Printer className="h-4 w-4" />
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Two-column details */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#2F6B2F]" aria-hidden />
            <h3 className="text-lg font-semibold text-foreground">Order Details</h3>
          </div>
          <ul className="space-y-4">
            <DetailRow icon={Shield} label="Order reference" value={formatOrderRefCsa(order.id)} />
            <DetailRow icon={Calendar} label="Box cycle date" value={cycleMonthCycleLabel(order.cycleDate)} />
            <DetailRow
              icon={Clock}
              label="Delivery target"
              value={dateLabel(order.deliveryDate ?? order.cycleDate)}
            />
            <DetailRow
              icon={Box}
              label="Box version"
              value={`${order.boxVersion.versionName} (${versionSlug(order.boxVersion.id)})`}
            />
            <DetailRow
              icon={User}
              label="Subscription plan"
              value={order.subscription?.plan.name ?? "—"}
            />
          </ul>
        </section>

        <section
          id="delivery-information"
          className="rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5 text-[#2F6B2F]" aria-hidden />
            <h3 className="text-lg font-semibold text-foreground">Delivery Information</h3>
          </div>
          <ul className="space-y-4">
            <DetailRow
              icon={CheckCircle2}
              label="Status"
              value={order.delivery ? deliveryStatusLabel(order.delivery.deliveryStatus) : statusLabel(order.status)}
            />
            <DetailRow
              icon={User}
              label="Driver"
              value={order.delivery?.deliveryDriver?.trim() || "—"}
            />
            <DetailRow
              icon={MapPin}
              label="Tracking code"
              value={order.delivery?.trackingCode?.trim() || "—"}
            />
            <DetailRow
              icon={Clock}
              label="Timestamp"
              value={
                order.delivery?.deliveredAt
                  ? deliveredTimestampLabel(order.delivery.deliveredAt)
                  : order.deliveryDate
                    ? deliveredTimestampLabel(order.deliveryDate)
                    : "—"
              }
            />
          </ul>
          <div className="mt-6">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[#2F6B2F] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-right text-[10px] font-semibold uppercase tracking-wider text-[#2F6B2F]">
              {deliveryComplete ? "Successfully delivered" : "Delivery in progress"}
            </p>
          </div>
        </section>
      </div>

      {/* Box contents */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground">Box Contents</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Included items for the {order.boxVersion.versionName} season
            </p>
          </div>
          <span className="shrink-0 self-start rounded-full bg-[#2F6B2F]/12 px-3 py-1 text-xs font-semibold text-[#2F6B2F]">
            {uniqueProducts} Unique {uniqueProducts === 1 ? "Product" : "Products"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 pr-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Product name
                </th>
                <th className="pb-3 pr-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Farmer / source
                </th>
                <th className="pb-3 pr-4 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Quantity
                </th>
                <th className="pb-3 pr-4 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Unit price
                </th>
                <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Line total
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((line) => (
                <tr key={line.id} className="border-b border-border/60 last:border-0">
                  <td className="py-4 pr-4 align-top">
                    <p className="font-semibold text-[#2F6B2F]">{line.product.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {line.product.unit?.trim() || "—"}
                    </p>
                  </td>
                  <td className="py-4 pr-4 align-top">
                    <span className="inline-block rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs text-foreground">
                      {line.farmer.farmName}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-center align-top tabular-nums">{line.quantity}×</td>
                  <td className="py-4 pr-4 text-right align-top tabular-nums text-muted-foreground">
                    {formatMoneyAmount(line.unitPrice, locale)}
                  </td>
                  <td className="py-4 text-right align-top font-semibold tabular-nums text-foreground">
                    {formatMoneyAmount(line.lineTotal, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col items-end border-t border-border pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Grand total</p>
          <p className="mt-1 text-2xl font-bold text-[#2F6B2F]">{formatMoneyAmount(order.totalPrice, locale)}</p>
        </div>
      </section>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <li className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 font-medium text-foreground">{value}</p>
      </div>
    </li>
  );
}
