"use client";

import { useEffect, useState } from "react";
import { AccountInformationsForm } from "@/components/espace/AccountInformationsForm";
import { CharacterManager } from "@/components/espace/CharacterManager";
import { MesFilmsList } from "@/components/espace/MesFilmsList";
import { MonEspaceNav } from "@/components/espace/MonEspaceNav";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/LocaleProvider";
import type { MonEspacePageData } from "@/lib/espace/load-page";
import {
  monEspaceSectionPath,
  parseEspaceSection,
  type EspaceSection,
} from "@/lib/espace/sections";

type MonEspaceShellProps = {
  initialSection: EspaceSection;
  data: MonEspacePageData;
};

export function MonEspaceShell({ initialSection, data }: MonEspaceShellProps) {
  const { t } = useLocale();
  const [section, setSection] = useState(initialSection);
  const { createFilmHref, account, characters, films } = data;

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    function syncSectionFromUrl() {
      const params = new URLSearchParams(window.location.search);
      setSection(parseEspaceSection(params.get("section") ?? undefined));
    }

    window.addEventListener("popstate", syncSectionFromUrl);
    return () => window.removeEventListener("popstate", syncSectionFromUrl);
  }, []);

  function navigateToSection(next: EspaceSection) {
    setSection(next);
    window.history.replaceState(null, "", monEspaceSectionPath(next));
  }

  return (
    <div className="mon-espace-content mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
      <div className="mt-2 grid gap-6 sm:mt-4 lg:grid-cols-[220px_1fr] lg:gap-10">
        <MonEspaceNav active={section} onSectionChange={navigateToSection} />

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
  );
}
