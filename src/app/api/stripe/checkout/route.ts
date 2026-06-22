import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";
import {
  getStripePriceId,
  isValidCheckoutPlan,
  type CheckoutPlanType,
} from "@/lib/stripe/plans";
import { getSiteUrl } from "@/lib/stripe/site-url";

export const runtime = "nodejs";

type CheckoutBody = {
  planId?: string;
  planType?: CheckoutPlanType;
  withdrawalWaiverAccepted?: boolean;
};

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Le paiement n'est pas encore configuré sur ce site. Réessayez plus tard.",
      },
      { status: 503 }
    );
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Vous devez être connecté pour payer." },
      { status: 401 }
    );
  }

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const planType = body.planType;
  const planId = body.planId?.trim();

  if (!planType || !planId || !isValidCheckoutPlan(planType, planId)) {
    return NextResponse.json({ error: "Offre invalide." }, { status: 400 });
  }

  if (body.withdrawalWaiverAccepted !== true) {
    return NextResponse.json(
      {
        error:
          "Vous devez accepter la renonciation au droit de rétractation pour continuer.",
      },
      { status: 400 }
    );
  }

  const waiverAcceptedAt = new Date().toISOString();

  const priceId = getStripePriceId(planType, planId);
  if (!priceId) {
    return NextResponse.json(
      {
        error:
          "Cette offre n'est pas encore disponible au paiement. Contactez le support.",
      },
      { status: 503 }
    );
  }

  const baseUrl = getSiteUrl();
  const returnPath = planType === "purchase" ? "/achat" : "/creer";
  const stripe = getStripe();

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: planType === "purchase" ? "payment" : "subscription",
    customer_email: session.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}${returnPath}/succes?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}${returnPath}?paiement=annule`,
    metadata: {
      userEmail: session.email,
      planId,
      planType,
      withdrawalWaiverAccepted: "true",
      withdrawalWaiverAt: waiverAcceptedAt,
    },
    locale: "fr",
  });

  if (!checkoutSession.url) {
    return NextResponse.json(
      { error: "Impossible de démarrer le paiement." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: checkoutSession.url });
}
