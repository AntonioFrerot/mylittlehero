import type { LocaleCode } from "./locales";

const INTL_LOCALE: Record<LocaleCode, string> = {
  fr: "fr-FR",
  en: "en-US",
  es: "es-ES",
  de: "de-DE",
  it: "it-IT",
  pt: "pt-PT",
};

/** Montants tarifs / achat — devise affichée : USD (alignée sur Stripe). */
export function formatSiteMoney(amount: number, locale: LocaleCode): string {
  const tag = INTL_LOCALE[locale] ?? "en-US";
  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}