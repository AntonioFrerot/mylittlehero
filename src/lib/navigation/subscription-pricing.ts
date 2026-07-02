export const TARIFS_PRICING_PATHS = ["/tarifs", "/abonnements"] as const;

export type TarifsPricingPath = (typeof TARIFS_PRICING_PATHS)[number];

export const SUBSCRIPTION_PRICING_PATHS = [
  "/creer",
  ...TARIFS_PRICING_PATHS,
] as const;

export type SubscriptionPricingPath = (typeof SUBSCRIPTION_PRICING_PATHS)[number];

export type PurchasePricingPath = TarifsPricingPath | "/achat";

function matchesPricingPath(pathname: string, path: TarifsPricingPath): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function isTarifsPricingPath(path: string): path is TarifsPricingPath {
  return TARIFS_PRICING_PATHS.includes(path as TarifsPricingPath);
}

export function isSubscriptionPricingPath(
  path: string
): path is SubscriptionPricingPath {
  return SUBSCRIPTION_PRICING_PATHS.includes(path as SubscriptionPricingPath);
}

export function resolveTarifsPricingPath(pathname: string): TarifsPricingPath {
  if (matchesPricingPath(pathname, "/abonnements")) {
    return "/abonnements";
  }
  if (matchesPricingPath(pathname, "/tarifs")) {
    return "/tarifs";
  }
  return "/tarifs";
}

export function resolveSubscriptionPricingPath(
  pathname: string
): SubscriptionPricingPath {
  if (matchesPricingPath(pathname, "/abonnements")) {
    return "/abonnements";
  }
  if (matchesPricingPath(pathname, "/tarifs")) {
    return "/tarifs";
  }
  return "/creer";
}

export function resolvePurchasePricingPath(pathname: string): PurchasePricingPath {
  if (matchesPricingPath(pathname, "/abonnements")) {
    return "/abonnements";
  }
  if (matchesPricingPath(pathname, "/tarifs")) {
    return "/tarifs";
  }
  return "/achat";
}
