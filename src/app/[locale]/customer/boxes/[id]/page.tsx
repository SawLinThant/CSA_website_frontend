import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, Leaf, MapPin, ShieldCheck } from "lucide-react";
import { getPublicBoxDetailUseCase } from "@/features/boxes/application/useCases/getPublicBoxDetail";
import { getShellAuthState } from "@/lib/server/getShellAuthState";
import { formatMoneyAmount } from "@/lib/format/money";
import { isLocale, type Locale, withLocalePath } from "@/i18n/config";
import CustomerSubscribeNowButton from "@/components/customer/CustomerSubscribeNowButton";

const FALLBACK_ITEM_IMAGE = "/images/subscriptions/organic-vegetables.svg";

export default async function CustomerBoxDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: loc, id } = await params;
  if (!isLocale(loc)) notFound();
  const locale = loc as Locale;
  const auth = await getShellAuthState();
  const authRole = auth.status === "authenticated" ? auth.user.role : "guest";

  let detail: Awaited<ReturnType<typeof getPublicBoxDetailUseCase>>;
  try {
    detail = await getPublicBoxDetailUseCase(id);
  } catch {
    notFound();
  }

  const { box, activePlan, activeVersion, sampleItems, meta } = detail;
  const dateLabel = new Date(meta.referenceDate).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <main className="w-full">
      <Link
        href={withLocalePath(locale, "/customer/subscriptions")}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Boxes
      </Link>

      <section className="mt-5 overflow-hidden rounded-[26px] border border-black/10 bg-white shadow-sm">
        <div className="grid grid-cols-1">
          <div className="relative min-h-[280px]">
            <Image
              src={box.imageUrl || FALLBACK_ITEM_IMAGE}
              alt={box.name}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <div className="mb-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm">
                  Organic
                </span>
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm">
                  Seasonal
                </span>
              </div>
              <h1 className="text-balance text-4xl font-extrabold leading-[0.98]">{box.name}</h1>
              {activeVersion ? (
                <p className="mt-2 text-sm text-white/90">Version: {activeVersion.versionName}</p>
              ) : null}
            </div>
          </div>

          <div className="bg-[#f4f9ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Subscription Price
            </p>
            <div className="mt-1 flex items-end gap-1">
              <p className="text-4xl font-extrabold leading-none text-[#2f7a1f]">
                {activePlan ? formatMoneyAmount(activePlan.price, locale) : "-"}
              </p>
              <p className="pb-1 text-sm font-medium text-muted-foreground">/box</p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Includes local farm delivery and packaging</p>

            <div className="mt-5">
              <CustomerSubscribeNowButton authRole={authRole} planId={activePlan?.id} />
              {!activePlan ? (
                <p className="mt-2 text-center text-xs font-medium text-muted-foreground">
                  No active subscription plan is available for this box right now.
                </p>
              ) : null}
              <p className="mt-3 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Secure checkout powered by RootedPay
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 space-y-4">
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <h2 className="text-2xl font-bold text-foreground">Box Description</h2>
          <div className="mt-3 rounded-xl border border-black/10 bg-[#f8fbf5] p-3 text-sm text-foreground">
            <p className="inline-flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 text-[#2f7a1f]" />
              {meta.disclaimer}
            </p>
          </div>
          <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-muted-foreground">
            {box.description?.trim() ||
              "This subscription box is curated from fresh seasonal harvests and may change week to week to keep quality at its peak."}
          </p>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-2xl font-bold text-foreground">Sample Items</h3>
              <p className="text-sm text-muted-foreground">What's typical in this box</p>
            </div>
            <span className="rounded-full bg-[#eef7ea] px-3 py-1 text-xs font-semibold text-[#2f7a1f]">
              Approx. {sampleItems.length || 0} items
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {sampleItems.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
                <div className="relative h-28">
                  <Image
                    src={item.product.imageUrl || FALLBACK_ITEM_IMAGE}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="50vw"
                  />
                </div>
                <div className="p-3">
                  <h4 className="line-clamp-1 text-sm font-semibold text-foreground">{item.product.name}</h4>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {item.quantity} {item.product.unit}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          <div className="bg-[#2f7a1f] px-4 py-3">
            <h3 className="text-lg font-semibold text-white">Delivery Schedule</h3>
          </div>
          <div className="space-y-3 p-4">
            <div className="rounded-xl bg-[#f7faf4] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Frequency</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {activePlan ? (activePlan.deliveryFrequency === "weekly" ? "Every week" : "Every month") : "Not available"}
              </p>
            </div>
            <div className="rounded-xl bg-[#f7faf4] p-3">
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <Clock3 className="size-3.5" />
                Next delivery window
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">{dateLabel}</p>
            </div>
            <div className="rounded-xl bg-[#f7faf4] p-3">
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <MapPin className="size-3.5" />
                Delivery area
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">Greater Metro Area (Zones 1-4)</p>
            </div>
            <p className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="size-4 text-[#2f7a1f]" />
              Contactless delivery available
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-black/10 bg-[#edf6e5] p-6 shadow-sm">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#d9ebcb] text-[#2f7a1f]">
            <Leaf className="size-5" />
          </div>
          <h3 className="mt-4 text-center text-xl font-semibold text-foreground">Support Local Agriculture</h3>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            100% of the profits from this box go directly back to our partner farms.
          </p>
        </section>
      </section>
    </main>
  );
}

