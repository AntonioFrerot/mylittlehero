import { formatSiteMoney } from "@/lib/i18n/format-money";
import type { LocaleCode } from "@/lib/i18n/locales";

/** Montants TTC affichés sur le site (USD), alignés sur les catalogues Stripe. */
const PLAN_REVENUE_USD: Record<string, number> = {
  "film-5min": 59.99,
  "film-10min": 99.99,
  "pack-3films": 199.99,
  "ticket-1": 59.99,
  "ticket-3": 149.99,
  "ticket-10": 399.99,
  "jeton-1": 7.99,
  "standard-monthly": 39.99,
  "standard-yearly": 349.99,
  "unlimited-monthly": 119.99,
  "unlimited-yearly": 999.99,
};

export function getPlanRevenueEur(planId: string): number {
  return PLAN_REVENUE_USD[planId] ?? 0;
}

/** @deprecated Nom historique — montants en USD. */
export function formatRevenueEur(amount: number, locale: string): string {
  const code: LocaleCode = locale === "en" ? "en" : "fr";
  return formatSiteMoney(amount, code);
}
