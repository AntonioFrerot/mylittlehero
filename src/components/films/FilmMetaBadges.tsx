import {
  filmDurationBadgeClassName,
  filmThemeBadgeClassName,
} from "@/lib/film-meta-badges";
import type { FilmThemeId } from "@/lib/i18n/film-labels";
import { translateFilmTheme } from "@/lib/i18n/film-labels";
import type { LocaleCode } from "@/lib/i18n/locales";

type FilmMetaBadgesProps = {
  className?: string;
  themes: FilmThemeId[];
  durationLabel: string;
  locale: LocaleCode;
};

export function FilmMetaBadges({
  className = "",
  themes,
  durationLabel,
  locale,
}: FilmMetaBadgesProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {themes.map((theme) => (
        <span key={theme} className={filmThemeBadgeClassName(theme)}>
          {translateFilmTheme(theme, locale)}
        </span>
      ))}
      <span className={filmDurationBadgeClassName()}>{durationLabel}</span>
    </div>
  );
}
