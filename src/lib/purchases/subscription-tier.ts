import type { PricingPlanId } from "@/lib/i18n/pricing-catalog";

export type SubscriptionTier = "standard" | "unlimited";
export type SubscriptionGrantPeriod = "month" | "week";

/** Crédits abonnement sur une année glissante (depuis la date d'achat). */
export const ANNUAL_SUBSCRIPTION_GRANTS: Record<SubscriptionTier, number> = {
  standard: 12,
  unlimited: 52,
};

export function getAnnualGrantCapForTier(tier: SubscriptionTier): number {
  return ANNUAL_SUBSCRIPTION_GRANTS[tier];
}

export function getSubscriptionTierFromPlanId(
  planId: string | null | undefined
): SubscriptionTier | null {
  if (!planId?.trim()) return null;
  if (planId.startsWith("standard-")) return "standard";
  if (planId.startsWith("unlimited-")) return "unlimited";
  return null;
}

export function isPricingPlanId(value: string): value is PricingPlanId {
  return (
    value === "standard-monthly" ||
    value === "standard-yearly" ||
    value === "unlimited-monthly" ||
    value === "unlimited-yearly"
  );
}

export function getGrantPeriodForTier(
  tier: SubscriptionTier
): SubscriptionGrantPeriod {
  return tier === "standard" ? "month" : "week";
}
