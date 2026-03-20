import type { Locale } from "@/i18n/config";
import { enMessages } from "./en";
import { myMessages } from "./my";

export type AppMessages = typeof enMessages | typeof myMessages;

export function getMessages(locale: Locale): AppMessages {
  return locale === "my" ? myMessages : enMessages;
}

