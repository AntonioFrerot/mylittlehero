"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import {
  cancelScheduledFilm,
  scheduleFilmsOnDates,
} from "@/lib/calendar/actions";
import {
  addMonths,
  getCalendarGrid,
  isPastDayKey,
  isTodayKey,
  parseDayKey,
  todayDayKey,
} from "@/lib/calendar/date-utils";
import {
  canNavigateToNextMonth,
  canNavigateToPrevMonth,
  clampViewMonth,
  getCalendarBounds,
  getInitialViewMonth,
  isDaySchedulable,
} from "@/lib/calendar/calendar-bounds";
import type { FilmScheduleEntry } from "@/lib/calendar/types";
import {
  BTN_3D_PRIMARY_ACTION,
  BTN_3D_SECONDARY,
  SURFACE_3D_PANEL_LG,
} from "@/lib/ui/button-3d-classes";

type FilmCalendarProps = {
  schedules: FilmScheduleEntry[];
  ticketBalance: number;
  hasActiveSubscription: boolean;
  availableSlots: number;
  canSchedule: boolean;
  registrationDate: string;
};

const WEEKDAY_KEYS = [
  "calendar.weekdays.mon",
  "calendar.weekdays.tue",
  "calendar.weekdays.wed",
  "calendar.weekdays.thu",
  "calendar.weekdays.fri",
  "calendar.weekdays.sat",
  "calendar.weekdays.sun",
] as const;

export function FilmCalendar({
  schedules: initialSchedules,
  ticketBalance,
  hasActiveSubscription,
  availableSlots,
  canSchedule,
  registrationDate,
}: FilmCalendarProps) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const bounds = useMemo(
    () => getCalendarBounds(new Date(registrationDate)),
    [registrationDate]
  );
  const [viewDate, setViewDate] = useState(() => getInitialViewMonth(bounds));
  const [schedules, setSchedules] = useState(initialSchedules);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [focusedScheduleId, setFocusedScheduleId] = useState<string | null>(
    null
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setSchedules(initialSchedules);
  }, [initialSchedules]);

  const scheduleByDate = useMemo(() => {
    const map = new Map<string, FilmScheduleEntry>();
    for (const entry of schedules) {
      map.set(entry.scheduledDate, entry);
    }
    return map;
  }, [schedules]);

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
      month: "long",
      year: "numeric",
    }).format(viewDate);
  }, [locale, viewDate]);

  const grid = useMemo(
    () => getCalendarGrid(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  );

  const canGoPrev = canNavigateToPrevMonth(viewDate, bounds);
  const canGoNext = canNavigateToNextMonth(viewDate, bounds);
  const todayKey = todayDayKey();

  const rangeLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
      month: "long",
      year: "numeric",
    });
    return {
      from: formatter.format(bounds.minMonth),
      to: formatter.format(bounds.maxMonth),
    };
  }, [bounds.maxMonth, bounds.minMonth, locale]);

  const focusedSchedule = focusedScheduleId
    ? schedules.find((entry) => entry.id === focusedScheduleId) ?? null
    : null;

  const selectedCount = selectedDates.size;
  const canConfirm =
    selectedCount > 0 &&
    selectedCount <= availableSlots &&
    canSchedule &&
    !pending;

  function toggleDate(dayKey: string) {
    const schedulable = isDaySchedulable(dayKey, bounds, todayKey);

    if (!schedulable || scheduleByDate.has(dayKey)) {
      const existing = scheduleByDate.get(dayKey);
      if (existing) {
        setFocusedScheduleId(existing.id);
        setSelectedDates(new Set());
      }
      return;
    }

    setFocusedScheduleId(null);
    setSelectedDates((current) => {
      const next = new Set(current);
      if (next.has(dayKey)) {
        next.delete(dayKey);
      } else if (next.size < availableSlots) {
        next.add(dayKey);
      }
      return next;
    });
    setError(null);
    setMessage(null);
  }

  function clearSelection() {
    setSelectedDates(new Set());
    setFocusedScheduleId(null);
    setError(null);
  }

  function handleSchedule() {
    if (!canConfirm) return;

    startTransition(async () => {
      const result = await scheduleFilmsOnDates([...selectedDates]);
      if (!result.ok) {
        setError(result.error);
        setMessage(null);
        return;
      }

      setMessage(
        result.count === 1
          ? t("calendar.successOne")
          : t("calendar.successMany", { count: result.count })
      );
      setError(null);
      setSelectedDates(new Set());
      router.refresh();
    });
  }

  function handleCancelSchedule() {
    if (!focusedSchedule) return;

    startTransition(async () => {
      const result = await cancelScheduledFilm(focusedSchedule.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSchedules((current) =>
        current.filter((entry) => entry.id !== focusedSchedule.id)
      );
      setFocusedScheduleId(null);
      setMessage(t("calendar.cancelSuccess"));
      setError(null);
      router.refresh();
    });
  }

  function formatDayLabel(dayKey: string): string {
    return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(parseDayKey(dayKey));
  }

  return (
    <div className="film-calendar">
      <div className="film-calendar__summary">
        {hasActiveSubscription ? (
          <p className="film-calendar__summary-text">
            {t("calendar.subscriptionActive")}
          </p>
        ) : (
          <p className="film-calendar__summary-text">
            {t("calendar.ticketsAvailable", { count: ticketBalance })}
            {availableSlots > 0 && availableSlots < 999
              ? ` · ${t("calendar.slotsAvailable", { count: availableSlots })}`
              : null}
          </p>
        )}
        {!canSchedule ? (
          <p className="film-calendar__hint film-calendar__hint--warn">
            {t("calendar.noTicketsHint")}{" "}
            <Link href="/achat" className="text-gold-light hover:text-gold">
              {t("calendar.buyTickets")}
            </Link>
          </p>
        ) : (
          <p className="film-calendar__hint">{t("calendar.selectHint")}</p>
        )}
        <p className="film-calendar__hint">
          {t("calendar.rangeHint", {
            from: rangeLabel.from,
            to: rangeLabel.to,
          })}
        </p>
      </div>

      <div className={`film-calendar__panel ${SURFACE_3D_PANEL_LG}`}>
        <div className="film-calendar__header">
          <button
            type="button"
            className={`film-calendar__nav-btn ${BTN_3D_SECONDARY}`}
            disabled={!canGoPrev || pending}
            onClick={() =>
              setViewDate((current) =>
                clampViewMonth(addMonths(current, -1), bounds)
              )
            }
            aria-label={t("calendar.prevMonth")}
          >
            ‹
          </button>
          <h2 className="film-calendar__month">{monthLabel}</h2>
          <button
            type="button"
            className={`film-calendar__nav-btn ${BTN_3D_SECONDARY}`}
            disabled={!canGoNext || pending}
            onClick={() =>
              setViewDate((current) =>
                clampViewMonth(addMonths(current, 1), bounds)
              )
            }
            aria-label={t("calendar.nextMonth")}
          >
            ›
          </button>
        </div>

        <div className="film-calendar__weekdays" aria-hidden>
          {WEEKDAY_KEYS.map((key) => (
            <span key={key} className="film-calendar__weekday">
              {t(key)}
            </span>
          ))}
        </div>

        <div className="film-calendar__grid" role="grid" aria-label={monthLabel}>
          {grid.map((dayKey, index) => {
            if (!dayKey) {
              return (
                <div
                  key={`empty-${index}`}
                  className="film-calendar__day film-calendar__day--empty"
                  aria-hidden
                />
              );
            }

            const dayNumber = parseDayKey(dayKey).getDate();
            const isPast = isPastDayKey(dayKey);
            const schedulable = isDaySchedulable(dayKey, bounds, todayKey);
            const isToday = isTodayKey(dayKey);
            const scheduled = scheduleByDate.get(dayKey);
            const isSelected = selectedDates.has(dayKey);
            const isFocused = scheduled?.id === focusedScheduleId;

            let stateClass = "";
            if (isPast || !schedulable) stateClass = "film-calendar__day--past";
            else if (scheduled) stateClass = "film-calendar__day--scheduled";
            else if (isSelected) stateClass = "film-calendar__day--selected";
            else if (canSchedule) stateClass = "film-calendar__day--available";

            return (
              <button
                key={dayKey}
                type="button"
                role="gridcell"
                disabled={
                  pending || (!scheduled && !schedulable) || (!canSchedule && !scheduled)
                }
                aria-pressed={isSelected || Boolean(isFocused)}
                aria-label={
                  scheduled
                    ? t("calendar.dayScheduled", { date: formatDayLabel(dayKey) })
                    : isSelected
                      ? t("calendar.daySelected", { date: formatDayLabel(dayKey) })
                      : formatDayLabel(dayKey)
                }
                className={`film-calendar__day btn-3d btn-3d--secondary ${stateClass}${
                  isToday ? " film-calendar__day--today" : ""
                }${isFocused ? " film-calendar__day--focused" : ""}`}
                onClick={() => toggleDate(dayKey)}
              >
                <span className="film-calendar__day-number">{dayNumber}</span>
                {scheduled ? (
                  <span className="film-calendar__day-badge" aria-hidden>
                    ★
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="film-calendar__legend">
          <span className="film-calendar__legend-item">
            <span className="film-calendar__legend-dot film-calendar__legend-dot--scheduled" />
            {t("calendar.legendScheduled")}
          </span>
          <span className="film-calendar__legend-item">
            <span className="film-calendar__legend-dot film-calendar__legend-dot--selected" />
            {t("calendar.legendSelected")}
          </span>
        </div>
      </div>

      {focusedSchedule ? (
        <div className={`film-calendar__action-panel ${SURFACE_3D_PANEL_LG}`}>
          <p className="film-calendar__action-title">
            {t("calendar.scheduledOn", {
              date: formatDayLabel(focusedSchedule.scheduledDate),
            })}
          </p>
          <div className="film-calendar__action-buttons">
            <Link
              href="/creer-film"
              className={BTN_3D_PRIMARY_ACTION}
              onClick={() => setFocusedScheduleId(null)}
            >
              {t("calendar.createFilm")}
            </Link>
            <button
              type="button"
              className={`${BTN_3D_SECONDARY} rounded-full px-5 py-2.5 text-sm font-semibold`}
              disabled={pending}
              onClick={handleCancelSchedule}
            >
              {t("calendar.cancelSchedule")}
            </button>
          </div>
        </div>
      ) : null}

      {selectedCount > 0 ? (
        <div className={`film-calendar__action-panel ${SURFACE_3D_PANEL_LG}`}>
          <p className="film-calendar__action-title">
            {selectedCount === 1
              ? t("calendar.selectedOne")
              : t("calendar.selectedMany", { count: selectedCount })}
          </p>
          {selectedCount > availableSlots ? (
            <p className="film-calendar__hint film-calendar__hint--warn">
              {t("calendar.errors.notEnoughTickets")}
            </p>
          ) : null}
          <div className="film-calendar__action-buttons">
            <button
              type="button"
              className={BTN_3D_PRIMARY_ACTION}
              disabled={!canConfirm}
              onClick={handleSchedule}
            >
              {pending
                ? t("calendar.scheduling")
                : selectedCount === 1
                  ? t("calendar.scheduleOne")
                  : t("calendar.scheduleMany", { count: selectedCount })}
            </button>
            <button
              type="button"
              className={`${BTN_3D_SECONDARY} rounded-full px-5 py-2.5 text-sm font-semibold`}
              disabled={pending}
              onClick={clearSelection}
            >
              {t("calendar.clearSelection")}
            </button>
          </div>
        </div>
      ) : null}

      {message ? (
        <p className="film-calendar__feedback film-calendar__feedback--success">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="film-calendar__feedback film-calendar__feedback--error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
