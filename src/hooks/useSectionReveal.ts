"use client";

import { useEffect, useRef, useState } from "react";

/** Same observer behavior as site sections (e.g. FarmersSection). */
export function useSectionReveal() {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
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

  return { ref, isVisible };
}

export const sectionRevealClasses = {
  visible: "translate-y-0 opacity-100",
  hidden: "translate-y-4 opacity-0",
  transition: "transition-all duration-700 ease-out",
} as const;
