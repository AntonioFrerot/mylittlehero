import Image from "next/image";
import { TarifsPerFilmRow } from "@/components/tarifs/TarifsPerFilmRow";
import { CheckoutButton } from "@/components/pricing/CheckoutButton";
import type { AbonnementsSampleOffer } from "@/lib/i18n/tarifs-catalog";
import { createTranslator } from "@/lib/i18n/translator";
import type { LocaleCode } from "@/lib/i18n/locales";
import { SITE_JETON_HEIGHT, SITE_JETON_SRC, SITE_JETON_WIDTH } from "@/lib/brand";
import { BTN_ABONNEMENTS_GOLD_CTA, SURFACE_3D_TARIFS_PLAN } from "@/lib/ui/button-3d-classes";

type AbonnementsSampleBlockProps = {
  offer: AbonnementsSampleOffer;
  locale: LocaleCode;
};

export function AbonnementsSampleBlock({ offer, locale }: AbonnementsSampleBlockProps) {
  const t = createTranslator(locale);

  return (
    <article
      className={`tarifs-plan-card tarifs-ticket-card tarifs-sample-strip group relative flex h-full flex-col ${SURFACE_3D_TARIFS_PLAN}`}
    >
      <div className="tarifs-plan-card__inner flex flex-1 flex-col">
        <p className="tarifs-plan-card__eyebrow tarifs-sample-strip__eyebrow">
          {t("abonnementsPage.sampleBlock.eyebrow")}
        </p>

        <div className="tarifs-ticket-card__visual">
          <div
            className="tarifs-ticket-card__icon-wrap tarifs-sample-strip__icon-wrap"
            aria-hidden
          >
            <Image
              src={SITE_JETON_SRC}
              alt=""
              width={SITE_JETON_WIDTH}
              height={SITE_JETON_HEIGHT}
              className="tarifs-sample-strip__icon"
              sizes="(max-width: 768px) 120px, 60px"
              draggable={false}
            />
          </div>

          <div className="tarifs-sample-strip__copy">
            <h3 className="tarifs-plan-card__title tarifs-ticket-card__title">
              {t("abonnementsPage.sampleBlock.title")}
            </h3>
            <p className="tarifs-plan-card__subtitle tarifs-ticket-card__subtitle">
              {t("abonnementsPage.sampleBlock.lead")}
            </p>
          </div>
        </div>

        <div className="tarifs-sample-strip__aside">
          <div className="tarifs-plan-card__price-block tarifs-ticket-card__price-block text-center">
            <TarifsPerFilmRow
              label={t("abonnementsPage.sampleBlock.duration")}
              centered
            />
            <span className="tarifs-plan-card__price">{offer.price}</span>
          </div>

          <div className="tarifs-plan-card__spacer" aria-hidden />

            <CheckoutButton
              planId={offer.stripePlanId}
              planType="purchase"
              variant="primary"
              className={BTN_ABONNEMENTS_GOLD_CTA}
            >
            {t("abonnementsPage.sampleBlock.buy")}
          </CheckoutButton>
        </div>
      </div>
    </article>
  );
}
