import Link from "next/link";
import type { Locale } from "@/i18n/config";

export default function FarmerPagination({
  locale,
  pathWithoutLocale,
  page,
  totalPages,
  prevLabel,
  nextLabel,
  summary,
  hrefForPage,
}: {
  locale: Locale;
  /** Ignored when `hrefForPage` is set. */
  pathWithoutLocale: string;
  page: number;
  totalPages: number;
  prevLabel: string;
  nextLabel: string;
  summary: string;
  /** Full path including locale and query (e.g. dashboard with multiple pagination keys). */
  hrefForPage?: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) =>
    hrefForPage?.(p) ??
    `/${locale}${pathWithoutLocale}${p > 1 ? `?page=${p}` : ""}`;

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{summary}</span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={href(page - 1)}
            className="rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-muted"
          >
            {prevLabel}
          </Link>
        ) : (
          <span className="rounded-lg px-3 py-1.5 text-muted-foreground">{prevLabel}</span>
        )}
        {page < totalPages ? (
          <Link
            href={href(page + 1)}
            className="rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-muted"
          >
            {nextLabel}
          </Link>
        ) : (
          <span className="rounded-lg px-3 py-1.5 text-muted-foreground">{nextLabel}</span>
        )}
      </div>
    </div>
  );
}
