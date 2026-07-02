import type { CheckoutPlanId, CheckoutPlanType } from "@/lib/stripe/plans";
import type { SubscriptionPricingPath, PurchasePricingPath } from "@/lib/navigation/subscription-pricing";

type CheckoutSessionResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function requestCheckoutSession(input: {
  planId: CheckoutPlanId;
  planType: CheckoutPlanType;
  returnPath?: SubscriptionPricingPath | PurchasePricingPath;
}): Promise<CheckoutSessionResult> {
  const response = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as { url?: string; error?: string };

  if (!response.ok || !data.url) {
    return { ok: false, error: data.error ?? "checkout.error" };
  }

  return { ok: true, url: data.url };
}
