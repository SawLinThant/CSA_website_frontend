"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { formatMoneyAmount } from "@/lib/format/money";
import { getLocaleFromPathname, type Locale, withLocalePath } from "@/i18n/config";

type Item = {
  box: {
    id: string;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
  };
  minPrice: number;
  frequencyBadge: "weekly" | "monthly" | null;
  isNew: boolean;
};

type ApiResponse = {
  items: Item[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

const BANNER_SLIDES = [
  {
    image: "/images/subscriptions/fresh-fruits.svg",
    badge: "Summer Harvest",
    title: "Curated boxes of seasonal goodness.",
    subtitle: "Farm-to-table freshness delivered to your door. Skip anytime.",
  },
  {
    image: "/images/subscriptions/organic-vegetables.svg",
    badge: "Organic Picks",
    title: "Straight from local farms.",
    subtitle: "Handpicked produce plans for healthy meals every week.",
  },
  {
    image: "/images/subscriptions/seasonal-grains.svg",
    badge: "Pantry Staples",
    title: "For your everyday cooking.",
    subtitle: "Balanced subscriptions that match your family routine.",
  },
] as const;

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
}: {
  initial: ApiResponse;
}) {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname) as Locale;

  const [items, setItems] = useState<Item[]>(initial.items);
  const [page, setPage] = useState(initial.page);
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [loading, setLoading] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const resultsLabel = `${items.length} Results`;

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

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="w-full">
      <section className="mb-4">
        <div className="overflow-hidden rounded-[18px] border border-black/10 bg-white shadow-sm">
          <div className="relative h-44 w-full">
            {BANNER_SLIDES.map((slide, index) => (
              <Image
                key={slide.image}
                src={slide.image}
                alt={slide.title}
                fill
                className={`object-cover transition-opacity duration-700 ${activeBanner === index ? "opacity-100" : "opacity-0"}`}
                sizes="100vw"
                priority={index === 0}
              />
            ))}
            <div className="absolute inset-0 bg-linear-to-r from-black/55 via-black/25 to-transparent" />
            <div className="absolute inset-x-4 top-4">
              <Badge tone="green">{BANNER_SLIDES[activeBanner]?.badge}</Badge>
            </div>
            <div className="absolute inset-x-4 bottom-4 text-white">
              <h1 className="text-balance text-3xl font-extrabold leading-tight">
                {BANNER_SLIDES[activeBanner]?.title}
              </h1>
              <p className="mt-2 text-sm text-white/90">
                {BANNER_SLIDES[activeBanner]?.subtitle}
              </p>
            </div>
            <div className="absolute bottom-3 right-4 z-10 flex items-center gap-1.5">
              {BANNER_SLIDES.map((slide, index) => (
                <button
                  key={`${slide.image}-dot`}
                  type="button"
                  aria-label={`Go to banner ${index + 1}`}
                  onClick={() => setActiveBanner(index)}
                  className={`h-2 rounded-full transition-all ${activeBanner === index ? "w-5 bg-white" : "w-2 bg-white/60"}`}
                />
              ))}
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

