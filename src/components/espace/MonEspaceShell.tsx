"use client";

import { useCallback, useEffect, useState } from "react";
import { AccountInformationsForm } from "@/components/espace/AccountInformationsForm";
import { CharacterManager } from "@/components/espace/CharacterManager";
import { MesFilmsList } from "@/components/espace/MesFilmsList";
import { MonEspaceNav } from "@/components/espace/MonEspaceNav";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/LocaleProvider";
import type { MonEspacePageData } from "@/lib/espace/load-page";
import { fetchMonEspaceSection } from "@/lib/espace/load-section";
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
  const [account, setAccount] = useState(data.account);
  const [characters, setCharacters] = useState(data.characters);
  const [films, setFilms] = useState(data.films);
  const [sectionLoading, setSectionLoading] = useState<EspaceSection | null>(
    null
  );
  const { createFilmHref } = data;

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

  const ensureSectionData = useCallback(
    async (target: EspaceSection) => {
      if (target === "profil" && account) return;
      if (target === "personnages" && characters) return;
      if (target === "films" && films) return;

      setSectionLoading(target);
      try {
        const result = await fetchMonEspaceSection(target);
        if (!result.ok) return;
        if (result.data.section === "profil") {
          setAccount(result.data.account);
        } else if (result.data.section === "personnages") {
          setCharacters(result.data.characters);
        } else {
          setFilms(result.data.films);
        }
      } finally {
        setSectionLoading(null);
      }
    },
    [account, characters, films]
  );

  useEffect(() => {
    void ensureSectionData(section);
  }, [section, ensureSectionData]);

  function navigateToSection(next: EspaceSection) {
    setSection(next);
    window.history.replaceState(null, "", monEspaceSectionPath(next));
  }

  const loadingThisSection = sectionLoading === section;

  return (
    <div className="mon-espace-content mx-auto max-w-6xl px-4 sm:px-6 md:px-8 lg:max-w-[85rem]">
      <div className="mt-2 grid gap-6 sm:mt-4 lg:grid-cols-[minmax(200px,240px)_minmax(0,1fr)] lg:gap-x-10 lg:gap-y-6">
        <MonEspaceNav active={section} onSectionChange={navigateToSection} />

        <div className="min-w-0">
          {loadingThisSection ? (
            <p className="py-12 text-center text-sm text-cream/55" aria-live="polite">
              {t("common.loading")}
            </p>
          ) : null}

          {!loadingThisSection && section === "profil" ? (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:items-center lg:gap-8">
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
                    {t("space.profileTitle")}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm text-cream/60 md:text-base lg:max-w-3xl">
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
              <div className="mt-8 lg:mt-6">
                {account ? (
                  <AccountInformationsForm account={account} />
                ) : (
                  <p className="text-sm text-cream/55">
                    {t("space.accountLoadError")}
                  </p>
                )}
              </div>
            </>
          ) : null}

          {!loadingThisSection && section === "personnages" ? (
            <CharacterManager
              initialCharacters={characters ?? []}
              createFilmHref={createFilmHref}
            />
          ) : null}

          {!loadingThisSection && section === "films" ? (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:items-center lg:gap-8">
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
                    {t("space.filmsTitle")}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm text-cream/60 md:text-base lg:max-w-3xl">
                    {t("space.filmsDesc")}
                  </p>
                </div>
                <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
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
              <div className="mt-8 lg:mt-6">
                {films ? (
                  <MesFilmsList films={films} createFilmHref={createFilmHref} />
                ) : (
                  <p className="text-sm text-cream/55">{t("space.accountLoadError")}</p>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}