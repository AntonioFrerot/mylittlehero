import { Header } from "@/components/Header";
import { FilmCreationForm } from "@/components/film-creation/FilmCreationForm";
import { getMyCharacters } from "@/lib/characters/actions";
import { getMyFilmCreationCooldown } from "@/lib/film-creation/actions";
import { getSession } from "@/lib/auth/get-session";
import { getMyFilmTicketSummary } from "@/lib/purchases/actions";
import { canCreateFilm, PRICING_PATH } from "@/lib/navigation/creer-film";
import { BRAND_NAME } from "@/lib/brand";
import { getServerTranslator } from "@/lib/i18n/server";
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
  const [session, ticketSummary, { t }, characters, creationCooldown] =
    await Promise.all([
    getSession(),
    getMyFilmTicketSummary(),
    getServerTranslator(),
    getMyCharacters(),
    getMyFilmCreationCooldown(),
  ]);

  if (!session) {
    redirect("/connexion?redirect=/creer-film");
  }

  if (ticketSummary && !canCreateFilm(ticketSummary)) {
    redirect(PRICING_PATH);
  }

  const greeting = session.name ?? session.email.split("@")[0];

  return (
    <>
      <Header />
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
          <p className="mt-3 text-cream/60">
            {t("filmCreation.greeting", { name: greeting })}
          </p>

          <div className={`mt-8 ${SURFACE_3D_PANEL_LG} p-4 sm:mt-10 sm:p-6 md:p-8`}>
            <FilmCreationForm
              characters={characters}
              ticketBalance={ticketSummary?.balance ?? 0}
              hasActiveSubscription={ticketSummary?.hasActiveSubscription ?? false}
              freeFilmAvailable={ticketSummary?.freeFilmAvailable ?? false}
              cooldownEndsAt={creationCooldown.endsAt}
            />
          </div>

          <p className="mt-6 text-center text-sm text-cream/45">
            <Link
              href="/mon-espace?section=personnages"
              className="text-gold-light/80 hover:text-gold-light"
            >
              {t("filmCreation.manageCharacters")}
            </Link>
            {" · "}
            {t("filmCreation.hint")}
          </p>
        </div>
      </main>
    </>
  );
}
