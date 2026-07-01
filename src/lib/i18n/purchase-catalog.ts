import type { LocaleCode } from "./locales";
import { createTranslator } from "./translator";
import type { TranslationKey } from "./translator";

export type AchatPurchasePlanId = "film-5min" | "film-10min" | "pack-3films";
export type TarifsTicketPlanId = "ticket-1" | "ticket-3" | "ticket-10";
export type PurchasePlanId = AchatPurchasePlanId | TarifsTicketPlanId;

export type PurchasePlan = {
  id: AchatPurchasePlanId;
  name: string;
  subtitle: string;
  price: string;
  priceValue: number;
  durationShort: string;
  filmCount: number;
  eyebrow: string;
  features: string[];
  highlighted?: boolean;
  promoLabel?: string;
  perFilmPrice: string;
};

const PLAN_CONFIG: Record<
  AchatPurchasePlanId,
  {
    name: TranslationKey;
    subtitle: TranslationKey;
    eyebrow: TranslationKey;
    durationShort: TranslationKey;
    filmCount: number;
    price: number;
    perMinuteRate: TranslationKey;
    features: TranslationKey[];
    highlighted?: boolean;
    promoLabel?: TranslationKey;
  }
> = {
  "film-5min": {
    name: "purchase.plans.film5min.name",
    subtitle: "purchase.plans.film5min.subtitle",
    eyebrow: "purchase.plans.film5min.eyebrow",
    durationShort: "purchase.plans.film5min.durationShort",
    filmCount: 1,
    price: 59.99,
    perMinuteRate: "purchase.plans.film5min.perMinuteRate",
    features: [
      "purchase.plans.film5min.features.duration",
      "purchase.plans.film5min.features.custom",
      "purchase.plans.film5min.features.delivery",
    ],
  },
  "film-10min": {
    name: "purchase.plans.film10min.name",
    subtitle: "purchase.plans.film10min.subtitle",
    eyebrow: "purchase.plans.film10min.eyebrow",
    durationShort: "purchase.plans.film10min.durationShort",
    filmCount: 1,
    price: 99.99,
    perMinuteRate: "purchase.plans.film10min.perMinuteRate",
    features: [
      "purchase.plans.film10min.features.duration",
      "purchase.plans.film10min.features.custom",
      "purchase.plans.film10min.features.delivery",
    ],
  },
  "pack-3films": {
    name: "purchase.plans.pack3films.name",
    subtitle: "purchase.plans.pack3films.subtitle",
    eyebrow: "purchase.plans.pack3films.eyebrow",
    durationShort: "purchase.plans.pack3films.durationShort",
    filmCount: 3,
    price: 199.99,
    perMinuteRate: "purchase.plans.pack3films.perMinuteRate",
    highlighted: true,
    promoLabel: "purchase.plans.pack3films.promoLabel",
    features: [
      "purchase.plans.pack3films.features.duration",
      "purchase.plans.pack3films.features.custom",
      "purchase.plans.pack3films.features.delivery",
    ],
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

export function getPurchasePlans(locale: LocaleCode): PurchasePlan[] {
  const t = createTranslator(locale);

  return (Object.keys(PLAN_CONFIG) as AchatPurchasePlanId[]).map((id) => {
    const config = PLAN_CONFIG[id];
    return {
      id,
      name: t(config.name),
      subtitle: t(config.subtitle),
      eyebrow: t(config.eyebrow),
      durationShort: t(config.durationShort),
      filmCount: config.filmCount,
      price: formatMoney(config.price, locale),
      priceValue: config.price,
      features: config.features.map((key) => t(key)),
      highlighted: config.highlighted,
      ...(config.promoLabel ? { promoLabel: t(config.promoLabel) } : {}),
      perFilmPrice: t(config.perMinuteRate),
    };
  });
}
