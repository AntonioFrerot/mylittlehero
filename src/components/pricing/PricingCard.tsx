import React from "react";
import type { PricingPlan } from "@/lib/pricing";
import { getTierQuotaLabel } from "@/lib/pricing";
import { BTN_3D_BADGE, SURFACE_3D_CHIP, SURFACE_3D_CHIP_CALLOUT, SURFACE_3D_CHIP_MUTED, SURFACE_3D_ICON_SM } from "@/lib/ui/button-3d-classes";
import { Button } from "@/components/ui/Button";
import { createTranslator } from "@/lib/i18n/translator";
import type { LocaleCode } from "@/lib/i18n/locales";

const PRICING_YELLOW_TOKENS_RE =
  /\b(15 films|180 films|30 films|360 films|5 minutes|10 minutes)\b/g;

function renderPricingFeature(feature: string) {
  const matches = [...feature.matchAll(PRICING_YELLOW_TOKENS_RE)];
  if (matches.length === 0) return feature;

  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  matches.forEach((match, index) => {
    const start = match.index ?? 0;
    const token = match[1] ?? match[0];
    const end = start + token.length;

    // Inclure les espaces adjacents dans le span jaune pour éviter
    // l'effet "trou" visible entre texte jaune et texte normal sur desktop.
    let spanStart = start;
    let spanEnd = end;
    if (spanStart > 0 && feature[spanStart - 1] === " ") spanStart -= 1;
    if (spanEnd < feature.length && feature[spanEnd] === " ") spanEnd += 1;

    if (spanStart > cursor) nodes.push(feature.slice(cursor, spanStart));
    nodes.push(
      <span key={`${token}-${index}`} className="text-yellow">
        {feature.slice(spanStart, spanEnd)}
      </span>
    );
    cursor = spanEnd;
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
          ? "border-gold/50 bg-gradient-to-b from-cinema-surface to-cinema-night shadow-glow-gold-subtle hover:border-gold/70 lg:z-10 lg:shadow-none"
          : "border-white/10 bg-cinema-surface/80 hover:border-gold/25 hover:shadow-poster"
      }`}
    >
      {plan.highlighted && (
        <span className={BTN_3D_BADGE}>
          {t("pricing.mostPopular")}
        </span>
      )}

      <div className="flex flex-col gap-4 lg:gap-5">
        <span className={isYearly ? SURFACE_3D_CHIP : SURFACE_3D_CHIP_MUTED}>
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
            <p className={`mt-3 ${SURFACE_3D_CHIP_CALLOUT}`}>
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
            <span className={SURFACE_3D_ICON_SM} aria-hidden>
              ✓
            </span>
            <span>{renderPricingFeature(feature)}</span>
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
