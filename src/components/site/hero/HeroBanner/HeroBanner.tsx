"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getLocaleFromPathname, withLocalePath } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

export function HeroBanner() {
  const gridLineCount = 7; // 8 columns => 7 lines
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const messages = getMessages(locale);

  return (
    <section className="w-full">
      <div className="relative w-full overflow-hidden">
        {/* Bottom layer (banner image) */}
        <div className="relative h-[360px] w-full md:h-[460px] lg:h-[560px] xl:h-[620px]">
          <Image
            src="/images/hero.jpg"
            alt="FreshRoot hero banner"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
            style={{ objectFit: "cover" }}
          />

        {/* Second layer (grid lines only; rest transparent) */}
        <div className="absolute inset-0 z-20 pointer-events-none" aria-hidden="true">
          {Array.from({ length: gridLineCount }).map((_, idx) => {
            const colIndex = idx + 1; // line positions: 1..7 for 8 columns
            return (
              <span
                key={colIndex}
                className="absolute top-0 bottom-0 w-[6px] bg-white"
                style={{
                  left: `${(colIndex * 100) / 8}%`,
                  transform: "translateX(-50%)",
                }}
              />
            );
          })}
        </div>

        {/* Curved top/bottom border caps (bow toward inside) */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[110px] w-full"
          viewBox="0 0 1000 120"
          preserveAspectRatio="none"
        >
          {/* outer white fill: from container edge to curve line */}
          <path
            d="M0 0 Q 500 140 1000 0 L1000 0 L0 0 Z"
            fill="rgba(255, 255, 255)"
          />
          {/* inner primary */}
          {/* (Intentionally removed: curve border stroke) */}
        </svg>

        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[110px] w-full"
          viewBox="0 0 1000 120"
          preserveAspectRatio="none"
        >
          {/* outer white fill: from container edge to curve line */}
          <path
            d="M0 120 Q 500 0 1000 120 L1000 120 L0 120 Z"
            fill="rgba(255, 255, 255)"
          />
          {/* inner primary */}
          {/* (Intentionally removed: curve border stroke) */}
        </svg>

        {/* Note: no center content here; it renders below the banner. */}
      </div>
      </div>

      {/* Text below banner (no absolute positioning) */}
      <div className="pb-10 pt-8 text-center">
        <h2 className="text-xl font-bold tracking-wide text-accent md:text-2xl">
          {messages.hero.title}
        </h2>
        <p className="mx-auto mt-2 max-w-[520px] text-sm text-neutral-950 md:text-base">
          {messages.hero.subtitle}
        </p>

        <Link
          href={withLocalePath(locale, "/products")}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-18 text-sm font-semibold text-neutral-50 md:h-12 md:px-18"
        >
          {messages.hero.cta}
        </Link>
      </div>
    </section>
  );
}

