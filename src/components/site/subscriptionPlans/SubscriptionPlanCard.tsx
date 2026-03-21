import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { AppMessages } from "@/i18n/messages";
import PlanCardBadgeBand from "@/components/site/subscriptionPlans/PlanCardBadgeBand";

export type PlanBadge = "active" | "save" | "popular";
export type PlanVariant = "white" | "mint" | "peach";

type PlanId = "vegetable" | "fruit" | "seasonal";

type SubscriptionPlanCardProps = {
  planId: PlanId;
  variant: PlanVariant;
  badge: PlanBadge;
  imageSrc: string;
  weeklyMode: boolean;
  subscriptionsHref: string;
  messages: AppMessages;
  animationClass: string;
  animationDelayMs: number;
};

/** Section background — shows through the SVG “hole” (notch) and behind the badge */
const SECTION_CREAM = "transparent";

/**
 * SVG top band: green L-shape + cream notch (transparent).
 * - **TL**: same geometry as `M 0,16 A 16 16 0 0 1 16,0` but drawn (16,0)→(0,16) → sweep **0** (sweep **1** picks the *other* r=16 circle through those points and looks “scooped”).
 * - **Right / notch fillets** (`A 8 8`) on outer corners; **shelf → notch wall** uses a **cubic** so the middle joint scoops **inward** (concave into green), not a convex bump into the cream.
 * viewBox 0 0 400 56; coords stretch with card width (`preserveAspectRatio="none"`).
 * Notch wall x≈286 — keep in sync with `NOTCH_WALL_X` in `PlanCardBadgeBand.tsx`.
 */
const NOTCH_TOP_PATH =
  "M 0 56 L 400 56 L 400 52 A 8 8 0 0 0 392 44 L 322 44 C 310 44 286 46 286 36 L 286 8 A 8 8 0 0 0 278 0 L 268 0 L 16 0 A 16 16 0 0 0 0 16 L 0 56 Z";

const variantShell: Record<
  PlanVariant,
  { bg: string; fill: string; stroke: string }
> = {
  white: {
    bg: "#FFFDFA",
    fill: "#FFFDFA",
    stroke: "#FFFDFA",
  },
  mint: {
    bg: "#D2E8CB",
    fill: "#D2E8CB",
    stroke: "#D2E8CB",
  },
  peach: {
    bg: "#FFE2C0",
    fill: "#FFE2C0",
    stroke: "#FFE2C0",
  },
};

function CardNotchTopSvg({ fill, stroke }: { fill: string; stroke: string }) {
  return (
    <svg
      className="block h-12 w-full shrink-0"
      viewBox="0 0 400 56"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d={NOTCH_TOP_PATH}
        fill={fill}
        stroke={stroke}
        strokeWidth={0}
        paintOrder="stroke fill"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function TabBadgeContent({
  type,
  label,
}: {
  type: PlanBadge;
  label: string;
}) {
  return (
    <div className="inline-flex max-w-full flex-nowrap items-center justify-end gap-1.5 text-xs font-medium leading-none text-neutral-700">
      <span className="min-w-0 wrap-break-word text-right">{label}</span>
      {type === "active" ? (
        <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-[#43a047]" aria-hidden />
      ) : null}
      {type === "save" ? (
        <span
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-50 text-[10px] font-bold text-red-600 ring-1 ring-red-100"
          aria-hidden
        >
          %
        </span>
      ) : null}
      {type === "popular" ? (
        <span className="text-base leading-none text-amber-500" aria-hidden>
          ★
        </span>
      ) : null}
    </div>
  );
}

/**
 * Hybrid layout: **SVG top cap** (accurate concave / convex notch edges) + **CSS** body (normal BL/BR rounds).
 * `border-radius` alone cannot draw a concave corner on the parent; options are SVG, `clip-path: path()`, or a mask image.
 */
export default function SubscriptionPlanCard({
  planId,
  variant,
  badge,
  imageSrc,
  weeklyMode,
  subscriptionsHref,
  messages,
  animationClass,
  animationDelayMs,
}: SubscriptionPlanCardProps) {
  const sp = messages.subscriptionPlans;
  const plan = sp.plans[planId];
  const p = sp.pricing;
  const v = variantShell[variant];

  const mainAmount = weeklyMode ? p.weeklyAmount : p.monthlyAmount;
  const suffix = weeklyMode ? sp.perWeek : sp.perMonth;
  const footnote = weeklyMode
    ? sp.footnoteWhenWeekly.replace("{monthly}", p.monthlyAmount).replace("{currency}", p.currency)
    : sp.footnoteWhenMonthly.replace("{weekly}", p.weeklyAmount).replace("{currency}", p.currency);

  const badgeLabel =
    badge === "active" ? sp.badges.active : badge === "save" ? sp.badges.save : sp.badges.popular;

  const alt =
    planId === "vegetable"
      ? sp.imageAlts.vegetable
      : planId === "fruit"
        ? sp.imageAlts.fruit
        : sp.imageAlts.seasonal;

  return (
    <div
      className={`transition-all duration-700 ease-out ${animationClass}`}
      style={{ transitionDelay: `${animationDelayMs}ms` }}
    >
      <article
        className="flex w-full flex-col drop-shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
        aria-labelledby={`plan-title-${planId}`}
      >
        {/* Top: SVG silhouette (tweak NOTCH_TOP_PATH for your exact S-curve) */}
        <div
          className="relative w-full overflow-hidden"
          style={{ backgroundColor: SECTION_CREAM }}
        >
          <CardNotchTopSvg fill={v.fill} stroke={v.stroke} />
          {/* Measured inset: clears mint for any label length + screen width (see PlanCardBadgeBand) */}
          <PlanCardBadgeBand>
            <TabBadgeContent type={badge} label={badgeLabel} />
          </PlanCardBadgeBand>
        </div>

        <div
          className="-mt-px flex flex-col rounded-b-2xl border-l border-r border-b px-5 pb-6 pt-5"
          style={
            { borderColor: v.stroke, backgroundColor: v.bg } satisfies CSSProperties
          }
        >
          <h3
            id={`plan-title-${planId}`}
            className="text-center text-md font-medium tracking-tight text-neutral-990"
          >
            {plan.title}
          </h3>

          <div className="mt-4 flex flex-wrap items-start justify-center gap-x-4 gap-y-2">
            <span className="text-center text-[1.65rem] font-bold leading-none tracking-tight text-[#1B5E20] md:text-xl">
              {mainAmount} {p.currency}
            </span>
            <div className="flex min-w-30 flex-col items-end gap-0.5 text-left text-[11px] leading-snug text-neutral-600 sm:text-xs md:text-sm">
              <span className="text-left w-full">{suffix}</span>
              <span className="text-neutral-500">{footnote}</span>
            </div>
          </div>

          <div
            className="my-5 border-t border-dashed border-neutral-300/90"
            role="presentation"
          />

          <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 text-left text-sm text-neutral-800">
            <ul className="list-disc space-y-1 pl-4 marker:text-[#1B5E20]">
              {sp.features.left.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <ul className="list-disc space-y-1 pl-4 marker:text-[#1B5E20]">
              {sp.features.right.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto mt-6 aspect-5/3 w-full max-w-[240px]">
            <Image
              src={imageSrc}
              alt={alt}
              fill
              className="object-contain object-bottom"
              sizes="(max-width:768px) 85vw, 240px"
            />
          </div>

          <Link
            href={subscriptionsHref}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#1B5E20] px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#145016] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5E20]"
          >
            {sp.orderNow}
          </Link>

          <Link
            href={subscriptionsHref}
            className="mt-3 text-center text-sm font-medium text-[#1B5E20] underline-offset-4 hover:underline"
          >
            {sp.learnMore} →
          </Link>
        </div>
      </article>
    </div>
  );
}
