"use client";

import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { withLocalePath } from "@/i18n/config";
import { useSectionReveal, sectionRevealClasses } from "@/hooks/useSectionReveal";
import { getMessages } from "@/i18n/messages";
import { cn } from "@/lib/utils";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&h=1400&q=80";

export default function AboutHeroSection({ locale }: { locale: Locale }) {
  const { ref, isVisible } = useSectionReveal();
  const about = getMessages(locale).aboutUs;
  const m = about.hero;
  const missionHash = `#${about.mission.id}`;
  const anim = cn(sectionRevealClasses.transition, isVisible ? sectionRevealClasses.visible : sectionRevealClasses.hidden);

  return (
    <section ref={ref} className="py-10 md:py-14" aria-labelledby="about-hero-heading">
      <div
        className={cn(
          "mx-auto max-w-6xl overflow-hidden rounded-3xl bg-card shadow-lg ring-1 ring-black/5 md:flex md:min-h-[min(420px,70vh)]",
          anim,
        )}
      >
        <div className="relative min-h-[240px] w-full md:min-h-0 md:w-1/2">
          <Image
            src={HERO_IMAGE}
            alt={m.imageAlt}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
          />
          <p
            className="absolute bottom-4 left-4 max-w-[min(100%,18rem)] rounded-lg px-3 py-2 text-center text-[11px] font-semibold leading-snug text-neutral-900 shadow-md sm:text-xs"
            style={{ backgroundColor: "#F4D03F" }}
          >
            {m.badge}
          </p>
        </div>
        <div
          className="flex w-full flex-col justify-center px-6 py-10 md:w-1/2 md:px-10 md:py-12 lg:px-14"
          style={{ backgroundColor: "#E8F5E9" }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2E7D32]">{m.eyebrow}</p>
          <h1
            id="about-hero-heading"
            className="mt-3 font-serif text-3xl font-bold leading-tight text-[#1B5E20] md:text-4xl"
          >
            {m.title}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-neutral-800 md:text-base">{m.body}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={withLocalePath(locale, "/subscriptions")}
              className="inline-flex items-center justify-center rounded-xl bg-[#2E7D32] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#256628]"
            >
              {m.ctaPrimary}
            </Link>
            <Link
              href={missionHash}
              className="inline-flex items-center justify-center rounded-xl border-2 border-[#2E7D32] bg-transparent px-6 py-3 text-sm font-semibold text-[#2E7D32] transition hover:bg-[#2E7D32]/10"
            >
              {m.ctaSecondary}
            </Link>
          </div>
          <p className="mt-8 text-xs italic leading-relaxed text-neutral-500 md:text-sm">{m.footnote}</p>
        </div>
      </div>
    </section>
  );
}
