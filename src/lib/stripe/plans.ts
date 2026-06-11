import type { PurchasePlanId } from "@/lib/i18n/purchase-catalog";
import type { PricingPlanId } from "@/lib/i18n/pricing-catalog";

export type CheckoutPlanType = "purchase" | "subscription";

export type CheckoutPlanId = PurchasePlanId | PricingPlanId;

const PURCHASE_PRICE_ENV: Record<PurchasePlanId, string> = {
  "film-5min": "STRIPE_PRICE_FILM_5MIN",
  "film-10min": "STRIPE_PRICE_FILM_10MIN",
  "pack-3films": "STRIPE_PRICE_PACK_3FILMS",
};

const SUBSCRIPTION_PRICE_ENV: Record<PricingPlanId, string> = {
  "standard-monthly": "STRIPE_PRICE_STANDARD_MONTHLY",
  "standard-yearly": "STRIPE_PRICE_STANDARD_YEARLY",
  "unlimited-monthly": "STRIPE_PRICE_UNLIMITED_MONTHLY",
  "unlimited-yearly": "STRIPE_PRICE_UNLIMITED_YEARLY",
};

export function getStripePriceId(
  planType: CheckoutPlanType,
  planId: CheckoutPlanId
): string | undefined {
  const envKey =
    planType === "purchase"
      ? PURCHASE_PRICE_ENV[planId as PurchasePlanId]
      : SUBSCRIPTION_PRICE_ENV[planId as PricingPlanId];

  const value = process.env[envKey]?.trim();
  return value || undefined;
}

export function isValidCheckoutPlan(
  planType: CheckoutPlanType,
  planId: string
): planId is CheckoutPlanId {
  if (planType === "purchase") {
    return planId in PURCHASE_PRICE_ENV;
  }
  return planId in SUBSCRIPTION_PRICE_ENV;
}
