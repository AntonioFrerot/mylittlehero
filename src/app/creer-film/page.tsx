import { FilmCreationForm } from "@/components/film-creation/FilmCreationForm";
import { FilmCreationNoCreditsNotice } from "@/components/film-creation/FilmCreationNoCreditsNotice";
import { getMyCharacters } from "@/lib/characters/actions";
import { getMyFilmCreationCooldown } from "@/lib/film-creation/actions";
import { getSession } from "@/lib/auth/get-session";
import { findUserByEmail } from "@/lib/auth/users-store";
import { listUserFilmSchedules } from "@/lib/calendar/store";
import { getMyFilmTicketSummary } from "@/lib/purchases/actions";
import { BRAND_NAME } from "@/lib/brand";
import { getServerTranslator } from "@/lib/i18n/server";
import { shouldShowNoCreditsNotice } from "@/lib/navigation/creer-film";
import { SURFACE_3D_PANEL_LG } from "@/lib/ui/button-3d-classes";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: `${t("meta.filmCreationTitle")} — ${BRAND_NAME}`,
    description: t("meta.filmCreationDescription"),
  };
}

export default async function CreerFilmPage() {
  const session = await getSession();

  if (!session) {
    redirect("/connexion?redirect=/creer-film");
  }

  const [ticketSummary, { t }, characters, creationCooldown, user, schedules] =
    await Promise.all([
      getMyFilmTicketSummary(),
      getServerTranslator(),
      getMyCharacters(),
      getMyFilmCreationCooldown(),
      findUserByEmail(session.email),
      listUserFilmSchedules(session.email),
    ]);

  const occupiedScheduleDates = schedules.map((entry) => entry.scheduledDate);
  const registrationDate = user?.createdAt ?? new Date().toISOString();
  const ticketBalance = ticketSummary?.balance ?? 0;
  const jetonBalance = ticketSummary?.jetonBalance ?? 0;
  const hasActiveSubscription = ticketSummary?.hasActiveSubscription ?? false;
  const freeFilmAvailable = ticketSummary?.freeFilmAvailable ?? false;
  const showNoCreditsNotice = shouldShowNoCreditsNotice({
    balance: ticketBalance,
    jetonBalance,
    hasActiveSubscription,
  });

  return (
    <>
      <main className="min-h-screen bg-cinema-black pb-20 safe-top-offset">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 md:px-8">
          <Link
            href="/mon-espace?section=films"
            className="text-sm text-cream/50 transition-colors hover:text-gold-light"
          >
            {t("filmCreation.backToFilms")}
          </Link>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-gold-light/80">
            {t("filmCreation.eyebrow")}
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold text-cream md:text-4xl">
            {t("filmCreation.title")}
          </h1>

          {showNoCreditsNotice ? (
            <FilmCreationNoCreditsNotice
              eyebrow={t("filmCreation.noCreditsNotice.eyebrow")}
              title={t("filmCreation.noCreditsNotice.title")}
              lead={t("filmCreation.noCreditsNotice.lead")}
              cta={t("filmCreation.noCreditsNotice.cta")}
            />
          ) : null}

          <div className={`mt-8 ${SURFACE_3D_PANEL_LG} p-4 sm:mt-10 sm:p-6 md:p-8`}>
            <FilmCreationForm
              characters={characters}
              ticketBalance={ticketBalance}
              jetonBalance={jetonBalance}
              hasActiveSubscription={hasActiveSubscription}
              freeFilmAvailable={freeFilmAvailable}
              cooldownEndsAt={creationCooldown.endsAt}
              registrationDate={registrationDate}
              occupiedScheduleDates={occupiedScheduleDates}
              subscriptionGrantSchedule={
                ticketSummary?.subscriptionGrantSchedule ?? {
                  active: false,
                  tier: null,
                  period: null,
                  anchorDayKey: null,
                  minScheduleDayKey: null,
                  remainingScheduleSlots: 0,
                  annualGrantCap: 0,
                  elapsedGrantsInYear: 0,
                  scheduledGrantCount: 0,
                  canScheduleMore: false,
                }
              }
            />
          </div>
        </div>
      </main>
    </>
  );
}
