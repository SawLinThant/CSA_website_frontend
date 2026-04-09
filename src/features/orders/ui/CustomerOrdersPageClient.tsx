"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ChevronRight,
  LayoutGrid,
  List,
  MoreVertical,
  Package,
  Search,
  SlidersHorizontal,
  Truck,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import { withLocalePath } from "@/i18n/config";
import { formatMoneyAmount } from "@/lib/format/money";
import {
  customerOrderListResponseSchema,
  type CustomerOrderListItem,
} from "@/features/orders/domain/schemas";
import {
  cycleMonthLabel,
  dateLabel,
  formatOrderRef,
  formatSubRef,
  startEndOfMonth,
  startEndOfPreviousMonth,
  statusBadgeClass,
  statusLabel,
} from "@/features/orders/lib/orderDisplay";

type TabId = "all" | "in_progress" | "delivered" | "flagged";

export default function CustomerOrdersPageClient({ locale }: { locale: Locale }) {
  const [tab, setTab] = useState<TabId>("all");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [datePreset, setDatePreset] = useState<"all" | "this_month" | "last_month">("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "totalPrice">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [view, setView] = useState<"list" | "grid">("list");

  const [data, setData] = useState<{
    items: CustomerOrderListItem[];
    total: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [counts, setCounts] = useState<Record<TabId, number>>({
    all: 0,
    in_progress: 0,
    delivered: 0,
    flagged: 0,
  });

  const tabQuery = useMemo(() => {
    switch (tab) {
      case "in_progress":
        return { statuses: "pending,packed,shipped" };
      case "delivered":
        return { status: "delivered" };
      case "flagged":
        return { status: "cancelled" };
      default:
        return {};
    }
  }, [tab]);

  const dateQuery = useMemo(() => {
    if (datePreset === "all") return {};
    const now = new Date();
    if (datePreset === "this_month") {
      const { start, end } = startEndOfMonth(now);
      return { from: start.toISOString(), to: end.toISOString() };
    }
    const { start, end } = startEndOfPreviousMonth(now);
    return { from: start.toISOString(), to: end.toISOString() };
  }, [datePreset]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    if ("statuses" in tabQuery && tabQuery.statuses) params.set("statuses", tabQuery.statuses);
    if ("status" in tabQuery && tabQuery.status) params.set("status", tabQuery.status);
    if ("from" in dateQuery && dateQuery.from) params.set("from", dateQuery.from);
    if ("to" in dateQuery && dateQuery.to) params.set("to", dateQuery.to);
    const q = searchApplied.trim();
    if (q) params.set("search", q);
    try {
      const res = await fetch(`/api/customer/orders?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });
      const json = (await res.json()) as unknown;
      if (!res.ok) {
        const err = json as { error?: string };
        throw new Error(err.error ?? "Failed to load orders");
      }
      const parsed = customerOrderListResponseSchema.parse(json);
      setData({
        items: parsed.items,
        total: parsed.total,
        totalPages: parsed.totalPages,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, tabQuery, dateQuery, searchApplied, sortBy, sortOrder]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  useEffect(() => {
    let cancelled = false;
    async function loadCounts() {
      const bases: Array<{ key: TabId; q: Record<string, string> }> = [
        { key: "all", q: {} },
        { key: "in_progress", q: { statuses: "pending,packed,shipped" } },
        { key: "delivered", q: { status: "delivered" } },
        { key: "flagged", q: { status: "cancelled" } },
      ];
      const search = searchApplied.trim();
      const results = await Promise.all(
        bases.map(async ({ key, q }) => {
          const params = new URLSearchParams();
          params.set("page", "1");
          params.set("limit", "1");
          for (const [k, v] of Object.entries(q)) {
            params.set(k, v);
          }
          if ("from" in dateQuery && dateQuery.from) params.set("from", dateQuery.from);
          if ("to" in dateQuery && dateQuery.to) params.set("to", dateQuery.to);
          if (search) params.set("search", search);
          const res = await fetch(`/api/customer/orders?${params.toString()}`, {
            credentials: "include",
          });
          const json = (await res.json()) as { total?: number };
          if (!res.ok) return [key, 0] as const;
          return [key, typeof json.total === "number" ? json.total : 0] as const;
        }),
      );
      if (cancelled) return;
      setCounts((prev) => {
        const next = { ...prev };
        for (const [k, v] of results) next[k] = v;
        return next;
      });
    }
    void loadCounts();
    return () => {
      cancelled = true;
    };
  }, [searchApplied, dateQuery]);

  const toggleSort = (field: "createdAt" | "totalPrice") => {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const applySearch = () => {
    setSearchApplied(search);
    setPage(1);
  };

  const ordersPath = withLocalePath(locale, "/customer/orders");

  return (
    <div className="mx-auto w-full max-w-6xl py-8">
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2F6B2F]/15">
          <Package className="h-6 w-6 text-[#2F6B2F]" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage all subscription box orders across the CSA network
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-1">
        {(
          [
            { id: "all" as const, label: "All Orders" },
            { id: "in_progress" as const, label: "In Progress" },
            { id: "delivered" as const, label: "Delivered" },
            { id: "flagged" as const, label: "Flagged" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setPage(1);
            }}
            className={`inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-[#2F6B2F] text-[#2F6B2F]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {t.id === "in_progress" ? (
              <span className="rounded-full bg-[#2F6B2F]/15 px-2 py-0.5 text-xs font-semibold text-[#2F6B2F]">
                {counts.in_progress}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by Order ID, Box Name or Tracking..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applySearch();
              }}
              className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={datePreset}
              onChange={(e) => {
                setDatePreset(e.target.value as "all" | "this_month" | "last_month");
                setPage(1);
              }}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground"
            >
              <option value="all">All dates</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
            </select>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-input bg-background text-muted-foreground"
              aria-label="More filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <div className="ml-auto flex rounded-lg border border-input p-0.5 lg:ml-0">
              <button
                type="button"
                onClick={() => setView("list")}
                className={`rounded-md p-2 ${view === "list" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`rounded-md p-2 ${view === "grid" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => toggleSort("createdAt")}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Sort by Created Date
              <span className="text-[10px] opacity-70">{sortBy === "createdAt" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
            </button>
            <button
              type="button"
              onClick={() => toggleSort("totalPrice")}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Sort by Price
              <span className="text-[10px] opacity-70">{sortBy === "totalPrice" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
            </button>
            <button
              type="button"
              onClick={applySearch}
              className="rounded-lg bg-[#2F6B2F] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#275A27]"
            >
              Apply search
            </button>
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="More actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error ? (
        <p className="py-12 text-center text-sm text-destructive">{error}</p>
      ) : loading && !data ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Loading orders…</p>
      ) : !data?.items.length ? (
        <p className="py-12 text-center text-sm text-muted-foreground">No orders found.</p>
      ) : (
        <ul
          className={
            view === "grid"
              ? "grid grid-cols-1 gap-4 md:grid-cols-2"
              : "flex flex-col gap-4"
          }
        >
          {data.items.map((order) => (
            <li key={order.id}>
              <Link
                href={`${ordersPath}/${order.id}`}
                className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-[#2F6B2F]/40 md:flex-row md:items-stretch"
              >
                <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg bg-muted md:h-32 md:w-36">
                  {order.box.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- box images may be on any CDN
                    <img
                      src={order.box.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <Package className="h-10 w-10 opacity-40" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-foreground">{formatOrderRef(order.id)}</span>
                    <span className="rounded-full bg-[#2F6B2F]/12 px-2 py-0.5 text-xs font-medium text-[#2F6B2F]">
                      {order.boxVersion.versionName}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{order.box.name}</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Created {dateLabel(order.createdAt)}
                  </p>
                </div>
                <div className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Subscription</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {order.subscription?.plan.name ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ID: {order.subscription ? formatSubRef(order.subscription.id) : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Cycle &amp; Delivery
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">{cycleMonthLabel(order.cycleDate)}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Truck className="h-3.5 w-3.5 shrink-0" />
                      {order.deliveryDate
                        ? `Arriving ${dateLabel(order.deliveryDate)}`
                        : order.delivery?.trackingCode
                          ? `Tracking ${order.delivery.trackingCode}`
                          : "Delivery TBD"}
                    </p>
                  </div>
                  <div className="flex flex-row items-center justify-between gap-4 sm:col-span-2 md:col-span-1 md:flex-col md:items-end md:justify-center">
                    <p className="text-xl font-bold tabular-nums text-foreground">
                      {formatMoneyAmount(order.totalPrice, locale)}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}
                      >
                        {statusLabel(order.status)}
                      </span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {data && data.totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-input px-4 py-2 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {data.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= data.totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-input px-4 py-2 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
