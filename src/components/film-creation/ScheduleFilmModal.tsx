"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { FilmScheduleMiniCalendar } from "@/components/calendar/FilmScheduleMiniCalendar";
import { TicketCountPill } from "@/components/tickets/TicketCountPill";
import { parseDayKey } from "@/lib/calendar/date-utils";
import {
  BTN_3D_SECONDARY,
  BTN_FILM_CREATE_SUBMIT,
} from "@/lib/ui/button-3d-classes";

import type { SubscriptionGrantScheduleContext } from "@/lib/purchases/subscription-scheduling-types";

type ScheduleFilmModalProps = {
  open: boolean;
  registrationDate: string;
  occupiedDates?: string[];
  pending?: boolean;
  ticketsRequired: number;
  ticketBalance: number;
  hasActiveSubscription: boolean;
  insufficientTickets: boolean;
  allowScheduleWithoutTickets?: boolean;
  subscriptionGrantSchedule?: SubscriptionGrantScheduleContext;
  onSchedule: (dayKey: string) => void;
  onClose: () => void;
};

export function ScheduleFilmModal({
  open,
  registrationDate,
  occupiedDates = [],
  pending = false,
  ticketsRequired,
  ticketBalance,
  hasActiveSubscription,
  insufficientTickets,
  allowScheduleWithoutTickets = false,
  subscriptionGrantSchedule,
  onSchedule,
  onClose,
}: ScheduleFilmModalProps) {
  const { t, locale } = useLocale();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedDate(null);
    }
  }, [open]);

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

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) onClose();
    };

    const blockBackgroundScroll = (event: TouchEvent) => {
      event.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("touchmove", blockBackgroundScroll, { passive: false });

    return () => {
      window.removeEventListener("keydown", onKeyDown);
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
  }, [open, onClose, pending]);

  const showTicketCost = ticketsRequired > 0 && ticketBalance > 0;
  const blockScheduleConfirm =
    insufficientTickets && !allowScheduleWithoutTickets;

  const ticketCostLabel =
    ticketsRequired === 1
      ? t("filmCreation.form.oneTicket")
      : t("filmCreation.form.ticketsCount", { count: ticketsRequired });

  const subscriptionGrantActive = subscriptionGrantSchedule?.active ?? false;
  const minScheduleDayKey = subscriptionGrantSchedule?.minScheduleDayKey ?? null;

  const formattedMinDate = minScheduleDayKey
    ? new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(parseDayKey(minScheduleDayKey))
    : null;

  if (!open) return null;

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (pending) return;
    if ((event.target as HTMLElement).closest(".tickets-required-modal__panel")) return;
    onClose();
  };

  const formattedSelection = selectedDate
    ? new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(parseDayKey(selectedDate))
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
        aria-labelledby="schedule-film-modal-title"
        className="tickets-required-modal__panel relative z-[1] w-full max-w-[24rem]"
      >
        <div className="tickets-required-modal__shine-top" aria-hidden />

        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="tickets-required-modal__close"
          aria-label={t("filmCreation.scheduleFilm.close")}
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

        <div className="tickets-required-modal__inner schedule-film-modal__inner">
          <p className="tickets-required-modal__eyebrow">
            {t("filmCreation.scheduleFilm.eyebrow")}
          </p>
          <h2 id="schedule-film-modal-title" className="schedule-film-modal__title">
            {t("filmCreation.scheduleFilm.title")}
          </h2>
          <p className="schedule-film-modal__lead">
            {subscriptionGrantActive
              ? t("filmCreation.scheduleFilm.leadGrant")
              : t("filmCreation.scheduleFilm.lead")}
          </p>

          {formattedMinDate ? (
            <p className="schedule-film-modal__min-date text-sm text-gold-light/85">
              {t("filmCreation.scheduleFilm.minDateHint", { date: formattedMinDate })}
            </p>
          ) : subscriptionGrantActive && !subscriptionGrantSchedule?.canScheduleMore ? (
            <p className="schedule-film-modal__min-date text-sm text-amber-200/90">
              {t("filmCreation.scheduleFilm.quotaReached")}
            </p>
          ) : null}

          {subscriptionGrantActive &&
          subscriptionGrantSchedule &&
          subscriptionGrantSchedule.canScheduleMore ? (
            <p className="schedule-film-modal__quota text-sm text-cream/60">
              {t("filmCreation.scheduleFilm.quotaHint", {
                remaining: subscriptionGrantSchedule.remainingScheduleSlots,
                total: subscriptionGrantSchedule.annualGrantCap,
              })}
            </p>
          ) : null}

          <FilmScheduleMiniCalendar
            registrationDate={registrationDate}
            occupiedDates={occupiedDates}
            value={selectedDate}
            onChange={setSelectedDate}
            minScheduleDayKey={minScheduleDayKey}
          />

          {formattedSelection ? (
            <p className="schedule-film-modal__selection">
              {t("filmCreation.scheduleFilm.preview", { date: formattedSelection })}
            </p>
          ) : null}

          <div className="schedule-film-modal__actions">
            <button
              type="button"
              className={`${BTN_FILM_CREATE_SUBMIT} schedule-film-modal__submit${
                blockScheduleConfirm ? " film-create-submit--blocked" : ""
              }${!showTicketCost || pending ? " film-create-submit--solo" : ""}`}
              disabled={!selectedDate || pending || blockScheduleConfirm}
              onClick={() => {
                if (!selectedDate || pending) return;
                onSchedule(selectedDate);
              }}
            >
              {pending ? (
                <span className="film-create-submit__pending">
                  {t("filmCreation.scheduleFilm.submitPending")}
                </span>
              ) : (
                <>
                  <span className="film-create-submit__label">
                    {t("filmCreation.scheduleFilm.confirm")}
                  </span>
                  {showTicketCost ? (
                    <span className="film-create-submit__cost">
                      <TicketCountPill
                        count={ticketsRequired}
                        size="onPrimary"
                        label={ticketCostLabel}
                      />
                    </span>
                  ) : null}
                </>
              )}
            </button>
            <button
              type="button"
              className={`${BTN_3D_SECONDARY} rounded-full px-5 py-2.5 text-sm font-semibold`}
              disabled={pending}
              onClick={onClose}
            >
              {t("filmCreation.scheduleFilm.cancel")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
