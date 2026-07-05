import {
  addPeriodToDayKey,
  parseDayKey,
  todayDayKey,
  toDayKey,
} from "@/lib/calendar/date-utils";
import type { UserFilm } from "@/lib/film-creation/types";
import type { SubscriptionGrantPeriod } from "./subscription-tier";

export function collectSubscriptionGrantScheduleDates(
  films: UserFilm[]
): string[] {
  return films
    .filter((film) => film.scheduledViaSubscriptionGrant && film.scheduledDate)
    .map((film) => film.scheduledDate!)
    .sort();
}

export function getSubscriptionYearIndex(
  anchorDayKey: string,
  todayKey: string = todayDayKey()
): number {
  const anchor = parseDayKey(anchorDayKey);
  const today = parseDayKey(todayKey);

  let years = today.getFullYear() - anchor.getFullYear();
  const anniversaryThisYear = new Date(
    today.getFullYear(),
    anchor.getMonth(),
    anchor.getDate()
  );
  if (today < anniversaryThisYear) {
    years -= 1;
  }

  return Math.max(0, years);
}

export function getSubscriptionYearStartDayKey(
  anchorDayKey: string,
  yearIndex: number
): string {
  const anchor = parseDayKey(anchorDayKey);
  return toDayKey(
    new Date(anchor.getFullYear() + yearIndex, anchor.getMonth(), anchor.getDate())
  );
}

export function listGrantDatesForSubscriptionYear(input: {
  anchorDayKey: string;
  period: SubscriptionGrantPeriod;
  annualCap: number;
  yearIndex?: number;
  todayKey?: string;
}): string[] {
  const todayKey = input.todayKey ?? todayDayKey();
  const yearIndex =
    input.yearIndex ??
    getSubscriptionYearIndex(input.anchorDayKey, todayKey);
  const yearStart = getSubscriptionYearStartDayKey(input.anchorDayKey, yearIndex);

  const dates: string[] = [];
  for (let index = 1; index <= input.annualCap; index += 1) {
    dates.push(addPeriodToDayKey(yearStart, input.period, index));
  }
  return dates;
}

export function countElapsedGrantPeriodsInCurrentYear(input: {
  anchorDayKey: string;
  period: SubscriptionGrantPeriod;
  annualCap: number;
  todayKey?: string;
}): number {
  const todayKey = input.todayKey ?? todayDayKey();
  const grantDates = listGrantDatesForSubscriptionYear({
    anchorDayKey: input.anchorDayKey,
    period: input.period,
    annualCap: input.annualCap,
    todayKey,
  });

  return grantDates.filter((grantDate) => grantDate <= todayKey).length;
}

export function getRemainingSubscriptionGrantScheduleSlots(input: {
  anchorDayKey: string;
  period: SubscriptionGrantPeriod;
  annualCap: number;
  scheduledGrantDates: string[];
  todayKey?: string;
}): number {
  const todayKey = input.todayKey ?? todayDayKey();
  const elapsed = countElapsedGrantPeriodsInCurrentYear({
    anchorDayKey: input.anchorDayKey,
    period: input.period,
    annualCap: input.annualCap,
    todayKey,
  });
  const futureScheduledCount = input.scheduledGrantDates.filter(
    (date) => date >= todayKey
  ).length;

  return Math.max(0, input.annualCap - elapsed - futureScheduledCount);
}

export function buildSubscriptionPeriodReferenceId(input: {
  yearStartDayKey: string;
  periodIndex: number;
}): string {
  return `subscription-period:${input.yearStartDayKey}:${input.periodIndex}`;
}

export function getNextSubscriptionGrantDate(input: {
  anchorDayKey: string;
  period: SubscriptionGrantPeriod;
  priorGrantDates: string[];
}): string {
  const sorted = [...input.priorGrantDates].sort();
  const base =
    sorted.length > 0 ? sorted[sorted.length - 1]! : input.anchorDayKey;
  return addPeriodToDayKey(base, input.period, 1);
}

export function isSubscriptionGrantScheduleDateAllowed(
  dayKey: string,
  minScheduleDayKey: string
): boolean {
  return dayKey >= minScheduleDayKey && dayKey >= todayDayKey();
}

export function isSubscriptionGrantScheduling(input: {
  hasActiveSubscription: boolean;
  ticketBalance: number;
}): boolean {
  return input.hasActiveSubscription && input.ticketBalance <= 0;
}
