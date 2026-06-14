import { Header } from "@/components/Header";
import { AccountInformationsForm } from "@/components/espace/AccountInformationsForm";
import { CharacterManager } from "@/components/espace/CharacterManager";
import { MesFilmsList } from "@/components/espace/MesFilmsList";
import { MonEspaceNav } from "@/components/espace/MonEspaceNav";
import { Button } from "@/components/ui/Button";
import { getMyAccountDetails } from "@/lib/auth/account-actions";
import { getMyCharacters } from "@/lib/characters/actions";
import { getMyFilmsWithStory } from "@/lib/film-creation/actions";
import { getSession } from "@/lib/auth/get-session";
import { parseEspaceSection, MON_ESPACE_DEFAULT_PATH } from "@/lib/espace/sections";
import { resolveCreerSonFilmHref } from "@/lib/navigation/creer-film.server";
import { BRAND_NAME } from "@/lib/brand";
import { getServerTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: `${t("meta.monEspaceTitle")} — ${BRAND_NAME}`,
    description: t("meta.monEspaceDescription"),
  };
}

type PageProps = {
  searchParams: Promise<{ section?: string }>;
};

export default async function MonEspacePage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session) {
    redirect(`/connexion?redirect=${encodeURIComponent(MON_ESPACE_DEFAULT_PATH)}`);
  }

  const { t } = await getServerTranslator();
  const params = await searchParams;
  if (!params.section) {
    redirect(MON_ESPACE_DEFAULT_PATH);
  }
  const section = parseEspaceSection(params.section);
  const createFilmHref = await resolveCreerSonFilmHref();

  const account =
    section === "profil" ? await getMyAccountDetails() : null;
  const characters =
    section === "personnages" ? await getMyCharacters() : [];
  const films = section === "films" ? await getMyFilmsWithStory() : [];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cinema-black pb-20">
        <section className="mon-espace-hero safe-top-offset" aria-labelledby="mon-espace-title">
          <div className="mon-espace-hero__ambient" aria-hidden>
            <div className="mon-espace-hero__glow mon-espace-hero__glow--gold" />
            <div className="mon-espace-hero__glow mon-espace-hero__glow--violet" />
          </div>

          <div className="mon-espace-hero__shell mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
            <Link href="/" className="mon-espace-hero__back">
              {t("space.backHome")}
            </Link>

            <header className="mon-espace-hero__header">
              <h1
                id="mon-espace-title"
                className="mon-espace-hero__title max-md:flex max-md:flex-col max-md:items-center max-md:leading-none"
              >
                <span className="mon-espace-hero__title-before">
                  {t("space.heroTitleBefore")}
                </span>
                <span className="mon-espace-hero__title-accent">
                  {t("space.heroTitleAccent")}
                </span>
              </h1>
              <p className="mon-espace-hero__lead">{t("space.heroLead")}</p>
            </header>
          </div>
        </section>

        <div className="mon-espace-content mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <div className="mt-2 grid gap-6 sm:mt-4 lg:grid-cols-[220px_1fr] lg:gap-10">
            <MonEspaceNav active={section} />

            <div className="min-w-0">
              {section === "profil" ? (
                <>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
                        {t("space.profileTitle")}
                      </h2>
                      <p className="mt-2 max-w-xl text-sm text-cream/60 md:text-base">
                        {t("space.profileDesc")}
                      </p>
                    </div>
                    <Button
                      href={createFilmHref}
                      variant="primary"
                      className="w-full !text-sm shrink-0 sm:w-auto"
                    >
                      {t("space.createFilm")}
                    </Button>
                  </div>
                  <div className="mt-8">
                    {account ? (
                      <AccountInformationsForm account={account} />
                    ) : (
                      <p className="text-sm text-cream/55">
                        {t("space.accountLoadError")}
                      </p>
                    )}
                  </div>
                </>
              ) : section === "personnages" ? (
                <CharacterManager
                  initialCharacters={characters}
                  createFilmHref={createFilmHref}
                />
              ) : (
                <>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
                        {t("space.filmsTitle")}
                      </h2>
                      <p className="mt-2 max-w-xl text-sm text-cream/60 md:text-base">
                        {t("space.filmsDesc")}
                      </p>
                    </div>
                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                      <Button
                        href="/catalogue"
                        variant="secondary"
                        className="w-full !text-sm shrink-0 sm:w-auto"
                      >
                        {t("space.browseCatalog")}
                      </Button>
                      <Button
                        href={createFilmHref}
                        variant="primary"
                        className="w-full !text-sm shrink-0 sm:w-auto"
                      >
                        {t("space.createFilm")}
                      </Button>
                    </div>
                  </div>
                  <div className="mt-8">
                    <MesFilmsList films={films} createFilmHref={createFilmHref} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
