import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { updateUserSubscription } from "@/lib/auth/users-store";
import {
  grantTicketsFromPurchase,
  isCheckoutSessionProcessed,
  markCheckoutSessionProcessed,
} from "@/lib/purchases/tickets";
import type { PurchasePlanId } from "@/lib/i18n/purchase-catalog";
import { isJetonPurchasePlanId } from "@/lib/i18n/purchase-catalog";
import { grantJetonsFromPurchase } from "@/lib/purchases/jetons";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";

export const runtime = "nodejs";

async function resolveCustomerEmail(
  stripe: ReturnType<typeof getStripe>,
  customerId: string
): Promise<string | null> {
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) return null;
  return customer.email?.trim() || null;
}

async function handleSubscriptionEnded(
  stripe: ReturnType<typeof getStripe>,
  subscription: Stripe.Subscription
) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId) return;

  const userEmail = await resolveCustomerEmail(stripe, customerId);
  if (!userEmail) return;

  await updateUserSubscription(userEmail, null);
}

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

  if (isJetonPurchasePlanId(planId)) {
    await grantJetonsFromPurchase({
      userEmail,
      planId,
      stripeSessionId: sessionId,
    });
    return;
  }

  await grantTicketsFromPurchase({
    userEmail,
    planId: planId as Exclude<PurchasePlanId, "jeton-1">,
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

  if (
    event.type === "customer.subscription.deleted" ||
    (event.type === "customer.subscription.updated" &&
      (event.data.object as Stripe.Subscription).status === "canceled")
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    await handleSubscriptionEnded(stripe, subscription);
  }

  return NextResponse.json({ received: true });
}
