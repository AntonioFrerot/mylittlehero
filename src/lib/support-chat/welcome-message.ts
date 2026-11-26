import type { LocaleCode } from "@/lib/i18n/locales";
import { en } from "@/lib/i18n/messages/en";
import { fr } from "@/lib/i18n/messages/fr";

export function getSupportWelcomeMessage(locale: LocaleCode): string {
  return locale === "en" ? en.supportWidget.welcome : fr.supportWidget.welcome;
}

/** @deprecated Utiliser getSupportWelcomeMessage(locale) */
export const SUPPORT_WELCOME_MESSAGE = getSupportWelcomeMessage("fr");