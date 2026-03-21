"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import CentralPaddyImage from "./CentralPaddyImage";
import FeatureBlock from "./FeatureBlock";

export default function WhyChooseSection({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  const w = m.whyChoose;
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const leftFeatures = w.features.slice(0, 2);
  const rightFeatures = w.features.slice(2, 4);

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
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const headerAnim = isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0";

  return (
    <section
      ref={sectionRef}
      className="py-12 md:py-20"
      style={{ backgroundColor: "#FAF9F6" }}
      aria-labelledby="why-choose-heading"
    >
      <div className="mx-auto max-w-6xl px-4">
        <header className="text-center font-sans">
          <h2
            id="why-choose-heading"
            className={`text-xl font-bold uppercase tracking-[0.14em] text-[#A67C52] transition-all duration-700 ease-out sm:text-2xl md:text-[1.65rem] ${headerAnim}`}
          >
            {w.title}
          </h2>
          <p
            className={`mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#4A4A4A] transition-all duration-700 ease-out md:text-base ${headerAnim}`}
            style={{ transitionDelay: "70ms" }}
          >
            {w.subtitle}
          </p>
        </header>

        {/* Mobile / tablet: image first, then 2×2 feature grid */}
        <div
          className={`mt-10 flex flex-col gap-10 font-sans transition-all duration-700 ease-out lg:hidden ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          style={{ transitionDelay: "100ms" }}
        >
          <CentralPaddyImage alt={w.imageAlt} />
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10">
            {w.features.map((f) => (
              <FeatureBlock key={f.title} title={f.title} description={f.description} />
            ))}
          </div>
        </div>

        {/* Desktop: text | image | text, columns aligned to image height */}
        <div
          className={`mt-12 hidden gap-10 font-sans transition-all duration-700 ease-out lg:grid lg:grid-cols-[1fr_minmax(280px,22rem)_1fr] lg:items-stretch lg:gap-x-10 xl:gap-x-12 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          style={{ transitionDelay: "100ms" }}
        >
          <div className="flex min-h-0 flex-col justify-start gap-28 pt-2 pb-4">
            {leftFeatures.map((f) => (
              <FeatureBlock key={f.title} title={f.title} description={f.description} />
            ))}
          </div>

          <div className="flex min-h-0 items-center justify-center self-stretch py-2">
            <CentralPaddyImage alt={w.imageAlt} />
          </div>

          <div className="flex min-h-0 flex-col justify-start gap-28 pt-2 pb-4">
            {rightFeatures.map((f) => (
              <FeatureBlock key={f.title} title={f.title} description={f.description} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
