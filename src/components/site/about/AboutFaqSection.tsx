"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { useSectionReveal, sectionRevealClasses } from "@/hooks/useSectionReveal";
import { getMessages } from "@/i18n/messages";
import { cn } from "@/lib/utils";

export default function AboutFaqSection({ locale }: { locale: Locale }) {
  const { ref, isVisible } = useSectionReveal();
  const m = getMessages(locale).aboutUs.faq;
  const [openIndex, setOpenIndex] = useState<number | null>(2);

  const headerAnim = cn(sectionRevealClasses.transition, isVisible ? sectionRevealClasses.visible : sectionRevealClasses.hidden);

  return (
    <section ref={ref} className="bg-white py-14 md:py-20" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl px-4">
        <header className="text-center">
          <h2
            id="faq-heading"
            className={cn("font-serif text-2xl font-bold tracking-tight text-neutral-990 md:text-3xl", headerAnim)}
          >
            {m.title}
          </h2>
          <p
            className={cn(
              "mt-4 text-sm leading-relaxed text-neutral-600 md:text-base",
              sectionRevealClasses.transition,
              isVisible ? sectionRevealClasses.visible : sectionRevealClasses.hidden,
            )}
            style={{ transitionDelay: isVisible ? "70ms" : undefined }}
          >
            {m.subtitle}
          </p>
        </header>

        <div
          className={cn(
            "mt-10 divide-y divide-neutral-200 border-t border-neutral-200",
            sectionRevealClasses.transition,
            isVisible ? sectionRevealClasses.visible : sectionRevealClasses.hidden,
          )}
          style={{ transitionDelay: isVisible ? "120ms" : undefined }}
        >
          {m.items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.q} className="py-1">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-start justify-between gap-4 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-base font-semibold text-neutral-990 md:text-lg">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "mt-0.5 h-5 w-5 shrink-0 text-neutral-500 transition-transform",
                      isOpen && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>
                {isOpen && (
                  <p className="pb-4 text-sm leading-relaxed text-neutral-600 md:text-[15px]">{item.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
