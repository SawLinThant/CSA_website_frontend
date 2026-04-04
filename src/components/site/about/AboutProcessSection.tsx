"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { withLocalePath } from "@/i18n/config";
import { useSectionReveal, sectionRevealClasses } from "@/hooks/useSectionReveal";
import { getMessages } from "@/i18n/messages";
import { cn } from "@/lib/utils";

export default function AboutProcessSection({ locale }: { locale: Locale }) {
  const { ref, isVisible } = useSectionReveal();
  const m = getMessages(locale).aboutUs.process;

  const headerAnim = cn(sectionRevealClasses.transition, isVisible ? sectionRevealClasses.visible : sectionRevealClasses.hidden);

  return (
    <section
      ref={ref}
      className="py-14 md:py-20"
      style={{ backgroundColor: "#F9F9F9" }}
      aria-labelledby="process-heading"
    >
      <div className="mx-auto max-w-6xl px-4">
        <header className="text-center">
          <h2
            id="process-heading"
            className={cn("font-serif text-2xl font-bold tracking-tight text-neutral-990 md:text-3xl", headerAnim)}
          >
            {m.title}
          </h2>
          <p
            className={cn(
              "mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 md:text-base",
              sectionRevealClasses.transition,
              isVisible ? sectionRevealClasses.visible : sectionRevealClasses.hidden,
            )}
            style={{ transitionDelay: isVisible ? "70ms" : undefined }}
          >
            {m.subtitle}
          </p>
        </header>

        <div className="relative mx-auto mt-12 max-w-5xl">
          <div className="hidden md:block">
            <div className="absolute left-[16.67%] right-[16.67%] top-6 z-0 h-px bg-neutral-200" aria-hidden />
          </div>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6">
            {m.steps.map((step, index) => (
              <div
                key={step.title}
                className={cn(
                  "relative z-10 flex flex-col items-center text-center",
                  sectionRevealClasses.transition,
                  isVisible ? sectionRevealClasses.visible : sectionRevealClasses.hidden,
                )}
                style={{ transitionDelay: `${120 + index * 110}ms` }}
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
                  style={{ backgroundColor: "#2E7D32" }}
                  aria-hidden
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-serif text-lg font-bold text-neutral-990">{step.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-neutral-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <p
          className={cn(
            "mt-12 text-center",
            sectionRevealClasses.transition,
            isVisible ? sectionRevealClasses.visible : sectionRevealClasses.hidden,
          )}
          style={{ transitionDelay: isVisible ? "420ms" : undefined }}
        >
          <Link
            href={withLocalePath(locale, "/subscriptions")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2E7D32] transition hover:underline"
          >
            {m.footerLink}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </p>
      </div>
    </section>
  );
}
