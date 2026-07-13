import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import { findUserByEmail, getUserLocale } from "@/lib/auth/users-store";
import { findStripeCustomerIdByEmail } from "@/lib/stripe/customer";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";
import {
  findActiveStripeSubscription,
  isWithinCommitmentPeriod,
  resolveCommitmentEndUnix,
} from "@/lib/stripe/subscriptions";
import { hasActiveSubscriptionForUser } from "@/lib/purchases/has-active-subscription";
import {
  formatCommitmentEndDate,
  isCommitmentSubscriptionPlan,
} from "@/lib/stripe/subscription-commitment";

export const runtime = "nodejs";

export async function GET() {
  if (!isStripeConfigured()) {
    return NextResponse.json({ active: false });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await findUserByEmail(session.email);
  if (
    !user ||
    !hasActiveSubscriptionForUser({
      email: user.email,
      subscriptionPlanId: user.subscriptionPlanId,
    })
  ) {
    return NextResponse.json({ active: false });
  }

  const customerId = await findStripeCustomerIdByEmail(session.email);
  if (!customerId) {
    return NextResponse.json({
      active: true,
      planId: user.subscriptionPlanId,
      hasCommitment: isCommitmentSubscriptionPlan(user.subscriptionPlanId),
    });
  }

  const subscription = await findActiveStripeSubscription(customerId);
  const locale = await getUserLocale(session.email);
  const localeTag = locale === "fr" ? "fr" : "en";
  const hasCommitment = isCommitmentSubscriptionPlan(user.subscriptionPlanId);

  let commitmentEndUnix: number | null = null;
  let commitmentEndDate: string | null = null;
  let commitmentActive = false;

  if (subscription && hasCommitment && user.subscriptionPlanId) {
    commitmentEndUnix = resolveCommitmentEndUnix(
      subscription,
      user.subscriptionPlanId
    );
    if (commitmentEndUnix) {
      commitmentEndDate = formatCommitmentEndDate(commitmentEndUnix, localeTag);
      commitmentActive = isWithinCommitmentPeriod(commitmentEndUnix);
    }
  }

  let cancellationScheduled = false;
  let cancellationDate: string | null = null;
  let cancellationPreviewMode: "commitment" | "period_end" = "period_end";
  let cancellationPreviewDate: string | null = null;

  if (subscription) {
    if (subscription.cancel_at) {
      cancellationScheduled = true;
      cancellationDate = formatCommitmentEndDate(
        subscription.cancel_at,
        localeTag
      );
    } else if (subscription.cancel_at_period_end) {
      cancellationScheduled = true;
      cancellationDate = formatCommitmentEndDate(
        subscription.current_period_end,
        localeTag
      );
    }

    if (hasCommitment && commitmentEndUnix && commitmentActive) {
      cancellationPreviewMode = "commitment";
      cancellationPreviewDate = formatCommitmentEndDate(commitmentEndUnix, localeTag);
    } else {
      cancellationPreviewMode = "period_end";
      cancellationPreviewDate = formatCommitmentEndDate(
        subscription.current_period_end,
        localeTag
      );
    }
  }

  return NextResponse.json({
    active: true,
    planId: user.subscriptionPlanId,
    hasCommitment,
    commitmentActive,
    commitmentEndDate,
    cancellationScheduled,
    cancellationDate,
    cancellationPreviewMode,
    cancellationPreviewDate,
  });
}
