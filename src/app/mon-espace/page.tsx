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
import { parseEspaceSection } from "@/lib/espace/sections";
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
    redirect("/connexion?redirect=/mon-espace");
  }

  const { t } = await getServerTranslator();
  const params = await searchParams;
  const section = parseEspaceSection(params.section);
  const greeting = session.name ?? session.email.split("@")[0];

  const account =
    section === "profil" ? await getMyAccountDetails() : null;
  const characters =
    section === "personnages" ? await getMyCharacters() : [];
  const films = section === "films" ? await getMyFilmsWithStory() : [];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cinema-black pb-20 safe-top-offset">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <Link
            href="/"
            className="text-sm text-cream/50 transition-colors hover:text-gold-light"
          >
            {t("space.backHome")}
          </Link>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light/80">
              {t("space.eyebrow")}
            </p>
            <h1 className="font-display mt-2 text-3xl font-bold text-cream md:text-4xl">
              {t("space.hello", { name: greeting })}
            </h1>
          </div>

          <div className="mt-8 grid gap-6 sm:mt-10 lg:grid-cols-[220px_1fr] lg:gap-10">
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
                      href="/creer-film"
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
                <>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
                        {t("space.charactersTitle")}
                      </h2>
                      <p className="mt-2 max-w-xl text-sm text-cream/60 md:text-base">
                        {t("space.charactersDesc")}
                      </p>
                    </div>
                    <Button
                      href="/creer-film"
                      variant="primary"
                      className="w-full !text-sm shrink-0 sm:w-auto"
                    >
                      {t("space.createFilm")}
                    </Button>
                  </div>
                  <div className="mt-8">
                    <CharacterManager initialCharacters={characters} />
                  </div>
                </>
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
                    <Button
                      href="/creer-film"
                      variant="primary"
                      className="w-full !text-sm shrink-0 sm:w-auto"
                    >
                      {t("space.createFilm")}
                    </Button>
                  </div>
                  <div className="mt-8">
                    <MesFilmsList films={films} />
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
