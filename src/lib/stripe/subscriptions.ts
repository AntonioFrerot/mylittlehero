import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import {
  getCommitmentEndUnix,
  isCommitmentSubscriptionPlan,
} from "@/lib/stripe/subscription-commitment";

export async function findActiveStripeSubscription(
  customerId: string
): Promise<Stripe.Subscription | null> {
  const stripe = getStripe();
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 1,
  });

  return subscriptions.data[0] ?? null;
}

export function resolveCommitmentEndUnix(
  subscription: Stripe.Subscription,
  planId: string | null | undefined
): number | null {
  if (!isCommitmentSubscriptionPlan(planId)) return null;

  const metadataEnd = Number(subscription.metadata?.commitmentEndUnix);
  if (Number.isFinite(metadataEnd) && metadataEnd > 0) {
    return metadataEnd;
  }

  return getCommitmentEndUnix(subscription.start_date);
}

export function isWithinCommitmentPeriod(
  commitmentEndUnix: number,
  nowUnix = Math.floor(Date.now() / 1000)
): boolean {
  return nowUnix < commitmentEndUnix;
}

export function resolvePortalConfigurationId(
  commitmentActive: boolean
): string | undefined {
  if (commitmentActive) {
    return process.env.STRIPE_PORTAL_CONFIG_NO_CANCEL?.trim() || undefined;
  }

  return process.env.STRIPE_PORTAL_CONFIG_WITH_CANCEL?.trim() || undefined;
}
