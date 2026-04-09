"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { formatMoneyAmount } from "@/lib/format/money";
import { getLocaleFromPathname, type Locale, withLocalePath } from "@/i18n/config";
import CustomerSubscribeNowButton from "@/components/customer/CustomerSubscribeNowButton";

type Item = {
  box: {
    id: string;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
  };
  minPrice: number;
  frequencyBadge: "weekly" | "monthly" | null;
  subscribePlanId: string;
  isNew: boolean;
};

type ApiResponse = {
  items: Item[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

function isApiResponse(value: unknown): value is ApiResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.items) &&
    typeof v.total === "number" &&
    typeof v.page === "number" &&
    typeof v.limit === "number" &&
    typeof v.hasMore === "boolean"
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "green" | "gold" | "gray" }) {
  const cls =
    tone === "green"
      ? "bg-[#2F6B2F] text-white"
      : tone === "gold"
        ? "bg-[#E9B949] text-black"
        : "bg-black/60 text-white";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${cls}`}>
      {children}
    </span>
  );
}

export default function CustomerSubscriptionsClient({
  initial,
  authRole,
}: {
  initial: ApiResponse;
  authRole: "guest" | "customer" | "farmer" | "admin";
}) {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname) as Locale;

  const [items, setItems] = useState<Item[]>(initial.items);
  const [total, setTotal] = useState(initial.total);
  const [page, setPage] = useState(initial.page);
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [loading, setLoading] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const resultsLabel = useMemo(() => `${total} Results`, [total]);

  async function loadNext() {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/customer/boxes?page=${nextPage}&limit=${initial.limit}`, {
        method: "GET",
      });
      const json = (await res.json().catch(() => null)) as unknown;
      if (!res.ok) {
        const err =
          json && typeof json === "object" && "error" in (json as Record<string, unknown>)
            ? String((json as Record<string, unknown>).error ?? "Failed to load more boxes")
            : "Failed to load more boxes";
        toast.error(err);
        return;
      }
      if (!isApiResponse(json)) {
        toast.error("Unexpected response while loading more boxes");
        return;
      }
      const data = json;
      setItems((prev) => [...prev, ...data.items]);
      setTotal(data.total);
      setPage(data.page);
      setHasMore(data.hasMore);
    } catch {
      toast.error("Failed to load more boxes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) void loadNext();
      },
      { rootMargin: "200px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentinelRef.current, hasMore, page, loading]);

  return (
    <main className="w-full">
      <section className="mb-4">
        <div className="overflow-hidden rounded-[18px] border border-black/10 bg-white shadow-sm">
          <div className="relative h-44 w-full">
            <Image
              src="/images/subscriptions/fresh-fruits.svg"
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/55 via-black/25 to-transparent" />
            <div className="absolute inset-x-4 top-4">
              <Badge tone="green">Summer Harvest</Badge>
            </div>
            <div className="absolute inset-x-4 bottom-4 text-white">
              <h1 className="text-balance text-3xl font-extrabold leading-tight">
                Curated boxes of <span className="italic">seasonal</span> goodness.
              </h1>
              <p className="mt-2 text-sm text-white/90">
                Farm-to-table freshness delivered to your door. Skip anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Browse Boxes</h2>
          <span className="rounded-full bg-[#E8F3E6] px-2.5 py-1 text-xs font-semibold text-[#2F6B2F]">
            {resultsLabel}
          </span>
        </div>
        <Link
          href={withLocalePath(locale, "/customer/subscriptions")}
          className="text-sm font-semibold text-[#2F6B2F]"
        >
          See All →
        </Link>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3">
        {items.map((it) => (
          <article key={it.box.id} className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
            <div className="relative aspect-square w-full bg-[#F5F5F5]">
              <Image
                src={it.box.imageUrl || "/images/subscriptions/organic-vegetables.svg"}
                alt={it.box.name}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 30vw, 50vw"
              />
              <div className="absolute left-2 top-2 flex flex-col gap-1">
                {it.isNew ? <Badge tone="gray">New</Badge> : null}
                {it.frequencyBadge ? <Badge tone="green">{it.frequencyBadge}</Badge> : null}
              </div>
            </div>

            <div className="p-3">
              <h3 className="line-clamp-1 text-sm font-semibold">{it.box.name}</h3>
              <p className="mt-0.5 line-clamp-1 text-[11px] text-foreground/55">
                {(it.box.description ?? "Seasonal goodness").toString()}
              </p>

              <div className="mt-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/45">
                  From
                </div>
                <div className="mt-0.5 text-base font-extrabold text-[#2F6B2F]">
                  {formatMoneyAmount(it.minPrice, locale)}
                </div>
              </div>

              <Link
                href={withLocalePath(locale, `/customer/boxes/${it.box.id}`)}
                className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-xl bg-[#2F6B2F] text-sm font-semibold text-white hover:bg-[#275A27]"
              >
                View Detail
              </Link>

              <CustomerSubscribeNowButton authRole={authRole} planId={it.subscribePlanId} />
            </div>
          </article>
        ))}
      </section>

      <div ref={sentinelRef} className="h-10" />
      {loading ? (
        <div className="py-4 text-center text-sm text-foreground/60">Loading more…</div>
      ) : null}
      {!hasMore ? (
        <div className="py-6 text-center text-sm text-foreground/50">You’ve reached the end.</div>
      ) : null}
    </main>
  );
}

