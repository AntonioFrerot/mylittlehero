import type { ReactNode } from "react";
import Link from "next/link";
import { CheckoutLauncher } from "@/components/pricing/CheckoutLauncher";
import { TarifsSubscriptionsSection } from "@/components/tarifs/TarifsSubscriptionsSection";
import { TarifsTicketCard } from "@/components/tarifs/TarifsTicketCard";
import {
  getTarifsMaxYearlySavingsPercent,
  getTarifsMonthlyPlans,
  getTarifsTicketPlans,
  getTarifsYearlyPlans,
} from "@/lib/i18n/tarifs-catalog";
import { getServerTranslator } from "@/lib/i18n/server";

function TarifsSection({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="tarifs-page__section scroll-mt-28">
      <div className="tarifs-page__section-header tarifs-page__section-header--centered">
        <h2 className="font-display text-2xl font-semibold text-cream md:text-3xl">{title}</h2>
        {lead ? <p className="mt-2 max-w-2xl text-sm text-cream/60 md:text-base">{lead}</p> : null}
      </div>
      {children}
    </section>
  );
}

export async function TarifsPageContent() {
  const { locale, t } = await getServerTranslator();
  const monthlyPlans = getTarifsMonthlyPlans(locale);
  const yearlyPlans = getTarifsYearlyPlans(locale);
  const ticketPlans = getTarifsTicketPlans(locale);
  const savingsPercent = getTarifsMaxYearlySavingsPercent();

  return (
    <div className="tarifs-page relative min-h-screen pb-20 safe-top-offset md:pb-28">
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
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-gold-light/85">
            {t("tarifsPage.heroEyebrow")}
          </p>
          <h1 className="font-display mt-4 text-3xl font-bold leading-tight text-cream md:text-5xl lg:text-[3.25rem]">
            {t("tarifsPage.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-cream/65 md:text-lg">
            {t("tarifsPage.subtitle")}
          </p>
        </header>

        <div className="mt-14 space-y-20 md:mt-16 md:space-y-24">
          <TarifsSubscriptionsSection
            monthlyPlans={monthlyPlans}
            yearlyPlans={yearlyPlans}
            locale={locale}
            savingsPercent={savingsPercent}
          />

          <TarifsSection
            id="tickets"
            title={t("tarifsPage.sections.ticketsTitle")}
            lead={t("tarifsPage.sections.ticketsLead")}
          >
            <div className="tarifs-tickets__grid grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {ticketPlans.map((plan) => (
                <TarifsTicketCard key={plan.id} plan={plan} locale={locale} />
              ))}
            </div>
          </TarifsSection>
        </div>

        <footer className="tarifs-page__footer mt-16 text-center md:mt-20">
          <p className="text-xs text-cream/40 md:text-sm">{t("tarifsPage.paymentNotice")}</p>
        </footer>
      </div>
    </div>
  );
}
