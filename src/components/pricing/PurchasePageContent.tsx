import { FreeTrialBanner } from "@/components/pricing/FreeTrialBanner";
import { PurchaseCard } from "@/components/pricing/PurchaseCard";
import { PurchaseMobileOffers } from "@/components/pricing/PurchaseMobileOffers";
import { getPurchasePlans } from "@/lib/i18n/purchase-catalog";
import { getServerTranslator } from "@/lib/i18n/server";
import Link from "next/link";

export async function PurchasePageContent() {
  const { locale, t } = await getServerTranslator();
  const purchasePlans = getPurchasePlans(locale);

  const desktopPlans = [
    purchasePlans.find((p) => p.id === "film-5min")!,
    purchasePlans.find((p) => p.id === "pack-3films")!,
    purchasePlans.find((p) => p.id === "film-10min")!,
  ];

  const mobilePlans = [
    purchasePlans.find((p) => p.id === "film-5min")!,
    purchasePlans.find((p) => p.id === "film-10min")!,
    purchasePlans.find((p) => p.id === "pack-3films")!,
  ];

  return (
    <div className="purchase-page relative min-h-screen pb-20 safe-top-offset md:pb-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-cinema-night to-transparent"
        aria-hidden
      />
      <div className="purchase-page__glow purchase-page__glow--left" aria-hidden />
      <div className="purchase-page__glow purchase-page__glow--right" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Link
            href="/"
            className="text-sm text-cream/50 transition-colors hover:text-gold-light"
          >
            {t("purchase.backHome")}
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

        <section id="offres-achat" className="mt-6 md:mt-12 lg:mt-14">
          <PurchaseMobileOffers plans={mobilePlans} locale={locale} />
          <div className="purchase-page__grid purchase-page__grid--desktop">
            {desktopPlans.map((plan) => (
              <PurchaseCard key={plan.id} plan={plan} locale={locale} />
            ))}
          </div>
        </section>

        <p className="mt-10 max-w-md mx-auto text-center text-xs text-cream/40 md:mt-14 md:text-sm">
          {t("purchase.paymentNotice")}
        </p>
      </div>
    </div>
  );
}
