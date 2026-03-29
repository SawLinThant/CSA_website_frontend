import { notFound, redirect } from "next/navigation";
import { isBackendRequestError } from "@/lib/server/backendClient";
import type { Locale } from "@/i18n/config";

/** Turn typical farmer API failures into navigation; rethrow the rest (e.g. 5xx). */
export function handleFarmerBackendFailure(e: unknown, locale: Locale): never {
  if (isBackendRequestError(e)) {
    if (e.status === 401) redirect(`/${locale}`);
    if (e.status === 404) notFound();
  }
  throw e;
}
