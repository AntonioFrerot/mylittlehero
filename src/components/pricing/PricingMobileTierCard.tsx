"use client";

import { useState } from "react";
import type { PricingPlan } from "@/lib/pricing";
import { getTierQuotaLabel } from "@/lib/pricing";
import { Button } from "@/components/ui/Button";
import { createTranslator } from "@/lib/i18n/translator";
import type { LocaleCode } from "@/lib/i18n/locales";

const PRICING_GOLD_HIGHLIGHTS_RE =
  /(15 films|180 films|30 films|360 films|5 minutes|10 minutes)/g;

function renderPricingFeature(feature: string) {
  const parts = feature.split(PRICING_GOLD_HIGHLIGHTS_RE);
  if (parts.length <= 1) return feature;

  return parts.map((part, index) =>
    PRICING_GOLD_HIGHLIGHTS_RE.test(part) ? (
      <span key={`${part}-${index}`} className="font-semibold text-gold-light">
        {part}
      </span>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  );
}

type PricingMobileTierCardProps = {
  monthlyPlan: PricingPlan;
  yearlyPlan: PricingPlan;
  tierLabel: string;
  ctaHref: string;
  locale: LocaleCode;
  highlighted?: boolean;
};

type BillingPeriodSwitchProps = {
  yearly: boolean;
  onChange: (yearly: boolean) => void;
  monthlyLabel: string;
  yearlyLabel: string;
};

function BillingPeriodSwitch({
  yearly,
  onChange,
  monthlyLabel,
  yearlyLabel,
}: BillingPeriodSwitchProps) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <span
        className={`text-xs font-medium leading-none transition-colors ${
          !yearly ? "text-gold-light" : "text-cream/40"
        }`}
      >
        {monthlyLabel}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={yearly}
        aria-label={yearly ? yearlyLabel : monthlyLabel}
        onClick={() => onChange(!yearly)}
        className="flex h-6 w-11 shrink-0 items-center rounded-full border border-white/15 bg-white/10 p-0.5 transition-colors hover:border-gold/30"
      >
        <span
          className={`block size-4 shrink-0 rounded-full bg-gold-light shadow-sm transition-[margin] duration-200 ease-out ${
            yearly ? "ml-auto" : "ml-0"
          }`}
        />
      </button>
      <span
        className={`text-xs font-medium leading-none transition-colors ${
          yearly ? "text-gold-light" : "text-cream/40"
        }`}
      >
        {yearlyLabel}
      </span>
    </div>
  );
}

export function PricingMobileTierCard({
  monthlyPlan,
  yearlyPlan,
  tierLabel,
  ctaHref,
  locale,
  highlighted = false,
}: PricingMobileTierCardProps) {
  const t = createTranslator(locale);
  const [yearly, setYearly] = useState(() => false);
  const plan = yearly ? yearlyPlan : monthlyPlan;

  return (
    <article
      className={`relative flex w-full flex-col rounded-2xl border p-5 ${
        highlighted
          ? "border-gold/50 bg-gradient-to-b from-cinema-surface to-cinema-night shadow-glow-gold-subtle"
          : "border-white/10 bg-cinema-surface/80"
      }`}
    >
      {highlighted && (
        <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light px-3 py-1 text-[10px] font-semibold text-cinema-black">
          {t("pricing.mostPopular")}
        </span>
      )}

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-widest text-gold/80">
            {getTierQuotaLabel(plan.tier, plan.billing, locale)}
          </p>
          <h3 className="font-display mt-1.5 text-xl font-bold leading-tight text-cream">
            {tierLabel}
          </h3>
        </div>
        <BillingPeriodSwitch
          yearly={yearly}
          onChange={setYearly}
          monthlyLabel={t("pricing.billingMonthlyShort")}
          yearlyLabel={t("pricing.billingYearlyShort")}
        />
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <div className="border-t border-white/5 pt-4">
          <span className="font-display text-3xl font-bold leading-none text-cream">
            {plan.price}
          </span>
          <span className="mt-1 block text-sm text-cream/50">
            {plan.period}
          </span>
          {plan.savingsLabel && (
            <p className="mt-3 rounded-lg border border-gold/35 bg-gold/10 px-3 py-2 text-xs font-semibold leading-snug text-gold-light">
              {plan.savingsLabel}
            </p>
          )}
        </div>

        <ul className="flex flex-col gap-2.5">
          {plan.features.map((feature) => (
            <li
              key={feature}
              className="flex gap-2.5 text-sm leading-snug text-cream/75"
            >
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs text-gold-light"
                aria-hidden
              >
                ✓
              </span>
              <span>{renderPricingFeature(feature)}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        href={ctaHref}
        variant={highlighted ? "primary" : "secondary"}
        className={`mt-6 w-full !rounded-xl ${!highlighted ? "border-white/15" : ""}`}
      >
        {t("pricing.choosePlan")}
      </Button>
    </article>
  );
}
