"use client";

import { Check, Globe, Leaf, Recycle, Users } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { useSectionReveal, sectionRevealClasses } from "@/hooks/useSectionReveal";
import { getMessages } from "@/i18n/messages";
import { cn } from "@/lib/utils";

export default function MissionValuesSection({ locale }: { locale: Locale }) {
  const { ref, isVisible } = useSectionReveal();
  const m = getMessages(locale).aboutUs.mission;

  const cards = [
    {
      key: "freshQuality",
      icon: Leaf,
      title: m.cards.freshQuality.title,
      description: m.cards.freshQuality.description,
      variant: "default" as const,
    },
    {
      key: "supportLocal",
      icon: Users,
      title: m.cards.supportLocal.title,
      description: m.cards.supportLocal.description,
      variant: "default" as const,
    },
    {
      key: "sustainable",
      icon: Recycle,
      title: m.cards.sustainable.title,
      description: m.cards.sustainable.description,
      variant: "default" as const,
    },
    {
      key: "cta",
      icon: Globe,
      title: m.cards.cta.title,
      description: null,
      variant: "cta" as const,
    },
  ];

  const headerAnim = cn(sectionRevealClasses.transition, isVisible ? sectionRevealClasses.visible : sectionRevealClasses.hidden);

  return (
    <section
      ref={ref}
      id={m.id}
      className="scroll-mt-24 bg-white py-14 md:py-20"
      aria-labelledby="mission-heading"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-start">
          <div className={headerAnim}>
            <h2
              id="mission-heading"
              className="font-serif text-2xl font-bold tracking-tight text-neutral-990 md:text-3xl"
            >
              {m.title}
            </h2>
            <div className="mt-3 h-1 w-14 rounded-full bg-[#2E7D32]" aria-hidden />
            <p className="mt-6 text-sm leading-relaxed text-neutral-700 md:text-base">{m.body}</p>
            <ul className="mt-8 flex flex-col gap-3">
              {m.bullets.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-neutral-800 md:text-[15px]">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F5E9] text-[#2E7D32]">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {cards.map((card, index) => {
              const Icon = card.icon;
              const isCta = card.variant === "cta";
              return (
                <article
                  key={card.key}
                  className={cn(
                    isCta
                      ? "flex min-h-[160px] flex-col items-center justify-center rounded-2xl bg-[#E8F5E9] p-6 text-center shadow-sm ring-1 ring-[#2E7D32]/15"
                      : "rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm",
                    sectionRevealClasses.transition,
                    isVisible ? sectionRevealClasses.visible : sectionRevealClasses.hidden,
                  )}
                  style={{ transitionDelay: `${160 + index * 55}ms` }}
                >
                  <div
                    className={
                      isCta
                        ? "mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#2E7D32] shadow-sm"
                        : "mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F5E9] text-[#2E7D32]"
                    }
                  >
                    <Icon className={isCta ? "h-6 w-6" : "h-5 w-5"} aria-hidden />
                  </div>
                  {!isCta && (
                    <h3 className="text-base font-bold text-neutral-990">{card.title}</h3>
                  )}
                  {!isCta && card.description && (
                    <p className="mt-2 text-sm leading-relaxed text-neutral-600">{card.description}</p>
                  )}
                  {isCta && (
                    <p className="font-serif text-lg font-bold leading-snug text-[#1B5E20]">{card.title}</p>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
