import Link from "next/link";
import { AbonnementsCatalogSection } from "@/components/tarifs/AbonnementsCatalogSection";
import { CheckoutLauncher } from "@/components/pricing/CheckoutLauncher";
import {
  getAbonnementsSampleOffer,
  getTarifsTicketPlans,
  getTarifsYearlyPlans,
} from "@/lib/i18n/tarifs-catalog";
import { getServerTranslator } from "@/lib/i18n/server";

export async function AbonnementsPageContent() {
  const { locale, t } = await getServerTranslator();
  const yearlyPlans = getTarifsYearlyPlans(locale, "abonnements");
  const ticketPlans = getTarifsTicketPlans(locale, "abonnements");
  const sampleOffer = getAbonnementsSampleOffer(locale);

  return (
    <div className="abonnements-page tarifs-page relative min-h-screen pb-20 safe-top-offset md:pb-28">
      <CheckoutLauncher planType="subscription" />
      <CheckoutLauncher planType="purchase" />
      <div className="tarifs-page__glow tarifs-page__glow--left" aria-hidden />
      <div className="tarifs-page__glow tarifs-page__glow--right" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <Link
            href="/"
            className="text-sm text-cream/50 transition-colors hover:text-gold-light"
          >
            {t("tarifsPage.backHome")}
          </Link>
        </header>

        <div className="mt-8 md:mt-10">
          <AbonnementsCatalogSection
            yearlyPlans={yearlyPlans}
            ticketPlans={ticketPlans}
            sampleOffer={sampleOffer}
            locale={locale}
          />
        </div>

        <footer className="tarifs-page__footer mt-16 text-center md:mt-20">
          <p className="text-xs text-cream/40 md:text-sm">{t("tarifsPage.paymentNotice")}</p>
        </footer>
      </div>
    </div>
  );
}
