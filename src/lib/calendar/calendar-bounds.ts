import { parseDayKey, toDayKey } from "./date-utils";

export type CalendarBounds = {
  minMonth: Date;
  maxMonth: Date;
  maxDayKey: string;
  minMonthKey: string;
  maxMonthKey: string;
};

function monthKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

export function getCalendarBounds(
  registrationDate: Date,
  now: Date = new Date()
): CalendarBounds {
  const minMonth = new Date(
    registrationDate.getFullYear(),
    registrationDate.getMonth(),
    1
  );

  const maxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  maxDate.setMonth(maxDate.getMonth() + 12);
  const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

  return {
    minMonth,
    maxMonth,
    maxDayKey: toDayKey(maxDate),
    minMonthKey: monthKey(minMonth),
    maxMonthKey: monthKey(maxMonth),
  };
}

export function isMonthBeforeMin(viewDate: Date, minMonth: Date): boolean {
  return (
    viewDate.getFullYear() < minMonth.getFullYear() ||
    (viewDate.getFullYear() === minMonth.getFullYear() &&
      viewDate.getMonth() < minMonth.getMonth())
  );
}

export function isMonthAfterMax(viewDate: Date, maxMonth: Date): boolean {
  return (
    viewDate.getFullYear() > maxMonth.getFullYear() ||
    (viewDate.getFullYear() === maxMonth.getFullYear() &&
      viewDate.getMonth() > maxMonth.getMonth())
  );
}

export function clampViewMonth(viewDate: Date, bounds: CalendarBounds): Date {
  if (isMonthBeforeMin(viewDate, bounds.minMonth)) {
    return new Date(bounds.minMonth);
  }
  if (isMonthAfterMax(viewDate, bounds.maxMonth)) {
    return new Date(bounds.maxMonth);
  }
  return new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
}

export function getInitialViewMonth(bounds: CalendarBounds): Date {
  const today = new Date();
  const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  return clampViewMonth(todayMonth, bounds);
}

export function canNavigateToPrevMonth(
  viewDate: Date,
  bounds: CalendarBounds
): boolean {
  return (
    viewDate.getFullYear() > bounds.minMonth.getFullYear() ||
    (viewDate.getFullYear() === bounds.minMonth.getFullYear() &&
      viewDate.getMonth() > bounds.minMonth.getMonth())
  );
}

export function canNavigateToNextMonth(
  viewDate: Date,
  bounds: CalendarBounds
): boolean {
  return (
    viewDate.getFullYear() < bounds.maxMonth.getFullYear() ||
    (viewDate.getFullYear() === bounds.maxMonth.getFullYear() &&
      viewDate.getMonth() < bounds.maxMonth.getMonth())
  );
}

function isDayBeforeRegistrationMonth(
  dayKey: string,
  bounds: CalendarBounds
): boolean {
  return dayKey.slice(0, 7) < bounds.minMonthKey;
}

function isDayAfterMaxSchedule(dayKey: string, bounds: CalendarBounds): boolean {
  return dayKey > bounds.maxDayKey;
}

export function isDayWithinScheduleRange(
  dayKey: string,
  bounds: CalendarBounds
): boolean {
  if (isDayBeforeRegistrationMonth(dayKey, bounds)) return false;
  if (isDayAfterMaxSchedule(dayKey, bounds)) return false;
  return true;
}

export function isDaySchedulable(
  dayKey: string,
  bounds: CalendarBounds,
  todayKey: string
): boolean {
  if (dayKey < todayKey) return false;
  return isDayWithinScheduleRange(dayKey, bounds);
}

export function isScheduleDateAllowed(
  dayKey: string,
  registrationDate: Date,
  todayKey: string = toDayKey(new Date())
): boolean {
  const today = parseDayKey(todayKey);
  return isDaySchedulable(
    dayKey,
    getCalendarBounds(registrationDate, today),
    todayKey
  );
}
