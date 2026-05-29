import type { PurchasePlanId } from "@/lib/i18n/purchase-catalog";
import { CREER_FILM_PATH } from "./creer-film";

export function getPurchaseOfferTarget(planId: PurchasePlanId): string {
  return `${CREER_FILM_PATH}?plan=${planId}`;
}

export function getPurchaseOfferHref(
  planId: PurchasePlanId,
  isLoggedIn: boolean
): string {
  const target = getPurchaseOfferTarget(planId);
  if (isLoggedIn) {
    return target;
  }
  return `/connexion?mode=signup&redirect=${encodeURIComponent(target)}`;
}
