/** Montants TTC affichés sur le site (EUR), alignés sur les catalogues Stripe. */
const PLAN_REVENUE_EUR: Record<string, number> = {
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
  return PLAN_REVENUE_EUR[planId] ?? 0;
}

export function formatRevenueEur(amount: number, locale: string): string {
  const tag = locale === "en" ? "en-GB" : "fr-FR";
  return (
    amount.toLocaleString(tag, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
}
