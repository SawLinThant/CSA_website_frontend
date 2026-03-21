"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { withLocalePath } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import SubscriptionPlanCard, {
  type PlanBadge,
  type PlanVariant,
} from "@/components/site/subscriptionPlans/SubscriptionPlanCard";

const PLANS: readonly {
  id: "vegetable" | "fruit" | "seasonal";
  variant: PlanVariant;
  badge: PlanBadge;
  image: string;
}[] = [
  {
    id: "vegetable",
    variant: "white",
    badge: "active",
    image: "/images/subscriptions/organic-vegetables.svg",
  },
  {
    id: "fruit",
    variant: "mint",
    badge: "save",
    image: "/images/subscriptions/fresh-fruits.svg",
  },
  {
    id: "seasonal",
    variant: "peach",
    badge: "popular",
    image: "/images/subscriptions/seasonal-grains.svg",
  },
];

export default function SubscriptionPlansSection({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  const sp = m.subscriptionPlans;
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [weeklyMode, setWeeklyMode] = useState(true);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const subscriptionsHref = withLocalePath(locale, "/subscriptions");
  const cardAnim = isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0";

  return (
    <section
      ref={sectionRef}
      className="py-10 md:py-16"
      style={{ backgroundColor: "#FFF9EB" }}
      aria-labelledby="subscription-plans-heading"
    >
      <div className="mx-auto max-w-6xl px-4">
        <header className="text-center">
          <h2
            id="subscription-plans-heading"
            className={`font-serif text-2xl font-bold tracking-[0.08em] text-[#8D6E63] md:text-3xl ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            } transition-all duration-700 ease-out`}
          >
            {sp.title}
          </h2>
          <p
            className={`mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-neutral-800 md:text-base ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            } transition-all duration-700 ease-out`}
            style={{ transitionDelay: "70ms" }}
          >
            {sp.subtitle}
          </p>
        </header>

        <div
          className={`mx-auto mt-8 flex justify-center transition-all duration-700 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ transitionDelay: "120ms" }}
        >
          <div
            role="group"
            aria-label={sp.billingPeriod}
            className="inline-flex p-1"
          >
            <button
              type="button"
              aria-pressed={weeklyMode}
              onClick={() => setWeeklyMode(true)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition md:px-7 ${
                weeklyMode
                  ? "bg-[#1B5E20] text-white shadow-sm"
                  : "text-neutral-700 hover:text-neutral-990"
              }`}
            >
              {sp.weekly}
            </button>
            <button
              type="button"
              aria-pressed={!weeklyMode}
              onClick={() => setWeeklyMode(false)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition md:px-7 ${
                !weeklyMode
                  ? "bg-[#1B5E20] text-white shadow-sm"
                  : "text-neutral-700 hover:text-neutral-990"
              }`}
            >
              {sp.monthly}
            </button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-5 lg:gap-8">
          {PLANS.map((plan, index) => (
            <SubscriptionPlanCard
              key={plan.id}
              planId={plan.id}
              variant={plan.variant}
              badge={plan.badge}
              imageSrc={plan.image}
              weeklyMode={weeklyMode}
              subscriptionsHref={subscriptionsHref}
              messages={m}
              animationClass={cardAnim}
              animationDelayMs={160 + index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
