import type { TarifsSubscriptionPlan } from "@/lib/i18n/tarifs-catalog";
import { CheckoutButton } from "@/components/pricing/CheckoutButton";
import { TarifsPerFilmRow } from "@/components/tarifs/TarifsPerFilmRow";
import { TarifsPlanFeatureList } from "@/components/tarifs/TarifsPlanFeatureList";
import { GoldenTicket } from "@/components/tickets/GoldenTicket";
import { createTranslator } from "@/lib/i18n/translator";
import type { LocaleCode } from "@/lib/i18n/locales";
import {
  BTN_ABONNEMENTS_GOLD_CTA,
  SURFACE_3D_TARIFS_PLAN,
  SURFACE_3D_TARIFS_PLAN_FEATURED,
} from "@/lib/ui/button-3d-classes";

type TarifsSubscriptionCardProps = {
  plan: TarifsSubscriptionPlan;
  locale: LocaleCode;
  showYearlySavings?: boolean;
  goldCheckout?: boolean;
};

function SavingsGiftIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C9 3 12 8 12 8" />
      <path d="M16.5 8a2.5 2.5 0 0 0 0-5C15 3 12 8 12 8" />
    </svg>
  );
}

export function TarifsSubscriptionCard({
  plan,
  locale,
  showYearlySavings = true,
  goldCheckout = false,
}: TarifsSubscriptionCardProps) {
  const t = createTranslator(locale);
  const isYearly = plan.billing === "yearly";

  return (
    <article
      className={`tarifs-plan-card group relative flex h-full flex-col ${
        plan.highlighted ? `tarifs-plan-card--featured ${SURFACE_3D_TARIFS_PLAN_FEATURED}` : SURFACE_3D_TARIFS_PLAN
      }`}
    >
      {(plan.tagline || plan.highlighted) && (
        <span className="tarifs-plan-card__badge">
          {plan.tagline ?? t("tarifsPage.mostPopular")}
        </span>
      )}

      <div className="tarifs-plan-card__inner flex flex-1 flex-col">
        <header className="tarifs-plan-card__header">
          <p className="tarifs-plan-card__eyebrow">
            {isYearly ? t("tarifsPage.billingYearly") : t("tarifsPage.billingMonthly")}
          </p>

          <div className="tarifs-plan-card__title-row">
            <div className="min-w-0 flex-1">
              <h3 className="tarifs-plan-card__title">{plan.name}</h3>
              <p className="tarifs-plan-card__subtitle">{plan.filmsLabel}</p>
            </div>

            <GoldenTicket
              count={plan.quotaHighlight}
              size="plan"
              className="tarifs-plan-card__ticket-quota shrink-0"
            />
          </div>
        </header>

        <div className="tarifs-plan-card__price-block">
          {isYearly && plan.yearlyBreakdown ? (
            <>
              <div className="tarifs-plan-card__price-stack">
                {showYearlySavings ? (
                  <div className="tarifs-plan-card__compare-row">
                    <span className="tarifs-plan-card__compare-price">
                      {plan.yearlyBreakdown.compareMonthlyPrice}
                    </span>
                    <span className="tarifs-plan-card__savings-pill">
                      <SavingsGiftIcon />
                      {t("tarifsPage.billingToggle.savingsBadge", {
                        percent: plan.yearlyBreakdown.savingsPercent,
                      })}
                    </span>
                  </div>
                ) : null}
                <div className="tarifs-plan-card__price-row">
                  <span className="tarifs-plan-card__price">
                    {plan.yearlyBreakdown.monthlyPrice}
                  </span>
                  <span className="tarifs-plan-card__period">
                    {t("tarifsPage.periodMonthly")}
                  </span>
                </div>
              </div>

              <p className="tarifs-plan-card__commitment-hint">
                {t("tarifsPage.yearlyCommitmentHint")}
              </p>
            </>
          ) : (
            <>
              <div className="tarifs-plan-card__price-row">
                <span className="tarifs-plan-card__price">{plan.price}</span>
                <span className="tarifs-plan-card__period">{plan.period}</span>
              </div>

              <p className="tarifs-plan-card__commitment-hint">
                {t("tarifsPage.monthlyCommitmentHint")}
              </p>
            </>
          )}

          <TarifsPerFilmRow label={plan.perFilmPrice} position="below" />
        </div>

        <TarifsPlanFeatureList features={plan.features} />

        <div className="tarifs-plan-card__spacer" aria-hidden />

        <CheckoutButton
          planId={plan.stripePlanId}
          planType="subscription"
          variant={goldCheckout || plan.highlighted ? "primary" : "secondary"}
          className={
            goldCheckout
              ? BTN_ABONNEMENTS_GOLD_CTA
              : `tarifs-plan-card__cta w-full !rounded-xl !px-4 !py-3.5 !text-sm ${
                  plan.highlighted ? "" : "!border-0 !bg-white/[0.06]"
                }`
          }
        >
          {t("tarifsPage.choosePlan")}
        </CheckoutButton>
      </div>
    </article>
  );
}
