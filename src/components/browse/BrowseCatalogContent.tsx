import { BrowseCatalogHero } from "@/components/browse/BrowseCatalogHero";
import { BrowseThemeSection } from "@/components/browse/BrowseThemeSection";
import { getCatalogFilmsForSession } from "@/lib/film-creation/catalog-films";
import { getBrowseThemeRows } from "@/lib/browse-catalog";
import { getServerTranslator } from "@/lib/i18n/server";
import { resolveCreerSonFilmHref } from "@/lib/navigation/creer-film.server";
import { themeNameKey } from "@/lib/theme-labels";

export async function BrowseCatalogContent() {
  const [{ t, locale }, createHref, userFilms] = await Promise.all([
    getServerTranslator(),
    resolveCreerSonFilmHref(),
    getCatalogFilmsForSession(),
  ]);
  const rows = getBrowseThemeRows();
  const durationLocale = locale === "fr" ? "fr" : "en";

  return (
    <div className="browse-catalog">
      <BrowseCatalogHero
        eyebrow={t("browse.eyebrow")}
        title={t("browse.title")}
        lead={t("browse.heroLead")}
        createHref={createHref}
        createLabel={t("browse.createFilm")}
        examplesHref="/#catalogue"
        examplesLabel={t("browse.heroExamples")}
        backHomeLabel={t("browse.backHome")}
        stepsTitle={t("browse.heroStepsTitle")}
        steps={[
          {
            title: t("browse.heroStep1Title"),
            text: t("browse.heroStep1Text"),
          },
          {
            title: t("browse.heroStep2Title"),
            text: t("browse.heroStep2Text"),
          },
          {
            title: t("browse.heroStep3Title"),
            text: t("browse.heroStep3Text"),
          },
        ]}
      />

      <div className="browse-catalog__body">
        <div className="browse-catalog__rows">
          {rows.map((row) => {
            const themeLabel = t(themeNameKey(row.themeId));

            return (
              <section
                key={row.themeId}
                className="browse-row"
                aria-label={t("browse.rowAria", { theme: themeLabel })}
              >
                <h2 className="browse-row__title">
                  <span className="browse-row__title-text">{themeLabel}</span>
                  <span className="browse-row__title-mark" aria-hidden />
                </h2>
                <BrowseThemeSection
                  themeId={row.themeId}
                  themeLabel={themeLabel}
                  gradient={row.gradient}
                  films={userFilms}
                  createHref={createHref}
                  createLabel={t("browse.createFilm")}
                  emptyTitle={t("browse.themeEmptyTitle", { theme: themeLabel })}
                  emptyHint={t("browse.themeEmptyHint", { theme: themeLabel })}
                  durationLocale={durationLocale}
                />
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
