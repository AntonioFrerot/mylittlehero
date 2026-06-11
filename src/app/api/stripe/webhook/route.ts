import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { updateUserSubscription } from "@/lib/auth/users-store";
import {
  grantFilmCreditsFromPurchase,
  isCheckoutSessionProcessed,
  markCheckoutSessionProcessed,
} from "@/lib/purchases/credits";
import type { PurchasePlanId } from "@/lib/i18n/purchase-catalog";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";

export const runtime = "nodejs";

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const sessionId = session.id;
  if (!sessionId) return;

  if (await isCheckoutSessionProcessed(sessionId)) {
    return;
  }

  const planId = session.metadata?.planId;
  const planType = session.metadata?.planType;
  const userEmail =
    session.metadata?.userEmail ?? session.customer_email ?? session.customer_details?.email;

  if (!planId || !planType || !userEmail) {
    console.error("[stripe/webhook] Missing metadata on checkout session", sessionId);
    return;
  }

  await markCheckoutSessionProcessed({
    sessionId,
    userEmail,
    planId,
    planType: planType === "subscription" ? "subscription" : "purchase",
  });

  if (planType === "subscription") {
    await updateUserSubscription(userEmail, planId);
    return;
  }

  await grantFilmCreditsFromPurchase({
    userEmail,
    planId: planId as PurchasePlanId,
    stripeSessionId: sessionId,
  });
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    console.error("[stripe/webhook] Signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutCompleted(session);
  }

  return NextResponse.json({ received: true });
}
