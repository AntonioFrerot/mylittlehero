import type { PurchasePlan, PurchasePlanId } from "@/lib/i18n/purchase-catalog";
import { PurchaseOfferBody } from "@/components/pricing/PurchaseOfferBody";
import type { LocaleCode } from "@/lib/i18n/locales";

const PLAN_ACCENT: Record<PurchasePlanId, string> = {
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
      <div className="purchase-offer__inner">
        {featured && plan.promoLabel && (
          <div className="purchase-offer__banner">{plan.promoLabel}</div>
        )}

        <div className="purchase-offer__content">
          <PurchaseOfferBody plan={plan} locale={locale} />
        </div>
      </div>
    </article>
  );
}
