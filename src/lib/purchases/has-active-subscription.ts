import { normalizeEmail } from "@/lib/db/normalize-email";
import type { PricingPlanId } from "@/lib/i18n/pricing-catalog";
import { isPricingPlanId } from "@/lib/purchases/subscription-tier";

export function resolveSubscriptionPlanId(input: {
  email?: string;
  subscriptionPlanId?: string | null;
}): string | null {
  void input.email;
  if (input.subscriptionPlanId?.trim()) {
    return input.subscriptionPlanId.trim();
  }
  return null;
}

export function hasActiveSubscriptionForUser(input: {
  email?: string;
  subscriptionPlanId?: string | null;
}): boolean {
  return Boolean(resolveSubscriptionPlanId(input));
}

export const ADMIN_SUBSCRIPTION_SIMULATOR_PLANS: PricingPlanId[] = [
  "standard-monthly",
  "unlimited-monthly",
];

export function isAdminSubscriptionSimulatorPlan(
  value: string | null | undefined
): value is PricingPlanId {
  return Boolean(value && isPricingPlanId(value));
}
