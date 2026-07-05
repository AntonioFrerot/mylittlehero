"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
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
import { BTN_3D_SECONDARY } from "@/lib/ui/button-3d-classes";

const WEEKDAY_KEYS = [
  "calendar.weekdays.mon",
  "calendar.weekdays.tue",
  "calendar.weekdays.wed",
  "calendar.weekdays.thu",
  "calendar.weekdays.fri",
  "calendar.weekdays.sat",
  "calendar.weekdays.sun",
] as const;

type FilmScheduleMiniCalendarProps = {
  registrationDate: string;
  occupiedDates?: string[];
  value: string | null;
  onChange: (dayKey: string) => void;
  /** Date minimum (YYYY-MM-DD) pour abonnés sans ticket. */
  minScheduleDayKey?: string | null;
};

export function FilmScheduleMiniCalendar({
  registrationDate,
  occupiedDates = [],
  value,
  onChange,
  minScheduleDayKey = null,
}: FilmScheduleMiniCalendarProps) {
  const { t, locale } = useLocale();
  const bounds = useMemo(
    () => getCalendarBounds(new Date(registrationDate), new Date()),
    [registrationDate]
  );
  const [viewDate, setViewDate] = useState(() => getInitialViewMonth(bounds));
  const occupiedSet = useMemo(() => new Set(occupiedDates), [occupiedDates]);
  const todayKey = todayDayKey();

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

  return (
    <div className="film-calendar-mini">
      <div className="film-calendar-mini__header">
        <button
          type="button"
          className={`film-calendar-mini__nav ${BTN_3D_SECONDARY}`}
          disabled={!canGoPrev}
          onClick={() =>
            setViewDate((current) => clampViewMonth(addMonths(current, -1), bounds))
          }
          aria-label={t("calendar.prevMonth")}
        >
          ‹
        </button>
        <p className="film-calendar-mini__month">{monthLabel}</p>
        <button
          type="button"
          className={`film-calendar-mini__nav ${BTN_3D_SECONDARY}`}
          disabled={!canGoNext}
          onClick={() =>
            setViewDate((current) => clampViewMonth(addMonths(current, 1), bounds))
          }
          aria-label={t("calendar.nextMonth")}
        >
          ›
        </button>
      </div>

      <div className="film-calendar-mini__weekdays" aria-hidden>
        {WEEKDAY_KEYS.map((key) => (
          <span key={key}>{t(key)}</span>
        ))}
      </div>

      <div className="film-calendar-mini__grid" role="grid" aria-label={monthLabel}>
        {grid.map((dayKey, index) => {
          if (!dayKey) {
            return <div key={`empty-${index}`} className="film-calendar-mini__day film-calendar-mini__day--empty" aria-hidden />;
          }

          const dayNumber = parseDayKey(dayKey).getDate();
          const schedulable =
            isDaySchedulable(dayKey, bounds, todayKey) &&
            (!minScheduleDayKey || dayKey >= minScheduleDayKey);
          const occupied = occupiedSet.has(dayKey);
          const isSelected = value === dayKey;
          const isToday = isTodayKey(dayKey);
          const isPast = isPastDayKey(dayKey);

          let stateClass = "film-calendar-mini__day--muted";
          if (occupied) stateClass = "film-calendar-mini__day--occupied";
          else if (isSelected) stateClass = "film-calendar-mini__day--selected";
          else if (schedulable) stateClass = "film-calendar-mini__day--available";

          return (
            <button
              key={dayKey}
              type="button"
              role="gridcell"
              disabled={!schedulable || occupied || isPast}
              aria-pressed={isSelected}
              className={`film-calendar-mini__day btn-3d btn-3d--secondary ${stateClass}${
                isToday ? " film-calendar-mini__day--today" : ""
              }`}
              onClick={() => onChange(dayKey)}
            >
              {dayNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
}
