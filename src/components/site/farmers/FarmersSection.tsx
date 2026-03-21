"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import FarmerCard from "./FarmerCard";

export default function FarmersSection({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  const f = m.farmers;
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

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
      style={{ backgroundColor: "#FDF8E1" }}
      aria-labelledby="farmers-section-heading"
    >
      <div className="mx-auto max-w-6xl px-4">
        <header className="text-center">
          <h2
            id="farmers-section-heading"
            className={`font-serif text-xl font-bold uppercase tracking-[0.12em] text-[#A67C52] transition-all duration-700 ease-out sm:text-2xl md:text-3xl ${headerAnim}`}
          >
            {f.title}
          </h2>
          <p
            className={`mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-neutral-800 transition-all duration-700 ease-out md:text-base ${headerAnim}`}
            style={{ transitionDelay: "70ms" }}
          >
            {f.subtitle}
          </p>
        </header>

        <div
          className={`mt-10 flex flex-wrap justify-center gap-x-6 gap-y-10 transition-all duration-700 ease-out md:mt-14 md:gap-x-8 md:gap-y-12 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ transitionDelay: "120ms" }}
        >
          {f.list.map((farmer, index) => (
            <FarmerCard
              key={farmer.id}
              farmer={farmer}
              hueIndex={index}
              isVisible={isVisible}
              animationDelayMs={160 + index * 45}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
