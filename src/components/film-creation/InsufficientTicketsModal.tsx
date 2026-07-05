"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, type MouseEvent } from "react";
import { useLocale } from "@/components/LocaleProvider";
import {
  SITE_TICKET_IMAGE_HEIGHT,
  SITE_TICKET_IMAGE_WIDTH,
  SITE_TICKET_SRC,
} from "@/lib/brand";
import { BTN_ABONNEMENTS_GOLD_CTA } from "@/lib/ui/button-3d-classes";
import { ABONNEMENTS_TICKETS_SECTION } from "@/components/tarifs/AbonnementsCatalogSection";

const ABONNEMENTS_TICKETS_HREF = `/abonnements?section=${ABONNEMENTS_TICKETS_SECTION}`;

type InsufficientTicketsModalProps = {
  open: boolean;
  ticketBalance: number;
  ticketsRequired?: number;
  onClose: () => void;
};

export function InsufficientTicketsModal({
  open,
  ticketBalance,
  ticketsRequired,
  onClose,
}: InsufficientTicketsModalProps) {
  const { t } = useLocale();

  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyLeft = document.body.style.left;
    const previousBodyRight = document.body.style.right;
    const previousBodyWidth = document.body.style.width;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    const blockBackgroundScroll = (event: TouchEvent) => {
      event.preventDefault();
    };

    document.addEventListener("touchmove", blockBackgroundScroll, { passive: false });

    return () => {
      document.removeEventListener("touchmove", blockBackgroundScroll);
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.left = previousBodyLeft;
      document.body.style.right = previousBodyRight;
      document.body.style.width = previousBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  if (!open) return null;

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest(".tickets-required-modal__panel")) return;
    onClose();
  };

  const missingTickets =
    ticketsRequired != null ? Math.max(0, ticketsRequired - ticketBalance) : null;

  const titleMessage =
    ticketsRequired === 1
      ? t("filmCreation.insufficientTicketsModal.titleOne")
      : ticketsRequired != null
        ? t("filmCreation.insufficientTicketsModal.titleMany", {
            count: ticketsRequired,
          })
        : t("filmCreation.insufficientTicketsModal.titleFallback");

  const missingMessage =
    missingTickets != null && missingTickets > 0
      ? missingTickets === 1
        ? t("filmCreation.insufficientTicketsModal.missingOne")
        : t("filmCreation.insufficientTicketsModal.missingMany", {
            count: missingTickets,
          })
      : null;

  return (
    <div
      className="tickets-required-modal fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
      onClick={handleOverlayClick}
    >
      <div className="tickets-required-modal__backdrop absolute inset-0" aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="insufficient-tickets-modal-title"
        className="tickets-required-modal__panel relative z-[1] w-full max-w-[22rem]"
      >
        <div className="tickets-required-modal__shine-top" aria-hidden />

        <button
          type="button"
          onClick={onClose}
          className="tickets-required-modal__close"
          aria-label={t("filmCreation.insufficientTicketsModal.close")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="tickets-required-modal__inner">
          <p className="tickets-required-modal__eyebrow">
            {t("filmCreation.insufficientTicketsModal.eyebrow")}
          </p>

          <div className="tickets-required-modal__hero">
            <div className="tickets-required-modal__icon-wrap" aria-hidden>
              <div className="tickets-required-modal__icon-halo" />
              <Image
                src={SITE_TICKET_SRC}
                alt=""
                width={SITE_TICKET_IMAGE_WIDTH}
                height={SITE_TICKET_IMAGE_HEIGHT}
                className="tickets-required-modal__ticket-icon"
                sizes="96px"
                draggable={false}
                priority
              />
            </div>

            <h2 id="insufficient-tickets-modal-title" className="tickets-required-modal__title">
              {titleMessage}
            </h2>

            {missingMessage ? (
              <p className="tickets-required-modal__missing">{missingMessage}</p>
            ) : null}
          </div>

          <div className="tickets-required-modal__actions">
            <Link
              href={ABONNEMENTS_TICKETS_HREF}
              className={`tickets-required-modal__cta btn-3d btn-3d--primary ${BTN_ABONNEMENTS_GOLD_CTA}`}
              onClick={onClose}
            >
              {t("filmCreation.insufficientTicketsModal.purchaseCta")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
