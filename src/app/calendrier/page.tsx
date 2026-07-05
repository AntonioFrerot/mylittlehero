import { FilmCalendar } from "@/components/calendar/FilmCalendar";
import { getMyFilmCalendarContext } from "@/lib/calendar/actions";
import { BRAND_NAME } from "@/lib/brand";
import { getServerTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: `${t("meta.calendarTitle")} — ${BRAND_NAME}`,
    description: t("meta.calendarDescription"),
  };
}

export default async function CalendrierPage() {
  const [context, { t }] = await Promise.all([
    getMyFilmCalendarContext(),
    getServerTranslator(),
  ]);

  if (!context) {
    redirect("/connexion?redirect=/calendrier");
  }

  return (
    <main className="min-h-screen bg-cinema-black pb-24 safe-top-offset">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8">
        <Link
          href="/mon-espace?section=films"
          className="text-sm text-cream/50 transition-colors hover:text-gold-light"
        >
          {t("calendar.backToSpace")}
        </Link>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-gold-light/80">
          {t("calendar.eyebrow")}
        </p>
        <h1 className="font-display mt-2 text-3xl font-bold text-cream md:text-4xl">
          {t("calendar.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-cream/65">
          {t("calendar.lead")}
        </p>

        <div className="mt-8 sm:mt-10">
          <FilmCalendar
            schedules={context.schedules}
            ticketBalance={context.ticketBalance}
            hasActiveSubscription={context.hasActiveSubscription}
            availableSlots={context.availableSlots}
            canSchedule={context.canSchedule}
            registrationDate={context.registrationDate}
          />
        </div>
      </div>
    </main>
  );
}
