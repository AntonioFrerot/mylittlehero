import type { PurchasePlan } from "@/lib/i18n/purchase-catalog";
import { PurchaseOfferCta } from "@/components/pricing/PurchaseOfferCta";
import { createTranslator } from "@/lib/i18n/translator";
import type { LocaleCode } from "@/lib/i18n/locales";

const FEATURE_ICONS = ["⏱", "✦", "⚡"] as const;

type PurchaseOfferBodyProps = {
  plan: PurchasePlan;
  locale: LocaleCode;
  /** Masque les infos déjà visibles dans l’en-tête mobile replié */
  hidePeekSummary?: boolean;
};

export function PurchaseOfferBody({
  plan,
  locale,
  hidePeekSummary = false,
}: PurchaseOfferBodyProps) {
  const t = createTranslator(locale);
  const featured = plan.highlighted;

  const filmsWord =
    plan.filmCount > 1 ? t("purchase.filmsWord") : t("purchase.filmWord");

  return (
    <>
      {hidePeekSummary ? (
        <p className="purchase-offer__subtitle purchase-offer__subtitle--expand-only">
          {plan.subtitle}
        </p>
      ) : (
        <>
          <header className="purchase-offer__head">
            <p className="purchase-offer__eyebrow">{plan.eyebrow}</p>
            <h3 className="purchase-offer__title">
              <span className="purchase-offer__title-num">{plan.filmCount}</span>{" "}
              <span>{filmsWord}</span>
            </h3>
            <p className="purchase-offer__subtitle">{plan.subtitle}</p>
          </header>

          <div className="purchase-offer__hero">
            <div className="purchase-offer__duration">
              <span className="purchase-offer__duration-value">
                {plan.durationShort}
              </span>
            </div>

            <div className="purchase-offer__price-block">
              <p className="purchase-offer__price">{plan.price}</p>
              {plan.perFilmPrice && (
                <p className="purchase-offer__per-film">
                  {t("purchase.perFilm", { price: plan.perFilmPrice })}
                </p>
              )}
            </div>
          </div>
        </>
      )}

      <ul className="purchase-offer__features">
        {plan.features.map((feature, index) => (
          <li key={feature} className="purchase-offer__feature">
            <span className="purchase-offer__feature-icon" aria-hidden>
              {FEATURE_ICONS[index] ?? "✓"}
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <PurchaseOfferCta planId={plan.id} featured={featured} />
    </>
  );
}
