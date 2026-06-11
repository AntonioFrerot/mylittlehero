"use client";

import React from "react";
import { useState } from "react";
import type { PricingPlan } from "@/lib/pricing";
import { getTierQuotaLabel } from "@/lib/pricing";
import {
  BTN_3D_BADGE,
  SURFACE_3D_CHIP_CALLOUT,
  SURFACE_3D_ICON_SM,
  SURFACE_3D_TOGGLE,
} from "@/lib/ui/button-3d-classes";
import { CheckoutButton } from "@/components/pricing/CheckoutButton";
import { createTranslator } from "@/lib/i18n/translator";
import type { LocaleCode } from "@/lib/i18n/locales";

const PRICING_GOLD_TOKENS_RE =
  /\b(15 films|180 films|30 films|360 films|5 minutes|10 minutes)\b/g;

function renderPricingFeature(feature: string) {
  const matches = [...feature.matchAll(PRICING_GOLD_TOKENS_RE)];
  if (matches.length === 0) return feature;

  const nodes: Array<string | React.ReactElement> = [];
  let cursor = 0;

  matches.forEach((match, index) => {
    const start = match.index ?? 0;
    const token = match[1] ?? match[0];
    const end = start + token.length;

    if (start > cursor) nodes.push(feature.slice(cursor, start));
    nodes.push(
      <span
        key={`${token}-${index}`}
        className="text-gold-light"
      >
        {token}
      </span>
    );
    cursor = end;
  });

  if (cursor < feature.length) nodes.push(feature.slice(cursor));
  return nodes;
}

type PricingMobileTierCardProps = {
  monthlyPlan: PricingPlan;
  yearlyPlan: PricingPlan;
  tierLabel: string;
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
        className={SURFACE_3D_TOGGLE}
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
        <span className={`${BTN_3D_BADGE} z-10`}>
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
            <p className={`mt-3 ${SURFACE_3D_CHIP_CALLOUT}`}>
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
              <span className={`${SURFACE_3D_ICON_SM} !h-5 !w-5`} aria-hidden>
                ✓
              </span>
              <span>{renderPricingFeature(feature)}</span>
            </li>
          ))}
        </ul>
      </div>

      <CheckoutButton
        planId={plan.id}
        planType="subscription"
        variant="primary"
        className="mt-6 w-full !rounded-xl"
      >
        {t("pricing.choosePlan")}
      </CheckoutButton>
    </article>
  );
}
