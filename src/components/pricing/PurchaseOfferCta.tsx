"use client";

import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/LocaleProvider";
import { useAuthUser } from "@/hooks/use-auth-user";
import type { PurchasePlanId } from "@/lib/i18n/purchase-catalog";
import { getPurchaseOfferHref } from "@/lib/navigation/purchase-offer";

type PurchaseOfferCtaProps = {
  planId: PurchasePlanId;
  featured?: boolean;
};

export function PurchaseOfferCta({ planId, featured = false }: PurchaseOfferCtaProps) {
  const { t } = useLocale();
  const user = useAuthUser();

  const className = `purchase-offer__cta w-full !rounded-2xl !px-4 !py-3 !text-sm ${
    featured ? "" : "!border-white/15 !bg-white/[0.04]"
  }`;

  const label = featured
    ? t("purchase.chooseOfferFeatured")
    : t("purchase.chooseOffer");

  if (user === undefined) {
    return (
      <span
        className={`${className} inline-flex min-h-[44px] animate-pulse items-center justify-center bg-white/10`}
        aria-hidden
      />
    );
  }

  return (
    <Button
      href={getPurchaseOfferHref(planId, !!user)}
      variant={featured ? "primary" : "secondary"}
      className={className}
    >
      {label}
    </Button>
  );
}
