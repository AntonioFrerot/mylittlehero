import { BrowseThemeCreatePanel } from "@/components/browse/BrowseThemeCreatePanel";
import { UserFilmPosterCard } from "@/components/browse/UserFilmPosterCard";
import { MoviePosterCarousel } from "@/components/MoviePosterCarousel";
import {
  getBrowseFilmsForTheme,
} from "@/lib/browse-catalog";
import type { UserFilmWithStory } from "@/lib/film-creation/actions";
import type { FilmThemeId } from "@/lib/i18n/film-labels";
import { getServerTranslator } from "@/lib/i18n/server";

type BrowseThemeSectionProps = {
  themeId: FilmThemeId;
  themeLabel: string;
  gradient: string;
  films: UserFilmWithStory[];
  createHref: string;
  createLabel: string;
  emptyTitle: string;
  emptyHint: string;
  durationLocale: "fr" | "en";
};

export async function BrowseThemeSection({
  themeId,
  themeLabel,
  gradient,
  films,
  createHref,
  createLabel,
  emptyTitle,
  emptyHint,
  durationLocale,
}: BrowseThemeSectionProps) {
  const { t } = await getServerTranslator();
  const themeFilms = getBrowseFilmsForTheme(films, themeId);

  if (themeFilms.length === 0) {
    return (
      <BrowseThemeCreatePanel
        gradient={gradient}
        themeLabel={themeLabel}
        emptyTitle={emptyTitle}
        emptyHint={emptyHint}
        createHref={createHref}
        createLabel={createLabel}
      />
    );
  }

  return (
    <div className="browse-row__films">
      <MoviePosterCarousel itemCount={themeFilms.length}>
        {themeFilms.map((film) => (
          <UserFilmPosterCard
            key={film.id}
            film={film}
            href={`/mon-espace/films/${film.id}`}
            posterAlt={t("space.filmPosterAlt", { title: film.title })}
            durationLocale={durationLocale}
          />
        ))}
      </MoviePosterCarousel>

      <div className="hidden gap-4 sm:flex sm:flex-wrap sm:gap-5 md:gap-6">
        {themeFilms.map((film) => (
          <UserFilmPosterCard
            key={film.id}
            film={film}
            href={`/mon-espace/films/${film.id}`}
            posterAlt={t("space.filmPosterAlt", { title: film.title })}
            durationLocale={durationLocale}
          />
        ))}
      </div>
    </div>
  );
}
