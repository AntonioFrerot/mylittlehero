import { BrowseCatalogHero } from "@/components/browse/BrowseCatalogHero";
import { BrowseThemeCreatePanel } from "@/components/browse/BrowseThemeCreatePanel";
import { getBrowseThemeRows } from "@/lib/browse-catalog";
import { getSession } from "@/lib/auth/get-session";
import { getServerTranslator } from "@/lib/i18n/server";
import { getCreerSonFilmHref } from "@/lib/navigation/creer-film";
import { themeNameKey } from "@/lib/theme-labels";

export async function BrowseCatalogContent() {
  const { t } = await getServerTranslator();
  const session = await getSession();
  const createHref = getCreerSonFilmHref(!!session);
  const rows = getBrowseThemeRows();

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
                <h2 className="browse-row__title">{themeLabel}</h2>
                <BrowseThemeCreatePanel
                  gradient={row.gradient}
                  themeLabel={themeLabel}
                  emptyTitle={t("browse.themeEmptyTitle", { theme: themeLabel })}
                  emptyHint={t("browse.themeEmptyHint", { theme: themeLabel })}
                  createHref={createHref}
                  createLabel={t("browse.createFilm")}
                />
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
