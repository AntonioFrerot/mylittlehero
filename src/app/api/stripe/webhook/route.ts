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
import {
  isWithinCommitmentPeriod,
  resolveCommitmentEndUnix,
} from "@/lib/stripe/subscriptions";
import {
  getCommitmentEndUnix,
  isCommitmentSubscriptionPlan,
} from "@/lib/stripe/subscription-commitment";

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

async function handleSubscriptionUpdated(
  stripe: ReturnType<typeof getStripe>,
  subscription: Stripe.Subscription,
  previousAttributes: Partial<Stripe.Subscription> | undefined
) {
  const planId = subscription.metadata?.planId;
  if (!isCommitmentSubscriptionPlan(planId)) return;

  const commitmentEndUnix = resolveCommitmentEndUnix(subscription, planId);
  if (!commitmentEndUnix || !isWithinCommitmentPeriod(commitmentEndUnix)) {
    return;
  }

  const earlyCancelRequested =
    subscription.cancel_at_period_end &&
    previousAttributes?.cancel_at_period_end === false;

  if (!earlyCancelRequested) return;

  await stripe.subscriptions.update(subscription.id, {
    cancel_at_period_end: false,
    proration_behavior: "none",
  });

  await stripe.subscriptions.update(subscription.id, {
    cancel_at: commitmentEndUnix,
    proration_behavior: "none",
    metadata: {
      ...subscription.metadata,
      commitmentEndUnix: String(commitmentEndUnix),
    },
  });
}

async function stampCommitmentMetadata(
  stripe: ReturnType<typeof getStripe>,
  session: Stripe.Checkout.Session,
  planId: string
) {
  if (!isCommitmentSubscriptionPlan(planId)) return;

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const commitmentEndUnix = getCommitmentEndUnix(subscription.start_date);

  await stripe.subscriptions.update(subscriptionId, {
    cancel_at: null,
    cancel_at_period_end: false,
    metadata: {
      ...subscription.metadata,
      planId,
      commitmentMonths: subscription.metadata?.commitmentMonths ?? "12",
      commitmentEndUnix: String(commitmentEndUnix),
    },
  });
}

async function handleCheckoutCompleted(
  stripe: ReturnType<typeof getStripe>,
  session: Stripe.Checkout.Session
) {
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
    await stampCommitmentMetadata(stripe, session, planId);
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
    await handleCheckoutCompleted(stripe, session);
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const previousAttributes = event.data.previous_attributes as
      | Partial<Stripe.Subscription>
      | undefined;

    if (subscription.status === "canceled") {
      await handleSubscriptionEnded(stripe, subscription);
    } else {
      await handleSubscriptionUpdated(stripe, subscription, previousAttributes);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await handleSubscriptionEnded(stripe, subscription);
  }

  return NextResponse.json({ received: true });
}
