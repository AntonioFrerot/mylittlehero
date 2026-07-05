"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/get-session";
import { findUserByEmail } from "@/lib/auth/users-store";
import { getServerTranslator } from "@/lib/i18n/server";
import { getTicketBalanceForUser } from "@/lib/purchases/tickets";
import { hasActiveSubscriptionForUser } from "@/lib/purchases/has-active-subscription";
import { isPastDayKey, todayDayKey } from "./date-utils";
import { isScheduleDateAllowed } from "./calendar-bounds";
import {
  canScheduleFilms,
  getAvailableScheduleSlots,
} from "./eligibility";
import {
  addUserFilmSchedules,
  listUserFilmSchedules,
  removeUserFilmSchedule,
} from "./store";
import type { FilmScheduleEntry } from "./types";

export type FilmCalendarContext = {
  schedules: FilmScheduleEntry[];
  ticketBalance: number;
  hasActiveSubscription: boolean;
  availableSlots: number;
  canSchedule: boolean;
  registrationDate: string;
};

export async function getMyFilmCalendarContext(): Promise<FilmCalendarContext | null> {
  const session = await getSession();
  if (!session) return null;

  const [schedules, ticketBalance, user] = await Promise.all([
    listUserFilmSchedules(session.email),
    getTicketBalanceForUser(session.email),
    findUserByEmail(session.email),
  ]);

  const hasActiveSubscription = hasActiveSubscriptionForUser({
    email: session.email,
    subscriptionPlanId: user?.subscriptionPlanId,
  });
  const availableSlots = getAvailableScheduleSlots({
    ticketBalance,
    hasActiveSubscription,
    schedules,
  });

  if (!user?.createdAt) {
    return null;
  }

  return {
    schedules,
    ticketBalance,
    hasActiveSubscription,
    availableSlots,
    canSchedule: canScheduleFilms({ ticketBalance, hasActiveSubscription }),
    registrationDate: user.createdAt,
  };
}

export async function scheduleFilmsOnDates(
  dates: string[]
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  const session = await getSession();
  const { t } = await getServerTranslator();
  if (!session) {
    return { ok: false, error: t("calendar.errors.notLoggedIn") };
  }

  const uniqueDates = [...new Set(dates.map((d) => d.trim()).filter(Boolean))];
  if (uniqueDates.length === 0) {
    return { ok: false, error: t("calendar.errors.noDatesSelected") };
  }

  if (uniqueDates.some((date) => isPastDayKey(date))) {
    return { ok: false, error: t("calendar.errors.pastDate") };
  }

  const [schedules, ticketBalance, user] = await Promise.all([
    listUserFilmSchedules(session.email),
    getTicketBalanceForUser(session.email),
    findUserByEmail(session.email),
  ]);

  if (!user?.createdAt) {
    return { ok: false, error: t("calendar.errors.notLoggedIn") };
  }

  const registrationDate = new Date(user.createdAt);
  if (
    uniqueDates.some(
      (date) => !isScheduleDateAllowed(date, registrationDate, todayDayKey())
    )
  ) {
    return { ok: false, error: t("calendar.errors.outOfRange") };
  }

  const hasActiveSubscription = hasActiveSubscriptionForUser({
    email: session.email,
    subscriptionPlanId: user?.subscriptionPlanId,
  });
  if (!canScheduleFilms({ ticketBalance, hasActiveSubscription })) {
    return { ok: false, error: t("calendar.errors.noTickets") };
  }

  const scheduledDates = new Set(schedules.map((entry) => entry.scheduledDate));
  if (uniqueDates.some((date) => scheduledDates.has(date))) {
    return { ok: false, error: t("calendar.errors.alreadyScheduled") };
  }

  const availableSlots = getAvailableScheduleSlots({
    ticketBalance,
    hasActiveSubscription,
    schedules,
  });

  if (uniqueDates.length > availableSlots) {
    return { ok: false, error: t("calendar.errors.notEnoughTickets") };
  }

  await addUserFilmSchedules(session.email, uniqueDates);
  revalidatePath("/calendrier");

  return { ok: true, count: uniqueDates.length };
}

export async function cancelScheduledFilm(
  scheduleId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  const { t } = await getServerTranslator();
  if (!session) {
    return { ok: false, error: t("calendar.errors.notLoggedIn") };
  }

  const schedules = await listUserFilmSchedules(session.email);
  const entry = schedules.find((item) => item.id === scheduleId);
  if (!entry) {
    return { ok: false, error: t("calendar.errors.notFound") };
  }

  if (entry.scheduledDate < todayDayKey()) {
    return { ok: false, error: t("calendar.errors.pastDate") };
  }

  await removeUserFilmSchedule(session.email, scheduleId);
  revalidatePath("/calendrier");

  return { ok: true };
}
