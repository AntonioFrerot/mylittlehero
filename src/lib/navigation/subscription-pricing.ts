export const SUBSCRIPTION_PRICING_PATHS = ["/creer", "/tarifs"] as const;

export type SubscriptionPricingPath = (typeof SUBSCRIPTION_PRICING_PATHS)[number];

export function isSubscriptionPricingPath(
  path: string
): path is SubscriptionPricingPath {
  return SUBSCRIPTION_PRICING_PATHS.includes(path as SubscriptionPricingPath);
}

export function resolveSubscriptionPricingPath(pathname: string): SubscriptionPricingPath {
  if (pathname === "/tarifs" || pathname.startsWith("/tarifs/")) {
    return "/tarifs";
  }
  return "/creer";
}

export function resolvePurchasePricingPath(pathname: string): "/tarifs" | "/achat" {
  if (pathname === "/tarifs" || pathname.startsWith("/tarifs/")) {
    return "/tarifs";
  }
  return "/achat";
}
