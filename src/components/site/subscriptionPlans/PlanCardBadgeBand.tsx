"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/** Must stay in sync with `NOTCH_TOP_PATH` vertical wall x in viewBox 0–400 */
const VIEWBOX_W = 400;
const NOTCH_WALL_X = 286;
/** Minimum gap between mint step and badge (px) */
const INSET_GAP_PX = 6;

type PlanCardBadgeBandProps = {
  children: ReactNode;
};

/**
 * Reserves left space so the badge stays in the SVG notch: at least the notch
 * fraction of the band width, or enough that (bandWidth - paddingEnd - badgeWidth)
 * clears the mint edge — whichever is larger. Re-measures on resize / content.
 */
export default function PlanCardBadgeBand({ children }: PlanCardBadgeBandProps) {
  const bandRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const [paddingStartPx, setPaddingStartPx] = useState<number | null>(null);

  const measure = useCallback(() => {
    const band = bandRef.current;
    const badge = badgeRef.current;
    if (!band || !badge) return;

    const w = band.getBoundingClientRect().width;
    if (w <= 0) return;

    const notchMinPx = (NOTCH_WALL_X / VIEWBOX_W) * w + INSET_GAP_PX;
    const pe = parseFloat(getComputedStyle(band).paddingInlineEnd) || 12;
    const bw = badge.getBoundingClientRect().width;

    // Enough left reserve so badge’s left edge ≥ notch line; or shrink reserve when badge is narrow
    const psPx = Math.max(notchMinPx, w - bw - pe);
    setPaddingStartPx(psPx);
  }, []);

  useLayoutEffect(() => {
    measure();
    const id = requestAnimationFrame(() => measure());

    const band = bandRef.current;
    const badge = badgeRef.current;
    if (!band) return;

    const ro = new ResizeObserver(() => {
      measure();
      requestAnimationFrame(() => measure());
    });
    ro.observe(band);
    if (badge) ro.observe(badge);

    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return (
    <div
      ref={bandRef}
      className="pointer-events-auto absolute inset-x-0 top-0 flex justify-end pt-2 pe-3 sm:pe-4"
      style={
        paddingStartPx != null
          ? { paddingInlineStart: paddingStartPx }
          : {
              // SSR / first paint: match SVG notch until JS measures
              paddingInlineStart: `calc(${NOTCH_WALL_X} / ${VIEWBOX_W} * 100% + ${INSET_GAP_PX}px)`,
            }
      }
    >
      <div
        ref={badgeRef}
        className="min-w-0 w-max max-w-full text-right"
        role="status"
      >
        {children}
      </div>
    </div>
  );
}
