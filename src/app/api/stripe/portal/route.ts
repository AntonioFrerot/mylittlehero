import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import { findStripeCustomerIdByEmail } from "@/lib/stripe/customer";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";
import { getSiteUrl } from "@/lib/stripe/site-url";
import { hasActiveSubscriptionForUser } from "@/lib/purchases/has-active-subscription";
import { findUserByEmail } from "@/lib/auth/users-store";
import { monEspaceSectionPath } from "@/lib/espace/sections";
import {
  findActiveStripeSubscription,
  isWithinCommitmentPeriod,
  resolveCommitmentEndUnix,
  resolvePortalConfigurationId,
} from "@/lib/stripe/subscriptions";
import { isCommitmentSubscriptionPlan } from "@/lib/stripe/subscription-commitment";

export const runtime = "nodejs";

export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "La gestion d'abonnement n'est pas encore disponible. Réessayez plus tard.",
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
      { error: "Aucun abonnement actif à gérer." },
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

  const baseUrl = getSiteUrl();
  const stripe = getStripe();

  const subscription = await findActiveStripeSubscription(customerId);
  let commitmentActive = false;

  if (
    subscription &&
    isCommitmentSubscriptionPlan(user.subscriptionPlanId) &&
    user.subscriptionPlanId
  ) {
    const commitmentEndUnix = resolveCommitmentEndUnix(
      subscription,
      user.subscriptionPlanId
    );
    commitmentActive = Boolean(
      commitmentEndUnix && isWithinCommitmentPeriod(commitmentEndUnix)
    );
  }

  const configuration = resolvePortalConfigurationId(commitmentActive);

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}${monEspaceSectionPath("profil")}`,
    ...(configuration ? { configuration } : {}),
  });

  if (!portalSession.url) {
    return NextResponse.json(
      { error: "Impossible d'ouvrir la page de gestion." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: portalSession.url });
}
