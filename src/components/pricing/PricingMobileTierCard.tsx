"use client";

import { useState } from "react";
import type { PricingPlan } from "@/lib/pricing";
import { getTierQuotaLabel } from "@/lib/pricing";
import { Button } from "@/components/ui/Button";
import { createTranslator } from "@/lib/i18n/translator";
import type { LocaleCode } from "@/lib/i18n/locales";

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
    <button
      type="button"
      role="switch"
      aria-checked={yearly}
      aria-label={yearly ? yearlyLabel : monthlyLabel}
      onClick={() => onChange(!yearly)}
      className="group flex shrink-0 items-center gap-1 rounded-full p-0.5"
    >
      <span
        className={`text-[9px] font-medium leading-none transition-colors ${
          !yearly ? "text-gold-light" : "text-cream/40"
        }`}
      >
        {monthlyLabel}
      </span>
      <span
        className="relative h-4 w-8 rounded-full border border-white/15 bg-white/10 transition-colors group-hover:border-gold/30"
        aria-hidden
      >
        <span
          className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-gold-light shadow-sm transition-transform duration-200 ${
            yearly ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </span>
      <span
        className={`text-[9px] font-medium leading-none transition-colors ${
          yearly ? "text-gold-light" : "text-cream/40"
        }`}
      >
        {yearlyLabel}
      </span>
    </button>
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
  const [yearly, setYearly] = useState(false);
  const plan = yearly ? yearlyPlan : monthlyPlan;

  return (
    <article
      className={`relative flex min-h-0 flex-col rounded-2xl border p-3 ${
        highlighted
          ? "border-gold/50 bg-gradient-to-b from-cinema-surface to-cinema-night shadow-glow-gold-subtle"
          : "border-white/10 bg-cinema-surface/80"
      }`}
    >
      {highlighted && (
        <span className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light px-2 py-0.5 text-[9px] font-semibold text-cinema-black">
          {t("pricing.mostPopular")}
        </span>
      )}

      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-medium uppercase tracking-wide text-gold/80">
            {getTierQuotaLabel(plan.tier, plan.billing, locale)}
          </p>
          <h3 className="font-display mt-0.5 text-sm font-bold leading-tight text-cream">
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

      <div className="flex flex-1 flex-col gap-2">
        <div className="border-t border-white/5 pt-2">
          <span className="font-display text-xl font-bold leading-none text-cream">
            {plan.price}
          </span>
          <span className="mt-0.5 block text-[10px] text-cream/50">
            {plan.period}
          </span>
          {plan.savingsLabel && (
            <p className="mt-2 rounded-md border border-gold/35 bg-gold/10 px-2 py-1 text-[9px] font-semibold leading-snug text-gold-light">
              {plan.savingsLabel}
            </p>
          )}
        </div>

        <ul className="mt-1 flex flex-col gap-1.5">
          {plan.features.map((feature) => (
            <li
              key={feature}
              className="flex gap-1.5 text-[10px] leading-snug text-cream/70"
            >
              <span
                className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-[8px] text-gold-light"
                aria-hidden
              >
                ✓
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        href={ctaHref}
        variant={highlighted ? "primary" : "secondary"}
        className={`mt-3 w-full !rounded-lg !px-2 !py-2 !text-[11px] ${!highlighted ? "border-white/15" : ""}`}
      >
        {t("pricing.choosePlan")}
      </Button>
    </article>
  );
}
