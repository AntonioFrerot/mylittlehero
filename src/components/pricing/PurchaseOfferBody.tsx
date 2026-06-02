import type { PurchasePlan } from "@/lib/i18n/purchase-catalog";
import { PurchaseOfferCta } from "@/components/pricing/PurchaseOfferCta";
import { createTranslator } from "@/lib/i18n/translator";
import type { LocaleCode } from "@/lib/i18n/locales";

const FEATURE_ICONS = [
  <svg
    key="duration"
    viewBox="0 0 24 24"
    className="purchase-offer__feature-icon-svg"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
    <path
      d="M12 8v4.2l2.6 1.6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>,
  <svg
    key="spark"
    viewBox="0 0 24 24"
    className="purchase-offer__feature-icon-svg"
    aria-hidden="true"
  >
    <path
      d="M12 3.5 13.8 10l6.2 1.8-6.2 1.8L12 20.5 10.2 13.7 4 12l6.2-1.8L12 3.5Z"
      fill="currentColor"
    />
  </svg>,
  <svg
    key="fast"
    viewBox="0 0 24 24"
    className="purchase-offer__feature-icon-svg"
    aria-hidden="true"
  >
    <path d="M13 2 5 13.5h6.5L11 22l8-11.5H12.5L13 2Z" fill="currentColor" />
  </svg>,
] as const;

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
              <p className="purchase-offer__per-film">{plan.perFilmPrice}</p>
            </div>
          </div>
        </>
      )}

      <ul className="purchase-offer__features">
        {plan.features.map((feature, index) => (
          <li key={feature} className="purchase-offer__feature">
            <span className="purchase-offer__feature-icon" aria-hidden>{FEATURE_ICONS[index] ?? "✓"}</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <PurchaseOfferCta planId={plan.id} featured={featured} />
    </>
  );
}
