import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import { findStripeCustomerIdByEmail } from "@/lib/stripe/customer";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";
import { getSiteUrl } from "@/lib/stripe/site-url";
import { hasActiveSubscriptionForUser } from "@/lib/purchases/has-active-subscription";
import { findUserByEmail } from "@/lib/auth/users-store";
import { monEspaceSectionPath } from "@/lib/espace/sections";

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

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}${monEspaceSectionPath("profil")}`,
  });

  if (!portalSession.url) {
    return NextResponse.json(
      { error: "Impossible d'ouvrir la page de gestion." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: portalSession.url });
}
