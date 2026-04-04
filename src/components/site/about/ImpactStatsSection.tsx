"use client";

import { Heart, MapPin, ShoppingBasket, TrendingUp } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { useSectionReveal, sectionRevealClasses } from "@/hooks/useSectionReveal";
import { getMessages } from "@/i18n/messages";
import { cn } from "@/lib/utils";

const ICONS = [ShoppingBasket, TrendingUp, Heart, MapPin] as const;

export default function ImpactStatsSection({ locale }: { locale: Locale }) {
  const { ref, isVisible } = useSectionReveal();
  const { stats } = getMessages(locale).aboutUs.impact;

  return (
    <section
      ref={ref}
      className="border-y border-neutral-200/80 py-12 md:py-16"
      style={{ backgroundColor: "#F9F9F9" }}
      aria-labelledby="impact-heading"
    >
      <div className="mx-auto max-w-6xl px-4">
        <h2 id="impact-heading" className="sr-only">
          Impact at a glance
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = ICONS[index] ?? ShoppingBasket;
            return (
              <div
                key={stat.label}
                className={cn(
                  "flex items-center gap-4 rounded-2xl bg-white p-5 shadow-md ring-1 ring-black/5",
                  sectionRevealClasses.transition,
                  isVisible ? sectionRevealClasses.visible : sectionRevealClasses.hidden,
                )}
                style={{ transitionDelay: `${140 + index * 90}ms` }}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: "#FDEBD0" }}
                >
                  <Icon className="h-6 w-6" style={{ color: "#C05621" }} aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="font-serif text-2xl font-bold tracking-tight text-neutral-990 md:text-[1.65rem]">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
