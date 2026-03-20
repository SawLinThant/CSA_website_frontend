"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import OfferCard from "@/components/site/offer/OfferCard";

export default function OfferSection({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [uniformCardHeight, setUniformCardHeight] = useState<number | null>(null);

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
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const measure = () => {
      const cards = Array.from(
        node.querySelectorAll<HTMLElement>("[data-offer-card]"),
      );
      if (!cards.length) return;

      // Reset any previous enforced height before measuring.
      for (const card of cards) {
        card.style.minHeight = "0px";
      }

      const maxHeight = Math.max(...cards.map((el) => el.getBoundingClientRect().height));
      setUniformCardHeight(Math.ceil(maxHeight));
    };

    measure();

    const resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(node);

    return () => resizeObserver.disconnect();
  }, [locale]);

  return (
    <section ref={sectionRef} className="bg-background py-8 md:py-12">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold tracking-wide text-accent md:text-2xl">
          {m.offer.title}
        </h2>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-6">
        <div
          className={`md:col-span-2 md:col-start-2 transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <OfferCard
            iconSrc="/images/offer/freshfarmproduce.png"
            iconAlt={m.offer.cards.freshProduce.title}
            title={m.offer.cards.freshProduce.title}
            description={m.offer.cards.freshProduce.description}
            style={uniformCardHeight ? { minHeight: `${uniformCardHeight}px` } : undefined}
          />
        </div>
        <div
          className={`md:col-span-2 transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
          style={{ transitionDelay: "120ms" }}
        >
          <OfferCard
            iconSrc="/images/offer/subscriptionbox.png"
            iconAlt={m.offer.cards.subscriptionBox.title}
            title={m.offer.cards.subscriptionBox.title}
            description={m.offer.cards.subscriptionBox.description}
            style={uniformCardHeight ? { minHeight: `${uniformCardHeight}px` } : undefined}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div
          className={`transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
          style={{ transitionDelay: "220ms" }}
        >
          <OfferCard
            iconSrc="/images/offer/reliabledelivery.png"
            iconAlt={m.offer.cards.reliableDelivery.title}
            title={m.offer.cards.reliableDelivery.title}
            description={m.offer.cards.reliableDelivery.description}
            style={uniformCardHeight ? { minHeight: `${uniformCardHeight}px` } : undefined}
          />
        </div>
        <div
          className={`transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
          style={{ transitionDelay: "320ms" }}
        >
          <OfferCard
            iconSrc="/images/offer/seasonal&organic.jpg"
            iconAlt={m.offer.cards.seasonalOrganic.title}
            title={m.offer.cards.seasonalOrganic.title}
            description={m.offer.cards.seasonalOrganic.description}
            style={uniformCardHeight ? { minHeight: `${uniformCardHeight}px` } : undefined}
          />
        </div>
        <div
          className={`transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
          style={{ transitionDelay: "420ms" }}
        >
          <OfferCard
            iconSrc="/images/offer/supportlocalfarmer.png"
            iconAlt={m.offer.cards.supportFarmers.title}
            title={m.offer.cards.supportFarmers.title}
            description={m.offer.cards.supportFarmers.description}
            style={uniformCardHeight ? { minHeight: `${uniformCardHeight}px` } : undefined}
          />
        </div>
      </div>
    </section>
  );
}

