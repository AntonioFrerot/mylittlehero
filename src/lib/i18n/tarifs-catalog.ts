import type { PricingPlanId } from "./pricing-catalog";
import type { PurchasePlanId, TarifsTicketPlanId } from "./purchase-catalog";
import type { LocaleCode } from "./locales";
import { createTranslator } from "./translator";
import type { TranslationKey } from "./translator";

export type TarifsSubscriptionId =
  | "monthly-1-film"
  | "monthly-1-weekly"
  | "yearly-12-films"
  | "yearly-48-films";

export type TarifsTicketId = TarifsTicketPlanId;

export type TarifsPlanFeatureId =
  | "filmDuration"
  | "fullCustom"
  | "delivery24h"
  | "supportStandard"
  | "supportPriority"
  | "accumulateFilms";

export type TarifsSubscriptionPlan = {
  id: TarifsSubscriptionId;
  stripePlanId: PricingPlanId;
  name: string;
  filmsLabel: string;
  quotaHighlight: number;
  tagline?: string;
  price: string;
  priceValue: number;
  period: string;
  monthlyEquivalent?: string;
  perFilmPrice: string;
  savingsLabel?: string;
  features: { id: TarifsPlanFeatureId; label: string; included: boolean }[];
  yearlyBreakdown?: {
    monthlyPrice: string;
    compareMonthlyPrice: string;
    savingsPercent: number;
  };
  highlighted?: boolean;
  billing: "monthly" | "yearly";
};

export type TarifsTicketPlan = {
  id: TarifsTicketId;
  stripePlanId: PurchasePlanId;
  name: string;
  ticketCount: number;
  price: string;
  priceValue: number;
  perFilmPrice: string;
  highlighted?: boolean;
};

export type AbonnementsSampleOffer = {
  id: "jeton-1";
  stripePlanId: "jeton-1";
  price: string;
  priceValue: number;
};

const PLAN_FEATURE_IDS: Record<TarifsSubscriptionId, TarifsPlanFeatureId[]> = {
  "monthly-1-film": ["filmDuration", "fullCustom", "delivery24h", "supportStandard"],
  "monthly-1-weekly": [
    "filmDuration",
    "fullCustom",
    "delivery24h",
    "supportPriority",
    "accumulateFilms",
  ],
  "yearly-12-films": [
    "filmDuration",
    "fullCustom",
    "delivery24h",
    "supportStandard",
    "accumulateFilms",
  ],
  "yearly-48-films": [
    "filmDuration",
    "fullCustom",
    "delivery24h",
    "supportPriority",
    "accumulateFilms",
  ],
};

const PLAN_EXCLUDED_FEATURE_IDS: Partial<Record<TarifsSubscriptionId, TarifsPlanFeatureId[]>> = {
  "monthly-1-film": ["accumulateFilms"],
};

const PLAN_FEATURE_LABEL_OVERRIDES: Partial<
  Record<TarifsSubscriptionId, Partial<Record<TarifsPlanFeatureId, TranslationKey>>>
> = {
  "monthly-1-weekly": {
    filmDuration: "tarifsPage.features.filmDurationPremium",
  },
  "yearly-12-films": {
    filmDuration: "tarifsPage.features.filmDurationYearlyEssentiel",
  },
  "yearly-48-films": {
    filmDuration: "tarifsPage.features.filmDurationYearlyPremium",
  },
};

export type TarifsPricingContext = "tarifs" | "abonnements";

type SubscriptionPlanConfig = {
  stripePlanId: PricingPlanId;
  name: TranslationKey;
  filmsLabel: TranslationKey;
  tagline?: TranslationKey;
  price: number;
  monthlyEquivalent?: number;
  compareMonthly?: number;
  perFilmUnit?: number;
  quotaHighlight: number;
  billing: "monthly" | "yearly";
  highlighted?: boolean;
};

const ABONNEMENTS_YEARLY_OVERRIDES: Partial<
  Record<
    TarifsSubscriptionId,
    Partial<Pick<SubscriptionPlanConfig, "monthlyEquivalent" | "perFilmUnit" | "price" | "quotaHighlight">>
  >
> = {
  "yearly-12-films": {
    monthlyEquivalent: 39.99,
    perFilmUnit: 39.99,
    price: 39.99 * 12,
  },
  "yearly-48-films": {
    monthlyEquivalent: 139.99,
    perFilmUnit: 32.31,
    price: 139.99 * 12,
    quotaHighlight: 52,
  },
};

const ABONNEMENTS_FEATURE_LABEL_OVERRIDES: Partial<
  Record<TarifsSubscriptionId, Partial<Record<TarifsPlanFeatureId, TranslationKey>>>
> = {
  "yearly-48-films": {
    filmDuration: "abonnementsPage.premiumYearly.filmDuration",
  },
};

const SUBSCRIPTION_CONFIG: Record<TarifsSubscriptionId, SubscriptionPlanConfig> = {
  "monthly-1-film": {
    stripePlanId: "standard-monthly",
    name: "tarifsPage.plans.monthly1Film.name",
    filmsLabel: "tarifsPage.plans.monthly1Film.films",
    price: 74.99,
    perFilmUnit: 74.99,
    billing: "monthly",
    quotaHighlight: 1,
  },
  "monthly-1-weekly": {
    stripePlanId: "unlimited-monthly",
    name: "tarifsPage.plans.monthlyWeekly.name",
    filmsLabel: "tarifsPage.plans.monthlyWeekly.films",
    tagline: "tarifsPage.plans.monthlyWeekly.tagline",
    price: 249.99,
    billing: "monthly",
    highlighted: true,
    quotaHighlight: 4,
  },
  "yearly-12-films": {
    stripePlanId: "standard-yearly",
    name: "tarifsPage.plans.yearly12Films.name",
    filmsLabel: "tarifsPage.plans.yearly12Films.films",
    price: 449.99,
    monthlyEquivalent: 37.49,
    perFilmUnit: 37.49,
    compareMonthly: 74.99,
    billing: "yearly",
    quotaHighlight: 12,
  },
  "yearly-48-films": {
    stripePlanId: "unlimited-yearly",
    name: "tarifsPage.plans.yearly48Films.name",
    filmsLabel: "tarifsPage.plans.yearly48Films.films",
    tagline: "tarifsPage.plans.monthlyWeekly.tagline",
    price: 1499.99,
    monthlyEquivalent: 124.99,
    compareMonthly: 249.99,
    billing: "yearly",
    highlighted: true,
    quotaHighlight: 48,
  },
};

function formatPerFilmUnit(
  unitPrice: number,
  locale: LocaleCode,
  t: ReturnType<typeof createTranslator>
): string {
  return t("tarifsPage.perFilmUnit", {
    amount: formatMoney(unitPrice, locale),
  });
}

function featureLabelKey(
  planId: TarifsSubscriptionId,
  featureId: TarifsPlanFeatureId,
  context: TarifsPricingContext = "tarifs"
): TranslationKey {
  if (context === "abonnements") {
    const abonnementsOverride = ABONNEMENTS_FEATURE_LABEL_OVERRIDES[planId]?.[featureId];
    if (abonnementsOverride) return abonnementsOverride;
  }

  return (
    PLAN_FEATURE_LABEL_OVERRIDES[planId]?.[featureId] ??
    (`tarifsPage.features.${featureId}` as TranslationKey)
  );
}

function buildPlanFeatures(
  id: TarifsSubscriptionId,
  t: ReturnType<typeof createTranslator>,
  context: TarifsPricingContext = "tarifs"
): { id: TarifsPlanFeatureId; label: string; included: boolean }[] {
  const included = PLAN_FEATURE_IDS[id].map((featureId) => ({
    id: featureId,
    label: t(featureLabelKey(id, featureId, context)),
    included: true,
  }));

  const excluded = (PLAN_EXCLUDED_FEATURE_IDS[id] ?? []).map((featureId) => ({
    id: featureId,
    label: t(featureLabelKey(id, featureId, context)),
    included: false,
  }));

  return [...included, ...excluded];
}

const TICKET_CONFIG: Record<
  TarifsTicketId,
  {
    stripePlanId: TarifsTicketPlanId;
    ticketCount: number;
    price: number;
    perFilmUnit?: number;
    highlighted?: boolean;
  }
> = {
  "ticket-1": { stripePlanId: "ticket-1", ticketCount: 1, price: 59.99 },
  "ticket-3": { stripePlanId: "ticket-3", ticketCount: 3, price: 149.99, perFilmUnit: 49.99 },
  "ticket-10": {
    stripePlanId: "ticket-10",
    ticketCount: 10,
    price: 399.99,
    perFilmUnit: 39.99,
    highlighted: true,
  },
};

const ABONNEMENTS_TICKET_OVERRIDES: Partial<
  Record<TarifsTicketId, { price: number; perFilmUnit?: number }>
> = {
  "ticket-1": { price: 59.99 },
  "ticket-3": { price: 149.99, perFilmUnit: 49.99 },
  "ticket-10": { price: 399.99, perFilmUnit: 39.99 },
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

function buildSavingsLabel(
  compareMonthly: number,
  yearlyPrice: number,
  locale: LocaleCode,
  t: ReturnType<typeof createTranslator>
): string {
  const annualIfMonthly = compareMonthly * 12;
  const saved = annualIfMonthly - yearlyPrice;
  const percent = Math.round((saved / annualIfMonthly) * 100);
  return t("tarifsPage.savingsLabel", {
    amount: formatMoney(saved, locale),
    percent,
  });
}

function resolveSubscriptionConfig(
  id: TarifsSubscriptionId,
  context: TarifsPricingContext
): SubscriptionPlanConfig {
  const config = SUBSCRIPTION_CONFIG[id];
  if (context !== "abonnements") return config;

  const override = ABONNEMENTS_YEARLY_OVERRIDES[id];
  if (!override) return config;

  return {
    ...config,
    ...override,
  };
}

function resolveTicketConfig(
  id: TarifsTicketId,
  context: TarifsPricingContext
): (typeof TICKET_CONFIG)[TarifsTicketId] {
  const config = TICKET_CONFIG[id];
  if (context !== "abonnements") return config;

  const override = ABONNEMENTS_TICKET_OVERRIDES[id];
  if (!override) return config;

  return {
    ...config,
    ...override,
    perFilmUnit: override.perFilmUnit ?? override.price / config.ticketCount,
  };
}

export function getTarifsSubscriptionPlans(
  locale: LocaleCode,
  context: TarifsPricingContext = "tarifs"
): TarifsSubscriptionPlan[] {
  const t = createTranslator(locale);

  return (Object.keys(SUBSCRIPTION_CONFIG) as TarifsSubscriptionId[]).map((id) => {
    const config = resolveSubscriptionConfig(id, context);
    return {
      id,
      stripePlanId: config.stripePlanId,
      name: t(config.name),
      filmsLabel: t(config.filmsLabel),
      quotaHighlight: config.quotaHighlight,
      tagline: config.tagline ? t(config.tagline) : undefined,
      price: formatMoney(config.price, locale),
      priceValue: config.price,
      period: t(
        config.billing === "yearly"
          ? "tarifsPage.periodYearly"
          : "tarifsPage.periodMonthly"
      ),
      monthlyEquivalent: config.monthlyEquivalent
        ? t("tarifsPage.monthlyEquivalent", {
            amount: formatMoney(config.monthlyEquivalent, locale),
          })
        : undefined,
      perFilmPrice: formatPerFilmUnit(
        config.perFilmUnit ?? config.price / config.quotaHighlight,
        locale,
        t
      ),
      savingsLabel:
        config.compareMonthly && config.billing === "yearly"
          ? buildSavingsLabel(config.compareMonthly, config.price, locale, t)
          : undefined,
      features: buildPlanFeatures(id, t, context),
      yearlyBreakdown:
        config.compareMonthly && config.monthlyEquivalent && config.billing === "yearly"
          ? {
              monthlyPrice: formatMoney(config.monthlyEquivalent, locale),
              compareMonthlyPrice: formatMoney(config.compareMonthly, locale),
              savingsPercent: Math.round(
                ((config.compareMonthly - config.monthlyEquivalent) /
                  config.compareMonthly) *
                  100
              ),
            }
          : undefined,
      highlighted: config.highlighted,
      billing: config.billing,
    };
  });
}

export function getTarifsTicketPlans(
  locale: LocaleCode,
  context: TarifsPricingContext = "tarifs"
): TarifsTicketPlan[] {
  const t = createTranslator(locale);

  return (Object.keys(TICKET_CONFIG) as TarifsTicketId[]).map((id) => {
    const config = resolveTicketConfig(id, context);
    return {
      id,
      stripePlanId: config.stripePlanId,
      name:
        config.ticketCount === 1
          ? t("tarifsPage.tickets.countOne")
          : t("tarifsPage.tickets.countMany", { count: config.ticketCount }),
      ticketCount: config.ticketCount,
      price: formatMoney(config.price, locale),
      priceValue: config.price,
      perFilmPrice: formatPerFilmUnit(
        config.perFilmUnit ?? config.price / config.ticketCount,
        locale,
        t
      ),
      highlighted: config.highlighted,
    };
  });
}

export function getTarifsMonthlyPlans(
  locale: LocaleCode,
  context: TarifsPricingContext = "tarifs"
): TarifsSubscriptionPlan[] {
  return getTarifsSubscriptionPlans(locale, context).filter(
    (plan) => plan.billing === "monthly"
  );
}

export function getTarifsYearlyPlans(
  locale: LocaleCode,
  context: TarifsPricingContext = "tarifs"
): TarifsSubscriptionPlan[] {
  return getTarifsSubscriptionPlans(locale, context).filter(
    (plan) => plan.billing === "yearly"
  );
}

/** Max % saved vs paying monthly for 12 months (shown on the billing toggle badge). */
export function getTarifsMaxYearlySavingsPercent(): number {
  const percents = (Object.keys(SUBSCRIPTION_CONFIG) as TarifsSubscriptionId[])
    .filter((id) => {
      const config = SUBSCRIPTION_CONFIG[id];
      return config.billing === "yearly" && config.compareMonthly != null;
    })
    .map((id) => {
      const config = SUBSCRIPTION_CONFIG[id];
      return Math.round(
        ((config.compareMonthly! - config.monthlyEquivalent!) / config.compareMonthly!) *
          100
      );
    });

  return percents.length > 0 ? Math.max(...percents) : 0;
}

export function getAbonnementsSampleOffer(locale: LocaleCode): AbonnementsSampleOffer {
  const priceValue = 7.99;
  return {
    id: "jeton-1",
    stripePlanId: "jeton-1",
    price: formatMoney(priceValue, locale),
    priceValue,
  };
}
