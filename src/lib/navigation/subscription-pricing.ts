export const ABONNEMENTS_PRICING_PATH = "/abonnements" as const;

export const TARIFS_PRICING_PATHS = [ABONNEMENTS_PRICING_PATH] as const;

export type TarifsPricingPath = (typeof TARIFS_PRICING_PATHS)[number];

export const SUBSCRIPTION_PRICING_PATHS = [
  "/creer",
  ABONNEMENTS_PRICING_PATH,
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

export function resolveTarifsPricingPath(
  _pathname: string
): TarifsPricingPath {
  return ABONNEMENTS_PRICING_PATH;
}

export function resolveSubscriptionPricingPath(
  pathname: string
): SubscriptionPricingPath {
  if (matchesPricingPath(pathname, ABONNEMENTS_PRICING_PATH)) {
    return ABONNEMENTS_PRICING_PATH;
  }
  return "/creer";
}

export function resolvePurchasePricingPath(pathname: string): PurchasePricingPath {
  if (matchesPricingPath(pathname, ABONNEMENTS_PRICING_PATH)) {
    return ABONNEMENTS_PRICING_PATH;
  }
  return "/achat";
}
