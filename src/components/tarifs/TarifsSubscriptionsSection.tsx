"use client";

import { useState } from "react";
import {
  TarifsBillingToggle,
  type TarifsBillingCycle,
} from "@/components/tarifs/TarifsBillingToggle";
import { TarifsSubscriptionCard } from "@/components/tarifs/TarifsSubscriptionCard";
import type { TarifsSubscriptionPlan } from "@/lib/i18n/tarifs-catalog";
import type { LocaleCode } from "@/lib/i18n/locales";

type TarifsSubscriptionsSectionProps = {
  monthlyPlans: TarifsSubscriptionPlan[];
  yearlyPlans: TarifsSubscriptionPlan[];
  locale: LocaleCode;
  savingsPercent: number;
};

export function TarifsSubscriptionsSection({
  monthlyPlans,
  yearlyPlans,
  locale,
  savingsPercent,
}: TarifsSubscriptionsSectionProps) {
  const [billing, setBilling] = useState<TarifsBillingCycle>("yearly");

  const plans = billing === "monthly" ? monthlyPlans : yearlyPlans;

  return (
    <section id="abonnements" className="tarifs-page__section scroll-mt-28">
      <div className="tarifs-subscriptions__header">
        <div className="tarifs-subscriptions__toolbar">
          <TarifsBillingToggle
            value={billing}
            onChange={setBilling}
            savingsPercent={savingsPercent}
          />
        </div>
      </div>

      <div
        key={billing}
        className="tarifs-subscriptions__grid mt-10 grid gap-6 md:mt-12 md:grid-cols-2 md:items-stretch md:gap-8"
      >
        {plans.map((plan) => (
          <TarifsSubscriptionCard key={plan.id} plan={plan} locale={locale} />
        ))}
      </div>
    </section>
  );
}
