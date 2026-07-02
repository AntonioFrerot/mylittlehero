import Image from "next/image";
import type { TarifsTicketPlan } from "@/lib/i18n/tarifs-catalog";
import { TarifsPerFilmRow } from "@/components/tarifs/TarifsPerFilmRow";
import { CheckoutButton } from "@/components/pricing/CheckoutButton";
import { createTranslator } from "@/lib/i18n/translator";
import type { LocaleCode } from "@/lib/i18n/locales";
import {
  BTN_ABONNEMENTS_GOLD_CTA,
  SURFACE_3D_TARIFS_PLAN,
  SURFACE_3D_TARIFS_PLAN_FEATURED,
} from "@/lib/ui/button-3d-classes";
import {
  SITE_TICKET_TARIFS_HEIGHT,
  SITE_TICKET_TARIFS_SRC,
  SITE_TICKET_TARIFS_WIDTH,
} from "@/lib/brand";

type TarifsTicketCardProps = {
  plan: TarifsTicketPlan;
  locale: LocaleCode;
  goldCheckout?: boolean;
};

function TarifsTicketIcon({ count }: { count: number }) {
  const imageProps = {
    src: SITE_TICKET_TARIFS_SRC,
    alt: "",
    width: SITE_TICKET_TARIFS_WIDTH,
    height: SITE_TICKET_TARIFS_HEIGHT,
    className: "tarifs-ticket-card__icon-img",
    sizes: "(max-width: 768px) 120px, 140px",
    draggable: false,
  } as const;

  return (
    <div className="tarifs-ticket-card__icon-wrap" aria-hidden>
      {count > 1 ? (
        <>
          <div className="tarifs-ticket-card__icon-layer tarifs-ticket-card__icon-layer--back">
            <Image {...imageProps} />
          </div>
          {count >= 3 ? (
            <div className="tarifs-ticket-card__icon-layer tarifs-ticket-card__icon-layer--mid">
              <Image {...imageProps} />
            </div>
          ) : null}
        </>
      ) : null}
      <div className="tarifs-ticket-card__icon-front">
        <Image {...imageProps} />
      </div>
    </div>
  );
}

export function TarifsTicketCard({ plan, locale, goldCheckout = false }: TarifsTicketCardProps) {
  const t = createTranslator(locale);

  return (
    <article
      className={`tarifs-plan-card tarifs-ticket-card group relative flex h-full flex-col ${
        plan.highlighted ? `tarifs-plan-card--featured ${SURFACE_3D_TARIFS_PLAN_FEATURED}` : SURFACE_3D_TARIFS_PLAN
      }`}
    >
      {plan.highlighted ? (
        <span className="tarifs-plan-card__badge">{t("tarifsPage.bestValue")}</span>
      ) : null}

      <div className="tarifs-plan-card__inner flex flex-1 flex-col">
        <p className="tarifs-plan-card__eyebrow">{t("tarifsPage.tickets.eyebrow")}</p>

        <div className="tarifs-ticket-card__visual">
          <TarifsTicketIcon count={plan.ticketCount} />
          <h3 className="tarifs-plan-card__title tarifs-ticket-card__title">{plan.name}</h3>
          <p className="tarifs-plan-card__subtitle tarifs-ticket-card__subtitle">
            {t("tarifsPage.tickets.oneFilmEach")}
          </p>
        </div>

        <div className="tarifs-plan-card__price-block tarifs-ticket-card__price-block text-center">
          <TarifsPerFilmRow label={plan.perFilmPrice} centered />
          <span className="tarifs-plan-card__price">{plan.price}</span>
        </div>

        <div className="tarifs-plan-card__spacer" aria-hidden />

        <CheckoutButton
          planId={plan.stripePlanId}
          planType="purchase"
          variant={goldCheckout || plan.highlighted ? "primary" : "secondary"}
          className={
            goldCheckout
              ? BTN_ABONNEMENTS_GOLD_CTA
              : `tarifs-plan-card__cta w-full !rounded-xl !px-4 !py-3.5 !text-sm ${
                  plan.highlighted ? "" : "!border-white/12 !bg-white/[0.03]"
                }`
          }
        >
          {t("tarifsPage.tickets.buy")}
        </CheckoutButton>
      </div>
    </article>
  );
}
