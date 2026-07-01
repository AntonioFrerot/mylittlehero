import type { PurchasePlan, AchatPurchasePlanId } from "@/lib/i18n/purchase-catalog";
import { PurchaseOfferBody } from "@/components/pricing/PurchaseOfferBody";
import type { LocaleCode } from "@/lib/i18n/locales";
import {
  SURFACE_3D_PURCHASE_BANNER,
  SURFACE_3D_PURCHASE_INNER,
  SURFACE_3D_PURCHASE_INNER_FEATURED,
} from "@/lib/ui/button-3d-classes";

const PLAN_ACCENT: Record<AchatPurchasePlanId, string> = {
  "film-5min": "purchase-offer--amber",
  "film-10min": "purchase-offer--violet",
  "pack-3films": "purchase-offer--gold",
};

type PurchaseCardProps = {
  plan: PurchasePlan;
  locale: LocaleCode;
};

export function PurchaseCard({ plan, locale }: PurchaseCardProps) {
  const featured = plan.highlighted;
  const accentClass = PLAN_ACCENT[plan.id];

  return (
    <article
      className={`purchase-offer ${accentClass} ${
        featured ? "purchase-offer--featured" : ""
      }`}
    >
      <div
        className={
          featured ? SURFACE_3D_PURCHASE_INNER_FEATURED : SURFACE_3D_PURCHASE_INNER
        }
      >
        {featured && plan.promoLabel && (
          <div className={SURFACE_3D_PURCHASE_BANNER}>{plan.promoLabel}</div>
        )}

        <div className="purchase-offer__content">
          <PurchaseOfferBody plan={plan} locale={locale} />
        </div>
      </div>
    </article>
  );
}
