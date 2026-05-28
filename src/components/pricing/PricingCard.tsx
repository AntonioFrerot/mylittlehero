import type { PricingPlan } from "@/lib/pricing";
import { getTierQuotaLabel } from "@/lib/pricing";
import { Button } from "@/components/ui/Button";
import { createTranslator } from "@/lib/i18n/translator";
import type { LocaleCode } from "@/lib/i18n/locales";

const PRICING_GOLD_NUMBERS_RE =
  /\b(15|180|30|360)(?=\sfilms\b)|\b(5|10)(?=\sminutes\b)/g;

function renderPricingFeature(feature: string) {
  const matches = [...feature.matchAll(PRICING_GOLD_NUMBERS_RE)];
  if (matches.length === 0) return feature;

  const nodes: Array<string | JSX.Element> = [];
  let cursor = 0;

  matches.forEach((match, index) => {
    const start = match.index ?? 0;
    const token = match[1] ?? match[2] ?? match[0];
    const end = start + token.length;

    if (start > cursor) nodes.push(feature.slice(cursor, start));
    nodes.push(
      <span key={`${token}-${index}`} className="text-gold-light">
        {token}
      </span>
    );
    cursor = end;
  });

  if (cursor < feature.length) nodes.push(feature.slice(cursor));
  return nodes;
}

type PricingCardProps = {
  plan: PricingPlan;
  ctaHref: string;
  locale: LocaleCode;
};

export function PricingCard({ plan, ctaHref, locale }: PricingCardProps) {
  const t = createTranslator(locale);
  const isYearly = plan.billing === "yearly";

  return (
    <article
      className={`relative flex flex-col rounded-2xl border p-5 transition-all duration-300 sm:min-h-[440px] sm:p-6 lg:min-h-[540px] lg:rounded-3xl lg:p-6 xl:p-7 ${
        plan.highlighted
          ? "border-gold/50 bg-gradient-to-b from-cinema-surface to-cinema-night shadow-glow-gold-subtle hover:border-gold/70 lg:scale-[1.02] lg:z-10"
          : "border-white/10 bg-cinema-surface/80 hover:border-gold/25 hover:shadow-poster"
      }`}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light px-3 py-1 text-[10px] font-semibold text-cinema-black xl:text-xs">
          {t("pricing.mostPopular")}
        </span>
      )}

      <div className="flex flex-col gap-4 lg:gap-5">
        <span
          className={`w-fit rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
            isYearly
              ? "border border-gold/30 bg-gold/10 text-gold-light"
              : "border border-white/10 bg-white/5 text-cream/60"
          }`}
        >
          {isYearly ? t("pricing.billingYearly") : t("pricing.billingMonthly")}
        </span>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-gold/80 xl:text-xs">
            {getTierQuotaLabel(plan.tier, plan.billing, locale)}
          </p>
          <h3 className="font-display mt-1.5 text-xl font-bold leading-tight text-cream xl:text-2xl">
            {plan.name}
          </h3>
        </div>

        <div className="border-t border-white/5 pt-4 lg:pt-5">
          <div className="flex flex-col gap-0.5">
            <span className="font-display text-3xl font-bold leading-none text-cream xl:text-4xl">
              {plan.price}
            </span>
            <span className="text-sm text-cream/50">{plan.period}</span>
          </div>
          {plan.savingsLabel && (
            <p className="mt-3 rounded-lg border border-gold/35 bg-gold/10 px-3 py-2 text-xs font-semibold leading-snug text-gold-light xl:text-sm">
              {plan.savingsLabel}
            </p>
          )}
        </div>
      </div>

      <ul className="mt-6 flex flex-1 flex-col gap-2.5 lg:mt-8 lg:gap-3">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex gap-2.5 text-xs leading-snug text-cream/75 xl:text-sm xl:leading-relaxed"
          >
            <span
              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gold/15 text-[10px] text-gold-light xl:h-5 xl:w-5 xl:text-xs"
              aria-hidden
            >
              ✓
            </span>
            {renderPricingFeature(feature)}
          </li>
        ))}
      </ul>

      <Button
        href={ctaHref}
        variant="primary"
        className="mt-6 w-full !rounded-xl !px-4 !py-2.5 !text-sm lg:mt-auto lg:!py-3"
      >
        {t("pricing.choosePlan")}
      </Button>
    </article>
  );
}
