"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

const IMAGES = [
  { src: "/images/howitworks/1.jpg", altKey: "step1" as const },
  { src: "/images/howitworks/2.jpg", altKey: "step2" as const },
  { src: "/images/howitworks/3.png", altKey: "step3" as const },
] as const;

/** Fan layout: [rotateDeg, bottomPx, zIndex, delayMs] — horizontal position via LEFT_CLASSES (responsive) */
const CARD_LAYOUT: readonly [number, string, number, number][] = [
  [-10, "12px", 30, 0],
  [2, "4px", 20, 110],
  [12, "0px", 10, 220],
];

/** Fan horizontal offsets — mobile % is inside a centered fixed-width box; md+ matches desktop layout */
const LEFT_CLASSES = [
  "left-[2%] md:left-[4%]",
  "left-[26%] md:left-[28%]",
  "left-[48%] md:left-[52%]",
] as const;

export default function HowItWorksSection({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
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
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const hiw = m.howItWorks;

  return (
    <section
      ref={sectionRef}
      className="py-10 md:py-16"
      style={{ backgroundColor: "#FFF9EB" }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <header className="text-center">
          <h2
            className={`font-serif text-2xl font-bold tracking-[0.12em] text-[#8D6E63] md:text-3xl ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            } transition-all duration-700 ease-out`}
          >
            {hiw.title}
          </h2>
          <p
            className={`mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-800 md:text-base ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            } transition-all duration-700 ease-out`}
            style={{ transitionDelay: "80ms" }}
          >
            {hiw.subtitle}
          </p>
        </header>

        <div className="mt-4 grid grid-cols-1 items-center gap-8 md:mt-0 md:grid-cols-2 md:gap-10 lg:gap-16">
          <ol className="flex flex-col gap-8 md:gap-10">
            {hiw.steps.map((step, index) => (
              <li
                key={step.title}
                className={`flex gap-4 transition-all duration-700 ease-out ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: `${140 + index * 120}ms` }}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
                  style={{ backgroundColor: "#1B5E20" }}
                  aria-hidden
                >
                  {index + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  <h3
                    className="text-base font-bold md:text-lg"
                    style={{ color: "#1B5E20" }}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-800 md:text-[15px]">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div
            className={`-translate-y-6 md:-translate-y-10 lg:-translate-y-12 ${
              isVisible ? "opacity-100" : "opacity-0"
            } transition-opacity duration-500 ease-out`}
            style={{ transitionDelay: "100ms" }}
          >
            {/* Centered stage on mobile; full column width from md */}
            <div
              className={`relative left-1/2 h-[min(64vw,268px)] w-[min(88vw,326px)] max-w-full -translate-x-1/2 min-[400px]:h-[min(68vw,288px)] md:left-auto md:mx-auto md:h-[380px] md:w-full md:max-w-[420px] md:translate-x-0 lg:h-[420px] lg:max-w-none`}
            >
            {IMAGES.map((img, i) => {
              const layout = CARD_LAYOUT[i];
              if (!layout) return null;
              const [rotate, bottom, z, delay] = layout;
              const leftClass = LEFT_CLASSES[i] ?? LEFT_CLASSES[0];
              const alt =
                img.altKey === "step1"
                  ? hiw.imageAlts.step1
                  : img.altKey === "step2"
                    ? hiw.imageAlts.step2
                    : hiw.imageAlts.step3;

              const transformVisible = `translate3d(0,0,0) rotate(${rotate}deg) scale(1)`;
              const transformHidden = `translate3d(0,28px,0) rotate(${rotate * 0.35}deg) scale(0.88)`;

              return (
                <div
                  key={img.src}
                  className={`absolute w-[40%] max-w-[138px] min-w-[114px] min-[400px]:max-w-[144px] md:max-w-none md:min-w-0 md:w-[220px] lg:w-[240px] ${leftClass}`}
                  style={{
                    bottom,
                    zIndex: z,
                    transform: isVisible ? transformVisible : transformHidden,
                    opacity: isVisible ? 1 : 0,
                    transitionProperty: "transform, opacity",
                    transitionDuration: "800ms",
                    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                    transitionDelay: `${delay}ms`,
                  }}
                >
                  <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-white shadow-[0_18px_40px_-12px_rgba(0,0,0,0.22)] ring-1 ring-black/5">
                    <Image
                      src={img.src}
                      alt={alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 36vw, 240px"
                      priority={false}
                    />
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
