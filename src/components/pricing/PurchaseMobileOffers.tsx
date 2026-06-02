import type { PurchasePlan, PurchasePlanId } from "@/lib/i18n/purchase-catalog";
import { PurchaseOfferBody } from "@/components/pricing/PurchaseOfferBody";
import { createTranslator } from "@/lib/i18n/translator";
import type { LocaleCode } from "@/lib/i18n/locales";
import {
  SURFACE_3D_PURCHASE_BANNER,
  SURFACE_3D_PURCHASE_MOBILE_SHELL,
  SURFACE_3D_PURCHASE_MOBILE_SHELL_FEATURED,
} from "@/lib/ui/button-3d-classes";

const PLAN_ACCENT: Record<PurchasePlanId, string> = {
  "film-5min": "amber",
  "film-10min": "violet",
  "pack-3films": "gold",
};

const PLAN_OFFER_CLASS: Record<PurchasePlanId, string> = {
  "film-5min": "purchase-offer--amber",
  "film-10min": "purchase-offer--violet",
  "pack-3films": "purchase-offer--gold",
};

type PurchaseMobileOffersProps = {
  plans: PurchasePlan[];
  locale: LocaleCode;
};

function MobileOfferItem({
  plan,
  locale,
}: {
  plan: PurchasePlan;
  locale: LocaleCode;
}) {
  const t = createTranslator(locale);
  const featured = plan.highlighted;
  const accent = PLAN_ACCENT[plan.id];
  const filmsWord =
    plan.filmCount > 1 ? t("purchase.filmsWord") : t("purchase.filmWord");

  return (
    <article
      className={`purchase-mobile-offer purchase-mobile-offer--${accent} ${
        featured ? "purchase-mobile-offer--featured" : ""
      }`}
    >
      <div
        className={
          featured
            ? SURFACE_3D_PURCHASE_MOBILE_SHELL_FEATURED
            : SURFACE_3D_PURCHASE_MOBILE_SHELL
        }
      >
        {featured && plan.promoLabel && (
          <div className={SURFACE_3D_PURCHASE_BANNER}>{plan.promoLabel}</div>
        )}

        <div className="purchase-mobile-offer__header">
          <div className="purchase-mobile-offer__peek-left">
            <div className="purchase-mobile-offer__peek-title-row">
              <p className="purchase-mobile-offer__films-line">
                <span className="purchase-mobile-offer__count">
                  {plan.filmCount}
                </span>{" "}
                {filmsWord}
              </p>
              <div className="purchase-mobile-offer__duration-rail" aria-hidden>
                <span className="purchase-mobile-offer__duration-rail-value">
                  {plan.durationShort}
                </span>
              </div>
            </div>
            <p className="purchase-mobile-offer__eyebrow">{plan.eyebrow}</p>
          </div>

          <div className="purchase-mobile-offer__peek-price-block">
            <p className="purchase-mobile-offer__peek-price">{plan.price}</p>
            <p className="purchase-mobile-offer__peek-per-film">{plan.perFilmPrice}</p>
          </div>
        </div>

        <div className="purchase-mobile-offer__body">
          <div
            className={`purchase-offer ${PLAN_OFFER_CLASS[plan.id]} ${
              featured ? "purchase-offer--featured" : ""
            } purchase-offer--embedded`}
          >
            <div className="purchase-offer__inner purchase-offer__inner--embedded">
              <div className="purchase-offer__content">
                <PurchaseOfferBody
                  plan={plan}
                  locale={locale}
                  hidePeekSummary
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function PurchaseMobileOffers({
  plans,
  locale,
}: PurchaseMobileOffersProps) {
  return (
    <div className="purchase-mobile-offers">
      {plans.map((plan) => (
        <MobileOfferItem key={plan.id} plan={plan} locale={locale} />
      ))}
    </div>
  );
}
