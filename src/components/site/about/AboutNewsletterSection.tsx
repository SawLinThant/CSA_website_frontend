"use client";

import Image from "next/image";
import { CheckCircle2, Mail, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Locale } from "@/i18n/config";
import { useSectionReveal, sectionRevealClasses } from "@/hooks/useSectionReveal";
import { getMessages } from "@/i18n/messages";
import { cn } from "@/lib/utils";

const NEWSLETTER_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&h=900&q=80";

export default function AboutNewsletterSection({ locale }: { locale: Locale }) {
  const { ref, isVisible } = useSectionReveal();
  const m = getMessages(locale).aboutUs.newsletter;
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success(m.toastThanks);
    setEmail("");
  }

  return (
    <section ref={ref} className="pb-16 pt-4 md:pb-24" aria-labelledby="newsletter-heading">
      <div className="mx-auto max-w-6xl px-4">
        <div
          className={cn(
            "overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-black/5 md:grid md:min-h-[320px] md:grid-cols-2",
            sectionRevealClasses.transition,
            isVisible ? sectionRevealClasses.visible : sectionRevealClasses.hidden,
          )}
        >
          <div className="order-2 flex flex-col justify-center px-6 py-10 md:order-1 md:px-10 md:py-12 lg:px-14">
            <p className="flex items-center gap-2 text-sm font-bold text-[#2E7D32]">
              <Mail className="h-4 w-4" aria-hidden />
              {m.label}
            </p>
            <h2
              id="newsletter-heading"
              className="mt-3 font-serif text-2xl font-bold tracking-tight text-neutral-990 md:text-3xl"
            >
              {m.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600 md:text-base">{m.description}</p>
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <label htmlFor="about-newsletter-email" className="sr-only">
                Email
              </label>
              <input
                id="about-newsletter-email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={m.placeholder}
                className="min-h-11 flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none ring-offset-2 placeholder:text-neutral-400 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/30"
              />
              <button
                type="submit"
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-[#2E7D32] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#256628]"
              >
                {m.submit}
              </button>
            </form>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-neutral-400" aria-hidden />
                {m.trustNoSpam}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5 text-neutral-400" aria-hidden />
                {m.trustUnsubscribe}
              </span>
            </div>
          </div>
          <div className="relative order-1 min-h-[220px] md:order-2 md:min-h-0">
            <Image
              src={NEWSLETTER_IMAGE}
              alt={m.imageAlt}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
