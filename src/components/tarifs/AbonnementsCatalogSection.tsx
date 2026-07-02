"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import {
  AbonnementsCatalogToggle,
  type AbonnementsCatalogTab,
} from "@/components/tarifs/AbonnementsCatalogToggle";
import { TarifsSubscriptionCard } from "@/components/tarifs/TarifsSubscriptionCard";
import { TarifsTicketCard } from "@/components/tarifs/TarifsTicketCard";
import { AbonnementsSampleBlock } from "@/components/tarifs/AbonnementsSampleBlock";
import type { AbonnementsSampleOffer, TarifsSubscriptionPlan, TarifsTicketPlan } from "@/lib/i18n/tarifs-catalog";
import type { LocaleCode } from "@/lib/i18n/locales";

type AbonnementsCatalogSectionProps = {
  yearlyPlans: TarifsSubscriptionPlan[];
  ticketPlans: TarifsTicketPlan[];
  sampleOffer: AbonnementsSampleOffer;
  locale: LocaleCode;
};

export function AbonnementsCatalogSection({
  yearlyPlans,
  ticketPlans,
  sampleOffer,
  locale,
}: AbonnementsCatalogSectionProps) {
  const { t } = useLocale();
  const [tab, setTab] = useState<AbonnementsCatalogTab>("subscriptions");

  return (
    <section className="tarifs-page__section abonnements-catalog scroll-mt-28">
      <div className="tarifs-subscriptions__header">
        <div className="tarifs-subscriptions__toolbar">
          <AbonnementsCatalogToggle value={tab} onChange={setTab} />
          <div className="abonnements-catalog__intro">
            <h2>
              {tab === "tickets"
                ? t("tarifsPage.sections.ticketsTitle")
                : t("abonnementsPage.catalogIntro.subscriptionsTitle")}
            </h2>
            <p>
              {tab === "tickets"
                ? t("tarifsPage.sections.ticketsLead")
                : t("abonnementsPage.catalogIntro.subscriptionsLead")}
            </p>
          </div>
        </div>
      </div>

      {tab === "tickets" ? (
        <div key="tickets" className="abonnements-catalog__tickets-stack">
          <div className="tarifs-tickets__grid abonnements-catalog__tickets-grid grid gap-6 sm:grid-cols-2 lg:grid-cols-6 lg:gap-8">
            {ticketPlans.map((plan) => (
              <TarifsTicketCard key={plan.id} plan={plan} locale={locale} goldCheckout />
            ))}
            <div className="abonnements-catalog__sample-slot">
              <AbonnementsSampleBlock offer={sampleOffer} locale={locale} />
            </div>
          </div>
        </div>
      ) : (
        <div
          key="subscriptions"
          className="tarifs-subscriptions__grid abonnements-catalog__subscriptions-grid grid gap-6 md:grid-cols-2 md:items-stretch md:gap-8"
        >
          {yearlyPlans.map((plan) => (
            <TarifsSubscriptionCard
              key={plan.id}
              plan={plan}
              locale={locale}
              showYearlySavings={false}
              goldCheckout
            />
          ))}
        </div>
      )}
    </section>
  );
}
