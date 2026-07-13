import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import { findUserByEmail } from "@/lib/auth/users-store";
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
import { getUserLocale } from "@/lib/auth/users-store";

export const runtime = "nodejs";

export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "La résiliation n'est pas encore disponible. Réessayez plus tard.",
      },
      { status: 503 }
    );
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Vous devez être connecté." },
      { status: 401 }
    );
  }

  const user = await findUserByEmail(session.email);
  if (
    !user ||
    !hasActiveSubscriptionForUser({
      email: user.email,
      subscriptionPlanId: user.subscriptionPlanId,
    })
  ) {
    return NextResponse.json(
      { error: "Aucun abonnement actif à résilier." },
      { status: 400 }
    );
  }

  const customerId = await findStripeCustomerIdByEmail(session.email);
  if (!customerId) {
    return NextResponse.json(
      {
        error:
          "Compte de facturation introuvable. Contactez le support si le problème persiste.",
      },
      { status: 404 }
    );
  }

  const subscription = await findActiveStripeSubscription(customerId);
  if (!subscription) {
    return NextResponse.json(
      { error: "Abonnement Stripe introuvable." },
      { status: 404 }
    );
  }

  const stripe = getStripe();
  const locale = await getUserLocale(session.email);
  const localeTag = locale === "fr" ? "fr" : "en";

  if (isCommitmentSubscriptionPlan(user.subscriptionPlanId)) {
    const commitmentEndUnix = resolveCommitmentEndUnix(
      subscription,
      user.subscriptionPlanId
    );

    if (!commitmentEndUnix) {
      return NextResponse.json(
        { error: "Impossible de déterminer la fin de l'engagement." },
        { status: 500 }
      );
    }

    if (isWithinCommitmentPeriod(commitmentEndUnix)) {
      const alreadyScheduled =
        subscription.cancel_at === commitmentEndUnix ||
        (subscription.cancel_at_period_end &&
          subscription.current_period_end >= commitmentEndUnix);

      if (!alreadyScheduled) {
        await stripe.subscriptions.update(subscription.id, {
          cancel_at_period_end: false,
          cancel_at: commitmentEndUnix,
          metadata: {
            ...subscription.metadata,
            commitmentEndUnix: String(commitmentEndUnix),
          },
        });
      }

      return NextResponse.json({
        mode: "commitment",
        effectiveDate: formatCommitmentEndDate(commitmentEndUnix, localeTag),
        effectiveUnix: commitmentEndUnix,
        alreadyScheduled,
      });
    }
  }

  if (subscription.cancel_at_period_end) {
    return NextResponse.json({
      mode: "period_end",
      effectiveDate: formatCommitmentEndDate(
        subscription.current_period_end,
        localeTag
      ),
      effectiveUnix: subscription.current_period_end,
      alreadyScheduled: true,
    });
  }

  const updated = await stripe.subscriptions.update(subscription.id, {
    cancel_at_period_end: true,
    cancel_at: null,
  });

  return NextResponse.json({
    mode: "period_end",
    effectiveDate: formatCommitmentEndDate(
      updated.current_period_end,
      localeTag
    ),
    effectiveUnix: updated.current_period_end,
    alreadyScheduled: false,
  });
}
