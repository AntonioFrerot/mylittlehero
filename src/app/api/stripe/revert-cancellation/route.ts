import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import { findUserByEmail } from "@/lib/auth/users-store";
import { findStripeCustomerIdByEmail } from "@/lib/stripe/customer";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";
import { findActiveStripeSubscription } from "@/lib/stripe/subscriptions";
import { hasActiveSubscriptionForUser } from "@/lib/purchases/has-active-subscription";

export const runtime = "nodejs";

export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Impossible de reprendre l'abonnement pour le moment. Réessayez plus tard.",
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
      { error: "Aucun abonnement actif." },
      { status: 400 }
    );
  }

  const customerId = await findStripeCustomerIdByEmail(session.email);
  if (!customerId) {
    return NextResponse.json(
      { error: "Compte de facturation introuvable." },
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

  const hasScheduledCancellation =
    Boolean(subscription.cancel_at) || subscription.cancel_at_period_end;

  if (!hasScheduledCancellation) {
    return NextResponse.json({
      alreadyActive: true,
    });
  }

  const stripe = getStripe();
  await stripe.subscriptions.update(subscription.id, {
    cancel_at_period_end: false,
    cancel_at: null,
  });

  return NextResponse.json({ ok: true });
}
