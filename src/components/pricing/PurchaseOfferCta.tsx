"use client";

import { CheckoutButton } from "@/components/pricing/CheckoutButton";
import { useLocale } from "@/components/LocaleProvider";
import type { PurchasePlanId } from "@/lib/i18n/purchase-catalog";

type PurchaseOfferCtaProps = {
  planId: PurchasePlanId;
  featured?: boolean;
};

export function PurchaseOfferCta({ planId, featured = false }: PurchaseOfferCtaProps) {
  const { t } = useLocale();

  const className = `purchase-offer__cta w-full !rounded-2xl !px-4 !py-3 !text-sm ${
    featured ? "" : "!border-white/15 !bg-white/[0.04]"
  }`;

  const label = featured
    ? t("purchase.chooseOfferFeatured")
    : t("purchase.chooseOffer");

  return (
    <CheckoutButton
      planId={planId}
      planType="purchase"
      variant={featured ? "primary" : "secondary"}
      className={className}
    >
      {label}
    </CheckoutButton>
  );
}
