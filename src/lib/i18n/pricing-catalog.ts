import type { LocaleCode } from "./locales";
import { createTranslator } from "./translator";
import type { TranslationKey } from "./translator";

export type PricingPlanId =
  | "standard-monthly"
  | "standard-yearly"
  | "unlimited-monthly"
  | "unlimited-yearly";

export type PricingPlan = {
  id: PricingPlanId;
  name: string;
  price: string;
  period: string;
  billing: "monthly" | "yearly";
  tier: "standard" | "unlimited";
  features: string[];
  highlighted?: boolean;
  savingsLabel?: string;
};

const STANDARD_MONTHLY = 49.99;
const STANDARD_YEARLY = 449.99;
const UNLIMITED_MONTHLY = 119.99;
const UNLIMITED_YEARLY = 999.99;

const PLAN_KEYS: Record<
  PricingPlanId,
  {
    name: TranslationKey;
    features: TranslationKey[];
    tier: "standard" | "unlimited";
    billing: "monthly" | "yearly";
    price: number;
    highlighted?: boolean;
  }
> = {
  "standard-monthly": {
    name: "pricing.plans.standardMonthly.name",
    features: [
      "pricing.plans.standardMonthly.features.films",
      "pricing.plans.standardMonthly.features.duration",
      "pricing.plans.standardMonthly.features.custom",
    ],
    tier: "standard",
    billing: "monthly",
    price: STANDARD_MONTHLY,
  },
  "standard-yearly": {
    name: "pricing.plans.standardYearly.name",
    features: [
      "pricing.plans.standardYearly.features.films",
      "pricing.plans.standardYearly.features.duration",
      "pricing.plans.standardYearly.features.custom",
    ],
    tier: "standard",
    billing: "yearly",
    price: STANDARD_YEARLY,
  },
  "unlimited-monthly": {
    name: "pricing.plans.unlimitedMonthly.name",
    features: [
      "pricing.plans.unlimitedMonthly.features.films",
      "pricing.plans.unlimitedMonthly.features.duration",
      "pricing.plans.unlimitedMonthly.features.custom",
      "pricing.plans.unlimitedMonthly.features.priority",
    ],
    tier: "unlimited",
    billing: "monthly",
    price: UNLIMITED_MONTHLY,
    highlighted: true,
  },
  "unlimited-yearly": {
    name: "pricing.plans.unlimitedYearly.name",
    features: [
      "pricing.plans.unlimitedYearly.features.films",
      "pricing.plans.unlimitedYearly.features.duration",
      "pricing.plans.unlimitedYearly.features.custom",
      "pricing.plans.unlimitedYearly.features.priority",
    ],
    tier: "unlimited",
    billing: "yearly",
    price: UNLIMITED_YEARLY,
  },
};

function formatMoney(amount: number, locale: LocaleCode): string {
  const tag = locale === "fr" ? "fr-FR" : "en-GB";
  return (
    amount.toLocaleString(tag, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
}

function buildYearlySavings(
  monthlyPrice: number,
  yearlyPrice: number,
  locale: LocaleCode,
  t: ReturnType<typeof createTranslator>
) {
  const annualIfMonthly = monthlyPrice * 12;
  const saved = annualIfMonthly - yearlyPrice;
  const percent = Math.round((saved / annualIfMonthly) * 100);
  return t("pricing.savingsLabel", {
    amount: formatMoney(saved, locale),
    percent,
  });
}

export function getPricingPlans(locale: LocaleCode): PricingPlan[] {
  const t = createTranslator(locale);

  return (Object.keys(PLAN_KEYS) as PricingPlanId[]).map((id) => {
    const config = PLAN_KEYS[id];
    const monthlyPair =
      id === "standard-yearly"
        ? { monthly: STANDARD_MONTHLY, yearly: STANDARD_YEARLY }
        : id === "unlimited-yearly"
          ? { monthly: UNLIMITED_MONTHLY, yearly: UNLIMITED_YEARLY }
          : null;

    return {
      id,
      name: t(config.name),
      price: formatMoney(config.price, locale),
      period: t(
        config.billing === "yearly"
          ? "pricing.periodYearly"
          : "pricing.periodMonthly"
      ),
      billing: config.billing,
      tier: config.tier,
      highlighted: config.highlighted,
      features: config.features.map((key) => t(key)),
      ...(monthlyPair
        ? {
            savingsLabel: buildYearlySavings(
              monthlyPair.monthly,
              monthlyPair.yearly,
              locale,
              t
            ),
          }
        : {}),
    };
  });
}

export function getTierQuotaLabel(
  tier: PricingPlan["tier"],
  billing: PricingPlan["billing"],
  locale: LocaleCode
): string {
  const t = createTranslator(locale);
  if (billing === "yearly") {
    return tier === "standard"
      ? t("pricing.tierStandardYearly")
      : t("pricing.tierUnlimitedYearly");
  }
  return tier === "standard"
    ? t("pricing.tierStandardDaily")
    : t("pricing.tierUnlimitedDaily");
}

/** @deprecated Use getTierQuotaLabel */
export function getTierDailyLabel(
  tier: PricingPlan["tier"],
  locale: LocaleCode
): string {
  return getTierQuotaLabel(tier, "monthly", locale);
}

export function findPricingPlanById(
  planId: string | undefined,
  locale: LocaleCode
): PricingPlan | undefined {
  return getPricingPlans(locale).find((plan) => plan.id === planId);
}
