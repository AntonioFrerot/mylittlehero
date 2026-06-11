import { FreeTrialBanner } from "@/components/pricing/FreeTrialBanner";
import { PricingCard } from "@/components/pricing/PricingCard";
import { PricingMobileTierCard } from "@/components/pricing/PricingMobileTierCard";
import { getServerTranslator } from "@/lib/i18n/server";
import { findPricingPlanById, getPricingPlans } from "@/lib/pricing";
import { CheckoutLauncher } from "@/components/pricing/CheckoutLauncher";
import Link from "next/link";

export async function PricingPageContent() {
  const { locale, t } = await getServerTranslator();
  const pricingPlans = getPricingPlans(locale);
  const standardMonthly = findPricingPlanById("standard-monthly", locale)!;
  const standardYearly = findPricingPlanById("standard-yearly", locale)!;
  const premiumMonthly = findPricingPlanById("unlimited-monthly", locale)!;
  const premiumYearly = findPricingPlanById("unlimited-yearly", locale)!;

  return (
    <div className="relative min-h-screen bg-cinema-black pb-20 safe-top-offset md:pb-28">
      <CheckoutLauncher planType="subscription" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-cinema-night to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[90rem] px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Link
            href="/"
            className="text-sm text-cream/50 transition-colors hover:text-gold-light"
          >
            {t("pricing.backHome")}
          </Link>
          <h1 className="font-display mt-6 text-3xl font-bold text-cream md:text-4xl lg:text-5xl">
            {t("pricing.title")}
          </h1>
          <p className="mt-4 text-base text-cream/60 md:text-lg">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="mt-8 md:mt-10">
          <FreeTrialBanner />
        </div>

        <section id="offres" className="mt-6 md:mt-12 lg:mt-14">
          <div className="flex w-full flex-col gap-8 pt-1 lg:hidden">
            <PricingMobileTierCard
              monthlyPlan={standardMonthly}
              yearlyPlan={standardYearly}
              tierLabel={t("pricing.tierEssential")}
              locale={locale}
            />
            <PricingMobileTierCard
              monthlyPlan={premiumMonthly}
              yearlyPlan={premiumYearly}
              tierLabel={t("pricing.tierPremium")}
              locale={locale}
              highlighted
            />
          </div>

          <div className="hidden grid-cols-1 gap-5 sm:gap-6 lg:grid lg:grid-cols-4 lg:items-stretch lg:gap-4 xl:gap-5">
            {pricingPlans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                locale={locale}
              />
            ))}
          </div>
        </section>

        <p className="mt-12 text-center text-xs text-cream/40 md:text-sm">
          {t("pricing.paymentNotice")}
        </p>
      </div>
    </div>
  );
}
