import type { PricingPlanId } from "@/lib/i18n/pricing-catalog";

export const SUBSCRIPTION_COMMITMENT_MONTHS = 12;

export const COMMITMENT_SUBSCRIPTION_PLAN_IDS = [
  "standard-yearly",
  "unlimited-yearly",
] as const satisfies readonly PricingPlanId[];

export type CommitmentSubscriptionPlanId =
  (typeof COMMITMENT_SUBSCRIPTION_PLAN_IDS)[number];

export function isCommitmentSubscriptionPlan(
  planId: string | null | undefined
): planId is CommitmentSubscriptionPlanId {
  return Boolean(
    planId &&
      (COMMITMENT_SUBSCRIPTION_PLAN_IDS as readonly string[]).includes(planId)
  );
}

export function getCommitmentEndUnix(
  startUnix: number,
  months = SUBSCRIPTION_COMMITMENT_MONTHS
): number {
  const date = new Date(startUnix * 1000);
  date.setMonth(date.getMonth() + months);
  return Math.floor(date.getTime() / 1000);
}

export function formatCommitmentEndDate(
  unixSeconds: number,
  locale: "fr" | "en"
): string {
  const tag = locale === "fr" ? "fr-FR" : "en-GB";
  return new Date(unixSeconds * 1000).toLocaleDateString(tag, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
